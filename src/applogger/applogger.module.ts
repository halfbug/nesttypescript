import { forwardRef, Module } from '@nestjs/common';
import { AppLoggerService } from './applogger.service';
import { AppLoggerResolver } from './applogger.resolver';
import { AppLogger } from './entities/applogger.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gslogger } from './gslogger';
import { AdminActivityLogsModule } from 'src/admin-activity-logs/admin-activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppLogger]),
    forwardRef(() => AdminActivityLogsModule),
  ],
  providers: [AppLoggerResolver, AppLoggerService, Gslogger],
  exports: [Gslogger, AppLoggerService],
})
export class AppLoggerModule {}
