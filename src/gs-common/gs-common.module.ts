import { forwardRef, Module } from '@nestjs/common';
import { VistorsService } from './vistors.service';
import { LifecycleService } from './lifecycle.service';
import { Lifecycle } from './entities/lifecycle.modal';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitors } from './entities/visitors.modal';
import { ViewedInterceptor } from './viewed.inceptor';
import { UtilsModule } from 'src/utils/utils.module';
import { GSLoadedEvent } from './events/groupshop-loaded.event';
import { GSLoadedListener } from './listeners/groupshop-loaded.listener';
import { GsCommonService } from './gs-common.service';
import { DropsGroupshopModule } from 'src/drops-groupshop/drops-groupshop.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lifecycle, Visitors]),
    UtilsModule,
    forwardRef(() => EmailModule),
    forwardRef(() => DropsGroupshopModule),
  ],
  providers: [
    VistorsService,
    LifecycleService,
    ViewedInterceptor,
    GSLoadedEvent,
    GSLoadedListener,
    GsCommonService,
  ],
  exports: [VistorsService, LifecycleService, GSLoadedEvent, GSLoadedListener],
})
export class GsCommonModule {}
