import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { ShopifyService } from 'src/shopify/shopify.service';
import { ConfigService } from '@nestjs/config';
import Store from 'src/stores/entities/store.model';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity';
import { ShopifyService } from 'src/shopify/shopify.service';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private shopifyService: ShopifyService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  goToAppfront(store: Store) {
    const { shop, installationStep, status } = store;
    const shopName = shop.split('.')[0];
    // {"app_subscription":{"admin_graphql_api_id":"gid://shopify/AppSubscription/26070876326",
    // "name":"Explore (free for 30 days) + Cashback charge","status":"DECLINED",
    // "admin_graphql_api_shop_id":"gid://shopify/Shop/53108211878","created_at":"2022-11-29T07:10:38-05:00","updated_at":"2022-11-29T07:10:49-05:00","capped_amount":"2000.0","currency":"USD"}}
    return installationStep === null &&
      ['Active', 'ACTIVE', 'actve'].includes(status)
      ? `${this.configService.get('DASHBOARD')}/${shopName}/dropmanager`
      : `${this.configService.get(
          'DASHBOARD',
        )}/${shopName}/${installationStep}`;
    // return;
  }

  signJwt(payload: AuthEntity): string {
    return this.jwtService.sign(payload);
  }

  decodeJwt(token: string) {
    if (!!token)
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWTSECRET'),
      });
    else
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: JSON.stringify('Token not found'),
        },
        HttpStatus.FORBIDDEN,
      );
    // console.log("🚀 ~ file: auth.service.ts ~ line 72 ~ AuthService ~ verfiyJwt ~ decoded", decoded)
  }

  async verifyToken(tokenData: any) {
    try {
      const shopRec = await this.shopifyService.storeDetail(
        JSON.parse(tokenData),
      );
      // console.log(
      //   '🚀 ~ file: auth.controller.ts ~ line 118 ~ AuthController ~ verify ~ shopRec',
      //   shopRec,
      // );
      // res.send({ ...tokenData.user });
      return { status: true, ...tokenData.user };
    } catch (err) {
      // console.log(
      //   '🚀 ~ file: auth.service.ts ~ line 89 ~ AuthService ~ verifyToken ~ err',
      //   err,
      // );
      // console.log('-----------------');
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: JSON.stringify(err.message),
        },
        HttpStatus.UNAUTHORIZED,
      );
      return err;
    }
  }
}
