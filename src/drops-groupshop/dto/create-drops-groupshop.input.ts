import { InputType, Field, ObjectType } from '@nestjs/graphql';
import {
  DiscountCodeInput,
  MemberInput,
  MilestoneInput,
  OBSettingsInput,
} from './create-groupshops.input';

@InputType()
export class DropCustomerInput {
  @Field({ nullable: true })
  klaviyoId: string;
  @Field({ nullable: true })
  fullName: string;
  @Field({ nullable: true })
  firstName: string;
  @Field({ nullable: true })
  lastName: string;
  @Field({ nullable: true })
  email: string;
  @Field({ nullable: true })
  phone: string;
}

@InputType()
export class CreateDropsGroupshopInput {
  @Field({ nullable: true })
  storeId?: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  shortUrl?: string;

  @Field({ nullable: true })
  expiredUrl?: string;

  @Field({ nullable: true })
  expiredShortUrl?: string;

  @Field(() => DiscountCodeInput, { nullable: true })
  discountCode?: DiscountCodeInput;

  @Field(() => DropCustomerInput)
  customerDetail: DropCustomerInput;

  @Field(() => [MemberInput], { nullable: true })
  members?: MemberInput[];

  @Field(() => MilestoneInput, { nullable: true })
  milestones: MilestoneInput[];

  @Field(() => OBSettingsInput, { nullable: true })
  obSettings?: OBSettingsInput;

  @Field(() => [String], { nullable: true })
  favorite?: string[];

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  groupshopSource?: string;

  @Field({ nullable: true })
  expiredAt?: Date;
}
