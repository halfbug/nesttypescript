import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class AdminPermission {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  route: string;

  @Field({ nullable: true })
  category: string;
}
