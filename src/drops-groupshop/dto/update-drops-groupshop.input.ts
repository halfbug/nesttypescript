import { CreateDropsGroupshopInput } from './create-drops-groupshop.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDropsGroupshopInput extends PartialType(
  CreateDropsGroupshopInput,
) {
  @Field(() => String, { nullable: true })
  id: string;
}
