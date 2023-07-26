import { EventBase } from 'src/utils/event.base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

//store.saved
@Injectable()
export class StoreSavedEvent extends EventBase {
  public storeId: string;
  constructor(private eventEmitter: EventEmitter2) {
    super();
  }
  emit() {
    console.log(this);
    this.eventEmitter.emit('store.saved', this);
  }
}
