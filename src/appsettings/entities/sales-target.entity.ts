import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Reward {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  discount?: string;

  @Field({ nullable: true })
  customerCount?: string;
}

@ObjectType()
export class SalesTarget {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  rogsMin: string;

  @Field({ nullable: true })
  rogsMax: string;

  @Field({ nullable: true })
  status: string;

  @Field((type) => [Reward], { nullable: true })
  rewards?: Reward[];
}
