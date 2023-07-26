import { Column } from 'typeorm';
import { BannerDesignTypeEnum, BannerSummaryEnum } from './settings.entity';

export class GeneralSetting {
  @Column({ nullable: true })
  brandColor?: string;
  @Column()
  customBg?: string;
  @Column({ nullable: true })
  imageUrl?: string;
  @Column({ nullable: true })
  youtubeUrl?: string;
  @Column({ nullable: true })
  media?: string;
}
export class LayoutSetting {
  @Column({ nullable: true })
  bannerProductPage?: boolean;
  @Column({ nullable: true })
  bannerCartPage?: boolean;
  @Column({ nullable: true })
  bannerStyle?: string;
  @Column({ nullable: true })
  bannerDesign?: string;
  @Column({ nullable: true })
  bannerColor?: string;
  @Column({ nullable: true })
  bannerCustomColor?: string;
  @Column({ nullable: true })
  callToActionText?: string;
  @Column({ nullable: true })
  bannerSummaryPage?: string;
}

export class MarketingSetting {
  @Column({ nullable: true })
  recoverAbandoned?: boolean;
  @Column({ nullable: true })
  WhatsAppnotifications?: boolean;
  @Column({ nullable: true })
  facebookPixels?: string;
  @Column({ nullable: true })
  tiktokPixels?: string;
  @Column({ nullable: true })
  googlePixels?: string;
  @Column({ nullable: true })
  snapchatPixels?: string;
}
export class Settings {
  @Column(() => GeneralSetting)
  general?: GeneralSetting;

  @Column(() => LayoutSetting)
  layout?: LayoutSetting;

  @Column(() => MarketingSetting)
  marketing?: MarketingSetting;
}

export class CSettings {
  @Column({ nullable: true })
  brandColor: string;

  @Column()
  customColor: string;

  @Column()
  customBg: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  youtubeUrl: string;

  @Column({ nullable: true })
  media: string;

  @Column('enum', { nullable: true })
  bannerDesign: BannerDesignTypeEnum;

  @Column({ nullable: true })
  bannerProductPage: boolean;

  @Column({ nullable: true })
  bannerCartPage: boolean;

  @Column({ nullable: true })
  bannerLocation: string;

  @Column({ nullable: true })
  callToActionText: string;

  @Column('enum', { nullable: true })
  bannerSummaryPage: BannerSummaryEnum;

  constructor(
    brandColor: string,
    customColor: string,
    customBg: string,
    imageUrl: string,
    youtubeUrl: string,
    media: string,
    bannerDesign: BannerDesignTypeEnum,
    bannerProductPage: boolean,
    bannerCartPage: boolean,
    bannerLocation: string,
    callToActionText: string,
    bannerSummaryPage: BannerSummaryEnum,
  ) {
    this.brandColor = brandColor;
    this.customColor = customColor;
    this.customBg = customBg;
    this.imageUrl = imageUrl;
    this.youtubeUrl = youtubeUrl;
    this.media = media;
    this.bannerDesign = bannerDesign;
    this.bannerProductPage = bannerProductPage;
    this.bannerCartPage = bannerCartPage;
    this.bannerLocation = bannerLocation;
    this.callToActionText = callToActionText;
    this.bannerSummaryPage = bannerSummaryPage;
  }
}
