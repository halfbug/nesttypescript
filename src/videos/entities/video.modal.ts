import { Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

@Entity()
export class Video extends DefaultColumnsService {
  @Column({ nullable: true })
  _id: string;

  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  orderId: number;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
