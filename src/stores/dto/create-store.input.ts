import { InputType, ID, Field } from '@nestjs/graphql';
import { AnyScalar } from 'src/utils/any.scalarType';
import {
  BannerDesignTypeEnum,
  BannerSummaryEnum,
} from '../entities/settings.entity';
import {
  BillingPlanEnum,
  BillingTierEnum,
  CollectionUpdateEnum,
  Resource,
} from '../entities/store.entity';
import { CodeUpdateStatusTypeEnum } from '../entities/store.entity';
import { DiscountCodeInput } from 'src/drops-groupshop/dto/create-groupshops.input';
import { PartnerRewards } from '../entities/store.model';
// import { Settings } from '../entities/settings.entity';

@InputType()
export class GeneralSettingInput {
  @Field({ nullable: true })
  brandColor?: string;
  @Field({ nullable: true })
  customBg?: string;
  @Field({ nullable: true })
  imageUrl?: string;
  @Field({ nullable: true })
  youtubeUrl?: string;
  @Field({ nullable: true })
  media?: string;
}

@InputType()
export class LayoutSettingInput {
  @Field({ nullable: true })
  bannerProductPage?: boolean;
  @Field({ nullable: true })
  bannerCartPage?: boolean;
  @Field({ nullable: true })
  bannerStyle?: string;
  @Field({ nullable: true })
  bannerDesign?: string;
  @Field({ nullable: true })
  bannerColor?: string;
  @Field({ nullable: true })
  bannerCustomColor?: string;
  @Field({ nullable: true })
  callToActionText?: string;
  @Field({ nullable: true })
  bannerSummaryPage?: string;
}

@InputType()
export class MarketingSettingInput {
  @Field({ nullable: true })
  recoverAbandoned?: boolean;
  @Field({ nullable: true })
  WhatsAppnotifications?: boolean;
  @Field({ nullable: true })
  facebookPixels?: string;
  @Field({ nullable: true })
  tiktokPixels?: string;
  @Field({ nullable: true })
  googlePixels?: string;
  @Field({ nullable: true })
  snapchatPixels?: string;
}
@InputType()
export class SettingsInput {
  @Field({ nullable: true })
  dropBanner?: string;

  @Field((type) => GeneralSettingInput, { nullable: true })
  general?: GeneralSettingInput;

  @Field((type) => LayoutSettingInput, { nullable: true })
  layout?: LayoutSettingInput;

  @Field((type) => MarketingSettingInput, { nullable: true })
  marketing?: MarketingSettingInput;
}

@InputType()
export class SocialInput {
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

@InputType('SubscriptionInput')
export class Subscription {
  @Field({ nullable: true })
  status?: string;
  @Field({ nullable: true })
  confirmationUrl?: string;
}
@InputType('RetentiontoolsInput')
export class Retentiontools {
  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@InputType()
export class MatchingBrandNameInput {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  brandName: string;
}
@InputType()
export class DiscoveryToolsInput {
  @Field({ nullable: true })
  status?: string;

  @Field(() => [MatchingBrandNameInput], { nullable: 'itemsAndList' })
  matchingBrandName?: MatchingBrandNameInput[];
}
@InputType()
export class CollectionsInputs {
  @Field({ nullable: true })
  shopifyId?: string;

  @Field({ nullable: true })
  name?: string;
}

@InputType()
export class KlaviyoInputs {
  @Field({ nullable: true })
  publicKey?: string;

  @Field({ nullable: true })
  privateKey?: string;

  @Field({ nullable: true })
  listId?: string;

  @Field({ nullable: true })
  subscriberListId?: string;

  @Field({ nullable: true })
  signup1?: string;

  @Field({ nullable: true })
  signup2?: string;

  @Field({ nullable: true })
  signup3?: string;

  @Field({ nullable: true })
  signup4?: string;
}
@InputType()
export class CartRewardsInput {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  rewardTitle?: string;

  @Field({ nullable: true })
  rewardValue?: string;
}

@InputType('DropsInput')
export class DropsInput {
  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  isVideoEnabled?: boolean;

  @Field({ nullable: true })
  spotlightColletionId?: string;

  @Field({ nullable: true })
  spotlightDiscount?: DiscountCodeInput;

  @Field({ nullable: true })
  vaultDiscount?: DiscountCodeInput;

  @Field(() => [CollectionsInputs], { nullable: 'itemsAndList' })
  collections?: CollectionsInputs[];

  @Field({ nullable: true })
  latestCollectionId?: string;

  @Field({ nullable: true })
  bestSellerCollectionId?: string;

  @Field({ nullable: true })
  runningOutCollectionId?: string;

  @Field({ nullable: true })
  skincareCollectionId?: string;

  @Field({ nullable: true })
  hairCollectionId?: string;

  @Field({ nullable: true })
  allProductsCollectionId?: string;

  @Field({ nullable: true })
  rewards?: PartnerRewards;

  @Field({ nullable: true })
  lastSync?: Date;

  @Field(() => CodeUpdateStatusTypeEnum)
  codeUpdateStatus?: CodeUpdateStatusTypeEnum;

  @Field({ nullable: true, defaultValue: 0 })
  dropsCount?: number;

  @Field({ nullable: true })
  klaviyo?: KlaviyoInputs;

  @Field(() => [CartRewardsInput], { nullable: 'itemsAndList' })
  cartRewards?: CartRewardsInput[];
}
@InputType('CollectionsToUpdateInput')
export class CollectionsToUpdateInput {
  @Field({ nullable: true })
  collectionId?: string;

  @Field({ nullable: true })
  collectionTitle?: string;

  @Field({ defaultValue: false })
  isSynced?: boolean;

  @Field({ defaultValue: new Date() })
  updatedAt?: Date;
}

@InputType('CollectionUpdateStatus')
export class CollectionUpdateStatus {
  cronStatus: CollectionUpdateEnum;
}

@InputType()
export class CreateStoreInput {
  @Field()
  id: string;

  @Field({ defaultValue: 'Active' })
  status?: string;

  @Field()
  shopifySessionId?: string;

  @Field({ nullable: true })
  brandName?: string;

  @Field()
  shop: string;

  @Field()
  accessToken?: string;

  @Field({ nullable: true })
  installationStep?: number | null;

  @Field({ nullable: true })
  logoImage?: string;

  @Field(() => [String], { nullable: true })
  industry?: string[];

  @Field((type) => SettingsInput)
  settings?: SettingsInput;

  @Field((type) => SocialInput)
  social?: SocialInput;

  @Field(() => BillingPlanEnum, { defaultValue: BillingPlanEnum.EXPLORE })
  plan?: BillingPlanEnum;

  @Field({ defaultValue: 0, nullable: true })
  totalGroupShop?: number;

  @Field(() => [Resource], { nullable: 'itemsAndList' })
  resources?: Resource[];

  @Field({ nullable: true })
  currencyCode: string;

  @Field(() => [String], { nullable: true })
  hideProducts?: string[];

  @Field({ nullable: true })
  timezone: string;

  @Field({ nullable: true })
  subscription?: Subscription;

  @Field({ nullable: true })
  retentiontool?: Retentiontools;

  createdAt?: Date;

  @Field({ defaultValue: new Date() })
  updatedAt: Date;

  @Field({ nullable: true })
  planResetDate: Date;

  @Field({ nullable: true })
  appTrialEnd: Date;

  @Field(() => DiscoveryToolsInput, { nullable: true })
  discoveryTool?: DiscoveryToolsInput;

  @Field({ nullable: true })
  recentgs?: string;

  @Field({ nullable: true })
  drops?: DropsInput;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  activity?: string;

  @Field(() => [CollectionsToUpdateInput], { nullable: true })
  collectionsToUpdate?: CollectionsToUpdateInput[];

  @Field(() => CollectionUpdateEnum)
  collectionUpdateStatus?: CollectionUpdateEnum;

  @Field({ nullable: true })
  state?: string;
}
