import { CreateAdminActivityLogInput } from './create-admin-activity-log.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAdminActivityLogInput extends PartialType(
  CreateAdminActivityLogInput,
) {
  @Field(() => String)
  id: string;
}
