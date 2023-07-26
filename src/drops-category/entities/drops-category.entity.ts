import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';
import { Sections } from 'src/drops-groupshop/entities/drops-groupshop.entity';
import { CodeUpdateStatusTypeEnum } from 'src/stores/entities/store.entity';

export enum CollectionType {
  VAULT = 'vault',
  SPOTLIGHT = 'spotlight',
  REGULAR = 'regular',
  ALLPRODUCT = 'allproduct',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
}

registerEnumType(CollectionType, {
  name: 'CollectionType',
});

registerEnumType(CategoryStatus, {
  name: 'CategoryStatus',
});

@ObjectType()
export class DropsCollection {
  @Field()
  name: string;

  @Field()
  shopifyId: string;

  @Field(() => CollectionType)
  type: CollectionType;
}

@ObjectType()
export class DropsCategory {
  @Field(() => ID)
  categoryId: string;

  @Field(() => ID)
  storeId: string;

  @Field({ nullable: true })
  title: string;

  @Field(() => ID, { nullable: true })
  parentId: string | null;

  @Field(() => [DropsCollection])
  collections: DropsCollection[];

  @Field(() => Int)
  sortOrder: number;

  @Field(() => CategoryStatus)
  status?: CategoryStatus;

  @Field(() => [Sections], { nullable: true })
  sections?: Sections[];
}

@ObjectType()
export class CodeUpdateStatusType {
  @Field(() => CodeUpdateStatusTypeEnum)
  codeUpdateStatus?: CodeUpdateStatusTypeEnum;
}
