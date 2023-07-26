import { Module } from '@nestjs/common';
import { AdminRolesService } from './admin-roles.service';
import { AdminRolesResolver } from './admin-roles.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import AdminUserRole from './entities/admin-role.model';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserRole]), DefaultColumnsService],
  providers: [AdminRolesResolver, AdminRolesService],
  exports: [AdminRolesService],
})
export class AdminRolesModule {}
