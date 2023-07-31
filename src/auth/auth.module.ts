import { Module, forwardRef, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StoresModule } from 'src/stores/stores.module';
import { JwtModule } from '@nestjs/jwt/dist';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { AuthDecorator } from './auth.decorator';
import { APP_GUARD } from '@nestjs/core';
import { Public } from './public.decorator';
import { AdminUsersModule } from 'src/admin-users/admin-users.module';
import { AdminRolesModule } from 'src/admin-roles/admin-roles.module';
import { ShopifyModule } from 'src/shopify/shopify.module';

@Global()
@Module({
  imports: [
    forwardRef(() => ShopifyModule),
    forwardRef(() => StoresModule),
    ConfigModule,
    AdminUsersModule,
    AdminRolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configservice: ConfigService) => {
        return {
          secret: configservice.get('JWTSECRET'),
          signOptions: { expiresIn: '3d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
