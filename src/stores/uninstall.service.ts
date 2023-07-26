import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { VistorsService } from 'src/gs-common/vistors.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { OrdersService } from 'src/inventory/orders.service';
import { UpdateStoreInput } from './dto/update-store.input';
import { BillingPlanEnum } from './entities/store.entity';
import { StoresService } from './stores.service';

@Injectable()
export class UninstallService {
  constructor(
    private inventorySrv: InventoryService,
    private ordersSrv: OrdersService,
    private storesService: StoresService,
    private configService: ConfigService,
    private readonly lifecyclesrv: LifecycleService,
    private visitorSrv: VistorsService,
  ) {}

  async deleteStoreByName(shop: string) {
    try {
      //   const shop = 'native-roots-dev.myshopify.com';
      const store: UpdateStoreInput = await this.storesService.findOne(shop);
      this.inventorySrv.removeShop(shop);
      this.ordersSrv.removeShop(shop);
      // await this.storesService.removeShop(shop);
      store.status = 'Uninstalled';
      store.installationStep = 0;
      store.totalGroupShop = 0;
      store.plan = BillingPlanEnum.EXPLORE;
      store.logoImage = '';
      // store.brandName = '';
      store.settings = null;
      if (store.subscription) store.subscription.status = 'Zero Trial';
      else store.subscription = { status: 'Zero Trial' };
      store.subscription.confirmationUrl = '';
      await this.storesService.update(store.id, store);
      this.lifecyclesrv.create({
        storeId: store.id,
        event: EventType.uninstalled,
        dateTime: new Date(),
      });
      // if (store?.resources?.length > 0)
      //   store?.resources?.map((res) => {
      //     if (res.type === 'scriptTag') {
      //       this.shopifyService.scriptTagDelete(res.id);
      //     }
      //   });
      await this.storesService.removeDiscoveryToolsInStoreName(store.id);
      Logger.warn(`${shop}--uninstalled`, UninstallService.name);
    } catch (error) {
      console.log(
        '🚀 ~ file: uninstall.service.ts:73 ~ UninstallService ~ deleteStoreByName ~ error',
        error,
      );
      Logger.error(error, UninstallService.name);
      return error.message;
    }
  }
}
