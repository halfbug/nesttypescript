import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { BillingPlanEnum } from './entities/store.entity';
import { StoresService } from './stores.service';

@Injectable()
export class StoreUpdatePlanCron {
  private readonly logger = new Logger(StoreUpdatePlanCron.name);
  constructor(
    private readonly storesService: StoresService,
    private readonly lifecyclesrv: LifecycleService,
  ) {}

  // @Cron('0 59 23 * * *')
  // @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    this.logger.log(
      'Called for daily cron for store plan check',
      StoreUpdatePlanCron.name,
      true,
    );
    const stores = await this.storesService.findActiveAll();
    console.log(
      'file: store.cron line 15 ~ stores',
      stores.map((item) => `${item.brandName} ${item.plan}`),
    );
    stores.map(async (store) => {
      if (
        ['Active', 'ACTIVE', 'active'].includes(store.status) &&
        ['Active', 'ACTIVE', 'active'].includes(store.subscription.status) &&
        store.planResetDate
      ) {
        console.log(`planreset=${store.planResetDate} ${store.brandName}`);

        const id = store.id;
        let payload;
        // here only after trial period run this if
        if (Date.now() >= store.planResetDate.getTime()) {
          // update store plan to launch after trial end. update planResetDate to next 30 days date
          console.log('im in curdate > = planresetdate', store.brandName);
          const nextDate = new Date(
            new Date(
              store.planResetDate.getTime() + 30 * 24 * 60 * 60 * 1000,
            ).setHours(23, 59, 59, 999),
          );
          payload = {
            id: store.id,
            plan: BillingPlanEnum.LAUNCH,
            planResetDate: nextDate,
          };
          const updatedStore = await this.storesService.update(id, payload);
          // life cycle record
          this.lifecyclesrv.create({
            storeId: store.id,
            event: EventType.planReset,
            plan: BillingPlanEnum.LAUNCH,
            dateTime: store.planResetDate,
          });
        }
        // else if (Date.now() >= store.planResetDate.getTime()) {
        //   console.log('im in plan reset');

        //   const nextDate = new Date(
        //     new Date(
        //       store.planResetDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        //     ).setHours(23, 59, 59, 999),
        //   );
        //   payload = {
        //     id: store.id,
        //     plan: BillingPlanEnum.LAUNCH,
        //     planResetDate: nextDate,
        //   };
        // }
        // else {
        //   payload = {
        //     id: store.id,
        //     plan: store.plan,
        //   };
        // }
        // const updatedStore = await this.storesService.update(id, payload);
        console.log(
          'file: store.cron line 58 ~ stores',
          stores.map((item) => `${item.brandName} ${item.plan}`),
        );
        //  1 planResetDate done
        //  2 update planResetDate when first time appTrialEnd is updated done
        //if current trialend date comes update to laucnh done
        // if current trial update planResetDate = trial+30 done
        // cron cur = planResetDate update plan to launch
        // on every GS create , take range of planResetDate and - 30days count GS and sqitch plan acc to count
      }
    });
  }
}
