import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Any } from 'typeorm';
import { Variants } from './drops-products.model';

@ObjectType()
export class DropsProduct {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  storeId?: string;

  @Field(() => Boolean)
  isSynced: boolean;

  @Field({ defaultValue: true })
  isSelected: boolean;

  @Field(() => String)
  m_product_id: string;

  @Field(() => String)
  d_product_id?: string;

  @Field(() => String)
  created_at: string;
}
@ObjectType()
export class DropsProductResponse {
  @Field(() => Boolean)
  acknowledged: string;

  @Field(() => Number)
  insertedCount: number;

  // @Field(() => Any)
  // insertedIds: any;
}
