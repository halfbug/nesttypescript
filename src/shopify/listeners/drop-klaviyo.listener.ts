import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { StoresService } from 'src/stores/stores.service';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
import { KalavioService } from 'src/email/kalavio.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { DropKlaviyoEvent } from '../events/drop-klaviyo.event';
import { OrdersService } from 'src/inventory/orders.service';
import DropsGroupshop from 'src/drops-groupshop/entities/dropsgroupshop.model';

@Injectable()
export class DropKlaviyoListener {
  constructor(
    private eventEmitter: EventEmitter2,
    private configSevice: ConfigService,
    private crypt: EncryptDecryptService,
    private dropsGroupshopService: DropsGroupshopService,
    private kalavioService: KalavioService,
    private storesService: StoresService,
    private ordersService: OrdersService,
    private inventryService: InventoryService,
  ) {}

  pendingCashback(lineItems: any[], discountPercentage: number) {
    const totalPrice = lineItems?.reduce(
      (priceSum: number, { price, quantity }) =>
        priceSum + quantity * parseFloat(price),
      0,
    );
    const netPrice = ((100 - discountPercentage) / 100) * totalPrice;
    return Math.floor(totalPrice - netPrice);
  }

  async getCurrentCashback(members, storeId) {
    const storeData = await this.storesService.findById(storeId);
    const maxDiscount = storeData?.drops?.rewards
      ? +storeData?.drops?.rewards?.maximum
      : 0;
    let pendingCashback = 0;
    let refundCashback = 0;
    members.forEach((member, key) => {
      if (key <= 2) {
        const refundAmount = member?.refund?.reduce(
          (priceSum: number, { amount }) => priceSum + parseFloat(amount),
          0,
        );
        if (typeof refundAmount !== 'undefined') {
          refundCashback += refundAmount;
        }
        const availedDiscount = member.availedDiscount;
        if (maxDiscount > 0 && maxDiscount !== availedDiscount) {
          const discountPercentage = maxDiscount - availedDiscount;
          const pendingAmount = this.pendingCashback(
            member.lineItems,
            discountPercentage,
          );
          pendingCashback += pendingAmount;
        }
      }
    });
    return {
      refundCashback: refundCashback,
      pendingCashback: pendingCashback,
    };
  }

  @OnEvent('drop.klaviyo')
  async dropKlaviyo(event: DropKlaviyoEvent | { webhook: any }) {
    try {
      // console.log('drop.klaviyo  ', JSON.stringify(event));
      const webdata = event.webhook;
      const shortURL = webdata.shortUrl;
      const klaviyoId = webdata.customerDetail.klaviyoId;

      // Update latest milestone discount that is active on the klaviyo profile
      const currentProfile: any = await this.kalavioService.getProfilesById(
        klaviyoId,
        webdata.storeId,
      );
      let current_milestone_discount;
      const latestShortUrl =
        currentProfile?.data.attributes.properties?.groupshop_url;
      if (shortURL === latestShortUrl) {
        const memberLength = webdata.members?.length;
        if (memberLength === 0) {
          current_milestone_discount = 'NA';
        } else if (memberLength === 1) {
          current_milestone_discount = webdata.milestones[0].discount;
        } else if (memberLength === 2) {
          current_milestone_discount = webdata.milestones[1].discount;
        } else {
          current_milestone_discount = webdata.milestones[2]
            ? webdata.milestones[2].discount
            : '';
        }

        const lifetimeRevenue: (DropsGroupshop & {
          lifetime_referral_count?: any;
          lifetime_gs_cashback?: any;
        })[] = await this.dropsGroupshopService.findDropsLifetimeCashback(
          klaviyoId,
        );

        const obj = {
          current_milestone_discount: current_milestone_discount,
          groupshop_status: 'active',
          lifetime_referral_count: !!lifetimeRevenue[0]
            ? lifetimeRevenue[0].lifetime_referral_count
            : '',
          lifetime_gs_cashback: !!lifetimeRevenue[0]
            ? lifetimeRevenue[0].lifetime_gs_cashback
            : '',
        };
        const data = Object.keys(obj)
          .map((key) => {
            return `${key}=${encodeURIComponent(obj[key])}`;
          })
          .join('&');
        await this.kalavioService.klaviyoProfileUpdate(
          klaviyoId,
          data,
          webdata.storeId,
        );
      }

      // Drop Groupshop Order Trigger on Klaviyo
      const orderid_referral1 =
        webdata.members.length >= 2 ? webdata.members[1].orderId : null;
      const orderid_referral2 =
        webdata.members.length >= 3 ? webdata.members[2].orderId : null;

      let cust_referral1_name = '';
      if (orderid_referral1 !== null) {
        const cust_referral1 =
          await this.ordersService.getCustomerNameByOrderId(orderid_referral1);
        cust_referral1_name = cust_referral1[0].customer.firstName;
      }
      let cust_referral2_name = '';
      if (orderid_referral2 !== null) {
        const cust_referral2 =
          await this.ordersService.getCustomerNameByOrderId(orderid_referral2);
        cust_referral2_name = cust_referral2[0].customer.firstName;
      }

      const calculateRevenue = await this.getCurrentCashback(
        webdata.members,
        webdata.storeId,
      );
      const mdata = {
        current_gs_referral1: cust_referral1_name,
        current_gs_referral2: cust_referral2_name,
        referral_count: webdata.members.length - 1,
        current_gs_cashback: calculateRevenue.refundCashback,
        current_gs_pending_cashback: calculateRevenue.pendingCashback,
      };

      console.log('Drop Groupshop Order Trigger', JSON.stringify(mdata));

      const body = {
        event: 'Drop Groupshop Order Trigger',
        customer_properties: {
          first_name: webdata.customerDetail.firstName,
          last_name: webdata.customerDetail.lastName,
          email:
            webdata.customerDetail.email !== 'None'
              ? webdata.customerDetail.email
              : null,
          phone_number: webdata.customerDetail.phone,
          groupshop_url: webdata.shortUrl,
        },
        properties: mdata,
      };
      this.kalavioService.sendKlaviyoEmail(body);
    } catch (err) {
      console.log(err);
      Logger.error(err, DropKlaviyoListener.name);
    }
  }
}
