import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PageInfo } from 'src/utils/entity/pageInfo.entity';
import { AppLogger } from './applogger.entity';

@ObjectType('AppLoggerPage')
export class AppLoggerPage {
  @Field(() => [AppLogger])
  result: AppLogger[];

  @Field({ nullable: true })
  pageInfo: PageInfo;
}
