import { ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class DropsProducts {
  @PrimaryColumn()
  _id: string;

  @Column({ nullable: true })
  storeId?: string;

  @Column({ nullable: true })
  shop: string;

  @Column({ default: false })
  isSynced: boolean;

  @Column({ default: true })
  isSelected: boolean;

  @Column({ nullable: true })
  m_product_id: string;

  @Column({ nullable: true })
  d_product_id?: string;

  @Column({ nullable: true })
  variants: Variants[];

  @Column()
  created_at: string;
}
@Entity()
@ObjectType()
export class Variants {
  @Column({ nullable: true })
  m_variant_id: string;

  @Column({ nullable: true })
  d_variant_id: string;
}
