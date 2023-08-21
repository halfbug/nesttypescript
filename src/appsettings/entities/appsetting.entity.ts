import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { SalesTarget } from './sales-target.entity';
import { PartnerRewards } from 'src/stores/entities/store.model';

@ObjectType()
export class Appsetting {
  @Field(() => ID)
  id: string;

  @Field((type) => [SalesTarget], { nullable: true })
  salestargets?: SalesTarget[];

  @Field(() => PartnerRewards, { nullable: true })
  details?: PartnerRewards;
}
