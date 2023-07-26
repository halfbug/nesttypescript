import { ObjectType, Field, InputType } from '@nestjs/graphql';

// @ObjectType('Order')
// @InputType('OrderInput')
// export default class Orders extends CreateOrderInput {}

@ObjectType()
export class TotalOrders {
  @Field({ nullable: true })
  countTotalOrders?: string;
}
@InputType('CustomerTypeInput')
@ObjectType('CustomerType')
export class CustomerType {
  @Field({ nullable: true })
  customer_id: string;
  @Field({ nullable: true })
  firstName: string;
  @Field({ nullable: true })
  lastName: string;
  @Field({ nullable: true })
  email: string;
  @Field({ nullable: true })
  ip?: string;
  @Field({ nullable: true })
  phone?: string;
  @Field({ nullable: true })
  sms_marketing?: string;
}

@ObjectType('PendingGroupshop')
export class PendingGroupshop {
  @Field({ nullable: true })
  _id?: string;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  id?: string;
  @Field(() => CustomerType, { nullable: true })
  customer?: CustomerType;
  @Field({ nullable: true })
  createDate?: string;
  @Field({ nullable: true })
  shopifyCreateAt?: string;
  @Field({ nullable: true })
  price?: number;
  @Field({ nullable: true })
  haveGroupshop?: boolean;
  @Field(() => [String], { nullable: 'itemsAndList' })
  groupshops?: string[];
}

@ObjectType('productDetails')
export class productDetails {
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  featuredImage?: string;
}

@ObjectType('MostViralProducts')
export class MostViralProducts {
  @Field({ nullable: true })
  _id?: string;
  @Field({ nullable: true })
  purchaseCount?: string;
  @Field({ nullable: true })
  revenue?: string;
  @Field(() => [productDetails], { nullable: 'itemsAndList' })
  productDetails?: productDetails[];
}

@ObjectType('OrderLineItems')
export class OrderLineItems {
  @Field({ nullable: true })
  _id?: string;
  @Field({ nullable: true })
  price?: string;
  @Field({ nullable: true })
  discountedPrice?: number;
  @Field({ nullable: true })
  quantity?: number;
  @Field({ nullable: true })
  totalDiscounts?: string;
  @Field(() => [productDetails], { nullable: 'itemsAndList' })
  product?: productDetails[];
}
