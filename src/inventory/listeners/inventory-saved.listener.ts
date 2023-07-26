import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryService } from '../inventory.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersSavedEvent } from '../events/orders-saved.event';
import { OrdersService } from '../orders.service';
import { Product, ProductVariant } from '../entities/product.entity';
import { InventorySavedEvent } from '../events/inventory-saved.event';
import { InventoryDoneEvent } from '../events/inventory-done.event';

@Injectable()
export class InventorySavedListener {
  constructor(
    private inventoryService: InventoryService,
    private ordersService: OrdersService,
    private eventEmitter: EventEmitter2,
    private inventoryDoneEvent: InventoryDoneEvent,
  ) {}

  @OnEvent('inventory.*')
  async countProductInventory(event: InventorySavedEvent) {
    console.log(
      '🚀 ~ file: inventory-saved.listener.ts:20 ~ InventorySavedListener ~ countProductInventory ~ event',
      event,
    );
    if (event.type && ['saved', 'outofstock'].includes(event.type)) {
      const StoreProducts: Product[] =
        await this.inventoryService.findAllProducts(event.shop);
      // map => variants check qty > 1, outofstock 0 else 1
      // const res = StoreProducts.map((product) => {
      //   product.outofstock = this.inventoryService.calculateOutOfStock(product);
      //   // const isAvailable = product.variants.some(
      //   //   (item) => item.inventoryQuantity > 0,
      //   // );
      //   // product.outofstock = !isAvailable;
      // });

      const blukWrite = StoreProducts.map((item) => {
        return {
          updateOne: {
            filter: { id: item.id },
            update: {
              $set: {
                outofstock: this.inventoryService.calculateOutOfStock(
                  item.variants as ProductVariant[],
                ),
                compareAtPrice: item.variants[0].compareAtPrice,
              },
            },
          },
        };
      });

      await this.inventoryService.getRandomPurchaseCount(StoreProducts);
      await this.inventoryService.setPurchaseCount(blukWrite);
      console.log('Product out of stock updated...');
      this.inventoryDoneEvent.shop = event.shop;
      this.inventoryDoneEvent.accessToken = event.accessToken;
      this.inventoryDoneEvent.emit();
    }
  }
}
