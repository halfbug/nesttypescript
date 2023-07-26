import { CreateAdminPermissionInput } from './create-admin-permission.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAdminPermissionInput extends PartialType(
  CreateAdminPermissionInput,
) {
  @Field(() => String)
  id: string;
}
