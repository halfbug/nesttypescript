import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectIdColumn,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity()
export class DefaultColumnsService {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  id: string;

  @Column('string', { default: 'active' })
  status: string;

  // @Column({
  //   nullable: false,
  //   default: () => new Date(),
  //   type: Date,
  // })
  @CreateDateColumn()
  createdAt: Date;
  // @Column() createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn({ default: 0.1 })
  version: number;
}
