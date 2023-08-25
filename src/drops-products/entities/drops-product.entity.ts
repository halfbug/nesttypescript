import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

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

@InputType()
export class CollectionObject {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [String])
  products?: string[];
}
