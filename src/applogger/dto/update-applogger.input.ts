import { CreateAppLoggerInput } from './create-applogger.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAppLoggerInput extends PartialType(CreateAppLoggerInput) {
  @Field(() => String)
  id: string;
}
