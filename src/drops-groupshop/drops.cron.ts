import { Injectable, Logger, Req, Res } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { KalavioService } from 'src/email/kalavio.service';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { DropCreatedListener } from 'src/drops-groupshop/listeners/drop-created.listener';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
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
      const storeData = await this.storesService.findDropStore();
      for (const stores of storeData) {
        const listId = stores.drops.klaviyo.listId;
        const privateKey = stores.drops.klaviyo.privateKey;
        const shop = stores.shop;
        let lastWeek: any = '';
        let counter = 0;
        let updatedCounter = 0;
        let lastWeekCounter = 0;
        const d = new Date(new Date().setDate(new Date().getDate() - 7));
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        lastWeek = Date.parse(`${year}${'-'}${month}${'-'}${day}`);

        const td = new Date(new Date().setDate(new Date().getDate()));
        const tyear = td.getFullYear();
        const tmonth = ('0' + (td.getMonth() + 1)).slice(-2);
        const tday = ('0' + td.getDate()).slice(-2);
        const today = Date.parse(`${tyear}${'-'}${tmonth}${'-'}${tday}`);
        let nextPage = '';

        Logger.log(
          `Weekly Drop Cron start for the listId : ${listId} for ${shop} at ${new Date()}`,
          'WeeklyDropCron',
          true,
        );
        do {
          const profiles = await this.kalavioService.getProfilesByListId(
            listId,
            nextPage,
            privateKey,
          );
          const nextPageLink = profiles?.links?.next
            ? profiles?.links?.next
            : '';
          if (nextPageLink !== '') {
            nextPage = nextPageLink.split('profiles/?')[1];
          } else {
            nextPage = '';
          }
          // console.log('profiles', JSON.stringify(profiles));
          let indexCounter = 0;
          for (const profile of profiles?.data) {
            const arrayLength = profiles.data.length;
            counter = counter + 1;
            indexCounter = indexCounter + 1;
            const klaviyoId = profile?.id;
            const createdAt = Date.parse(
              profile.attributes.properties?.groupshop_created_at,
            );
            const drop_source = profile.attributes.properties?.groupshop_source
              ? profile.attributes.properties?.groupshop_source
              : '';

            const groupshop_status = profile.attributes.properties
              ?.groupshop_status
              ? profile.attributes.properties?.groupshop_status
              : '';

            if (
              (drop_source === 'API' &&
                createdAt > lastWeek &&
                groupshop_status === 'pending') ||
              (drop_source === 'CRON' && createdAt === today)
            ) {
              lastWeekCounter = lastWeekCounter + 1;
              console.log('Drop recently created ', klaviyoId);
            } else {
              updatedCounter = updatedCounter + 1;
              const dropGroupshops =
                await this.dropsGroupshopService.getGroupshopByKlaviyoId(
                  klaviyoId,
                );
              // Update status in database of old pending drop groupshop
              if (groupshop_status !== 'active') {
                dropGroupshops.map(async (dgroupshop) => {
                  dgroupshop.status = 'expired';
                  dgroupshop.expiredAt = new Date();

                  this.lifecyclesrv.create({
                    groupshopId: dgroupshop.id,
                    event: EventType.ended,
                    dateTime: new Date(),
                  });

                  await this.dropsGroupshopService.update(
                    dgroupshop.id,
                    dgroupshop,
                  );
                });
              }
              const fullname =
                profile?.attributes?.properties?.['Full Name'] ?? null;
              const webdata = {
                id: klaviyoId,
                fullname: fullname,
                first_name: profile?.attributes?.first_name,
                last_name: profile?.attributes?.last_name,
                email: profile?.attributes?.email,
                phone_number: profile?.attributes?.phone_number,
              };
              const inputListener: any = {};
              inputListener.webhook = webdata;
              inputListener.shop = shop;
              await this.dropCreatedListener.addCronDrop(inputListener);
            }
            // eslint-disable-next-line prettier/prettier
         if (nextPage === '' && arrayLength === indexCounter) {
              console.log(
                `Weekly Drop Cron completed ${updatedCounter}/${counter} for ${shop} at ${new Date()} `,
              );
              Logger.log(
                `Weekly Drop Cron completed ${updatedCounter}/${counter} for ${shop} at ${new Date()} `,
                'WeeklyDropCron',
                true,
              );
              Logger.log(
                `Weekly Drop created last week ${lastWeekCounter}/${counter} for ${shop} at ${new Date()} `,
                'WeeklyDropCron',
                true,
              );
            }
          }
        } while (nextPage !== '');
      }
      res.status(200).send('Success');
    }
  }
}
