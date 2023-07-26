import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SocialLinks {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  instagram?: string;

  @Field({ nullable: true })
  pinterest?: string;

  @Field({ nullable: true })
  tiktok?: string;

  @Field({ nullable: true })
  twitter?: string;

  @Field({ nullable: true })
  facebook?: string;
}
