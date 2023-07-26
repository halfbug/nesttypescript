import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class DropsProducts {
  @PrimaryColumn()
  _id: string;

  @Column({ nullable: true })
  storeId: string;

  @Column({ default: false })
  isSynced: boolean;

  @Column({ nullable: true })
  m_product_id: string;

  @Column({ nullable: true })
  d_product_id: string;

  @Column()
  created_at: string;
}
