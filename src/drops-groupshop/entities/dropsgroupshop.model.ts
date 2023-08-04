import { Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import {
  DiscountCode,
  Member,
  Milestone,
  OBSettings,
} from '../entities/groupshop.modal';
import { Customer } from 'src/inventory/entities/orders.modal';
import Store from 'src/stores/entities/store.model';

export class DropCustomer {
  @Column({ nullable: true })
  klaviyoId: string;
  @Column({ nullable: true })
  fullName: string;
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  phone: string;
}

@Entity()
export default class DropsGroupshop extends DefaultColumnsService {
  @Column()
  id: string;

  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  expiredUrl: string;

  @Column({ default: 0 })
  totalProducts: number;

  @Column(() => DiscountCode)
  discountCode: DiscountCode;

  @Column(() => DropCustomer)
  customerDetail: DropCustomer;

  @Column(() => Member)
  members?: Member[];

  @Column()
  shortUrl?: string;

  @Column()
  expiredShortUrl?: string;

  @Column(() => Milestone)
  milestones: Milestone[];

  @Column({ nullable: true })
  obSettings?: OBSettings;

  @Column({ default: [] })
  favorite?: string[];

  @Column({ nullable: true })
  groupshopSource: string;

  @Column()
  expiredAt?: Date | null;

  @Column({ default: [] })
  forYou?: string[];
}
