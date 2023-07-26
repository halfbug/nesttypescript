import { ObjectType, Field, Int } from '@nestjs/graphql';
import { DropsGroupshop } from './drops-groupshop.entity';
import { PageInfo } from 'src/utils/entity/pageInfo.entity';

@ObjectType('DropsPage')
export class DropsPage {
  @Field(() => [DropsGroupshop])
  result: DropsGroupshop[];

  @Field({ nullable: true })
  pageInfo: PageInfo;
}
