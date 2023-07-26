import { InputType, Int, Field, ObjectType } from '@nestjs/graphql';

@InputType('LineProductInput')
@ObjectType('LineProduct')
export class LineProduct {
  @Field({ nullable: true })
  id: string;
}

@InputType('CustomerInput')
@ObjectType('Customer')
export class Customer {
  @Field({ nullable: true })
  firstName: string;
  @Field({ nullable: true })
  lastName: string;
  @Field({ nullable: true })
  email: string;
  @Field({ nullable: true })
  ip?: string;
  @Field({ nullable: true })
  phone: string;
  @Field({ nullable: true })
  sms_marketing: string;
}

@InputType('DiscountInfoInput')
@ObjectType('DiscountInfo')
export class DiscountInfo {
  @Field({ nullable: true })
  code: string;
  @Field({ nullable: true })
  amount: string;
  @Field({ nullable: true })
  type: string;
  @Field({ nullable: true })
  vaule: string;
  constructor(dc?: DiscountInfo | null) {
    this.code = dc?.code;
    this.amount = dc?.amount;
    this.type = dc?.type;
    this.vaule = dc?.vaule;
  }
}
@InputType('RefundInfoInput')
@ObjectType('RefundInfo')
export class RefundInfo {
  @Field({ nullable: true })
  type: string;
  @Field({ nullable: true })
  date: Date;
  @Field({ nullable: true })
  amount?: string;
  @Field({ nullable: true })
  lineItemId?: string;
  @Field({ nullable: true })
  quantity?: string;
  @Field({ nullable: true })
  note?: string;
}
@ObjectType('Order')
@InputType()
export class CreateOrderInput {
  @Field({ description: 'shopify entity admin_graphql_api_id' })
  id: string;

  @Field({ nullable: true })
  name: string;
  @Field({ nullable: true })
  shopifyCreatedAt?: string;
  @Field({ nullable: true })
  confirmed?: boolean;
  @Field({ nullable: true })
  cancelledAt?: string;
  @Field({ nullable: true })
  shop?: string;
  @Field({ nullable: true })
  totalPrice?: string;
  @Field({ nullable: true })
  discountedPrice?: number;
  @Field({ nullable: true })
  parentId?: string;
  @Field(() => LineProduct)
  product?: LineProduct;
  @Field(() => LineProduct)
  variant?: LineProduct;
  @Field({ nullable: true })
  price?: string;
  @Field({ nullable: true })
  quantity?: number;
  @Field({ nullable: true })
  currencyCode?: string;
  @Field({ nullable: true })
  discountCode?: string;
  @Field({ nullable: true })
  totalDiscounts?: string;
  @Field(() => Customer)
  customer?: Customer;
  @Field(() => DiscountInfo)
  discountInfo?: DiscountInfo[];
  @Field({ nullable: true })
  financialStatus?: string;
  @Field(() => [RefundInfo])
  refundDetail: RefundInfo[];
  @Field({ nullable: true })
  refferalId?: string;
}
