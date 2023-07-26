import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BillingPlanEnum } from 'src/stores/entities/store.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
} from 'typeorm';

export enum EventType {
  started = 'started',
  expired = 'expired',
  revised = 'revised',
  installed = 'installed',
  uninstalled = 'uninstalled',
  planReset = 'planReset',
  planChanged = 'planChanged',
  planReset1 = 'planReset1',
  partnerTierSwitch = 'partnerTierSwitch',
  partnerRecurringCharged = 'partnerRecurringCharged',
  ended = 'ended',
}

@Entity()
@ObjectType()
@InputType('LifecycleInput')
export class Lifecycle {
  @ObjectIdColumn()
  @Field({ nullable: true })
  _id?: string;

  @Column()
  @Field()
  event: EventType;

  @Index({ background: true })
  @Field({ nullable: true })
  @Column({ nullable: true })
  groupshopId?: string;

  @Index({ background: true })
  @Column({ nullable: true })
  @Field({ nullable: true })
  storeId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  dateTime?: Date;

  @Column('enum', { nullable: true })
  @Field({ nullable: true })
  plan?: BillingPlanEnum;
}
