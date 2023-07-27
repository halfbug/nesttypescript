import { ObjectType, Field } from '@nestjs/graphql';
import { PageInfo } from 'src/utils/entity/pageInfo.entity';
import { Product } from './product.entity';

@ObjectType('ProductsPaginated')
export class ProductsPaginated {
  @Field(() => [Product], { nullable: 'itemsAndList' })
  result: Product[];

  @Field({ nullable: true })
  pageInfo: PageInfo;
}
