import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  CategoryStatus,
  CollectionType,
} from '../entities/drops-category.entity';

@InputType()
export class CollectionInput {
  @Field()
  name: string;

  @Field()
  shopifyId: string;

  @Field(() => CollectionType)
  type: CollectionType;
}

@InputType()
export class CreateDropsCategoryInput {
  @Field(() => ID)
  categoryId: string;

  @Field(() => ID)
  storeId: string;

  @Field()
  title: string;

  @Field(() => ID, { nullable: true })
  parentId: string | null;

  @Field(() => [CollectionInput])
  collections: CollectionInput[];

  @Field(() => Int)
  sortOrder: number;

  @Field(() => CategoryStatus)
  status?: CategoryStatus;
}

@InputType()
export class CreateDropsCategoryForFront {
  @Field(() => String)
  id?: string;

  @Field(() => [CreateDropsCategoryInput])
  categoryData?: CreateDropsCategoryInput[];

  @Field({ defaultValue: '', nullable: true })
  collectionUpdateMsg?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  activity?: string;
}
