import { Field, InputType } from '@nestjs/graphql';
import { CreateDropsProductInput } from './create-drops-product.input';
import { PartialType } from '@nestjs/mapped-types';

@InputType()
export class UpdateDropsProductInput extends PartialType(
  CreateDropsProductInput,
) {
  @Field()
  m_product_id: string;
}
