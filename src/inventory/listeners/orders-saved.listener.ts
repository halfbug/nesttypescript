import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryService } from '../inventory.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersSavedEvent } from '../events/orders-saved.event';
import { OrdersService } from '../orders.service';

@Injectable()
export class OrderSavedListener {
  constructor(
    private inventoryService: InventoryService,
    private ordersService: OrdersService,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('orders.saved')
  async setProductsPurchaseCount(event: OrdersSavedEvent) {
    console.log(
      'on Event orders saved reteriving products data ----->>>> ',
      event.shop,
    );
    console.log(event);
    const PurchasedProducts = await this.ordersService.getPurchasedProducts(
      event.shop,
    );

    const blukWrite = PurchasedProducts.map((item) => {
      return {
        updateOne: {
          filter: { id: item.productId },
          update: { $set: { purchaseCount: item.purchaseCount } },
        },
      };
    });

    await this.inventoryService.setPurchaseCount(blukWrite);
    console.log('Product purchase count updated...');
  }
}
