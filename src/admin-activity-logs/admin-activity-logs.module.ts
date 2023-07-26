import { Module, forwardRef } from '@nestjs/common';
import { AdminActivityLogsService } from './admin-activity-logs.service';
import { AdminActivityLogsResolver } from './admin-activity-logs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import AdminActivityLogs from './entities/admin-activity-log.model';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { StoresModule } from 'src/stores/stores.module';
import { DropsCategoryModule } from 'src/drops-category/drops-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminActivityLogs]),
    forwardRef(() => StoresModule),
    forwardRef(() => DropsCategoryModule),
    DefaultColumnsService,
  ],
  providers: [AdminActivityLogsResolver, AdminActivityLogsService],
  exports: [AdminActivityLogsService],
})
export class AdminActivityLogsModule {}
