import { EventBase } from 'src/utils/event.base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

//add.resource
@Injectable()
export class AddResourceEvent extends EventBase {
  public id: string;
  public type?: string;
  public detail?: string;

  constructor(private eventEmitter: EventEmitter2) {
    super();
  }
  emit() {
    this.eventEmitter.emit('add.resource', this);
  }
}
