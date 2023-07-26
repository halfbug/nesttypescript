import { InputType, Int, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class CreateSignUpInput {
  @Field({ nullable: true })
  email: string;
}
