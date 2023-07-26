import { EventBase } from 'src/utils/event.base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

//store.saved
@Injectable()
export class DropKlaviyoEvent extends EventBase {
  public webhook: any;
  constructor(private eventEmitter: EventEmitter2) {
    super();
  }
  emit() {
    this.eventEmitter.emit('drop.klaviyo', this);
  }
}
