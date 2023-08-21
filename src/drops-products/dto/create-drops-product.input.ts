import { Field, InputType } from '@nestjs/graphql';
import { Variants } from '../entities/drops-products.model';

@InputType()
export class CreateDropsProductInput {
  @Field()
  _id: string;

  @Field({ nullable: true })
  storeId: string;

  @Field({ defaultValue: false })
  isSynced: boolean;

  @Field({ defaultValue: true })
  isSelected: boolean;

  @Field({ nullable: true })
  m_product_id: string;

  @Field({ nullable: true })
  d_product_id: string;

  @Field()
  created_at: string;
}
