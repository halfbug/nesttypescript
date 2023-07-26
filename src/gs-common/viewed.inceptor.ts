import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as requestIp from '@supercharge/request-ip';
import { GqlExecutionContext } from '@nestjs/graphql';
import { EncryptDecryptService } from '../utils/encrypt-decrypt/encrypt-decrypt.service';
import { GSLoadedEvent } from './events/groupshop-loaded.event';

@Injectable()
export class ViewedInterceptor implements NestInterceptor {
  constructor(
    private readonly crypt: EncryptDecryptService,
    private readonly gsloadedenvt: GSLoadedEvent,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // console.log('Before...');

    const now = Date.now();
    return next.handle().pipe(
      tap(async () => {
        console.log(`After... ${Date.now() - now}ms`);
        const { code } = context.getArgByIndex(1);

        const req = GqlExecutionContext.create(context).getContext().req; //context.getArgByIndex(2);

        const clientIp = requestIp.getClientIp(req); //req.clientIp;

        const ip =
          clientIp ||
          (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
          req.socket?.remoteAddress ||
          req.ip;
        console.log({ ip });

        this.gsloadedenvt.groupshopCode = this.crypt.decrypt(code);
        this.gsloadedenvt.userIp = ip;
        this.gsloadedenvt.emit();
      }),
    );
  }
}
