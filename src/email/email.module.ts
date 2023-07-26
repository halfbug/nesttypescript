import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { InventoryModule } from 'src/inventory/inventory.module';
import { CatController } from './connect/connect.controller';
import { GroupshopCashbackListener } from './listeners/groupshop-cashback.listener';
import { KalavioService } from './kalavio.service';

import { KalavioResolver } from './kalavio.resolver';
import { StoresModule } from 'src/stores/stores.module';
import { DropsGroupshopModule } from 'src/drops-groupshop/drops-groupshop.module';
import { GsCommonModule } from 'src/gs-common/gs-common.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => InventoryModule),
    forwardRef(() => DropsGroupshopModule),
    forwardRef(() => GsCommonModule),
    forwardRef(() => StoresModule),
  ],
  providers: [GroupshopCashbackListener, KalavioService, KalavioResolver],
  exports: [KalavioService],
  controllers: [CatController],
})
export class EmailModule {}
