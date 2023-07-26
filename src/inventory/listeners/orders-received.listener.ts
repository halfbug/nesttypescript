import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import readJsonLines from 'read-json-lines-sync';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from '../orders.service';
import { OrdersSavedEvent } from '../events/orders-saved.event';
import { OrdersReceivedEvent } from 'src/shopify/events/orders-received.event';

@Injectable()
export class OrdersReceivedListener {
  constructor(
    private httpService: HttpService,
    private orderService: OrdersService,
    private eventEmitter: EventEmitter2,
  ) {}

  private reshapeOrders(orderArray, shop) {
    return orderArray.map((order) => {
      //rename order __parentId
      if (order.__parentId) {
        order.parentId = order.__parentId;
        delete order.__parentId;
      }
      // add shop to order
      order.shop = shop;
      order.price =
        order.totalPriceSet?.shopMoney.amount ||
        order.originalUnitPriceSet?.shopMoney.amount;
      order.totalDiscounts =
        order.totalDiscountSet?.shopMoney.amount ||
        order.currentTotalDiscountsSet?.shopMoney.amount;

      // add record type
      order.recordType = order.id.split('/')[3];
      if (order.recordType === 'Order') {
        order.gateway = order.paymentGatewayNames?.[0];
        order.financialStatus = order.displayFinancialStatus;
      }

      return order;
    });
  }

  @OnEvent('orders.received')
  async storeOrdersReceived(event: OrdersReceivedEvent) {
    console.log('orders Received ----->>>> ', event.shop);
    console.log(event);
    try {
      if (event.bulkOperationResponse.url) {
        this.httpService
          .get(event.bulkOperationResponse.url)
          .subscribe(async (res) => {
            const ordersObj = this.reshapeOrders(
              readJsonLines(res.data),
              event.shop,
            );
            // console.log(JSON.stringify(ordersObj));

            const blukWrite = ordersObj.map((item) => {
              return {
                updateOne: {
                  filter: { id: item.id },
                  update: { $set: { ...item } },
                  upsert: true,
                },
              };
            });
            await this.orderService.updateBulkOrders(blukWrite);

            const ordersSavedEvent = new OrdersSavedEvent();
            ordersSavedEvent.shop = event.shop;
            ordersSavedEvent.accessToken = event.accessToken;
            this.eventEmitter.emit('orders.saved', ordersSavedEvent);
          });
      }
    } catch (err) {
      Logger.error(err, OrdersReceivedListener.name);
    } finally {
      console.log('out');
    }
  }
}
