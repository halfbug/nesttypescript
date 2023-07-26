import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersResolver } from './admin-users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import AdminUser from './entities/admin-user.model';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUser]), DefaultColumnsService],
  providers: [AdminUsersResolver, AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
