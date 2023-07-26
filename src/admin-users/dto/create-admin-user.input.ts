import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
@InputType()
export class CreateAdminUserInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;

  @Field(() => [String], { nullable: true })
  roles: [string];

  @Field({ defaultValue: 'Active', nullable: true })
  status: string;

  @Field({ nullable: true })
  userRole: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  lastLogin: Date;

  @Field({ defaultValue: new Date() })
  createdAt: Date;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;

  @Field(() => [String], { nullable: true })
  favouriteStore?: [string];
}
