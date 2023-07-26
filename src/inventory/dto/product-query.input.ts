import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class ProductQueryInput {
  @Field({ description: 'shop name' })
  shop: string;

  @Field(() => Int, {
    description: 'sort by the published at date 1 accending -1 decending',
  })
  sort: number;

  @Field(() => Int, {
    description: 'default limit is 80',
    defaultValue: 80,
  })
  limit: number;
}
