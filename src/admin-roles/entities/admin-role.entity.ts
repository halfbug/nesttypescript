import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Permission')
export class Permission {
  @Field({ nullable: true })
  name: string;
  @Field({ nullable: true })
  category: string;
}

@ObjectType('generalPermission')
export class generalPermission {
  @Field({ nullable: true })
  title: string;
  @Field({ nullable: true })
  route: string;
  @Field({ nullable: true })
  category: string;
}

@ObjectType()
export class AdminRole {
  @Field(() => ID)
  id?: string;

  @Field({ nullable: true })
  roleName?: string;

  @Field(() => [Permission], { nullable: 'itemsAndList' })
  permission?: Permission[];

  @Field(() => [generalPermission], { nullable: 'itemsAndList' })
  generalPermission?: generalPermission[];

  @Field({ defaultValue: new Date() })
  createdAt?: Date;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;
}
