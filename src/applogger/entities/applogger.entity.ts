import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { Column, Entity } from 'typeorm';

export enum LogEventTypeEnum {
  WH_PRODUCT_UPDATED = 'WH_PRODUCT_UPDATED',
  WH_PRODUCT_CREATED = 'WH_PRODUCT_CREATED',
  WH_PRODUCT_DELETED = 'WH_PRODUCT_DELETED',
}

// export enum LogEventTypeEnum {
//   WH_PRODUCT_UPDATED,
//   WH_PRODUCT_CREATED,
//   WH_PRODUCT_DELETED,
// }
registerEnumType(LogEventTypeEnum, {
  name: 'LogEventTypeEnum',
});

@ObjectType()
export class LastAutoSyncType {
  @Field({ nullable: true })
  createdAt: Date;
  @Field({ nullable: true })
  context: string;
}
@ObjectType()
export class LastAutoSync {
  @Field(() => [LastAutoSyncType])
  lastAutoSync: any;
}

@ObjectType()
@Entity()
export class AppLogger extends DefaultColumnsService {
  @Column({ nullable: true })
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  context: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  message?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  stack?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  initiator: string;

  @Column({ default: 'log' })
  @Field({ defaultValue: 'log' })
  level: 'log' | 'error' | 'warn' | 'debug' | 'verbose';

  @Field()
  createdAt: Date;
}
