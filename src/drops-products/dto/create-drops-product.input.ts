import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDropsProductInput {
  @Field()
  _id: string;

  @Field({ nullable: true })
  storeId: string;

  @Field({ defaultValue: false })
  isSynced: boolean;

  @Field({ nullable: true })
  m_product_id: string;

  @Field({ nullable: true })
  d_product_id: string;

  @Field()
  created_at: string;
}
