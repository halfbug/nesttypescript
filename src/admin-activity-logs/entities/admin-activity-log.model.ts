import { BeforeInsert, Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';

export class fieldDetails {
  @Column({ nullable: true })
  parentTitle?: string;

  @Column({ nullable: true })
  fieldName?: string;

  @Column({ nullable: true })
  oldValue?: string;

  @Column({ nullable: true })
  newValue?: string;
}

export class AdminRole {
  @Column({ nullable: true })
  roleName?: string;
}

@Entity()
export default class AdminActivityLogs extends DefaultColumnsService {
  @Column()
  id: string;

  @Column()
  operation: string;

  @Column()
  route: string;

  @Column()
  context: string;

  @Column()
  userId?: string;

  @Column()
  storeId?: string;

  @Column(() => fieldDetails)
  changes?: fieldDetails[];

  @Column(() => AdminRole)
  adminRole?: AdminRole;
}
