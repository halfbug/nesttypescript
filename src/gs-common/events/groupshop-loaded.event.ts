import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

// 1st ref comes
@Injectable()
export class GSLoadedEvent {
  public groupshopCode: string;
  public userIp: string;
  constructor(private eventEmitter: EventEmitter2) {}
  emit() {
    this.eventEmitter.emit('groupshop.loaded', this);
  }
}
