import { CreateDropsCategoryInput } from './create-drops-category.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDropsCategoryInput extends PartialType(
  CreateDropsCategoryInput,
) {
  @Field()
  id: string;
}
