import { BeforeInsert, Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import * as bcrypt from 'bcrypt';

@Entity()
export default class AdminUser extends DefaultColumnsService {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  roles?: string[];

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column({ nullable: true })
  userRole: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  favouriteStore?: string[];

  @BeforeInsert() async hashPassword() {
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 10);
  }
}
