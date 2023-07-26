import { CreateOrderInput } from './create-order.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput extends PartialType(CreateOrderInput) {
  @Field()
  email: string;
  @Field()
  shop?: string;
  @Field()
  sms_marketing?: string;
}
