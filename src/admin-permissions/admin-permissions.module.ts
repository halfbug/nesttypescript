import { Module } from '@nestjs/common';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminPermissionsResolver } from './admin-permissions.resolver';
import AdminPermission from './entities/admin-permission.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminPermission]), DefaultColumnsService],
  providers: [AdminPermissionsResolver, AdminPermissionsService],
  exports: [AdminPermissionsService],
})
export class AdminPermissionsModule {}
