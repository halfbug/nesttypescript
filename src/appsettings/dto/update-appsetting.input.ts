import { CreateAppsettingInput } from './create-appsetting.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAppsettingInput extends PartialType(CreateAppsettingInput) {
  @Field({ description: 'mongo entity id' })
  id: string;
}
