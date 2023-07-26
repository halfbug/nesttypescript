import { Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { CreateOrderInput as LineItem } from 'src/inventory/dto/create-order.input';

export enum ProductTypeEnum {
  deal,
  owner,
  abandoned,
  first, // product Owner buys which is out of campaign
}

export enum RefundStatusEnum {
  done,
  panding,
}

export enum RoleTypeEnum {
  owner,
  referral,
}

export class DealProducts {
  @Column({ nullable: true })
  productId: string;

  @Column('enum', {
    nullable: true,
    comment: 'deal = 0 and abandoned = 1',
    enum: ProductTypeEnum,
  })
  type: ProductTypeEnum;

  @Column({ nullable: true })
  addedBy: string;

  @Column({ nullable: true })
  customerIP: string;
}

export class DiscountCode {
  @Column({ nullable: true })
  title: string;
  @Column({ nullable: true })
  percentage: string;
  @Column({ nullable: true })
  priceRuleId: string;
}

export class Refund {
  @Column('enum', { nullable: true })
  status: RefundStatusEnum;
  @Column({ nullable: true })
  createdAt: Date;
  @Column({ nullable: true })
  discount: number;
  @Column({ nullable: true })
  amount: number;
}

export class Milestone {
  @Column({ nullable: true })
  activatedAt: Date;
  @Column({ nullable: true })
  discount: string;
}

export class Member {
  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  availedDiscount: number;

  @Column('enum', { nullable: true })
  role: RoleTypeEnum;

  @Column(() => Refund)
  refund?: Refund[];

  @Column(() => LineItem)
  lineItems?: LineItem[];
}

export class OBSettings {
  @Column({ nullable: true })
  ownerUrl?: string;

  @Column({ nullable: true })
  allowEmails?: boolean;

  @Column({ nullable: true })
  allowTexts?: boolean;

  @Column({ nullable: true })
  mobileNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  shopHeader?: string;

  @Column({ nullable: true })
  instagramLink?: string;

  @Column({ nullable: true })
  pinteresrLink?: string;

  @Column({ nullable: true })
  tiktokLink?: string;

  @Column({ nullable: true })
  twitterLink?: string;

  @Column({ nullable: true })
  themeBanner?: string;

  @Column({ nullable: true })
  step?: number;
}

@Entity()
export class Groupshops extends DefaultColumnsService {
  @Column()
  id: string;

  @Column()
  campaignId: string;

  @Column()
  storeId: string;

  @Column({ default: 0 })
  totalProducts: number;

  @Column(() => DealProducts)
  dealProducts?: DealProducts[];

  @Column()
  url: string;

  @Column()
  shortUrl?: string;

  @Column()
  exipredShortLink?: string;

  // @Column()
  // createdAt: string;

  @Column()
  expiredAt: Date;

  @Column(() => DiscountCode)
  discountCode: DiscountCode;

  @Column(() => Member)
  members: Member[];

  @Column(() => Milestone)
  milestones: Milestone[];

  @Column({ nullable: true })
  obSettings?: OBSettings;

  @Column({ nullable: true })
  isInfluencer?: boolean;

  @Column({ nullable: true })
  isChannel?: boolean;

  @Column()
  channelId?: string;
}
