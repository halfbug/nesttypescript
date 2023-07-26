import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAdminPermissionInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  route: string;

  @Field({ nullable: true })
  category: string;
}
