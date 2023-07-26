import { Column, Entity, PrimaryColumn } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

export class LineProduct {
  @Column({ nullable: true })
  id: string;
}

export class Customer {
  @Column({ nullable: true })
  customer_id: string;
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  ip?: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  sms_marketing: string;
}

export class DiscountInfo {
  @Column({ nullable: true })
  code: string;
  @Column({ nullable: true })
  amount: string;
  @Column({ nullable: true })
  type: string;
}

export class RefundInfo {
  @Column({ nullable: true })
  type: string;
  @Column({ nullable: true })
  date: Date;
  @Column({ nullable: true })
  amount?: string;
  @Column({ nullable: true })
  lineItemId?: string;
  @Column({ nullable: true })
  quantity?: string;
  @Column({ nullable: true })
  note?: string;
}
@Entity()
export default class Orders extends DefaultColumnsService {
  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  shopifyCreatedAt?: string;
  @Column({ nullable: true })
  confirmed?: boolean;
  @Column({ nullable: true })
  cancelledAt?: string;
  @Column({ nullable: true })
  shop?: string;
  @Column({ nullable: true })
  totalPrice?: string;
  @Column({ nullable: true })
  parentId?: string;

  @Column(() => LineProduct)
  product?: LineProduct;

  @Column(() => LineProduct)
  variant?: LineProduct;

  @Column({ nullable: true })
  price?: string;
  @Column({ nullable: true })
  discountedPrice?: number;

  @Column({ nullable: true })
  quantity?: number;
  @Column({ nullable: true })
  currencyCode?: string;
  @Column({ nullable: true })
  discountCode?: string | null;
  @Column({ nullable: true })
  totalDiscounts?: string;
  @Column(() => Customer)
  customer?: Customer;
  @Column(() => DiscountInfo)
  discountInfo?: DiscountInfo[];
  @Column({ nullable: true })
  gateway?: string;
  @Column({ nullable: true })
  financialStatus?: string;
  @Column(() => RefundInfo)
  refundDetail: RefundInfo[];
  @Column({ nullable: true })
  refferalId?: string;
}
