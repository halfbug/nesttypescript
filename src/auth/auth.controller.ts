import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
// import { ShopifyService } from 'src/shopify/shopify.service';
import { StoresService } from 'src/stores/stores.service';
import { AuthService } from './auth.service';
// import { LoginAuthDto } from './dto/login-auth.dto';
import { Public } from './public.decorator';
import { v4 as uuid } from 'uuid';
import { AuthEntity, User } from './entities/auth.entity';
import { randomInt } from 'crypto';
import { AdminUsersService } from 'src/admin-users/admin-users.service';
import { AdminRolesService } from 'src/admin-roles/admin-roles.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
// import { AuthDecorator } from 'src/auth/auth.decorator';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private shopifyService: ShopifyService,
    private configService: ConfigService,
    private storesService: StoresService,
    private userService: AdminUsersService,
    private adminRoleService: AdminRolesService,
    private crypt: EncryptDecryptService,
  ) {}

  @Get()
  async login(@Req() req: Request, @Res() res: Response) {
    const { shop } = req.query;
    // console.log('🚀 ~ auth login ~ shop:', shop);
    await this.shopifyService.shopify.auth.begin({
      shop: await this.shopifyService.sanitizeShop(shop),
      callbackPath: '/auth/callback',
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    // console.log('inside auth callback');
    // console.log('auth - req.quer :', req.query);
    // console.log('auth - req.body :', req.body);
    const { session } = await this.shopifyService.shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    //  sign JWT token

    const {
      id,
      shop,
      expires,
      accessToken,
      onlineAccessInfo: { associated_user: user },
    } = session;

    const token = this.authService.signJwt({
      id,
      user,
      shop,
      // accessToken,
      expires,
      isGSAdminUser: false,
      onlineSession: await this.crypt.sencrypt(JSON.stringify(session)),
    });
    // console.log(
    //   '🚀 ~ file: auth.controller.ts ~ line 64 ~ AuthController ~ callback ~ token',
    //   token,
    // );
    // post it to the login webhook front end
    const store = await this.storesService.findOne(shop);

    res.redirect(
      `${this.configService.get(
        'FRONT',
      )}/api/login?rurl=${this.authService.goToAppfront(store)}&st=${token}`,
    );
  }

  @Post('verify')
  async verify(@Req() req: Request, @Res() res: Response) {
    const rowToken = req.headers.authorization.split(' ');
    // console.log('🚀 ~  rowToken:', rowToken);
    if (!!rowToken) {
      const tokenData = this.authService.decodeJwt(rowToken[1]);
      try {
        // console.log(
        //   '🚀 ~ file: auth.controller.ts ~ line 102 ~ AuthController ~ verify ~ tokenData',
        //   tokenData,
        // );
        if (!tokenData.isGSAdminUser) {
          const resData = await this.authService.verifyToken(
            await this.crypt.sdicrypt(tokenData.onlineSession),
          );

          // console.log(
          //   '🚀 ~ file: auth.controller.ts ~ line 106 ~ AuthController ~ verify ~ resData',
          //   resData,
          // );
        }
        res.send({ ...tokenData.user });
      } catch (error) {
        // console.log('🚀 ~ verify ~ error', error);
        // console.log(error);
        res.status(403).send({
          ...error,
          redirectUrl: `https://${tokenData.shop}/admin/auth/login`,
        });
      }
    } else
      res.status(403).send({
        message: 'Not Authorized',
        // redirectUrl: `https://${tokenData.shop}/admin/auth/login`,
      });
  }

  @Post('user')
  async userVerify(@Req() req: Request, @Res() res: Response) {
    const rowToken = req.headers.authorization.split(' ');
    // console.log(
    //   '🚀 ~ file: auth.controller.ts ~ line 132 ~ AuthController ~ userVerify ~ rowToken',
    //   rowToken,
    // );
    if (rowToken[1] !== 'undefined') {
      const tokenData = this.authService.decodeJwt(rowToken[1]);
      try {
        // console.log(
        //   '🚀 ~ file: auth.controller.ts ~ line 102 ~ AuthController ~ verify ~ tokenData',
        //   tokenData,
        // );
        let userRoleName: any;
        if (tokenData.user.userRole) {
          userRoleName = await this.adminRoleService.findOne(
            tokenData.user.userRole,
          );
        }
        // const resData = await this.authService.verifyToken(tokenData);
        // console.log(
        //   '🚀 ~ file: auth.controller.ts ~ line 106 ~ AuthController ~ verify ~ resData',
        //   resData,
        // );
        res.send({
          ...tokenData.user,
          jobtitle: userRoleName ? userRoleName.roleName : '',
        });
      } catch (error) {
        // console.log('🚀 ~ userverify ~ error', error);
        // console.log(error);
        res.status(403).send({
          error: true,
          ...error,
          // redirectUrl: `https://${tokenData.shop}/admin/auth/login`,
        });
      }
    } else
      res.status(403).send({
        error: true,
        message: 'Token not valid',
        // redirectUrl: `https://${tokenData.shop}/admin/auth/login`,
      });
  }

  @Post('stafflogin')
  async admin_login(@Req() req: Request, @Res() res: Response) {
    // console.log('staffLogin');
    // 1. get email and password from front server
    // console.log('auth - req.body :', req.body);
    // 2. @Todo verify email and password from database admin user collection
    const registerdUser = await this.userService.verify({
      email: req.body.email,
      password: req.body.password,
    });
    if (registerdUser) {
      // 3. generate jwt token
      const userInfo: AuthEntity = {
        id: uuid(),
        user: {
          id: randomInt(3),
          first_name: registerdUser.firstName,
          last_name: registerdUser.lastName ?? '',
          email: registerdUser.email,
          userRole: registerdUser.userRole,
          userId: registerdUser.id,
        },
        isGSAdminUser: true,
        expires: new Date(new Date().setDate(new Date().getDate() + 3)), // expires 3d
      };
      const token = this.authService.signJwt(userInfo);
      // console.log(
      //   '🚀 ~ file: auth.controller.ts ~ line 64 ~ AuthController ~ callback ~ token',
      //   token,
      // );
      // 4. send jwt token to front server
      res.status(200).send({ token });
    } else
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  @Post('storeLogin')
  async dashboardLogin(@Req() req: any, @Res() res: Response) {
    const rowToken = req.headers.authorization.split(' ');
    console.log(
      '🚀 ~ file: auth.controller.ts ~ line 132 ~ AuthController ~ userVerify ~ rowToken',
      rowToken,
    );
    console.log(
      '🚀 ~ file: auth.controller.ts ~ line 228 ~ AuthController ~ dashboardLogin ~ req.body.storeId',
      req.body,
    );
    if (rowToken[1]) {
      const { id, user, isGSAdminUser } = this.authService.decodeJwt(
        rowToken[1],
      );
      console.log(
        '🚀 ~ file: auth.controller.ts ~ line 217 ~ AuthController ~ dashboardLogin ~ currentSession',
        id,
        user,
        isGSAdminUser,
      );

      // post it to the login webhook front end
      const store = await this.storesService.findById(req.body.storeId);
      console.log(
        '🚀 ~ file: auth.controller.ts ~ line 228 ~ AuthController ~ dashboardLogin ~ store',
        store,
      );
      const newtoken = this.authService.signJwt({
        id,
        user,
        isGSAdminUser,
        shop: store.shop,
        accessToken: store.accessToken,
      });
      res.status(200).send({
        redirectUrl: `${this.configService.get(
          'FRONT',
        )}/api/login?rurl=${this.authService.goToAppfront(
          store,
        )}&st=${newtoken}`,
      });
      // return res.redirect(
      //   `${this.configService.get('FRONT')}/${shopName.split('.')[0]}/0`,
      // );
    }
  }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
