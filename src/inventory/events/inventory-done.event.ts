import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { EventBase } from 'src/utils/event.base';

@Injectable()
export class InventoryDoneEvent extends EventBase {
  constructor(private eventEmitter: EventEmitter2) {
    super();
  }
  emit() {
    this.eventEmitter.emit('inventory.done', this);
  }
}
