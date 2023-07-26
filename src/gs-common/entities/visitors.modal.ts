import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
} from 'typeorm';

@Entity()
export class Visitors {
  @ObjectIdColumn()
  _id: string;

  @Column()
  ip: string;

  @Index({ background: true })
  @Column()
  groupshopId: string;

  @Column()
  dataTime: Date;
}
