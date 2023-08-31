import { forwardRef, Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresResolver } from './stores.resolver';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Store from './entities/store.model';
import { ShopifyAPIListener } from './listeners/shopify.listener';
import { StoreListener } from './listeners/store.listener';
import { AnyScalar } from 'src/utils/any.scalarType';
import { AddResourceListener } from './listeners/add-resource.listener';
import { AddResourceEvent } from './events/add-resource.event';
import { StoreSavedEvent } from './events/store-saved.event';
import { UninstallService } from './uninstall.service';
// import { CampaignsModule } from 'src/campaigns/campaigns.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { GsCommonModule } from 'src/gs-common/gs-common.module';
import { StoreUpdatePlanCron } from './store.cron';
import { DropsGroupshopModule } from 'src/drops-groupshop/drops-groupshop.module';
import { SyncProductsEvent } from 'src/inventory/events/sync.products.event';
import { DropsProductsModule } from 'src/drops-products/drops-products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    // AnyScalar,
    DefaultColumnsService,
    ShopifyModule,
    InventoryModule,
    forwardRef(() => DropsGroupshopModule),
    DropsProductsModule,
    GsCommonModule,
  ],
  providers: [
    StoresResolver,
    StoresService,
    ShopifyAPIListener,
    StoreListener,
    AddResourceListener,
    AddResourceEvent,
    StoreSavedEvent,
    UninstallService,
    StoreUpdatePlanCron,
    SyncProductsEvent,
  ],
  exports: [StoresService, AddResourceEvent, StoreSavedEvent, UninstallService],
})
export class StoresModule {}
