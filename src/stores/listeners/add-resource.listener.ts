import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AddResourceEvent as addAResourceEvent } from '../events/add-resource.event';
import { StoresService } from '../stores.service';

@Injectable()
export class AddResourceListener {
  constructor(private storeService: StoresService) {}
  @OnEvent('add.resource')
  addResource(event: addAResourceEvent) {
    const { id, type, detail, shop } = event;
    console.log(
      '🚀 ~ file: add-resource.listener.ts ~ line 14 ~ addResourceListener ~ addResource ~ event',
      { id, type, detail, shop },
    );

    this.storeService
      .updateResource(shop, { id, type, detail })
      .then((res) => console.log(JSON.stringify(res)))
      .catch((err) => console.log(JSON.stringify(err)));
  }
}
