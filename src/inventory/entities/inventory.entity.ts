import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class FeatureImageType {
  @Field()
  src: string;
}

@ObjectType()
export class Inventory {
  // @Field({ description: 'mongo entity id' })
  // _id: string;

  @Field({ description: 'shopify entity id' })
  id: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  deletedAt: Date;

  @Field()
  version: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  onlineStorePreviewUrl?: string;

  @Field()
  onlineStoreUrl?: string;

  @Field()
  storefrontId: string;

  @Field()
  descriptionHtml?: string;

  @Field()
  productType?: string;

  @Field()
  totalVariants?: number;

  @Field()
  totalInventory?: number;

  @Field()
  publishedAt?: string;

  @Field()
  createdAtShopify?: string;

  @Field()
  shopifyCreatedAt?: string;

  @Field()
  recordType: string;

  @Field()
  parentId?: string;

  @Field()
  image?: string;

  @Field()
  sortOrder?: string;

  @Field()
  productsCount?: number;

  @Field()
  secondaryCount?: number;

  @Field()
  displayName?: string;

  @Field()
  featuredImage?: FeatureImageType;

  @Field()
  featuredVideo?: string;

  @Field({ nullable: true })
  outofstock?: boolean;
  @Field({ nullable: true })
  src?: string;

  @Field({ nullable: true })
  inventoryPolicy?: string;

  @Field({ nullable: true })
  inventoryManagement?: string;

  @Field({ defaultValue: 0 })
  purchaseCount: number;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  productCategory?: string;

  @Field({ nullable: true })
  vendor?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  compareAtPrice?: string;
}

@ObjectType()
export class SearchResult {
  @Field(() => [String], { nullable: 'itemsAndList' })
  products?: string[];
}

@ObjectType()
export class CollectionStatusList {
  @Field({ nullable: true })
  collectionId?: string;

  @Field({ nullable: true })
  collectionTitle?: string;

  @Field({ nullable: true })
  isSynced?: boolean;

  @Field({ nullable: true })
  productCount?: number;
}

@ObjectType()
export class GetLocationsOutput {
  @Field(() => [String], { nullable: 'itemsAndList' })
  locations: string[];
}

@ObjectType()
export class CollectionListOfShop {
  @Field(() => [CollectionStatusList], { defaultValue: [] })
  collections?: CollectionStatusList[];

  @Field(() => [CollectionStatusList], { defaultValue: [] })
  collectionsToUpdate?: CollectionStatusList[];
}
