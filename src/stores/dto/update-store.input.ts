import { CreateStoreInput } from './create-store.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateStoreInput extends PartialType(CreateStoreInput) {
  @Field({ description: 'mongo entity id' })
  id: string;

  // // @Field(() => ID)
  // // id: string;

  // @Field({ nullable: true })
  // shopifySessionId: string;

  // @Field({ nullable: true })
  // brandName?: string;

  // @Field()
  // shop: string;

  // @Field()
  // accessToken: string;

  // @Field({ defaultValue: 0 })
  // installationStep: number;

  // @Field({ nullable: true })
  // logoImage: string;

  // @Field({ nullable: true })
  // industry: string;
}
