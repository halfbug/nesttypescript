import { InputType, Int, Field } from '@nestjs/graphql';
import {
  ProductImage,
  ProductOption,
  SelectedOption,
} from '../entities/product.entity';

@InputType()
export class CreateInventoryInput {
  @Field({ description: 'shopify entity admin_graphql_api_id' })
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  totalVariants?: number;

  @Field({ nullable: true })
  price?: string;

  @Field({ nullable: true })
  currencyCode?: string;

  @Field({ nullable: true })
  publishedAt?: string;

  @Field({ nullable: true })
  createdAtShopify?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field({ nullable: true })
  featuredVideo?: string;

  @Field({ nullable: true })
  shop?: string;

  @Field({ nullable: true })
  recordType?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  inventoryQuantity?: number;

  @Field({ nullable: true })
  totalInventory?: number;

  @Field({ nullable: true })
  outofstock?: boolean;

  @Field(() => [ProductOption], { nullable: 'itemsAndList' })
  options?: ProductOption[];

  @Field(() => [SelectedOption], { nullable: 'itemsAndList' })
  selectedOptions?: SelectedOption[];

  @Field()
  displayName?: string;

  @Field(() => ProductImage, { nullable: true })
  image?: ProductImage;
  @Field({ nullable: true })
  src?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  inventoryPolicy?: string;

  @Field({ nullable: true })
  inventoryManagement?: string;

  @Field({ defaultValue: new Date() })
  createdAt?: Date;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;

  @Field({ defaultValue: 0 })
  purchaseCount: number;

  @Field({ defaultValue: 0 })
  secondaryCount: number;

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

@InputType()
export class GetLocationsInput {
  @Field()
  shop: string;

  @Field(() => [String])
  variantIds: string[];
}
