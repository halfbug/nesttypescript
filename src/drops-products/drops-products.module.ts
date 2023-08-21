import { Module, forwardRef } from '@nestjs/common';
import { DropsProductsService } from './drops-products.service';
import { DropsProductsResolver } from './drops-products.resolver';
import DropsProducts from './entities/drops-products.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DropsProducts]),
    forwardRef(() => InventoryModule),
  ],

  providers: [DropsProductsResolver, DropsProductsService],
  exports: [DropsProductsService],
})
export class DropsProductsModule {}
