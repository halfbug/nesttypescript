import { BeforeInsert, Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

@Entity()
export default class AdminPermission extends DefaultColumnsService {
  @Column()
  title: string;

  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  category: string;
}
