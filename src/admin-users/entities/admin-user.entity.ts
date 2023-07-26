import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AdminRole } from 'src/admin-roles/entities/admin-role.entity';

@ObjectType('userAdminRole')
export class userAdminRole {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  roleName: string;
}

@ObjectType('AdminUser')
export class AdminUser {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => [String])
  roles: string[];

  @Field({ defaultValue: 'Active', nullable: true })
  status: string;

  @Field(() => userAdminRole, { nullable: true })
  userRole?: userAdminRole;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field({ defaultValue: new Date() })
  createdAt: Date;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;

  @Field(() => [String], { nullable: true })
  favouriteStore?: [string];
}
