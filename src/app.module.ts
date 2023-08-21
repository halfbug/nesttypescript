import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import Store from './stores/entities/store.model';
import { StoresModule } from './stores/stores.module';
import { UtilsModule } from './utils/utils.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InventoryModule } from './inventory/inventory.module';
import Inventory from './inventory/entities/inventory.modal';
import Orders from './inventory/entities/orders.modal';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';

import { GsCommonModule } from './gs-common/gs-common.module';
import { Lifecycle } from './gs-common/entities/lifecycle.modal';
import { Visitors } from './gs-common/entities/visitors.modal';
import { AuthModule } from './auth/auth.module';
import { VideoModule } from './videos/video.module';
import { Video } from './videos/entities/video.modal';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AppLoggerModule } from './applogger/applogger.module';
import AdminUser from './admin-users/entities/admin-user.model';
import { AppLogger } from './applogger/entities/applogger.entity';
import { DropsGroupshopModule } from './drops-groupshop/drops-groupshop.module';
import { AdminRolesModule } from './admin-roles/admin-roles.module';
import { AdminPermissionsModule } from './admin-permissions/admin-permissions.module';
import DropsGroupshop from './drops-groupshop/entities/dropsgroupshop.model';
import AdminUserRole from './admin-roles/entities/admin-role.model';
import AdminPermission from './admin-permissions/entities/admin-permission.model';
import { DropsCategoryModule } from './drops-category/drops-category.module';
import { AdminActivityLogsModule } from './admin-activity-logs/admin-activity-logs.module';
import DropsCategory from './drops-category/entities/drops-category.model';
import AdminActivityLogs from './admin-activity-logs/entities/admin-activity-log.model';
import { ShopifyModule } from './shopify/shopify.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppsettingsModule } from './appsettings/appsettings.module';
import { Appsetting } from './appsettings/entities/appsetting.model';
import { DropsProductsModule } from './drops-products/drops-products.module';
import DropsProducts from './drops-products/entities/drops-products.model';
import { UploadImageModule } from './ImageUpload/uploadimage.module';
@Module({
  imports: [
    ShopifyModule,
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: true,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 20,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configservice: ConfigService) => {
        console.log(configservice.get('DB_URL'));

        return {
          type: 'mongodb',
          url: configservice.get('DB_URL'),
          synchronize: true,
          useUnifiedTopology: true,
          useNewUrlParser: true,
          // logging: true,

          // entities: [__dirname + './**/*.modal.ts'],
          entities: [
            Store,
            Inventory,
            Orders,
            Lifecycle,
            Visitors,
            Video,
            AdminUser,
            AdminUserRole,
            AdminPermission,
            AdminActivityLogs,
            AppLogger,
            DropsGroupshop,
            DropsCategory,
            Appsetting,
            DropsProducts,
          ],
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
    }),
    ScheduleModule.forRoot(),
    StoresModule,
    UtilsModule,
    InventoryModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/', //last slash was important
    }),
    EmailModule,
    GsCommonModule,
    VideoModule,
    AdminUsersModule,
    AuthModule,
    AppLoggerModule,
    DropsGroupshopModule,
    AdminRolesModule,
    AdminPermissionsModule,
    DropsCategoryModule,
    AdminActivityLogsModule,
    AppsettingsModule,
    DropsProductsModule,
    UploadImageModule,
  ],
})
export class AppModule {}
