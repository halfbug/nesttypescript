import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
// import moment from 'moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import { GroupShopCreated } from 'src/groupshops/events/groupshop-created.event';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import {
  GS_PLAN1_START_COUNT,
  GS_PLAN2_END_COUNT,
  GS_PLAN3_END_COUNT,
  GS_PLAN4_START_COUNT,
} from 'src/utils/constant';
import { BillingPlanEnum } from '../entities/store.entity';
import { StoresService } from '../stores.service';

@Injectable()
export class StoreListener {
  constructor(
    private storeService: StoresService,
    // private billingService: BillingsService,
    private readonly lifecyclesrv: LifecycleService,
  ) {}

  // @OnEvent('groupshop.created')
  // async updateStore(event: GroupShopCreated) {
  //   const { id, totalGroupShop, planResetDate, appTrialEnd } = event.store;
  //   const storeId = id;
  //   let { plan } = event.store;
  //   console.log('GroupshopSavedEvent Groupshop count n store updation');
  //   // const { createdAt } = event.groupshop;
  //   // const month = (createdAt.getMonth() + 1).toString();
  //   // const year = createdAt.getFullYear().toString();
  //   // const { sdate, edate } = DateFormats(month, year);
  //   const sdate = new Date(
  //     new Date(planResetDate.getTime() - 30 * 24 * 60 * 60 * 1000).setHours(
  //       23,
  //       59,
  //       59,
  //       999,
  //     ),
  //   );
  //   const edate = planResetDate;

  //   // sdate date > traildate then
  //   if (Date.now() > appTrialEnd.getTime()) {
  //     const { total } = await this.billingService.CountGSByRange(
  //       sdate,
  //       edate,
  //       storeId,
  //     );
  //     // const total = 1000;
  //     console.log(
  //       '🚀 ~ file: store.listener.ts ~ line 61 ~ StoreListener ~ updateStore ~ total',
  //       total,
  //     );
  //     console.log('🚀 ~ updateStore ~ sdate', sdate);
  //     console.log('🚀 ~ updateStore ~ edate', edate);
  //     const newCount = (total ?? 0) + 1;
  //     // const newCount = 1001;

  //     // check GS count of custome range (1-1000 groupshops)
  //     if (newCount >= GS_PLAN1_START_COUNT && newCount <= GS_PLAN2_END_COUNT) {
  //       plan = BillingPlanEnum.LAUNCH;
  //       console.log('laucnh');
  //       // (1000 - 2500 groupshops)
  //     } else if (
  //       newCount > GS_PLAN2_END_COUNT &&
  //       newCount <= GS_PLAN3_END_COUNT
  //     ) {
  //       console.log('GROWTH');
  //       plan = BillingPlanEnum.GROWTH;
  //     } else if (newCount >= GS_PLAN4_START_COUNT) {
  //       console.log('ENTERPRISE');
  //       plan = BillingPlanEnum.ENTERPRISE;
  //     } else {
  //       plan = BillingPlanEnum.LAUNCH;
  //     }
  //     // plan changes and which plan in lifecycle
  //     const payload = { id, plan, totalGroupShop: (totalGroupShop ?? 0) + 1 };
  //     const updatedStore = await this.storeService.update(id, payload);
  //     this.lifecyclesrv.create({
  //       storeId: id,
  //       event: EventType.planChanged,
  //       plan,
  //       dateTime: new Date(),
  //     });

  //     // console.log(
  //     //   '🚀 ~ file: store.listener.ts ~ line 32 ~ StoreListener ~ updateStore ~ updatedStore',
  //     //   updatedStore,
  //     // );

  //     this.planUpdateEvent.store = updatedStore;
  //     this.planUpdateEvent.groupshop = event.groupshop;
  //     this.planUpdateEvent.revenue = event.revenue;
  //     this.planUpdateEvent.emit();
  //   } else {
  //     const payload = { id, totalGroupShop: (totalGroupShop ?? 0) + 1 };
  //     const updatedStore = await this.storeService.update(id, payload);
  //     this.planUpdateEvent.store = updatedStore;
  //     this.planUpdateEvent.groupshop = event.groupshop;
  //     this.planUpdateEvent.revenue = event.revenue;
  //     this.planUpdateEvent.emit();
  //   }
  // }
}
