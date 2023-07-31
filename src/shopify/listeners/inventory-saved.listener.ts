import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
// import { ShopifyService } from '../shopify/shopify.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventorySavedEvent } from 'src/inventory/events/inventory-saved.event';
import { OrdersReceivedEvent } from '../events/orders-received.event';
import { ShopifyService } from '../shopify.service';
import { StoresService } from 'src/stores/stores.service';

@Injectable()
export class InvenotrySavedListener {
  constructor(
    private shopifyapi: ShopifyService,
    private storeService: StoresService,
    private configSevice: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}
  // @OnEvent('inventory.saved')
  // async bulkOrdersQuery(event: InventorySavedEvent) {
  //   console.log('inventory----saved ---> fetching Orders Data');
  //   try {
  //     const { shop, accessToken } = event;
  //     const client = await this.shopifyapi.client(shop, accessToken);
  //     const qres = await client.query({
  //       data: {
  //         query: `mutation {
  //           bulkOperationRunQuery(
  //            query:"""
  //             {
  //                orders(first:10000, reverse:true){
  //                         edges{
  //                           node{
  //                             name
  //                             id
  //                             shopifyCreateAt:createdAt
  //                             confirmed
  //                             cancelledAt
  //                             currencyCode
  //                             paymentGatewayNames
  //                             displayFinancialStatus
  //                             customer{

  //                               firstName
  //                               lastName
  //                               email

  //                             }
  //                             discountCode
  //                             totalPriceSet{
  //                               shopMoney{
  //                                 amount
  //                                 currencyCode
  //                               }
  //                             }
  //                             lineItems(first:100){
  //                               edges{
  //                                 node{
  //                                   id
  //                                   originalUnitPriceSet{
  //                                     shopMoney{
  //                                       amount
  //                                       currencyCode
  //                                     }
  //                                   }
  //                                   totalDiscountSet{
  //                                     shopMoney{
  //                                       amount
  //                                       currencyCode
  //                                     }}
  //                                   quantity
  //                                   product{
  //                                     id
  //                                     priceRangeV2{
  //                                       maxVariantPrice{
  //                                         amount
  //                                         currencyCode
  //                                       }
  //                                     }
  //                                   }
  //                                   variant{
  //                                     id,
  //                                     price
  //                                     }
  //                                 }
  //                               }
  //                             }

  //                           }
  //                         }
  //                       }
  //             }
  //             """
  //           ) {
  //             bulkOperation {
  //               id
  //               status
  //             }
  //             userErrors {
  //               field
  //               message
  //             }
  //           }
  //         }`,
  //       },
  //     });

  //     // console.log(event);
  //     console.log(JSON.stringify(qres));
  //     console.log(
  //       'orderbulk',
  //       qres.body['data']['bulkOperationRunQuery']['bulkOperation'],
  //     );
  //     // const dopoll = true;
  //     if (
  //       qres.body['data']['bulkOperationRunQuery']['bulkOperation'][
  //         'status'
  //       ] === 'CREATED'
  //     ) {
  //       const pollit = setInterval(async () => {
  //         const poll = await client.query({
  //           data: {
  //             query: `query {
  //           currentBulkOperation {
  //             id
  //             status
  //             errorCode
  //             createdAt
  //             completedAt
  //             objectCount
  //             fileSize
  //             url
  //             partialDataUrl
  //           }
  //         }`,
  //           },
  //         });

  //         console.log(poll.body['data']['currentBulkOperation']);
  //         if (
  //           poll.body['data']['currentBulkOperation']['status'] === 'COMPLETED'
  //         ) {
  //           clearInterval(pollit);

  //           // fire inventory received event

  //           const ordersReceivedEvent = new OrdersReceivedEvent();
  //           ordersReceivedEvent.bulkOperationResponse =
  //             poll.body['data']['currentBulkOperation'];
  //           ordersReceivedEvent.shop = shop;
  //           ordersReceivedEvent.accessToken = accessToken;

  //           this.eventEmitter.emit('orders.received', ordersReceivedEvent);
  //         } else if (
  //           poll.body['data']['currentBulkOperation']['status'] === 'FAILED'
  //         ) {
  //           clearInterval(pollit);
  //           Logger.error(
  //             { message: 'Order bulk failed' },
  //             'inventory-saved.listener.ts:156 ~ InvenotrySavedListener ',
  //             InvenotrySavedListener.name,
  //           );
  //         }
  //       }, 3000);
  //     } else console.log(JSON.stringify(qres.body['data']));
  //   } catch (err) {
  //     Logger.error(err, InvenotrySavedListener.name);
  //     console.log(JSON.stringify(err));
  //   }
  // }

  @OnEvent('inventory.saved')
  async registerWebhooks(event: InventorySavedEvent) {
    try {
      const { shop } = event;
      const session = await this.storeService.loadStoreSession(shop);

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/product-create',
        'PRODUCTS_CREATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/uninstalled',
        'APP_UNINSTALLED',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/product-update',
        'PRODUCTS_UPDATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/order-create',
        'ORDERS_CREATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/product-delete',
        'PRODUCTS_DELETE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/customer-update',
        'CUSTOMERS_UPDATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/collection-create',
        'COLLECTIONS_CREATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/collection-delete',
        'COLLECTIONS_DELETE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/bulk-finish',
        'BULK_OPERATIONS_FINISH',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/collection-update',
        'COLLECTIONS_UPDATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/billing-failure',
        'SUBSCRIPTION_BILLING_ATTEMPTS_FAILURE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/billing-success',
        'SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/app-subscription',
        'APP_SUBSCRIPTIONS_UPDATE',
        session,
      );

      await this.shopifyapi.registerHook(
        shop,
        '/webhooks/order-updated',
        'ORDERS_UPDATED',
        session,
      );

      console.log('webhook registered');
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, InvenotrySavedListener.name);
    }
  }
}
