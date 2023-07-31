import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { CreateShopifyDto } from './dto/create-shopify.dto';
import { UpdateShopifyDto } from './dto/update-shopify.dto';
import { Public } from 'src/auth/public.decorator';
import { Request, Response } from 'express';
import { StoresService } from 'src/stores/stores.service';
import { OrdersService } from 'src/inventory/orders.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { ConfigService } from '@nestjs/config';

@Public()
@Controller()
export class ShopifyController {
  constructor(
    private readonly shopifyService: ShopifyService,
    private storesService: StoresService,
    private ordersSrv: OrdersService,
    private inventorySrv: InventoryService,
    private configService: ConfigService,
  ) {}

  @Get()
  async login(@Req() req: Request, @Res() res: Response) {
    console.log('inside login get request');
    const { shop } = req.query;
    console.log(
      '🚀 ~ file: shopify.controller.ts:25 ~ ShopifyController ~ login ~ shop:',
      shop,
    );
    await this.shopifyService.shopify.auth.begin({
      shop: await this.shopifyService.sanitizeShop(shop),
      callbackPath: '/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    console.log('inside shoify store callback');
    console.log('req.quer :', req.query);
    console.log('req.body :', req.body);
    const { session } = await this.shopifyService.shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });
    console.log(
      '🚀 ~ file: shopify.controller.ts:47 ~ ShopifyController ~ callback ~ callback:',
      session,
    );

    if (!this.shopifyService.shopify.config.scopes.equals(session.scope)) {
      // Sc opes have changed, the app should redirect the merchant to OAuth
      return res.redirect(`https://${session.shop}/admin/oauth/authorize`);
    }
    const { shop } = req.query;
    const store = await this.storesService.findOne(shop as string);
    const isStoreExist = store && store.status !== 'Uninstalled';
    if (!isStoreExist) {
      const offlineSession = this.shopifyService.offlineSession(session);
      // const offlineSessRes = await this.shopifyapi.offlineSession(shop);
      console.log(
        '🚀 ~ file: store.service.ts ~ line 56 ~ StoreService ~ callback ~ offlineSessRes',
        JSON.stringify(offlineSession),
      );
    } else
      await this.storesService.updateField(
        { id: store.id },
        { state: session.state },
      );
    return res.redirect(`/auth?shop=${shop}`);
  }

  @Get('test')
  test() {
    return 'running server on port 5000';
  }

  @Get('refresh')
  async dbfresh() {
    try {
      const shop = 'native-roots-dev.myshopify.com';
      const store = await this.storesService.findOne(shop);
      // this.shopifyService.accessToken = store.accessToken;
      // this.shopifyService.shop = shop;
      if (store?.resources?.length > 0)
        store?.resources?.map((res) => {
          if (res.type === 'scriptTag') {
            // this.shopifyService.scriptTagDelete(res.id);
          }
        });
      await this.inventorySrv.removeShop(shop);
      await this.ordersSrv.removeShop(shop);
      return 'done';
    } catch (error) {
      return error.message;
    }
  }

  @Get('healthcheck')
  async testme() {
    return `server is running properly with CI/CD on
    HOST: ${process.env.HOST}
    FRONT: ${process.env.FRONT}`;
  }

  @Get('type')
  async tesstme() {
    return this.configService.get('BILLING_LIVE');
  }

  @Get('billing-status')
  async checkbillstatus() {
    return {
      billingStatus: this.configService.get('BILLING_LIVE'),
    };
  }

  // @Get('add-secondary-purchase-count')
  // async addSecondaryPurchaseCount() {
  //   const manager = getMongoManager();
  //   const products = await manager.find(Inventory, {
  //     where: {
  //       recordType: 'Product',
  //       secondaryCount: null,
  //     },
  //   });

  //   return await this.inventorySrv
  //     .getRandomPurchaseCount(products)
  //     .then(() => {
  //       return `Random purchase count added in ${products.length} products`;
  //     })
  //     .catch((err) => {
  //       return `ERROR ${err}`;
  //     });
  // }
}
