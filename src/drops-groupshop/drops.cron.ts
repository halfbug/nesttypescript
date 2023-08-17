import { Injectable, Logger, Req, Res } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { KalavioService } from 'src/email/kalavio.service';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { DropCreatedListener } from 'src/drops-groupshop/listeners/drop-created.listener';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
import { v4 as uuid } from 'uuid';
import { StoresService } from 'src/stores/stores.service';
@Injectable()
export class DropKlaviyoCron {
  constructor(
    private kalavioService: KalavioService,
    private dropsGroupshopService: DropsGroupshopService,
    private readonly lifecyclesrv: LifecycleService,
    private readonly storesService: StoresService,
    private configService: ConfigService,
    private dropCreatedListener: DropCreatedListener,
    private readonly crypt: EncryptDecryptService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES) // CronExpression.EVERY_10_MINUTES)
  async klaviyoGroupshopStatus() {
    const groupshops =
      await this.dropsGroupshopService.findExpiredDropGroupshhop();
    groupshops?.map(async (groupshop) => {
      const klaviyoId = groupshop?.customerDetail.klaviyoId;
      const shortURL = groupshop?.shortUrl;

      // Update status in database
      groupshop.status = 'expired';
      await this.dropsGroupshopService.update(groupshop.id, groupshop);

      // Update status on Klaviyo profile
      if (typeof klaviyoId !== 'undefined') {
        const currentProfile = await this.kalavioService.getProfilesById(
          klaviyoId,
          groupshop.storeId,
        );
        const latestShortUrl =
          currentProfile?.data.attributes.properties?.groupshop_url;
        if (shortURL === latestShortUrl) {
          const params = new URLSearchParams({
            groupshop_status: 'expired',
          });
          const data = params.toString();
          await this.kalavioService.klaviyoProfileUpdate(
            klaviyoId,
            data,
            groupshop.storeId,
          );
        }
      }
    });
  }

  @Cron('0 */07 * * FRI') // CronExpression.EVERY_WEEK)
  async WeeklyDropCreation(@Req() req, @Res() res) {
    if (this.configService.get('ENV') === 'production') {
      const stores = await this.storesService.findOneByName(
        this.configService.get('DROPSHOP'),
      );
      // const listId = stores.drops.klaviyo.listId;
      const listId = this.configService.get('DROPLISTID');
      const shop = stores.shop;
      const privateKey = stores.drops.klaviyo.privateKey;
      const baseline = stores.drops.rewards.baseline;

      Logger.log(
        `Weekly Drop Cron Started for ${shop} at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      const d = new Date(new Date().setDate(new Date().getDate() - 7));
      const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      const lastWeek = Date.parse(`${year}${'-'}${month}${'-'}${day}`);

      const td = new Date(new Date().setDate(new Date().getDate()));
      const tyear = td.getFullYear();
      const tmonth = ('0' + (td.getMonth() + 1)).slice(-2);
      const tday = ('0' + td.getDate()).slice(-2);
      const today = Date.parse(`${tyear}${'-'}${tmonth}${'-'}${tday}`);

      let nextPage = '';
      let allProfiles = [];
      do {
        const profiles = await this.kalavioService.getProfilesBySegmentId(
          listId,
          nextPage,
          privateKey,
        );
        allProfiles = [...allProfiles, ...profiles.data];
        const nextPageLink = profiles?.links?.next ? profiles?.links?.next : '';

        if (nextPageLink !== '') {
          nextPage = nextPageLink;
        } else {
          nextPage = '';
        }
        console.log('nextPageLink', nextPageLink);
      } while (nextPage !== '');

      Logger.log(
        `Weekly Drop Cron fetching ${
          allProfiles.length
        } profiles at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      const filteredProfiles = allProfiles.filter(
        (profile) =>
          (profile.attributes.properties?.groupshop_source === 'API' &&
            profile.attributes.properties?.groupshop_status !== 'pending' &&
            Date.parse(profile.attributes.properties?.groupshop_created_at) <
              lastWeek) ||
          (profile.attributes.properties?.groupshop_source === 'API' &&
            profile.attributes.properties?.groupshop_status !== 'pending' &&
            Date.parse(profile.attributes.properties?.groupshop_created_at) >=
              lastWeek) ||
          (profile.attributes.properties?.groupshop_source === 'CRON' &&
            Date.parse(profile.attributes.properties?.groupshop_created_at) !==
              today),
      );

      Logger.log(
        `Weekly Drop Cron get filtered Profiles at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      // console.log('filteredProfiles', JSON.stringify(filteredProfiles));

      const profileKalviyoIDs = filteredProfiles
        .filter(
          (profile) =>
            profile.attributes.properties?.groupshop_status === 'pending',
        )
        .map((profile) => {
          return profile.id;
        });

      // console.log('profileKalviyoIDs', JSON.stringify(profileKalviyoIDs));
      const getpendingdropGroupshops =
        await this.dropsGroupshopService.getAllPendingDropsByIds(
          profileKalviyoIDs,
        );

      Logger.log(
        `Weekly Drop Cron Get Pending Drop Groupshops at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      const pendingdropGroupshops = getpendingdropGroupshops?.map(
        (dgroupshop) => {
          return {
            groupshopId: dgroupshop,
            event: EventType.ended,
            dateTime: new Date(),
          };
        },
      );

      if (pendingdropGroupshops.length > 0) {
        await this.lifecyclesrv.insertMany(pendingdropGroupshops);
      }
      Logger.log(
        `Weekly Drop Cron Completed  Lifecycle ${
          pendingdropGroupshops.length
        } records for Pending Drop Groupshops at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      if (getpendingdropGroupshops.length > 0) {
        await this.dropsGroupshopService.updateBulkDgroupshops(
          getpendingdropGroupshops,
        );
      }

      Logger.log(
        `Weekly Drop Cron Updated Bulk Pending Drop Groupshops Status at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      const dropobjects = filteredProfiles.map((profile, index) => {
        const discountTitle = `GSD${Date.now()}${index}`;
        const cryptURL = `/${shop.split('.')[0]}/drops/${this.crypt.encrypt(
          discountTitle,
        )}`;
        const ownerUrl = `/${shop.split('.')[0]}/drops/${this.crypt.encrypt(
          discountTitle,
        )}/owner&${this.crypt.encrypt(new Date().toDateString())}`;
        const expiredFulllink = `${this.configService.get(
          'FRONT',
        )}${cryptURL}/status&activated`;
        const fulllink = `${this.configService.get('FRONT')}${ownerUrl}`;

        return {
          id: uuid(),
          storeId: stores.id,
          url: cryptURL,
          obSettings: {
            step: 0,
            ownerUrl: ownerUrl,
          },
          shortUrl: fulllink,
          expiredUrl: expiredFulllink,
          expiredShortUrl: expiredFulllink,
          discountCode: {
            title: discountTitle,
            percentage: null,
            priceRuleId: null,
          },
          customerDetail: {
            klaviyoId: profile?.id,
            fullName: profile?.attributes?.properties?.['Full Name'] ?? null,
            firstName: profile?.attributes?.first_name,
            lastName: profile?.attributes?.last_name,
            email: profile?.attributes?.email,
            phone: profile?.attributes?.phone_number,
          },
          status: 'pending',
          groupshopSource: 'CRON',
          expiredAt: null,
          milestones: [{ activatedAt: new Date(), discount: baseline }],
          members: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      Logger.log(
        `Weekly Drop Cron Created ${
          dropobjects.length
        } records of Drop object for New drop links at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );
      await this.dropsGroupshopService.insertMany(dropobjects);

      Logger.log(
        `Weekly Drop Cron Successfully Inserted New drop links at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      Logger.log(
        `Weekly Drop Cron Start updating profiles on klaviyo at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );

      for (const dropobject of dropobjects) {
        const obj = {
          groupshop_status: 'pending',
          groupshop_created_at: `${tyear}${'-'}${tmonth}${'-'}${tday}`,
          groupshop_source: 'CRON',
          groupshop_url: dropobject.shortUrl,
          reactivate_groupshop: dropobject.expiredShortUrl,
        };
        const data = Object.keys(obj)
          .map((key) => {
            return `${key}=${encodeURIComponent(obj[key])}`;
          })
          .join('&');
        await this.kalavioService.klaviyoProfileUpdate(
          dropobject.customerDetail.klaviyoId,
          data,
          stores.id,
        );
      }

      Logger.log(
        `Weekly Drop Cron updated ${
          dropobjects.length
        } profiles on klaviyo at ${new Date()} `,
        'WeeklyDropCron',
        true,
      );
      res.status(200).send('Success');
    }
  }
}
