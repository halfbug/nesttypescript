import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { CreateOrderInput as LineItem } from 'src/inventory/dto/create-order.input';
import { Product } from 'src/inventory/entities/product.entity';
import {
  ProductTypeEnum,
  RefundStatusEnum,
  RoleTypeEnum,
} from '../entities/groupshop.entity';

// import { GroupShop } from '../entities/Groupshop.entity';
@InputType()
export class DealProductsInput {
  @Field({ nullable: true })
  productId: string;

  @Field(() => ProductTypeEnum, { nullable: true })
  type: ProductTypeEnum;

  @Field({ nullable: true })
  addedBy: string;

  @Field({ nullable: true })
  customerIP: string;

  @Field({ nullable: true })
  gsid?: string;

  @Field({ nullable: true })
  isInfluencer?: boolean;
}

@InputType()
export class DiscountCodeInput {
  @Field({ nullable: true })
  title: string;
  @Field({ nullable: true })
  percentage: string;
  @Field({ nullable: true })
  priceRuleId: string;
}

@InputType()
export class MemberInput {
  @Field({ nullable: true })
  orderId: string;

  @Field({ nullable: true })
  availedDiscount: number;

  @Field(() => RoleTypeEnum, { nullable: true })
  role: RoleTypeEnum;

  @Field(() => [RefundInput], { nullable: 'itemsAndList' })
  refund?: RefundInput[];

  @Field(() => [LineItem], { nullable: 'itemsAndList' })
  lineItems?: LineItem[];

  @Field(() => [Product], { nullable: 'itemsAndList' })
  products?: Product[];
}

@InputType()
export class MilestoneInput {
  @Field({ nullable: true })
  activatedAt: Date;
  @Field({ nullable: true })
  discount: string;
}

@InputType()
export class RefundInput {
  @Field(() => RefundStatusEnum, { nullable: true })
  status: RefundStatusEnum;
  @Field({ nullable: true })
  createdAt: Date;
  @Field({ nullable: true })
  discount: number;
  @Field(() => Float, { nullable: true })
  amount: number;

  constructor(
    status?: RefundStatusEnum,
    createdAt?: Date,
    discount?: number,
    amount?: number,
  ) {
    this.status = status;
    this.createdAt = createdAt || new Date();
    this.discount = discount;
    this.amount = amount;
  }
}

@InputType()
export class OBSettingsInput {
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

@InputType()
export class CreateGroupshopInput {
  @Field()
  campaignId: string;

  @Field()
  storeId: string;

  @Field(() => Int, { defaultValue: 0 })
  totalProducts: number;

  @Field(() => [DealProductsInput], { nullable: 'itemsAndList' })
  dealProducts?: DealProductsInput[];

  @Field()
  url: string;

  @Field()
  shortUrl?: string;

  @Field()
  exipredShortLink?: string;

  @Field()
  createdAt: Date;

  @Field()
  expiredAt: Date;

  @Field(() => DiscountCodeInput)
  discountCode: DiscountCodeInput;

  @Field(() => [MemberInput])
  members: MemberInput[];

  @Field(() => [MilestoneInput])
  milestones: MilestoneInput[];

  @Field(() => OBSettingsInput, { nullable: true })
  obSettings?: OBSettingsInput;
}
