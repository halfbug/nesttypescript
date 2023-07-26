import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
// import { ShopifyService } from '../shopify/shopify.service';
import { AddResourceEvent } from 'src/stores/events/add-resource.event';
import { StoreSavedEvent } from 'src/stores/events/store-saved.event';
import { StoresService } from 'src/stores/stores.service';
import { UpdateStoreInput } from 'src/stores/dto/update-store.input';

@Injectable()
export class StoreSavedListener {
  constructor(
    // private shopifyapi: ShopifyService,
    private configService: ConfigService,
    private addResourceEvent: AddResourceEvent,
    private storeService: StoresService,
  ) {}

  private shop: string;
  // async addResource(resource: string) {
  //   const scriptTag = await this.shopifyapi.scriptTagRegister(
  //     resource,
  //     'ORDER_STATUS',
  //   );
  //   if (scriptTag) {
  //     this.addResourceEvent.shop = this.shop;
  //     this.addResourceEvent.id = scriptTag.id;
  //     this.addResourceEvent.type = 'scriptTag';
  //     this.addResourceEvent.detail = JSON.stringify(scriptTag);
  //     this.addResourceEvent.emit();
  //   }
  // }
  // @OnEvent('store.saved')
  // async registerScriptTag(event: StoreSavedEvent) {
  //   if (this.configService.get('SCRIPTTAG')) {
  //     const { shop, accessToken } = event;
  //     console.log('🚀 ~ store saved listener');
  //     this.shop = shop;

  //     this.shopifyapi.accessToken = accessToken;
  //     this.shopifyapi.shop = shop;

  //     this.addResource('groupshop-thanks.js');
  //     console.log('🚀 ~ order status registered');
  //   }
  // }

  // @OnEvent('store.saved')
  // async getStoreDetail(event: StoreSavedEvent) {
  //   const { shop, accessToken, storeId } = event;
  //   this.shopifyapi.accessToken = accessToken;
  //   this.shopifyapi.shop = shop;
  //   const { body: shopRec } = await this.shopifyapi.storeDetail();
  //   const store = new UpdateStoreInput();
  //   store.id = storeId;
  //   store.currencyCode = shopRec['data']['shop']['currencyCode'];
  //   store.timezone = shopRec['data']['shop']['ianaTimezone'];
  //   this.storeService.update(storeId, store);
  // }
}
