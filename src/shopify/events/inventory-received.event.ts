import { EventBase } from 'src/utils/event.base';

export class InventoryReceivedEvent extends EventBase {
  bulkOperationResponse: any;
  // shop: string;
}
