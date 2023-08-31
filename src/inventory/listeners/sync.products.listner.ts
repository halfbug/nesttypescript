import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DropsProductsService } from 'src/drops-products/drops-products.service';
import { SyncProductsEvent } from '../events/sync.products.event';

@Injectable()
export class SyncProductsListner {
  constructor(private DropsProductsService: DropsProductsService) {}
  @OnEvent('sync_products')
  async syncProducts(event: SyncProductsEvent) {
    this.DropsProductsService.createJSONL(event.storeId);
  }
}
