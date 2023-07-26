import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('Video')
export class Video {
  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  storeId: string;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  orderId: number;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  createdAt: string;

  @Field({ nullable: true })
  updatedAt: string;
}
