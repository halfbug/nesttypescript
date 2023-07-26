import { EventBase } from 'src/utils/event.base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DropsCollectionUpdatedEvent extends EventBase {
  constructor(private eventEmitter: EventEmitter2) {
    super();
  }
  public collections: string[];
  public dropsGroupshops: any;
  public storeId: string;
  public drops: any;
  emit() {
    this.eventEmitter.emit('dropsCollection.updated', this);
  }
}
