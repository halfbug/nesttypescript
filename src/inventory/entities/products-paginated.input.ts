import { Field, InputType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/drops-groupshop/dto/paginationArgs.input';

@InputType()
export class ProductsPaginatedArgs {
  @Field(() => PaginationArgs)
  pagination: PaginationArgs;

  @Field({ nullable: true })
  collection_id: string;
}
