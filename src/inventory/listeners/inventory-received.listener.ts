import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import readJsonLines from 'read-json-lines-sync';
import { InventoryService } from '../inventory.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventorySavedEvent } from '../events/inventory-saved.event';
import { InventoryReceivedEvent } from 'src/shopify/events/inventory-received.event';

@Injectable()
export class InventoryReceivedListener {
  constructor(
    private httpService: HttpService,
    private inventoryService: InventoryService,
    private eventEmitter: EventEmitter2,
  ) {}

  private handleFile(err, data) {
    if (err) throw err;
    const obj = JSON.parse(data);
    // You can now play with your datas
    console.log(obj);
  }

  private reshapeInventory(inventoryArray, shop) {
    return inventoryArray.map((inventory) => {
      //
      // if (typeof inventory.featuredImage === 'object')
      inventory.featuredImage = inventory?.featuredImage?.src;
      inventory.price =
        inventory?.priceRangeV2?.maxVariantPrice?.amount || inventory.price;
      inventory.currencyCode =
        inventory?.priceRangeV2?.maxVariantPrice?.currencyCode;

      //rename inventory __parentId
      if (inventory.__parentId) {
        inventory.parentId = inventory.__parentId;
        delete inventory.__parentId;
      }
      // add shop to inventory
      inventory.shop = shop;

      // add record type
      inventory.recordType = inventory.id.split('/')[3];

      if (inventory.productType) {
        inventory.productCategory = inventory.productType;
        delete inventory.productType;
      }

      //add inventory management details
      if (inventory.recordType === 'ProductVariant') {
        inventory.inventoryManagement = inventory?.inventoryItem?.tracked
          ? 'shopify'
          : null;
        inventory.compareAtPrice = inventory?.compareAtPrice ?? null;
      }

      delete inventory.inventoryItem;
      inventory.createdAt = new Date();
      inventory.updatedAt = new Date();
      return inventory;
    });
  }

  @OnEvent('inventory.received')
  async storeInventoryReceived(event: InventoryReceivedEvent) {
    console.log('inventory Received ----->>>> ', event.shop);
    console.log(event);
    // const productBulkFile = createReadStream(event.bulkOperationResponse.url);
    this.httpService
      .get(event.bulkOperationResponse.url)
      .subscribe(async (res) => {
        const inventoryObj = this.reshapeInventory(
          readJsonLines(res.data),
          event.shop,
        );
        // console.log(inventoryObj);
        // const savedInventory =
        await this.inventoryService.insertMany(inventoryObj);
        console.log('saved inventory for ', event.shop);

        const inventorySavedEvent = new InventorySavedEvent();
        inventorySavedEvent.shop = event.shop;
        inventorySavedEvent.accessToken = event.accessToken;
        inventorySavedEvent.type = 'saved';
        this.eventEmitter.emit('inventory.saved', inventorySavedEvent);
      });
  }
}
