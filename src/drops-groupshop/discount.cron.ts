import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DropsGroupshopService } from './drops-groupshop.service';
import { StoresService } from 'src/stores/stores.service';
import { AppLoggerService } from 'src/applogger/applogger.service';
import { DropsCategoryService } from 'src/drops-category/drops-category.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscountCron {
  constructor(
    private dropsGroupshopService: DropsGroupshopService,
    private readonly storesService: StoresService,
    private readonly apploggerService: AppLoggerService,
    private readonly dropsCategoryService: DropsCategoryService,
    private configService: ConfigService,
  ) {}
  @Cron(CronExpression.EVERY_HOUR)
  async setDiscountAfterUpdateCollections() {
    if (
      this.configService.get('ENV') === 'production' ||
      this.configService.get('ENV') === 'stage'
    ) {
      console.log('run new cron');
      const dropStores = await this.storesService.findDropStore();
      dropStores.map(async (store) => {
        const getUpdateDiscountStatus =
          await this.storesService.getUpdateDiscountStatus(store.id);
        const updateCollectionDate = getUpdateDiscountStatus.lastSync;
        const getLatestLogStatus = await this.apploggerService.findLatestLog(
          'DROPS_COLLECTION_UPDATED',
          store.id,
        );
        if (
          getLatestLogStatus &&
          getLatestLogStatus.createdAt !== 'undefined'
        ) {
          const getLatestDate = getLatestLogStatus.createdAt;
          console.log(store.shop, updateCollectionDate, getLatestDate);
          // console.log(
          //   'before if updateCollectionDate > getLatestDate',
          //   !!(updateCollectionDate > getLatestDate),
          // );
          if (updateCollectionDate < getLatestDate) {
            this.dropsCategoryService.syncDiscountCodes(store.id);
            // console.log('update discoutn codes');
            Logger.log(
              `discountcode update after collection sync`,
              'SYNC_DISCOUNT_AFTER_COLLECTION_UPDATE',
              true,
            );
          } else {
            Logger.log(
              `cron run but nothing to sync`,
              'SYNC_DISCOUNT_AFTER_COLLECTION_UPDATE',
              true,
            );
          }
        } else {
          Logger.log(
            `cron run but store has no drops`,
            'SYNC_DISCOUNT_AFTER_COLLECTION_UPDATE',
            true,
          );
        }
      });
    } // outer cron if
  }
}
