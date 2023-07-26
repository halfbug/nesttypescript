import { EventBase } from 'src/utils/event.base';

export class GroupshopCashbackEvent extends EventBase {
  groupshop: any;
  cashbackAmount: any;
  netDiscount: any;
  orderId: any;
  store: any;
}
