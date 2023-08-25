import { Column, Entity } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { Settings } from './settings.model';
// import SocialLinks from 'src/campaigns/entities/social-link.model';
import {
  BillingPlanEnum,
  BillingTierEnum,
  CodeUpdateStatusTypeEnum,
  CollectionUpdateEnum,
} from './store.entity';
import { DiscountCode } from 'src/drops-groupshop/entities/groupshop.modal';
import SocialLinks from './social-link.model';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Session } from '@shopify/shopify-api';

export class Resource {
  @Column({ nullable: true })
  id: string;
  @Column({ nullable: true })
  type?: string;
  @Column({ nullable: true })
  detail?: string;
}

export class Subscription {
  @Column({ nullable: true })
  status?: string;
  confirmationUrl?: string;
}

export class Retentiontools {
  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  updatedAt?: Date;
}
export class MatchingBrandName {
  @Column({ nullable: true })
  id: string;

  @Column({ nullable: true })
  brandName: string;
}

export class DiscoveryTools {
  @Column({ nullable: true })
  status?: string;

  @Column(() => MatchingBrandName)
  matchingBrandName?: MatchingBrandName[];
}
export class Collections {
  @Column({ nullable: true })
  shopifyId?: string;

  @Column({ nullable: true })
  name?: string;
}
export class CartRewards {
  @Column({ nullable: true })
  id?: string;

  @Column({ nullable: true })
  rewardTitle?: string;

  @Column({ nullable: true })
  rewardValue?: string;
}

export class Klaviyo {
  @Column({ nullable: true })
  publicKey?: string;

  @Column({ nullable: true })
  privateKey?: string;

  @Column({ nullable: true })
  listId?: string;

  @Column({ nullable: true })
  subscriberListId?: string;

  @Column({ nullable: true })
  signup1?: string;

  @Column({ nullable: true })
  signup2?: string;

  @Column({ nullable: true })
  signup3?: string;

  @Column({ nullable: true })
  signup4?: string;
}
@InputType('PartnerRewardsInput')
@ObjectType('PartnerRewards')
export class PartnerRewards {
  @Field({ nullable: true })
  @Column({ nullable: true })
  baseline: string;
  @Field({ nullable: true })
  @Column({ nullable: true })
  average: string;
  @Field({ nullable: true })
  @Column({ nullable: true })
  maximum: string;
}
export class Drops {
  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  isVideoEnabled?: boolean;

  @Column({ nullable: true })
  spotlightColletionId?: string;

  @Column({ nullable: true })
  spotlightDiscount?: DiscountCode;

  @Column(() => Collections)
  collections?: Collections[];

  @Column({ nullable: true })
  latestCollectionId?: string;

  @Column({ nullable: true })
  bestSellerCollectionId?: string;

  @Column({ nullable: true })
  runningOutCollectionId?: string;

  @Column({ nullable: true })
  skincareCollectionId?: string;

  @Column({ nullable: true })
  hairCollectionId?: string;

  @Column({ nullable: true })
  allProductsCollectionId?: string;

  @Column({ nullable: true })
  rewards?: PartnerRewards;

  @Column({ nullable: true, default: null })
  lastSync?: Date;

  @Column('enum', { default: CodeUpdateStatusTypeEnum.none })
  codeUpdateStatus?: CodeUpdateStatusTypeEnum;

  @Column({ default: 0, nullable: true })
  dropsCount?: number;

  @Column({ nullable: true })
  klaviyo?: Klaviyo;

  @Column(() => CartRewards)
  cartRewards?: CartRewards[];

  @Column(() => String)
  collectionId?: string;
}

export class CollectionsToUpdate {
  @Column({ nullable: true })
  collectionId?: string;

  @Column({ nullable: true })
  collectionTitle?: string;

  @Column({ default: false })
  isSynced: boolean;

  @Column({ default: new Date() })
  updatedAt: Date;
}

@Entity()
export default class Store extends DefaultColumnsService {
  @Column()
  shopifySessionId: string;

  @Column({ nullable: true })
  brandName: string;

  @Column()
  shop: string;

  @Column()
  accessToken: string;

  @Column({ nullable: true })
  installationStep: number | null;

  @Column({ nullable: true })
  logoImage: string;

  @Column({ nullable: true })
  industry: string[];

  @Column((type) => Settings)
  settings?: Settings;

  @Column((type) => SocialLinks)
  social?: SocialLinks;

  @Column('enum', { default: BillingPlanEnum.EXPLORE })
  plan?: BillingPlanEnum;

  @Column({ default: 0, nullable: true })
  totalGroupShop?: number;

  @Column({ nullable: true })
  resources?: Resource[];

  @Column({ nullable: true })
  subscription?: Subscription;

  @Column({ nullable: true })
  retentiontool?: Retentiontools;

  @Column({ nullable: true })
  hideProducts?: string[];

  @Column({ nullable: true })
  appTrialEnd: Date;

  @Column({ nullable: true })
  planResetDate: Date;

  @Column({ nullable: true })
  currencyCode: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  discoveryTool: DiscoveryTools;

  @Column({ nullable: true })
  recentgs: string;

  @Column({ nullable: true })
  drops: Drops;

  @Column({ default: [] })
  collectionsToUpdate?: CollectionsToUpdate[];

  @Column('enum', { default: CollectionUpdateEnum.COMPLETE })
  collectionUpdateStatus?: CollectionUpdateEnum;

  @Column({ nullable: true })
  state?: string;
}

export type StoreWithSession = Store & { session: Session };
