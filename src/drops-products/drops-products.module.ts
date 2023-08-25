import { Module, forwardRef } from '@nestjs/common';
import { DropsProductsService } from './drops-products.service';
import { DropsProductsResolver } from './drops-products.resolver';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { StoresModule } from 'src/stores/stores.module';
import { HttpModule } from '@nestjs/axios';
import DropsProducts from './entities/drops-products.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DropsProducts]),
    forwardRef(() => ShopifyModule),
    forwardRef(() => StoresModule),
    forwardRef(() => InventoryModule),
    HttpModule,
  ],
  providers: [DropsProductsResolver, DropsProductsService],
  exports: [DropsProductsService],
})
export class DropsProductsModule {}
