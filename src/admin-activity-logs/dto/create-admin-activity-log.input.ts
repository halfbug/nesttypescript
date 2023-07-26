import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class fieldDetails {
  @Field({ nullable: true })
  parentTitle?: string;

  @Field({ nullable: true })
  fieldName?: string;

  @Field({ nullable: true })
  oldValue?: string;

  @Field({ nullable: true })
  newValue?: string;
}

@InputType()
export class CreateAdminActivityLogInput {
  @Field()
  id?: string;

  @Field()
  operation: string;

  @Field()
  route: string;

  @Field()
  context: string;

  @Field({ nullable: true })
  storeId?: string;

  @Field()
  userId?: string;

  @Field(() => fieldDetails)
  changes?: fieldDetails[];

  @Field({ defaultValue: new Date() })
  createdAt?: Date;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;
}
