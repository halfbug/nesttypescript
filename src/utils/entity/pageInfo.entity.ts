import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
@InputType('PageInfoInput')
export class PageInfo {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  lastPage: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => Number, { nullable: true })
  totalRecords: number;
}
