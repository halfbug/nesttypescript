import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DropsProductsService } from 'src/drops-products/drops-products.service';

@Injectable()
export class SyncProductsListner {
  constructor(private DropsProductsService: DropsProductsService) {}
  @OnEvent('sync_products')
  async syncProducts() {
    this.DropsProductsService.createJSONL('');
  }
}
