import { Column, Entity } from 'typeorm';

@Entity()
export default class SocialLinks {
  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  pinterest?: string;

  @Column({ nullable: true })
  tiktok?: string;

  @Column({ nullable: true })
  twitter?: string;

  @Column({ nullable: true })
  facebook?: string;
}
