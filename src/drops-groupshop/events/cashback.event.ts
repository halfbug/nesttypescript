import Store from 'src/stores/entities/store.model';
import { Groupshops } from '../entities/groupshop.modal';

export class CashBackEvent {
  groupshop: Groupshops;
  cashbackAmount: number;
  cashbackCharge: number;
  store: Store;
  revenue: number;
  orderId: any;
  netDiscount: any;
}
