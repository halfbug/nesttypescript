import { CreateAdminUserInput } from './create-admin-user.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAdminUserInput extends PartialType(CreateAdminUserInput) {
  @Field(() => String)
  id: string;
  // @Field(() => String, { nullable: true })
  // _id?: string;
}
