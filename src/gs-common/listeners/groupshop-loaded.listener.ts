import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { GSLoadedEvent } from '../events/groupshop-loaded.event';
import { GsCommonService } from '../gs-common.service';
import { VistorsService } from '../vistors.service';

@Injectable()
export class GSLoadedListener {
  constructor(
    private readonly vistorsrv: VistorsService,
    private readonly dropsService: DropsGroupshopService,
    private readonly GSCommonService: GsCommonService,
  ) {}

  @OnEvent('groupshop.loaded')
  async updateSubscription(event: GSLoadedEvent) {
    const { groupshopCode: code, userIp: ip } = event;
    const gsType = this.GSCommonService.identifyGS(code);
    let gs;
    if (gsType === 'DROPS') {
      gs = await this.dropsService.findDropsGS(code);
    }
    const gsviews = (await this.vistorsrv.findAll(gs.id)) || [];
    if (gsType === 'DROPS' && gsviews?.length === 0) {
      this.vistorsrv.create(gs.id, ip);
    }
  }
}
