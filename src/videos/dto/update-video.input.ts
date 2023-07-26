import { CreateVideoInput } from './create-video.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateVideoInput extends PartialType(CreateVideoInput) {
  @Field()
  storeId: string;

  @Field(() => [String], { nullable: true })
  selectedIds: string[];
}
