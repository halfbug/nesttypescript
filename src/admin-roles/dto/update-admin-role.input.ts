import { CreateAdminRoleInput } from './create-admin-role.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAdminRoleInput extends PartialType(CreateAdminRoleInput) {
  @Field(() => String)
  id: string;
}
