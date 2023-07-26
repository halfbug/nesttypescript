import { InputType, Int, Field } from '@nestjs/graphql';
import { AppLogger, LogEventTypeEnum } from '../entities/applogger.entity';

@InputType()
export class CreateAppLoggerInput extends AppLogger {
  @Field()
  message: string;
}
