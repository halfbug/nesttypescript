import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
// import moment from 'moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Orders from 'src/inventory/entities/orders.modal';
import { GS_CHARGE_CASHBACK } from 'src/utils/constant';
import { KalavioService } from 'src/email/kalavio.service';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
import Store from 'src/stores/entities/store.model';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { UpdateDropsGroupshopInput } from 'src/drops-groupshop/dto/update-drops-groupshop.input';
import { InventoryService } from 'src/inventory/inventory.service';
import { Product } from 'src/inventory/entities/product.entity';
import { OrdersService } from 'src/inventory/orders.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { DropKlaviyoEvent } from 'src/shopify/events/drop-klaviyo.event';
import { ShopifyService } from '../shopify.service';
import {
  Groupshops,
  RefundStatusEnum,
  RoleTypeEnum,
} from 'src/drops-groupshop/entities/groupshop.modal';
import { OrderPlacedEvent } from '../events/order-placed.envent';
import {
  DiscountCodeInput,
  MemberInput,
  MilestoneInput,
  RefundInput,
} from 'src/drops-groupshop/dto/create-groupshops.input';
import { CashBackEvent } from 'src/drops-groupshop/events/cashback.event';
import { Session } from '@shopify/shopify-api';

@Injectable()
export class OrderPlacedListener {
  constructor(
    private shopifyapi: ShopifyService,
    private configSevice: ConfigService,
    private eventEmitter: EventEmitter2,
    private kalavioService: KalavioService,
    private crypt: EncryptDecryptService,
    private dropsService: DropsGroupshopService,
    private inventoryService: InventoryService,
    private orderService: OrdersService,
    private readonly lifecyclesrv: LifecycleService,
    private dropKlaviyoEvent: DropKlaviyoEvent,
  ) {}

  accessToken: string;
  shop: string;
  store: Store;
  order: Orders;
  groupshop: Groupshops;
  session: Session;

  static formatTitle(name: string) {
    return `GS${Math.floor(1000 + Math.random() * 9000)}${name?.substring(
      1,
      name.length,
    )}`;
  }
  static addDays(date: Date, number: number) {
    const newDate = new Date(date);
    return new Date(newDate.setDate(newDate.getDate() + number));
  }

  // getNextMemberDiscount(totalMembers: number, rewards: Reward[]) {
  //   if (totalMembers === 6) return rewards[0].discount;
  //   return (
  //     rewards.filter((rew) => parseInt(rew.customerCount) === totalMembers)[0]
  //       ?.discount || null
  //   );
  // }

  totalPricePercent(
    lineItems: Orders[],
    discountPercentage: number,
    role: RoleTypeEnum,
  ) {
    const totalPrice = lineItems?.reduce(
      (
        priceSum: number,
        { discountedPrice, price, quantity, discountInfo },
      ) => {
        // check if owner have another discount used
        // so we consider discounted price as selling price
        console.log('2908', discountedPrice);
        if (role === RoleTypeEnum.owner) {
          console.log('2908 owner');

          return priceSum + quantity * (discountedPrice ?? parseFloat(price));
        } else {
          console.log('2908 not owner');

          // calculate price if the referral use other discounts as well
          // so we subtract other discount value from orignal price and consider it as selling price
          const fprice =
            discountInfo.length > 1
              ? parseFloat(price) -
                discountInfo.reduce((psum: number, discount: any) => {
                  if (discount.code.includes('script'))
                    return psum + +discount.amount;
                  else return psum;
                }, 0)
              : discountedPrice;
          console.log('2908 not owner price', priceSum + quantity * fprice);
          return priceSum + quantity * fprice;
        }
      },
      0,
    );
    const netPrice = (discountPercentage / 100) * totalPrice;
    return netPrice < 1 ? netPrice : Math.floor(netPrice);
  }

  totalRevenue(lineItems: any[], discountPercentage: number) {
    const totalPrice = lineItems?.reduce(
      (priceSum: number, { price, quantity }) =>
        priceSum + quantity * parseFloat(price),
      0,
    );
    const netPrice = ((100 - discountPercentage) / 100) * totalPrice;
    return netPrice < 1 ? netPrice : Math.floor(netPrice);
  }
  async shopifyRefund(amount: string, orderId: string, discount: number) {
    // console.log('.............shopifyrefund....................');
    // console.log({ amount });
    // console.log({ orderId });
    // console.log({ discount });

    try {
      const client = await this.shopifyapi.client(this.session);
      // console.log(
      //   '🚀 ~ file: order-placed.listener.ts ~ line 79 ~ OrderPlacedListener ~ shopifyRefund ~ this.accessToken',
      //   this.accessToken,
      // );
      // console.log(
      //   '🚀 ~ file: order-placed.listener.ts ~ line 79 ~ OrderPlacedListener ~ shopifyRefund ~ this.shop,',
      //   this.shop,
      // );
      const refund = await client.query({
        data: {
          query: `mutation refundCreate($input: RefundInput!) {
          refundCreate(input: $input) {
            order {
              id
              name
            }
            refund {
              id
              
            }
            userErrors {
              field
              message
            }
          }
        }`,
          variables: {
            input: {
              orderId: orderId,
              note: `GROUPSHOP - ${discount}% cash back for referral`,
              notify: true,
              transactions: {
                amount,
                gateway: 'exchange-credit',
                kind: 'REFUND',
                orderId: orderId,
              },
            },
          },
        },
      });
      console.log(JSON.stringify(refund));
      console.log('.............shopifyrefund....................');
    } catch (err) {
      console.log('shopifyRefund > err ', JSON.stringify(err));
    }
  }

  async calculateRefund(member: any, milestone: number, service: string) {
    const netDiscount = milestone * 100 - member.availedDiscount;
    console.log(
      '🚀 ~ file: order-placed.listener.ts:193 ~ OrderPlacedListener ~ calculateRefund ~ netDiscount:',
      netDiscount,
    );
    // 100 -

    let lineitems;

    if (service === 'drops') {
      lineitems = await this.dropsService.getNonVaultSpotlightLineitems(
        this.shop,
        member.lineItems,
      );
    }

    const refundAmount = this.totalPricePercent(
      service === 'drops' ? lineitems : member.lineItems,
      netDiscount,
      member.role,
    );
    // const revenuePrice = this.totalRevenue(member.lineItems, netDiscount);

    // cashback - gsfees
    // const percentageGiven = (100 - GS_CHARGE_CASHBACK) / 100;
    const cashBackUsageCharge = GS_CHARGE_CASHBACK / 100; //convert percentage in amount
    const cashBackUsageChargeAmount = refundAmount * cashBackUsageCharge;
    console.log(
      '🚀 ~ file: order-placed.listener.ts ~ line 151 ~ OrderPlacedListener ~ calculateRefund ~ refundAmount',
      refundAmount,
    );
    const shopifyAmount = Math.floor(refundAmount - cashBackUsageChargeAmount);
    console.log(
      '🚀 ~ file: order-placed.listener.ts ~ line 116  calculateRefund ~ refundAmount',
      refundAmount,
    );
    if (refundAmount) {
      this.shopifyRefund(shopifyAmount.toString(), member.orderId, netDiscount);
      const cashBackEvent = new CashBackEvent();
      cashBackEvent.cashbackAmount = shopifyAmount;
      cashBackEvent.cashbackCharge = cashBackUsageChargeAmount;
      cashBackEvent.groupshop = this.groupshop;
      // cashBackEvent.revenue = revenuePrice;
      cashBackEvent.revenue = 0;
      cashBackEvent.orderId = member.orderId;
      cashBackEvent.netDiscount = netDiscount;
      cashBackEvent.store = this.store;
      console.log('.......cashback..........');
      this.eventEmitter.emit('cashback.generated', cashBackEvent);
      if (service === 'groupshop') {
        this.eventEmitter.emit('cashbackEmail.generated', cashBackEvent);
      } else if (service === 'drops') {
        this.eventEmitter.emit('cashbackDropEmail.generated', cashBackEvent);
      }

      const refund = new RefundInput(
        RefundStatusEnum.panding,
        new Date(),
        netDiscount,
        refundAmount,
      );

      member.refund = [...(member.refund ?? []), refund];
      member.availedDiscount += netDiscount;
    }
    // after shopify refund we emit cashBack event n go to billing listner
    return member;
  }
  async setPreviousMembersRefund(
    members: MemberInput[],
    discountCode: DiscountCodeInput,
  ) {
    const totalMembers = members.length;
    const currentMilestone = parseFloat(discountCode.percentage) / 100;
    const temp: any[] = [];
    for (let member of members) {
      if (totalMembers === 6 && member.role === RoleTypeEnum.owner) {
        member = await this.calculateRefund(member, 50 / 100, 'groupshop');
      } else if (totalMembers === 10 && member.role === RoleTypeEnum.owner) {
        member = await this.calculateRefund(member, 90 / 100, 'groupshop');
      } else if (member.availedDiscount / 100 < currentMilestone) {
        member = await this.calculateRefund(
          member,
          currentMilestone,
          'groupshop',
        );
      }
      temp.push(member);
    }
    return temp;
  }

  async setPreviousMembersRefundDrops(
    members: MemberInput[],
    discountCode: DiscountCodeInput,
  ) {
    console.log(
      '2908 lineitem price',
      members.map((item) => item.lineItems[0].discountedPrice),
    );
    const currentMilestone = parseFloat(discountCode.percentage);
    const temp: any[] = [];
    for (let member of members) {
      if (member.availedDiscount < currentMilestone) {
        member = await this.calculateRefund(
          member,
          currentMilestone / 100,
          'drops',
        );
        console.log('2908 member.availedDiscount < currentMilestone', member);
      }

      temp.push(member);
    }
    return temp;
  }

  @OnEvent('order.placed')
  async createGroupShop(event: OrderPlacedEvent) {
    try {
      // console.log(
      //   '🚀 ~ file: order-placed.listener.ts ~ line 18 ~ OrderPlacedListener ~ createGroupShop ~ event',
      //   JSON.stringify(event),
      // );
      const {
        order: {
          discountCode, // need to update here when multiple discount codes will work
          name,
          customer,
          id: orderId,
          price: totalProductPrice,
        },
        store: {
          session,
          shop,
          accessToken,
          drops: { rewards: { baseline, average, maximum } } = {
            rewards: {
              baseline: '0',
              average: '0',
              maximum: '0',
            },
          },
          id,
        },
        lineItems,
        gsId,
      } = event;
      console.log('totalProductPrice : ' + totalProductPrice);
      this.accessToken = accessToken;
      this.shop = shop;
      this.order = event.order;
      this.store = event.store;
      this.session = session;
      Logger.log(
        `orderPlaceListener ${JSON.stringify(this.order)}`,
        'THANKSPAGE',
        true,
      );

      const gsMember = new MemberInput();
      gsMember.orderId = orderId;
      // filter out items that price is less than or eq to 1
      const newLineItems = lineItems.filter(({ price }) => +price > 1);
      gsMember.lineItems = newLineItems;
      // console.log(
      //   '🚀 ~ file: order-placed.listener.ts ~ line 242 ~ OrderPlacedListener ~ createGroupShop ~ newLineItems',
      //   newLineItems,
      // );

      //check order price is greater than $1
      if (+totalProductPrice > 1) {
        let dgroupshop = null;
        if (discountCode) {
          dgroupshop = await this.dropsService.findDropsGS(discountCode);
        } else {
          dgroupshop = await this.dropsService.findOne(gsId);
        }
        if (dgroupshop) {
          console.log('im in drops');
          this.groupshop = dgroupshop as Groupshops;
          let isExistingUser = false as boolean;

          if (dgroupshop?.members?.length) {
            const orderDetails = await this.orderService.getMembersOrderDetail(
              dgroupshop?.members,
            );
            orderDetails.forEach((o: any) => {
              if (
                o.customer.email === customer.email ||
                (o.customer?.phone &&
                  customer?.phone &&
                  o.customer.phone === customer.phone)
              ) {
                isExistingUser = true;
              }
            });
          }

          const {
            discountCode: { title, priceRuleId },
            createdAt,
            expiredAt,
            id,
          } = dgroupshop;

          gsMember.role = RoleTypeEnum.referral;
          gsMember.availedDiscount = parseFloat(
            dgroupshop.discountCode.percentage,
          );
          if (dgroupshop?.members?.length) {
            dgroupshop.members = [...dgroupshop.members, gsMember];
          } else {
            dgroupshop.members = [gsMember];
          }

          // console.log(
          //   '🚀 ~ file: order-placed.listener.ts:451 ~ OrderPlacedListener ~ createGroupShop ~ isExistingUser',
          //   isExistingUser,
          // );
          // console.log(
          //   '🚀 ~ file: order-placed.listener.ts:448 ~ OrderPlacedListener ~ createGroupShop ~ dgroupshop.members',
          //   dgroupshop.members,
          // );
          if (!isExistingUser) {
            console.log('!isexistinguser');
            dgroupshop.members = await this.setPreviousMembersRefundDrops(
              dgroupshop.members,
              dgroupshop.discountCode,
            );

            const newDiscount =
              dgroupshop.members.length === 1 ? average : maximum;

            if (
              !!newDiscount &&
              newDiscount !== dgroupshop.discountCode.percentage
            ) {
              // update expiredAt
              const d = new Date(expiredAt);
              d.setHours(d.getHours() + 24);
              dgroupshop.expiredAt = d;
              console.log(
                '🚀 ~ file: order-placed.listener.ts:505 ~ OrderPlacedListener ~ createGroupShop ~ dgroupshop.expiredAt',
                dgroupshop.expiredAt,
              );
              // update discount code
              dgroupshop.discountCode = await this.shopifyapi.setDiscountCode(
                shop,
                'Update',
                this.session,
                title,
                parseInt(newDiscount),
                null,
                createdAt,
                dgroupshop.expiredAt,
                priceRuleId,
                true,
                true,
              );
              // update milestone
              const gsMilestone = new MilestoneInput();
              gsMilestone.activatedAt = new Date();
              gsMilestone.discount = `${newDiscount}`;
              dgroupshop.milestones = [...dgroupshop.milestones, gsMilestone];
              // console.log(
              //   '🚀 ~ file: order-placed.listener.ts:481 ~ OrderPlacedListener ~ createGroupShop ~ gsMilestone',
              //   gsMilestone,
              // );

              this.lifecyclesrv.create({
                groupshopId: dgroupshop.id,
                event: EventType.expired,
                dateTime: dgroupshop.expiredAt,
              });

              if (newDiscount === maximum) {
                this.lifecyclesrv.create({
                  groupshopId: dgroupshop.id,
                  event: EventType.ended,
                  dateTime: dgroupshop.expiredAt,
                });
              }
            }
          }
          await this.dropsService.update(dgroupshop.id, dgroupshop);

          this.dropKlaviyoEvent.webhook = dgroupshop;
          this.dropKlaviyoEvent.emit();
          // console.log(
          //   '🚀 ~ file: order-placed.listener.ts:488 ~ OrderPlacedListener ~ createGroupShop ~ dgroupshop',
          //   dgroupshop.milestones,
          // );
        }
      }
    } catch (err) {
      console.log(
        '🚀 ~ file: order-placed.listener.ts ~ line 452 ~ OrderPlacedListener ~ createGroupShop ~ err',
        err,
      );
      Logger.error(err, OrderPlacedListener.name);
    }
  }
}
