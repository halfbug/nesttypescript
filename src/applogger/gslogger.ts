import { Injectable } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';
import { CreateAppLoggerInput } from './dto/create-applogger.input';
import { AppLoggerService } from './applogger.service';
import { AdminActivityLogsService } from 'src/admin-activity-logs/admin-activity-logs.service';

@Injectable()
export class Gslogger extends ConsoleLogger {
  constructor(
    private readonly apploggerService: AppLoggerService,
    private readonly adminActivityLogsService: AdminActivityLogsService,
  ) {
    super();
  }
  log(
    message: any,
    context?: string,
    save2db?: boolean,
    operation?: string,
    mfields?: any,
    userId?: string,
    oldValue?: any,
    storeId?: string,
  ): void {
    super.log(message, context);
    if (save2db) {
      const elog = new CreateAppLoggerInput();
      elog.context = context.toUpperCase();
      elog.message = message;
      elog.level = 'log';
      this.apploggerService.create(elog);
    }
    if (mfields) {
      this.adminActivityLogsService.createAdminActivity(
        message,
        context,
        operation,
        mfields,
        userId,
        oldValue,
        storeId,
      );
    }
    // console.log({ message });
  }
  error(exception: any, stack?: string, context?: string) {
    console.log('gslogger', exception, stack, context);
    super.error(exception.message, context);
    const elog = new CreateAppLoggerInput();
    elog.stack = stack?.length < 30 ? exception.stack : stack;
    elog.context = context ? context.toUpperCase() : stack.toUpperCase();
    elog.message = exception.message ?? exception;
    elog.level = 'error';
    this.apploggerService.create(elog);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    const elog = new CreateAppLoggerInput();
    elog.context = context?.toUpperCase();
    elog.message = message;
    elog.level = 'warn';
    this.apploggerService.create(elog);
  }
  debug(message: any, context?: string) {
    super.debug(message, context);
  }
  activity(message: string, route: string, context?: any) {
    super.log(message, context);
    console.log('message', JSON.stringify(message));
    console.log('context', JSON.stringify(context));
  }
}
