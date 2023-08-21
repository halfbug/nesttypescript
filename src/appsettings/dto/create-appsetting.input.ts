import { InputType, ID, Field } from '@nestjs/graphql';
// import { Settings } from '../entities/settings.entity';
@InputType()
export class RewardInput {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field({ nullable: true })
  discount?: string;

  @Field({ nullable: true })
  customerCount?: string;
}
@InputType()
export class SalesTargetType {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  rogsMin: string;

  @Field({ nullable: true })
  rogsMax: string;

  @Field({ nullable: true })
  status: string;

  @Field(() => [RewardInput])
  rewards: RewardInput[];

  @Field({ defaultValue: true })
  isActive?: boolean;
}

@InputType()
export class CreateAppsettingInput {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field((type) => [SalesTargetType])
  salestargets: SalesTargetType[];
}
