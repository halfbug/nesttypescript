import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType('DetailsInput')
@ObjectType('Details')
export class Details {
  @Field({ nullable: true })
  totalGroupshops: number;

  @Field({ nullable: true })
  totalRevenue: number;

  @Field({ nullable: true })
  totalCashback: number;

  @Field({ nullable: true })
  totalFeeCharges: number;
}
