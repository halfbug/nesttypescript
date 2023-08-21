import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrdersService } from 'src/inventory/orders.service';
import {
  CreateOrderInput,
  Customer,
  LineProduct,
} from 'src/inventory/dto/create-order.input';
import { OrderPlacedEvent } from '../events/order-placed.envent';
import { StoresService } from 'src/stores/stores.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { ShopifyService } from '../shopify.service';
import { AESEncryptDecryptService } from 'src/utils/encrypt-decrypt/aes-encrypt-decrypt.service';

@Injectable()
export class OrderCreatedListener {
  constructor(
    private shopifyapi: ShopifyService,
    private orderService: OrdersService,
    private eventEmitter: EventEmitter2,
    private configSevice: ConfigService,
    private storesService: StoresService,
    private inventryService: InventoryService,
    private dropsService: DropsGroupshopService,
    private aesService: AESEncryptDecryptService,
  ) {}

  private shop: string;
  // update Plan In Shopify Billing Subscription
  @OnEvent('order.created')
  async addOrder(event: OrderCreatedEvent) {
    try {
      const { shop, webhook } = event;
      const whOrder = webhook;
      Logger.log(`addOrder ${JSON.stringify(whOrder)}`, 'THANKSPAGE', true);

      // console.log(
      //   'WebhooksController ~ orderCreate ~ webhookData',
      //   JSON.stringify(whOrder),
      // );
      const newOrder = new CreateOrderInput();
      newOrder.id = whOrder.admin_graphql_api_id;
      newOrder.name = '#' + JSON.stringify(whOrder.order_number);
      newOrder.shop = shop;
      newOrder.confirmed = whOrder.confirmed;
      newOrder.shopifyCreatedAt = whOrder.created_at;
      newOrder.price = whOrder.current_subtotal_price;
      newOrder.currencyCode = whOrder.currency;
      newOrder.totalDiscounts = whOrder.total_discounts;
      // newOrder.discountCode = whOrder.discount_codes[0].code || null;
      const dc = whOrder.discount_codes.filter((itm) =>
        itm.code.startsWith(this.configSevice.get('DC_PREFIX')),
      );
      newOrder.discountCode =
        dc[0]?.code || whOrder.discount_codes[0]?.code || null;
      // newOrder.discountInfo = [new DiscountInfo()];
      // newOrder.discountInfo = whOrder.discount_codes?.map(
      //   (dc: DiscountInfo) => new DiscountInfo(dc),
      // );
      const phoneNumber =
        whOrder.phone ??
        whOrder.shipping_address?.phone ??
        whOrder.customer?.phone;
      newOrder.discountInfo = whOrder.discount_codes;
      newOrder.customer = new Customer();
      if (whOrder.customer?.last_name === null) {
        newOrder.customer.firstName = whOrder.billing_address?.first_name;
        newOrder.customer.lastName = whOrder.billing_address?.last_name;
      } else {
        newOrder.customer.firstName = whOrder.customer?.first_name;
        newOrder.customer.lastName = whOrder.customer?.last_name;
      }
      newOrder.customer.email = this.aesService.encryptData(
        whOrder.customer?.email,
      );
      newOrder.customer.ip = whOrder?.browser_ip;
      newOrder.customer.phone =
        whOrder.shipping_address?.country === 'United States'
          ? this.aesService.encryptData(phoneNumber)
          : null;
      newOrder.customer.sms_marketing =
        whOrder?.customer?.sms_marketing_consent?.state || null;
      const newOrderSaved = await this.orderService.create(newOrder);

      const lineItems = await Promise.all(
        whOrder?.line_items?.map(async (item: any) => {
          const newItem = new CreateOrderInput();
          newItem.id = item.admin_graphql_api_id;
          newItem.parentId = whOrder.admin_graphql_api_id;
          newItem.shop = shop;
          newItem.product = new LineProduct();
          newItem.product.id = `gid://shopify/Product/${item.product_id}`;
          newItem.variant = new LineProduct();
          newItem.variant.id = `gid://shopify/ProductVariant/${item.variant_id}`;
          newItem.price = item.price;
          newItem.quantity = item.quantity;
          newItem.totalDiscounts = item.discount_allocations.reduce(
            (total: number, da: any) => {
              return total + +da.amount;
            },
            0,
          );
          const resInv = await this.inventryService.updateInventory(
            `gid://shopify/Product/${item.product_id}`,
            item.quantity,
            'purchaseCount',
          );
          console.log(
            '🚀 ~ file: order-created.listener.ts ~ line 100 ~ OrderCreatedListener ~ whOrder?.line_items?.map ~ resInv',
            JSON.stringify(resInv),
          );

          newItem.discountedPrice =
            +item.price - +newItem.totalDiscounts / item.quantity;
          newItem.discountCode = whOrder.discount_codes[0]?.code;
          newItem.discountInfo = item.discount_allocations.map((dinfo) => ({
            amount: dinfo.amount,
            code:
              whOrder.discount_applications[dinfo.discount_application_index]
                .code ??
              whOrder.discount_applications[dinfo.discount_application_index]
                .title,
            type:
              whOrder.discount_applications[dinfo.discount_application_index]
                .type +
              '-' +
              whOrder.discount_applications[dinfo.discount_application_index]
                .value_type,
            value:
              whOrder.discount_applications[dinfo.discount_application_index]
                .value,
          }));
          newItem.shopifyCreatedAt = whOrder.created_at;
          newItem.refferalId = whOrder.note_attributes.length
            ? whOrder.note_attributes[0]?.value
            : null;
          return await this.orderService.create(newItem);
          // return newItem;
        }),
      );

      const newOrderPlaced = new OrderPlacedEvent();
      newOrderPlaced.klaviyo = {
        ...newOrder.customer,
        email: whOrder.customer.email,
        phone: phoneNumber,
      };
      newOrderPlaced.order = {
        ...newOrderSaved,
        customer: {
          ...newOrderSaved.customer,
          email: whOrder.customer.email,
          phone: phoneNumber,
        },
      };
      newOrderPlaced.store = await this.storesService.findOneByName(shop);
      newOrderPlaced.lineItems = lineItems;
      newOrderPlaced.gsId = whOrder.note_attributes.length
        ? whOrder.note_attributes[0]?.value
        : null;
      // console.log(
      //   '🚀 ~ file: order-created.listener.ts:137 ~ OrderCreatedListener ~ addOrder ~ newOrderPlaced',
      //   JSON.stringify(newOrderPlaced.store.activeCampaign),
      // );

      this.eventEmitter.emit('order.placed', newOrderPlaced);
    } catch (err) {
      Logger.error(err, OrderCreatedListener.name);
    }
  }

  @OnEvent('order.created')
  async setCartRewardsTags(event: OrderCreatedEvent) {
    try {
      const { shop, webhook } = event;
      const whOrder = webhook;
      const { session, drops: { cartRewards } = { cartRewards: [] } } =
        await this.storesService.findOne(shop);

      const refferalId = whOrder.note_attributes.length
        ? whOrder.note_attributes[0]?.value
        : null;
      const dgroupshop = await this.dropsService.findOne(refferalId);

      // track product collection
      if (dgroupshop) {
        // get collections of lineitems
        const pids: string[] = whOrder?.line_items?.map(
          (l) => `gid://shopify/Product/${l.product_id}`,
        );
        let note = '';

        for (const pid of pids) {
          const collections =
            await this.inventryService.getCollectionNameByProductId(shop, pid);
          note = note.concat(
            '',
            `product : ${pid.replace(
              'gid://shopify/Product/',
              '',
            )} collections : ${collections.map((c) => c.title).toString()};`,
          );
        }

        const subTotal = +whOrder.current_subtotal_price;

        let tags: string[];
        if (cartRewards.length) {
          tags = cartRewards
            .filter((cr) => subTotal >= +cr?.rewardValue)
            .map((cr) => cr.rewardTitle);
        }

        await this.shopifyapi.addTagsToOrder(
          shop,
          session,
          tags?.length ? tags : [],
          note,
          whOrder.admin_graphql_api_id,
        );
      }
    } catch (err) {
      Logger.error(err, OrderCreatedListener.name);
    }
  }
}
