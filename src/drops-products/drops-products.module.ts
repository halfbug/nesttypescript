import { Module } from '@nestjs/common';
import { DropsProductsService } from './drops-products.service';
import { DropsProductsResolver } from './drops-products.resolver';

@Module({
  providers: [DropsProductsResolver, DropsProductsService],
})
export class DropsProductsModule {}
