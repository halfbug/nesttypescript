import {
  Controller,
  forwardRef,
  Logger,
  Get,
  Inject,
  Req,
  Res,
  Param,
  Query,
  Post,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { map } from 'rxjs/operators';
import { InventoryService } from 'src/inventory/inventory.service';
import { OrdersService } from 'src/inventory/orders.service';
import { KalavioService } from '../kalavio.service';
// import { ShopifyService } from 'src/shopify/shopify.service';
// import { StoreService } from 'src/shopify-store/store/store.service';
// import { OrdersReceivedEvent } from 'src/shopify-store/events/orders-received.event';
import { StoresService } from 'src/stores/stores.service';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { DropCreatedEvent } from 'src/drops-groupshop/events/drop-created.event';
import { Cron, CronExpression } from '@nestjs/schedule';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as getSymbolFromCurrency from 'currency-symbol-map';
import { Public } from 'src/auth/public.decorator';
import { v4 as uuid } from 'uuid';
import { DropCreatedListener } from 'src/drops-groupshop/listeners/drop-created.listener';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { ShopifyService } from 'src/shopify/shopify.service';
import { AESEncryptDecryptService } from 'src/utils/encrypt-decrypt/aes-encrypt-decrypt.service';
@Public()
@Controller('connect')
export class CatController {
  // [x: string]: any;
  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private httpService: HttpService,
    private inventoryService: InventoryService,
    private shopifyService: ShopifyService,
    // private storeService: StoreService,
    private readonly storesService: StoresService,
    private readonly lifecyclesrv: LifecycleService,
    private ordersService: OrdersService,
    private kalavioService: KalavioService,
    private dropsGroupshopService: DropsGroupshopService,
    private dropCreatedEvent: DropCreatedEvent,
    private dropCreatedListener: DropCreatedListener,
    private readonly crypt: EncryptDecryptService,
    private aesService: AESEncryptDecryptService,
  ) {}
  @Get('/')
  async test() {
    return 'running server on port 5000';
  }

  @Get('pull-orders')
  async pullOrders() {
    // try {
    //   const { shop, accessToken } = await this.storesService.findOneById(
    //     '0ef135cd-c239-420e-a61f-5177e99c91ab',
    //   );
    //   const client = await this.shopifyService.client(shop, accessToken);
    //   const qres = await client.query({
    //     data: {
    //       query: `mutation {
    //         bulkOperationRunQuery(
    //          query:"""
    //           {
    //              orders(first:5, , query: "created_at:>=2022-07-08"){
    //                       edges{
    //                         node{
    //                           name
    //                           id
    //                           shopifyCreateAt:createdAt
    //                           confirmed
    //                           cancelledAt
    //                           currencyCode
    //                           customer{
    //                             firstName
    //                             lastName
    //                             email
    //                           }
    //                           discountCode
    //                           totalPriceSet{
    //                             shopMoney{
    //                               amount
    //                               currencyCode
    //                             }
    //                           }
    //                           lineItems(first:100){
    //                             edges{
    //                               node{
    //                                 id
    //                                 originalUnitPriceSet{
    //                                   shopMoney{
    //                                     amount
    //                                     currencyCode
    //                                   }
    //                                 }
    //                                 totalDiscountSet{
    //                                   shopMoney{
    //                                     amount
    //                                     currencyCode
    //                                   }}
    //                                 quantity
    //                                 product{
    //                                   id
    //                                   priceRangeV2{
    //                                     maxVariantPrice{
    //                                       amount
    //                                       currencyCode
    //                                     }
    //                                   }
    //                                 }
    //                                 variant{
    //                                   id,
    //                                   price
    //                                   }
    //                               }
    //                             }
    //                           }
    //                         }
    //                       }
    //                     }
    //           }
    //           """
    //         ) {
    //           bulkOperation {
    //             id
    //             status
    //           }
    //           userErrors {
    //             field
    //             message
    //           }
    //         }
    //       }`,
    //     },
    //   });
    //   // console.log(event);
    //   // console.log(JSON.stringify(qres));
    //   console.log(qres.body['data']['bulkOperationRunQuery']['bulkOperation']);
    //   if (
    //     qres.body['data']['bulkOperationRunQuery']['bulkOperation'][
    //       'status'
    //     ] === 'CREATED'
    //   ) {
    //     const pollit = setInterval(async () => {
    //       const poll = await client.query({
    //         data: {
    //           query: `query {
    //         currentBulkOperation {
    //           id
    //           status
    //           errorCode
    //           createdAt
    //           completedAt
    //           objectCount
    //           fileSize
    //           url
    //           partialDataUrl
    //         }
    //       }`,
    //         },
    //       });
    //       console.log(poll.body['data']['currentBulkOperation']);
    //       if (
    //         poll.body['data']['currentBulkOperation']['status'] === 'COMPLETED'
    //       ) {
    //         clearInterval(pollit);
    //         // fire inventory received event
    //         const ordersReceivedEvent = new OrdersReceivedEvent();
    //         ordersReceivedEvent.bulkOperationResponse =
    //           poll.body['data']['currentBulkOperation'];
    //         ordersReceivedEvent.shop = shop;
    //         ordersReceivedEvent.accessToken = accessToken;
    //         this.eventEmitter.emit('orders.received', ordersReceivedEvent);
    //       }
    //     }, 3000);
    //   } else console.log(JSON.stringify(qres.body['data']));
    // } catch (err) {
    //   console.log(JSON.stringify(err));
    // }
  }

  @Get('inventory-insert')
  async inventoryInsert(
    @Query('shop') shop: string,
    @Query('token') token: string,
  ) {
    // console.log('inventory-insert  :: ' + shop);
    // console.log('inventory-insert  :: ' + token);
    // const tokenReceivedEvent = new TokenReceivedEvent();
    // const session = {
    //   shop: shop,
    //   accessToken: token,
    // };
    // tokenReceivedEvent.token = session.accessToken;
    // tokenReceivedEvent.session = session;
    // this.eventEmitter.emit('token.received', tokenReceivedEvent);
  }

  @Get('campaign-insert')
  async campaignInsert() {
    const link = 'http://localhost:3000/native-roots-dev/deal/R1M1OTgxMjcwOQ==';
    const short = await this.kalavioService.generateShortLink(link);
    return { short };
  }

  @Get('update-klaviyo-profile')
  async updateKlaviyoProfile(@Req() req, @Res() res) {
    const { listId, shop } = req.query;

    const storeData = await this.storesService.findOne(shop);
    let nextPage = '';
    let counter = 0;
    let updatedCounter = 0;
    if (storeData?.drops?.rewards) {
      if (typeof listId !== 'undefined' && listId !== '') {
        Logger.log(
          `update-klaviyo-profile start for the   : ${shop} at ${new Date()}`,
          'updateKlaviyoProfile',
          true,
        );
        do {
          const profiles = await this.kalavioService.getProfilesByListId(
            listId,
            nextPage,
            storeData.drops.klaviyo.privateKey,
          );
          const nextPageLink = profiles?.links?.next
            ? profiles?.links?.next
            : '';
          if (nextPageLink !== '') {
            nextPage = nextPageLink.split('profiles/?')[1];
          } else {
            nextPage = '';
          }
          // console.log('profiles', JSON.stringify(profiles));
          profiles?.data.map(async (profile, index) => {
            const arrayLength = profiles.data.length;
            counter = counter + 1;
            const klaviyoId = profile?.id;
            const profilesExit =
              await this.dropsGroupshopService.findOneByKlaviyoId(klaviyoId);
            if (profilesExit?.id) {
              console.log('Exits ', klaviyoId);
            } else {
              updatedCounter = updatedCounter + 1;
              const webdata = {
                id: klaviyoId,
                first_name: profile?.attributes?.first_name,
                last_name: profile?.attributes?.last_name,
                email: profile?.attributes?.email,
                phone_number: profile?.attributes?.phone_number,
              };
              const inputListener: any = {};
              inputListener.webhook = webdata;
              inputListener.shop = shop;
              await this.dropCreatedListener.addDrop(inputListener);
            }
            // eslint-disable-next-line prettier/prettier
            if (nextPage === '' && arrayLength === (index + 1)) {
              console.log(
                `update-klaviyo-profile completed ${updatedCounter}/${counter} at ${new Date()} `,
              );
              Logger.log(
                `update-klaviyo-profile completed ${updatedCounter}/${counter} at ${new Date()} `,
                'updateKlaviyoProfile',
                true,
              );
            }
          });
        } while (nextPage !== '');
        res.status(200).send('Success');
      } else {
        res.status(200).send('listId not found!');
      }
    } else {
      res.status(200).send('Store rewards not found!');
    }
  }

  // Drop static function for stage testing
  @Get('drop-cron')
  async dropCron(@Req() req, @Res() res) {
    const stores = await this.storesService.findOneByName(
      this.configService.get('DROPSHOP'),
    );
    // const listId = stores.drops.klaviyo.listId;
    const listId = this.configService.get('DROPLISTID');
    const shop = stores.shop;
    const privateKey = stores.drops.klaviyo.privateKey;
    const baseline = stores.drops.rewards.baseline;

    Logger.log(
      `Weekly Drop Cron Started for ${shop} at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    const d = new Date(new Date().setDate(new Date().getDate() - 7));
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const lastWeek = Date.parse(`${year}${'-'}${month}${'-'}${day}`);

    const td = new Date(new Date().setDate(new Date().getDate()));
    const tyear = td.getFullYear();
    const tmonth = ('0' + (td.getMonth() + 1)).slice(-2);
    const tday = ('0' + td.getDate()).slice(-2);
    const today = Date.parse(`${tyear}${'-'}${tmonth}${'-'}${tday}`);

    let nextPage = '';
    let allProfiles = [];
    do {
      const profiles = await this.kalavioService.getProfilesBySegmentId(
        listId,
        nextPage,
        privateKey,
      );
      allProfiles = [...allProfiles, ...profiles.data];
      const nextPageLink = profiles?.links?.next ? profiles?.links?.next : '';

      if (nextPageLink !== '') {
        nextPage = nextPageLink;
      } else {
        nextPage = '';
      }
      console.log('nextPageLink', nextPageLink);
    } while (nextPage !== '');

    Logger.log(
      `Weekly Drop Cron fetching ${
        allProfiles.length
      } profiles at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    const filteredProfiles = allProfiles.filter(
      (profile) =>
        (profile.attributes.properties?.groupshop_source === 'API' &&
          profile.attributes.properties?.groupshop_status !== 'pending' &&
          Date.parse(profile.attributes.properties?.groupshop_created_at) <
            lastWeek) ||
        (profile.attributes.properties?.groupshop_source === 'API' &&
          profile.attributes.properties?.groupshop_status !== 'pending' &&
          Date.parse(profile.attributes.properties?.groupshop_created_at) >=
            lastWeek) ||
        (profile.attributes.properties?.groupshop_source === 'CRON' &&
          Date.parse(profile.attributes.properties?.groupshop_created_at) !==
            today),
    );

    Logger.log(
      `Weekly Drop Cron get filtered Profiles at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    // console.log('filteredProfiles', JSON.stringify(filteredProfiles));

    const profileKalviyoIDs = filteredProfiles
      .filter(
        (profile) =>
          profile.attributes.properties?.groupshop_status === 'pending',
      )
      .map((profile) => {
        return profile.id;
      });

    // console.log('profileKalviyoIDs', JSON.stringify(profileKalviyoIDs));
    const getpendingdropGroupshops =
      await this.dropsGroupshopService.getAllPendingDropsByIds(
        profileKalviyoIDs,
      );

    Logger.log(
      `Weekly Drop Cron Get Pending Drop Groupshops at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    const pendingdropGroupshops = getpendingdropGroupshops?.map(
      (dgroupshop) => {
        return {
          groupshopId: dgroupshop,
          event: EventType.ended,
          dateTime: new Date(),
        };
      },
    );

    if (pendingdropGroupshops.length > 0) {
      await this.lifecyclesrv.insertMany(pendingdropGroupshops);
    }
    Logger.log(
      `Weekly Drop Cron Completed  Lifecycle ${
        pendingdropGroupshops.length
      } records for Pending Drop Groupshops at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    if (getpendingdropGroupshops.length > 0) {
      await this.dropsGroupshopService.updateBulkDgroupshops(
        getpendingdropGroupshops,
      );
    }

    Logger.log(
      `Weekly Drop Cron Updated Bulk Pending Drop Groupshops Status at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    const dropobjects = filteredProfiles.map((profile, index) => {
      const discountTitle = `GSD${Date.now()}${index}`;
      const cryptURL = `/${shop.split('.')[0]}/drops/${this.crypt.encrypt(
        discountTitle,
      )}`;
      const ownerUrl = `/${shop.split('.')[0]}/drops/${this.crypt.encrypt(
        discountTitle,
      )}/owner&${this.crypt.encrypt(new Date().toDateString())}`;
      const expiredFulllink = `${this.configService.get(
        'FRONT',
      )}${cryptURL}/status&activated`;
      const fulllink = `${this.configService.get('FRONT')}${ownerUrl}`;

      return {
        id: uuid(),
        storeId: stores.id,
        url: cryptURL,
        obSettings: {
          step: 0,
          ownerUrl: ownerUrl,
        },
        shortUrl: fulllink,
        expiredUrl: expiredFulllink,
        expiredShortUrl: expiredFulllink,
        discountCode: {
          title: discountTitle,
          percentage: null,
          priceRuleId: null,
        },
        // encryption aes
        customerDetail: {
          klaviyoId: profile?.id,
          fullName: profile?.attributes?.properties?.['Full Name'] ?? null,
          firstName: profile?.attributes?.first_name,
          lastName: profile?.attributes?.last_name,
          email: this.aesService.encryptData(profile?.attributes?.email),
          phone: this.aesService.encryptData(profile?.attributes?.phone_number),
        },
        status: 'pending',
        groupshopSource: 'CRON',
        expiredAt: null,
        milestones: [{ activatedAt: new Date(), discount: baseline }],
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    Logger.log(
      `Weekly Drop Cron Created ${
        dropobjects.length
      } records of Drop object for New drop links at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );
    await this.dropsGroupshopService.insertMany(dropobjects);

    Logger.log(
      `Weekly Drop Cron Successfully Inserted New drop links at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    Logger.log(
      `Weekly Drop Cron Start updating profiles on klaviyo at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    for (const dropobject of dropobjects) {
      const obj = {
        groupshop_status: 'pending',
        groupshop_created_at: `${tyear}${'-'}${tmonth}${'-'}${tday}`,
        groupshop_source: 'CRON',
        groupshop_url: dropobject.shortUrl,
        reactivate_groupshop: dropobject.expiredShortUrl,
      };
      const data = Object.keys(obj)
        .map((key) => {
          return `${key}=${encodeURIComponent(obj[key])}`;
        })
        .join('&');
      await this.kalavioService.klaviyoProfileUpdate(
        dropobject.customerDetail.klaviyoId,
        data,
        stores.id,
      );
    }

    Logger.log(
      `Weekly Drop Cron updated ${
        dropobjects.length
      } profiles on klaviyo at ${new Date()} `,
      'WeeklyDropCron',
      true,
    );

    res.status(200).send('Success');
  }

  @Cron('*/30 * * * * FRI') // CronExpression.EVERY_WEEK)
  @Get('update-shortlink')
  async updateShortLink(@Req() req, @Res() res) {
    if (this.configService.get('ENV') === 'production') {
      const dropGroupshops =
        await this.dropsGroupshopService.findMissingDropShortLinks();
      // console.log('dropGroupshops', JSON.stringify(dropGroupshops));
      let links = [];
      if (dropGroupshops.length > 0) {
        dropGroupshops.forEach(async (profile, index) => {
          const shortUrl = profile.shortUrl;
          const expiredShortUrl = profile.expiredShortUrl;
          if (shortUrl.includes('front-stage.groupshop.co')) {
            links = [
              ...links,
              {
                originalURL: shortUrl,
                title: 'GroupShop',
                tags: [profile.id, 'shortUrl'],
              },
            ];
          }
          if (expiredShortUrl.includes('front-stage.groupshop.co')) {
            links = [
              ...links,
              {
                originalURL: expiredShortUrl,
                title: 'GroupShop',
                tags: [profile.id, 'expiredShortUrl'],
              },
            ];
          }
        });
      }
      const bulkShortLinks = await this.kalavioService.generateBulkShortLink(
        links,
      );
      await this.dropsGroupshopService.updateBulkShortLinks(bulkShortLinks);
    }
  }

  @Get('setdiscountcode?')
  async setdiscountcode(@Query('shop') shop: any, @Query('url') url: any) {
    // try {
    //   let dgroupshop = new UpdateDropsGroupshopInput();
    //   const discountTitle = await this.crypt.decrypt(url.split('/')[3]);
    //   dgroupshop = await this.dropsGroupshopService.findOneByURL(url);
    //   const {
    //     id,
    //     accessToken,
    //     drops: {
    //       rewards: { baseline },
    //       bestSellerCollectionId,
    //       latestCollectionId,
    //       allProductsCollectionId,
    //     },
    //   } = await this.storesService.findOne(shop);
    //   const discountCode = await this.shopifyService.setDiscountCode(
    //     shop,
    //     'Create',
    //     accessToken,
    //     discountTitle,
    //     parseInt(baseline, 10),
    //     [bestSellerCollectionId, latestCollectionId, allProductsCollectionId],
    //     new Date(),
    //     null,
    //     null,
    //     true,
    //   );
    //   dgroupshop.discountCode = discountCode;
    //   await this.dropsGroupshopService.update(dgroupshop.id, dgroupshop);
    //   return discountCode;
    // } catch (err) {
    //   console.log(err);
    // }
  }

  @Get('updateAllDiscounts')
  async updateAllDiscounts() {
    console.log(`Update all discount`);
    const allDrops = await this.dropsGroupshopService.findAllNullDiscounts();

    // allDrops.forEach(async ({ url, storeId }) => {
    //   console.log(
    //     '🚀 ~ file: connect.controller.ts:619 ~ CatController ~ allDrops.forEach ~ url',
    //     url,
    //   );
    //   try {
    //     let dgroupshop = new UpdateDropsGroupshopInput();
    //     const discountTitle = await this.crypt.decrypt(url.split('/')[3]);
    //     dgroupshop = await this.dropsGroupshopService.findOneByURL(url);
    //     const {
    //       id,
    //       accessToken,
    //       shop,
    //       drops: {
    //         rewards: { baseline },
    //         bestSellerCollectionId,
    //         latestCollectionId,
    //         allProductsCollectionId,
    //       },
    //     } = await this.storesService.findById(storeId);
    //     setTimeout(() => console.log('discount going to execute'), 8000);
    //     // await new Promise(() =>
    //     //   setTimeout(() => console.log('discount going to execute'), 5000),
    //     // );
    //     const discountCode = await this.shopifyService.setDiscountCode(
    //       shop,
    //       'Create',
    //       accessToken,
    //       discountTitle,
    //       parseInt(baseline, 10),
    //       [bestSellerCollectionId, latestCollectionId, allProductsCollectionId],
    //       new Date(),
    //       null,
    //       null,
    //       true,
    //     );
    //     dgroupshop.discountCode = discountCode;
    //     console.log(
    //       '🚀 ~ file: connect.controller.ts:607 ~ CatController ~ allDrops.forEach ~ discountCode',
    //       discountCode,
    //     );
    //     await this.dropsGroupshopService.update(dgroupshop.id, dgroupshop);
    //     return discountCode;
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
  }

  @Post('update-product-vendors')
  async productVendors() {
    const storeId = this.configService.get('DROPSTORE');
    const { session, shop } = await this.storesService.findById(storeId);
    const client = await this.shopifyService.client(session);
    try {
      const res = await client.query({
        data: {
          query: `mutation {
          bulkOperationRunQuery(
           query: """
            {
              products {
                edges {
                  node {
                    id
                    title
                    vendor
                  }
                }
              }
            }
            """
          ) {
            bulkOperation {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }`,
        },
      });
      const bulkId =
        res.body['data']['bulkOperationRunQuery']['bulkOperation']['id'];

      Logger.log(
        `Product vendors update bulk register with id - ${bulkId}`,
        'PRODUCT_VENDOR_TO_UPDATE_BULK',
        true,
      );
    } catch (err) {
      Logger.error(
        `Product vendors update bulk register failed - ${err}`,
        'PRODUCT_VENDOR_TO_UPDATE_BULK',
        true,
      );
    }
  }
}
