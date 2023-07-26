import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TotalProducts {
  @Field({ description: 'total products in given store' })
  count: number;
}
