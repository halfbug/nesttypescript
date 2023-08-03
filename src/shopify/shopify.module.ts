import { Module, forwardRef } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { ShopifyController } from './shopify.controller';
import { StoresModule } from 'src/stores/stores.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { TokenReceivedListener } from './listeners/token-received.listener';
import { StoreSavedListener } from './listeners/store-saved.listener';
import { InvenotrySavedListener } from './listeners/inventory-saved.listener';
import { DropKlaviyoListener } from './listeners/drop-klaviyo.listener';
import { OldThemeFoundListener } from './listeners/old-theme-found.listener';
import { EmailModule } from 'src/email/email.module';
import { AuthModule } from 'src/auth/auth.module';
import { DropsGroupshopModule } from 'src/drops-groupshop/drops-groupshop.module';
import { GsCommonModule } from 'src/gs-common/gs-common.module';
import { AppLoggerModule } from 'src/applogger/applogger.module';
import { DropsCategoryModule } from 'src/drops-category/drops-category.module';
import { OrderCreatedEvent } from './events/order-created.event';
import { OrderCreatedListener } from './listeners/order-created.listener';
import { WebhooksController } from './webhooks.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ThemeAppExtensionController } from './theme-app-extension/theme-app-extension.controller';

@Module({
  imports: [
    forwardRef(() => StoresModule),
    forwardRef(() => InventoryModule),
    forwardRef(() => EmailModule),
    forwardRef(() => DropsGroupshopModule),
    forwardRef(() => GsCommonModule),
    forwardRef(() => AuthModule),
    forwardRef(() => DropsCategoryModule),
    forwardRef(() => AppLoggerModule),
    HttpModule,
  ],
  controllers: [
    ShopifyController,
    WebhooksController,
    ThemeAppExtensionController,
  ],
  providers: [
    ShopifyService,
    TokenReceivedListener,
    StoreSavedListener,
    InvenotrySavedListener,
    DropKlaviyoListener,
    OldThemeFoundListener,
    OrderCreatedEvent,
    OrderCreatedListener,
  ],
  exports: [ShopifyService, OrderCreatedEvent],
})
export class ShopifyModule {}
