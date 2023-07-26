import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum BannerDesignTypeEnum {
  GS_NEON,
  GS_WHITE,
  GS_LIGHT,
  GS_DARK,
  GS_LIGHT_A,
  GS_DARK_A,
  GS_CUSTOM_A,
}
registerEnumType(BannerDesignTypeEnum, {
  name: 'BannerDesignTypeEnum',
});
export enum BannerSummaryEnum {
  LEFT,
  RIGHT,
  BOTH,
  NONE,
}
registerEnumType(BannerSummaryEnum, {
  name: 'BannerSummaryEnum',
});

@ObjectType('GeneralSetting')
export class GeneralSetting {
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

@ObjectType('LayoutSetting')
export class LayoutSetting {
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

@ObjectType('MarketingSetting')
export class MarketingSetting {
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

@ObjectType()
export class Settings {
  @Field(() => GeneralSetting, { nullable: true })
  general?: GeneralSetting;

  @Field(() => LayoutSetting, { nullable: true })
  layout?: LayoutSetting;

  @Field(() => MarketingSetting, { nullable: true })
  marketing?: MarketingSetting;
}

@ObjectType()
export class CSettings {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  brandColor?: string;

  @Field({ nullable: true })
  customColor?: string;

  @Field({ nullable: true })
  customBg?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  youtubeUrl?: string;

  @Field({ nullable: true })
  media?: string;

  @Field(() => BannerDesignTypeEnum, { nullable: true })
  bannerDesign: BannerDesignTypeEnum;

  @Field({ nullable: true })
  bannerProductPage?: boolean;

  @Field({ nullable: true })
  bannerCartPage?: boolean;

  @Field({ nullable: true })
  bannerLocation?: string;

  @Field({ nullable: true })
  callToActionText?: string;

  @Field(() => BannerSummaryEnum, { nullable: true })
  bannerSummaryPage: BannerSummaryEnum;
}
