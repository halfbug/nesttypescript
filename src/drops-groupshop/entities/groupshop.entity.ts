import {
  ObjectType,
  Field,
  registerEnumType,
  ID,
  Int,
  Float,
} from '@nestjs/graphql';
import {
  CreateOrderInput as Order,
  RefundInfo,
} from 'src/inventory/dto/create-order.input';
import { CustomerType } from 'src/inventory/entities/orders.entity';
import { Product } from 'src/inventory/entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { CreateOrderInput as LineItem } from 'src/inventory/dto/create-order.input';

export enum ProductTypeEnum {
  deal,
  owner,
  abandoned,
  first, // product Owner buys which is out of campaign
}
registerEnumType(ProductTypeEnum, {
  name: 'ProductTypeEnum',
});

export enum RefundStatusEnum {
  done,
  panding,
}
registerEnumType(RefundStatusEnum, {
  name: 'RefundStatusEnum',
});

export enum RoleTypeEnum {
  owner,
  referral,
}
registerEnumType(RoleTypeEnum, {
  name: 'RoleTypeEnum',
});

@ObjectType()
export class DealProducts {
  @Field({ nullable: true })
  productId: string;

  @Field(() => ProductTypeEnum, { nullable: true })
  type: ProductTypeEnum;

  @Field({ nullable: true })
  addedBy: string;

  @Field({ nullable: true })
  customerIP: string;
  @Field({ nullable: true })
  isInfluencer?: boolean;
}

@ObjectType()
export class DiscountCode {
  @Field({ nullable: true })
  title: string;
  @Field({ nullable: true })
  percentage: string;
  @Field({ nullable: true })
  priceRuleId: string;
}

@ObjectType()
export class PartnerDetails {
  @Field({ nullable: true })
  fname: string;
  @Field({ nullable: true })
  email: string;
}

@ObjectType()
export class CustomerInfo {
  @Field({ nullable: true })
  firstName: string;
  @Field({ nullable: true })
  lastName: string;
  @Field({ nullable: true })
  email: string;
}

@ObjectType()
export class Refund {
  @Field(() => RefundStatusEnum, { nullable: true })
  status: RefundStatusEnum;
  @Field({ nullable: true })
  createdAt: Date;
  @Field({ nullable: true })
  discount: number;
  @Field(() => Float, { nullable: true })
  amount: number;
}

@ObjectType()
export class Milestone {
  @Field({ nullable: true })
  activatedAt: Date;
  @Field({ nullable: true })
  discount: string;
}

@ObjectType()
export class Member {
  @Field({ nullable: true })
  orderId: string;

  @Field({ nullable: true })
  availedDiscount: number;

  @Field(() => RoleTypeEnum, { nullable: true })
  role: RoleTypeEnum;

  @Field(() => [Refund], { nullable: 'itemsAndList' })
  refund?: Refund[];
  @Field(() => [Product], { nullable: 'itemsAndList' })
  products?: Product[];

  @Field(() => Order, { nullable: true })
  orderDetail?: Order;

  @Field(() => [Order], { nullable: 'itemsAndList' })
  lineItems?: Order[];
}

@ObjectType()
export class TotalOrders {
  @Field({ nullable: true })
  countTotalOrders?: string;
}

@ObjectType()
export class uniqueClicks {
  @Field({ nullable: true })
  uniqueVisitors?: string;

  @Field({ nullable: true })
  totalOrders?: string;
}

@ObjectType()
export class OBSettings {
  @Field({ nullable: true })
  ownerUrl?: string;

  @Field({ nullable: true })
  allowEmails?: boolean;

  @Field({ nullable: true })
  allowTexts?: boolean;

  @Field({ nullable: true })
  mobileNumber?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  shopHeader?: string;

  @Field({ nullable: true })
  instagramLink?: string;

  @Field({ nullable: true })
  pinteresrLink?: string;

  @Field({ nullable: true })
  tiktokLink?: string;

  @Field({ nullable: true })
  twitterLink?: string;

  @Field({ nullable: true })
  themeBanner?: string;

  @Field({ nullable: true })
  step?: number;
}

@ObjectType()
export class GroupShop {
  @Field(() => ID)
  id: string;

  @Field()
  campaignId: string;

  @Field()
  storeId: string;

  @Field(() => Int, { defaultValue: 0 })
  totalProducts: number;

  @Field(() => [DealProducts], { nullable: 'itemsAndList' })
  dealProducts?: DealProducts[];

  @Field()
  url: string;

  @Field({ nullable: true })
  shortUrl?: string;

  @Field({ nullable: true })
  exipredShortLink?: string;

  @Field()
  createdAt: Date;

  @Field()
  expiredAt: Date;

  @Field(() => DiscountCode)
  discountCode: DiscountCode;

  @Field(() => [Member])
  members: Member[];

  @Field(() => [Milestone])
  milestones: Milestone[];

  @Field(() => Store, { nullable: true })
  store?: Store;

  @Field(() => [Product], { nullable: 'itemsAndList' })
  popularProducts?: Product[];

  // @Field(() => Campaign, { nullable: true })
  // campaign?: Campaign;

  @Field(() => [Product], { nullable: 'itemsAndList' })
  allProducts?: (Product | undefined)[];

  @Field(() => [Product], { nullable: 'itemsAndList' })
  bestSeller?: Product[];

  @Field(() => OBSettings, { nullable: true })
  obSettings?: OBSettings;

  @Field(() => [Product], { nullable: 'itemsAndList' })
  ownerDeals?: Product[];

  @Field(() => [Product], { nullable: 'itemsAndList' })
  reffDeals?: Product[];

  @Field(() => [DealProducts], { nullable: 'itemsAndList' })
  ownerDealsProducts?: DealProducts[];

  @Field(() => [DealProducts], { nullable: 'itemsAndList' })
  refferalDealsProducts?: DealProducts[];
}

@ObjectType()
export class activeGroupshop {
  @Field({ nullable: true })
  shortUrl?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  isExpired?: boolean;

  @Field(() => [GroupShop], { nullable: 'itemsAndList' })
  groupshops?: GroupShop[];

  @Field(() => GroupShop, { nullable: true })
  groupshop?: GroupShop;

  @Field(() => [RefundInfo], { nullable: 'itemsAndList' })
  refundDetail?: RefundInfo[];

  @Field(() => CustomerType)
  customer?: CustomerType;

  @Field(() => Store)
  shop?: Store;

  @Field({ nullable: true })
  url?: string;
}

@ObjectType()
export class GsOrders {
  @Field(() => [Member])
  members: Member[];
}

@ObjectType()
export class TotalGS {
  @Field()
  _id?: string;

  @Field({ nullable: true })
  count?: number;
}

@ObjectType()
export class ViralMember {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  shopifyCreatedAt?: string;

  @Field({ nullable: true })
  shop?: string;

  @Field({ nullable: true })
  price?: string;

  @Field({ nullable: true })
  totalDiscounts?: string;

  @Field(() => CustomerType, { nullable: true })
  customer?: CustomerType;
}

@ObjectType()
export class ViralPartnerMember {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  groupshopId?: string;

  @Field({ nullable: true })
  orderId?: Date;

  @Field({ nullable: true })
  orderAmount?: number;

  @Field({ nullable: true })
  comissionAmount?: number;

  @Field(() => CustomerInfo, { nullable: true })
  customerInfo?: CustomerInfo;
}

@ObjectType()
export class Owner {
  @Field({ nullable: true })
  orderId?: string;
}

@ObjectType()
export class MostViralCustomers {
  @Field()
  _id?: string;

  @Field(() => [ViralMember])
  members?: ViralMember[];

  @Field(() => [ViralMember])
  owner?: ViralMember[];

  @Field({ nullable: true })
  uniqueClicks?: number;

  @Field({ nullable: true })
  numMembers?: number;

  @Field({ nullable: true })
  lineItemsCount?: number;

  @Field({ nullable: true })
  refund?: number;

  @Field({ nullable: true })
  revenue?: number;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  shortUrl?: string;

  @Field(() => [LineItem], { nullable: 'itemsAndList' })
  lineItems?: LineItem[];
}
@ObjectType()
export class MostPartnerViralCustomers {
  @Field()
  _id?: string;

  @Field({ nullable: true })
  storeId?: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  shortUrl?: string;

  @Field({ nullable: true })
  partnerCommission?: string;

  @Field(() => DiscountCode, { nullable: true })
  discountCode?: DiscountCode;

  @Field(() => PartnerDetails, { nullable: true })
  partnerDetails?: PartnerDetails;

  @Field(() => [ViralPartnerMember])
  members?: ViralPartnerMember[];

  @Field(() => [ViralMember])
  orderName?: ViralMember[];

  @Field({ nullable: true })
  uniqueClicks?: number;

  @Field({ nullable: true })
  numMembers?: number;

  @Field({ nullable: true })
  revenue?: number;

  @Field({ nullable: true })
  lineItemsCount?: number;

  @Field({ nullable: true })
  refund?: number;

  @Field()
  createdAt: Date;
}
