import { forwardRef, Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import Inventory from './entities/inventory.modal';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { HttpModule } from '@nestjs/axios';
import { InventoryReceivedListener } from './listeners/inventory-received.listener';
import { OrdersService } from './orders.service';
import { OrdersReceivedListener } from './listeners/orders-received.listener';
import Orders from './entities/orders.modal';
import { OrderSavedListener } from './listeners/orders-saved.listener';
import { InventorySavedListener } from './listeners/inventory-saved.listener';
import { OrdersResolver } from './orders.resolver';
import { InventoryDoneEvent } from './events/inventory-done.event';
import { ProductOutofstockEvent } from './events/product-outofstock.event';
import { SyncCollectionCron } from './inventory.cron';
// import { ShopifyStoreModule } from 'src/shopify-store/shopify-store.module';
import { StoresModule } from 'src/stores/stores.module';
import { AppLoggerModule } from 'src/applogger/applogger.module';
import { SearchIndexingRefreshEvent } from './events/searchIndexing-refresh.event';
import { SearchIndexingListener } from './listeners/searchIndexing-refresh.listner';
import { DropsCategoryModule } from 'src/drops-category/drops-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, Orders]),
    DefaultColumnsService,
    HttpModule,
    DropsCategoryModule,
    forwardRef(() => StoresModule),
    // forwardRef(() => ShopifyStoreModule),
    forwardRef(() => AppLoggerModule),
  ],
  providers: [
    InventoryResolver,
    InventoryService,
    InventoryReceivedListener,
    OrdersReceivedListener,
    OrdersService,
    OrderSavedListener,
    InventorySavedListener,
    OrdersResolver,
    SearchIndexingRefreshEvent,
    SearchIndexingListener,
    InventoryDoneEvent,
    ProductOutofstockEvent,
    SyncCollectionCron,
    InventoryDoneEvent,
  ],
  exports: [
    InventoryService,
    OrdersService,
    SearchIndexingRefreshEvent,
    InventoryDoneEvent,
    ProductOutofstockEvent,
  ],
})
export class InventoryModule {}
