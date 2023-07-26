import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateVideoInput {
  @Field()
  storeId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  orderId?: number;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  activity?: string;
}
