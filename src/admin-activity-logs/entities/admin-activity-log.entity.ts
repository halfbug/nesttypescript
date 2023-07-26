import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  AdminRole,
  Permission,
} from 'src/admin-roles/entities/admin-role.entity';
import { AdminUser } from 'src/admin-users/entities/admin-user.entity';

@ObjectType('collections')
export class collections {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  shopifyId?: string;

  @Field({ nullable: true })
  type?: string;
}

@ObjectType('discoveryTool')
export class discoveryTool {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  brandName?: string;
}

@ObjectType('fieldDetail')
export class fieldDetail {
  @Field({ nullable: true })
  parentTitle?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  userRole?: string;

  @Field({ nullable: true })
  fieldname?: string;

  @Field({ nullable: true })
  oldvalue?: string;

  @Field({ nullable: true })
  newValue?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  sortOrder?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  orderId?: string;

  @Field({ nullable: true })
  brandName?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => [collections], { nullable: true })
  collections?: collections[];

  @Field(() => [discoveryTool], { nullable: true })
  discoveryTool?: discoveryTool[];

  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  rewardTitle?: string;

  @Field({ nullable: true })
  rewardValue?: string;

  @Field({ nullable: true })
  roleName?: string;

  @Field(() => [Permission], { nullable: true })
  permission?: Permission[];
}

@ObjectType()
export class AdminActivityLog {
  @Field()
  id?: string;

  @Field()
  operation?: string;

  @Field()
  route?: string;

  @Field()
  context?: string;

  @Field({ nullable: true })
  storeId?: string;

  @Field()
  userId?: string;

  @Field(() => AdminUser)
  user?: AdminUser;

  @Field(() => AdminRole, { nullable: true })
  adminRole?: AdminRole;

  @Field(() => [fieldDetail])
  changes?: fieldDetail[];

  @Field({ defaultValue: new Date() })
  createdAt: Date;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;
}
