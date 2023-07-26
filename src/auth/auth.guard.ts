import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      // console.log(
      //   '🚀 ~ file: auth.guard.ts ~ line 22 ~ AuthGuard ~ canActivate ~ isPublic',
      //   isPublic,
      // );
      if (isPublic) {
        return true;
      }
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      const rowToken = req.headers.authorization;
      const auth = this.authService.decodeJwt(rowToken.split(' ')[1]);
      req.auth = auth;
      if (auth.isGSAdminUser) return true;
      // TODO validate admin user
      else {
        const { status } = await this.authService.verifyToken(auth);
        // context.auth = auth;
        return status;
      }
      //   return authData.status;
    } catch (err) {
      return false;
    }
  }
}
