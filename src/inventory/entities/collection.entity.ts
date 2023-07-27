import { ObjectType, Field } from '@nestjs/graphql';
import { Product } from './product.entity';

@ObjectType()
export class Collection {
  // @Field({ description: 'mongo entity id' })
  // _id: string;

  @Field({ description: 'shopify entity id' })
  id: string;

  @Field()
  title: string;

  //   @Field()
  //   storefrontId: string;

  @Field()
  productsCount?: number;

  @Field()
  type?: string;

  @Field(() => [Product])
  products: Product[];
}
