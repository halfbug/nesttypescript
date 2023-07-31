import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { TokenReceivedEvent } from 'src/shopify/events/token-received.event';
import { CreateStoreInput } from '../dto/create-store.input';
import { UpdateStoreInput } from '../dto/update-store.input';
import { StoreSavedEvent } from '../events/store-saved.event';
import { StoresService } from '../stores.service';
import { ConfigService } from '@nestjs/config';
import { BillingPlanEnum } from '../entities/store.entity';

@Injectable()
export class ShopifyAPIListener {
  constructor(
    private storeService: StoresService,
    private storeSavedEvent: StoreSavedEvent,
    private readonly lifecyclesrv: LifecycleService,
    private configService: ConfigService,
  ) {}
  @OnEvent('token.received')
  async handleTokenReceivedEvent(event: TokenReceivedEvent) {
    console.log(
      '🚀 ~ file: shopify.listener.ts:23 ~ ShopifyAPIListener ~ handleTokenReceivedEvent ~ event:',
      event,
    );
    const {
      token,
      session: { shop, id, state },
    } = event;
    const store: CreateStoreInput =
      (await this.storeService.findOne(shop)) ?? new CreateStoreInput();
    store.accessToken = token;
    store.shop = shop;
    store.shopifySessionId = id;
    store.installationStep = 0;
    store.state = state;
    store.resources = [];
    store.hideProducts = [];
    const trialDays = parseInt(this.configService.get('TRIAL_PERIOD'));
    console.log('store ---', store);

    console.log('app install/uninstall');
    // on re-install app update plan back to launch and planresetdate to next 30days
    if (store.status === 'Uninstalled' && store.appTrialEnd) {
      console.log(
        'store plan',
        Date.now() >= store.appTrialEnd.getTime()
          ? BillingPlanEnum.LAUNCH
          : BillingPlanEnum.EXPLORE,
      );
      //lifecycle

      console.log('app re-install');
      store.status = 'Active';
      store.plan =
        Date.now() >= store.appTrialEnd.getTime()
          ? BillingPlanEnum.LAUNCH
          : BillingPlanEnum.EXPLORE;
      if (Date.now() >= store.appTrialEnd.getTime()) {
        store.planResetDate = new Date(
          new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).setHours(
            23,
            59,
            59,
            999,
          ),
        );
      }
    }

    this.storeService.createORupdate(store).then((sstore) => {
      console.log('store---------------------------saved');
      console.log(sstore);
      this.storeSavedEvent.session = sstore.session;
      this.storeSavedEvent.shop = sstore.shop;
      this.storeSavedEvent.storeId = sstore.id;
      this.storeSavedEvent.emit();
      console.log('done');
      this.lifecyclesrv.create({
        storeId: sstore.id,
        event: EventType.installed,
        dateTime: new Date(),
      });
      // this.lifecyclesrv.create({
      //   storeId: store.id,
      //   event: EventType.planReset,
      //   dateTime: new Date(),
      // });
    });
  }
}
