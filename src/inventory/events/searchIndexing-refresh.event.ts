import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

// 1st ref comes
@Injectable()
export class SearchIndexingRefreshEvent {
  public shopName: string;
  constructor(private eventEmitter: EventEmitter2) {}
  emit() {
    this.eventEmitter.emit('searchIndexing.refresh', this);
  }
}
