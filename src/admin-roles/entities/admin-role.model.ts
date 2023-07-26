import { BeforeInsert, Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

export class Permission {
  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  category: string;
}

export class generalPermission {
  @Column({ nullable: true })
  title: string;
  @Column({ nullable: true })
  route: string;
  @Column({ nullable: true })
  category: string;
}

@Entity()
export default class AdminUserRole extends DefaultColumnsService {
  @Column()
  roleName: string;

  @Column(() => Permission)
  permission?: Permission[];

  @Column({ nullable: true })
  userId: string;

  @Column(() => generalPermission)
  generalPermission?: generalPermission[];
}
