import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
// import { ShopifyService } from '../shopify/shopify.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { oldThemeFoundEvent } from '../events/old-theme-found.event';
import { AddResourceEvent } from 'src/stores/events/add-resource.event';

@Injectable()
export class OldThemeFoundListener {
  constructor(
    // private shopifyapi: ShopifyService,
    private configService: ConfigService,
    private addResourceEvent: AddResourceEvent,
  ) {}

  private shop: string;
  // async addResource(resource: string) {
  //   const scriptTag = await this.shopifyapi.scriptTagRegister(resource);
  //   if (scriptTag) {
  //     this.addResourceEvent.shop = this.shop;
  //     this.addResourceEvent.id = scriptTag.id;
  //     this.addResourceEvent.type = 'scriptTag';
  //     this.addResourceEvent.detail = JSON.stringify(scriptTag);
  //     this.addResourceEvent.emit();
  //   }
  // }
  @OnEvent('old.theme.found')
  async registerScriptTag(event: oldThemeFoundEvent) {
    if (this.configService.get('SCRIPTTAG')) {
      // const { shop, accessToken } = event;
      // console.log(
      //   '🚀 ~ file: old-theme-found.listener.ts ~ line 18 ~ InvenotrySavedListener ~ registerScriptTag ~ event',
      // );
      // this.shop = shop;
      // this.shopifyapi.accessToken = accessToken;
      // this.shopifyapi.shop = shop;
      // this.addResource('gsbootstrap.css');
      // this.addResource('gsbootstrap.js');
      // this.addResource('groupshop-pdp.js');
    }
  }
}
