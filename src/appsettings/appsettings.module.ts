import { Module } from '@nestjs/common';
import { AppsettingsService } from './appsettings.service';
import { AppsettingsResolver } from './appsettings.resolver';
import { Appsetting } from './entities/appsetting.model';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Appsetting]), DefaultColumnsService],
  providers: [AppsettingsResolver, AppsettingsService],
  exports: [AppsettingsService],
})
export class AppsettingsModule {}
