import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductOutofstockEvent {
  public shop: string;
  constructor(private eventEmitter: EventEmitter2) {}
  emit() {
    this.eventEmitter.emit('is-outofstock', this);
  }
}
