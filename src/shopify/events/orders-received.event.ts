import { EventBase } from 'src/utils/event.base';

export class OrdersReceivedEvent extends EventBase {
  bulkOperationResponse: any;
}
