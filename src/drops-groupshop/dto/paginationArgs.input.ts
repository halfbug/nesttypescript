import { Field, Int, InputType, registerEnumType } from '@nestjs/graphql';

export enum FilterOption {
  CONTAINS = 'contains',
  EQUALS = 'equals',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty',
  IS_ANY_OF = 'isAnyOf',
}

registerEnumType(FilterOption, {
  name: 'FilterOption',
});

export enum SortOrder {
  ASC = 1,
  DESC = -1,
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Options for sorting order',
});

@InputType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 0 })
  skip: number;

  @Field(() => Int, { defaultValue: 10 })
  take: number;
}

@InputType()
export class Filter {
  @Field({ nullable: true })
  columnField: string;
  @Field({ nullable: true })
  id: number;
  @Field({ nullable: true })
  operatorValue: FilterOption;
  @Field(() => [String], { nullable: 'itemsAndList' })
  value: string[];
}

// [
//   {
//     "field": "customerDetail.firstName",
//     "sort": "asc"
// }
// ]
@InputType()
export class Sorting {
  @Field({ nullable: true })
  field: string;

  @Field({ nullable: true })
  sort: 'asc' | 'desc';
}
@InputType()
export class GridArgs {
  @Field(() => PaginationArgs)
  pagination: PaginationArgs;

  @Field(() => [Filter], { nullable: 'itemsAndList' })
  filters: Filter[];

  @Field(() => [Sorting], { nullable: 'itemsAndList' })
  sorting: Sorting[];
}
