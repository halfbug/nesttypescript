import { Field, InputType, ObjectType } from '@nestjs/graphql';
// {
//     id: 'c8174240-f90e-4cae-99e7-1cf60db0172f',
//     user: {
//       id: 69956763814,
//       first_name: 'maddy',
//       last_name: 'sukoru',
//       email: 'team@groupshop.co',
//       account_owner: true,
//       locale: 'en-US',
//       collaborator: false,
//       email_verified: true
//     },
//     shop: 'native-roots-dev.myshopify.com',
//     accessToken: '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',
//     expires: '2022-09-07T16:06:43.992Z',
//     iat: 1662480406,
//     exp: 1662739606
//   }

@ObjectType()
export class User {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  first_name?: string;
  @Field({ nullable: true })
  last_name: string;
  @Field({ nullable: true, defaultValue: '' })
  account_owner?: boolean;
  @Field({ nullable: true })
  locale?: string;
  @Field({ nullable: true })
  userRole?: string;
  @Field({ nullable: true })
  userId?: string;
  @Field({ nullable: true })
  collaborator?: boolean;
  @Field({ nullable: true })
  email_verified?: boolean;
  @Field({ nullable: true })
  email: string;
}
@InputType('AuthEntityInput')
@ObjectType('AuthEntity')
export class AuthEntity {
  @Field({ nullable: true })
  id?: string;
  @Field({ nullable: true })
  shop?: string;
  @Field({ nullable: true })
  accessToken?: string;
  @Field(() => User, { nullable: true })
  user?: User;
  @Field({ nullable: true })
  expires?: Date;
  @Field({ nullable: true })
  iat?: number;
  @Field({ nullable: true })
  exp?: number;
  @Field({ defaultValue: false })
  isGSAdminUser: boolean;
}
