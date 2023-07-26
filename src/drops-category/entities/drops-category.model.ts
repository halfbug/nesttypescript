import { Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { CategoryStatus, CollectionType } from './drops-category.entity';

@Entity()
export class DropsCollection {
  @Column()
  name: string;

  @Column()
  shopifyId: string;

  @Column('enum', { nullable: true })
  type: CollectionType;
}

@Entity()
export default class DropsCategory extends DefaultColumnsService {
  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  parentId: string | null;

  @Column({ nullable: true })
  collections: DropsCollection[];

  @Column({ nullable: true })
  sortOrder: number;

  @Column({ nullable: true })
  status: CategoryStatus;
}
