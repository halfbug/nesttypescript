import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DropsProduct {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  storeId: string;

  @Field(() => Boolean)
  isSynced: boolean;

  @Field(() => String)
  m_product_id: string;

  @Field(() => String)
  d_product_id: string;

  @Field(() => String)
  created_at: string;
}
