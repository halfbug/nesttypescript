import Orders from 'src/inventory/entities/orders.modal';
import Store from 'src/stores/entities/store.model';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export class KlaviyoProfile {
  @Column({ nullable: true })
  firstName?: string;
  @Column({ nullable: true })
  lastName?: string;
  @Column({ nullable: true })
  email?: string;
  @Column({ nullable: true })
  phone?: string;
  @Column({ nullable: true })
  sms_marketing?: string;
}
export class OrderPlacedEvent {
  order: Orders;
  klaviyo: KlaviyoProfile;
  store: Store;
  lineItems: any[];
  gsId: string;
}
