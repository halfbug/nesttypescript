import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CreateInventoryInput } from 'src/inventory/dto/create-inventory.input';
import { UpdateInventoryInput } from 'src/inventory/dto/update-inventory.input';
import { InventoryService } from 'src/inventory/inventory.service';
import { OrdersService } from 'src/inventory/orders.service';
import { StoresService } from 'src/stores/stores.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShopifyService } from '../shopify/shopify.service';
import { KalavioService } from 'src/email/kalavio.service';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
import { UninstallService } from 'src/stores/uninstall.service';
import { DropCreatedEvent } from 'src/drops-groupshop/events/drop-created.event';
import {
  ProductImage,
  SelectedOption,
} from 'src/inventory/entities/product.entity';
// import Product from 'src/campaigns/entities/product.model';
import { HttpService } from '@nestjs/axios';
import readJsonLines from 'read-json-lines-sync';
import { InventorySavedEvent } from 'src/inventory/events/inventory-saved.event';
import { OrdersSavedEvent } from 'src/inventory/events/orders-saved.event';
import { UpdateFullOrderInput } from 'src/inventory/dto/update-fullorder.input';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { Public } from 'src/auth/public.decorator';
import { ProductOutofstockEvent } from 'src/inventory/events/product-outofstock.event';
import { generatesecondaryCount } from 'src/utils/functions';
import { DropsCategoryService } from 'src/drops-category/drops-category.service';
import { RecordType } from 'src/utils/constant';
import { AppLoggerService } from 'src/applogger/applogger.service';
import { SearchIndexingRefreshEvent } from 'src/inventory/events/searchIndexing-refresh.event';
import { OrderCreatedEvent } from './events/order-created.event';
@Public()
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private storesService: StoresService,
    private shopifyService: ShopifyService,
    private inventryService: InventoryService,
    private orderService: OrdersService,
    private kalavioService: KalavioService,
    private dropsGroupshopService: DropsGroupshopService,
    private crypt: EncryptDecryptService,
    private eventEmitter: EventEmitter2,
    private orderCreatedEvent: OrderCreatedEvent,
    private configSevice: ConfigService,
    private uninstallSerivice: UninstallService,
    private dropCreatedEvent: DropCreatedEvent,
    private httpService: HttpService,
    public searchIndexingRefreshEvent: SearchIndexingRefreshEvent,
    public campaignStock: ProductOutofstockEvent,
    private lifecyclesrv: LifecycleService,
    private appLoggerService: AppLoggerService,
    private dropsCategoryService: DropsCategoryService,
  ) {}
  async refreshSingleProduct(shop, session, id, shopName) {
    try {
      this.shopifyService.shop = shop;
      const client = await this.shopifyService.client(session);
      const Prd = await client.query({
        data: {
          query: `query product($id: ID!){
          product(id: $id) {
            title
            id
            status
            createdAt
            publishedAt
            featuredImage {
              src
            }
            images(first:10, reverse: true){
              edges{
                node{
                  src
                  id
                  originalSrc
                }
              }
            }
          options{
              id
              name
              values
              position
            }
            variants(first: 30, reverse: true) {
              edges {
                node {
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    src
                  }
                  title
                  price
                  inventoryQuantity
                  id
                  createdAt
                  image {
                    src
                  }

                }
              }
            }
          }
        }`,
          variables: {
            id: id,
          },
        },
      });
      const data1: any = Prd.body;
      const prod = data1.data.product;
      const variants = data1.data.product.variants.edges;
      const images = data1.data.product.images.edges;
      const pid = data1.data.product.id;

      const nprod = new UpdateInventoryInput();
      // nprod.id = rproduct.id;
      nprod.id = id;
      nprod.createdAtShopify = prod?.createdAt;
      nprod.publishedAt = prod?.publishedAt;
      nprod.title = prod?.title;
      nprod.status = prod?.status?.toUpperCase();
      nprod.price = variants[0].node?.price; //
      nprod.featuredImage = prod?.featuredImage?.src;
      let qDifference: number;
      // const isAvailable = variants.some(
      //   ({ node: { inventoryQuantity } }) => inventoryQuantity > 0,
      // );
      // nprod.outofstock = !isAvailable;
      nprod.options = prod.options.map(({ id, name, position, values }) => ({
        id,
        name,
        position,
        values,
      }));
      nprod.outofstock = this.inventryService.calculateOutOfStock(variants);
      await this.inventryService.update(nprod);

      await this.inventryService.removeVariants(pid);

      variants.map(
        async ({
          node: {
            selectedOptions,
            title,
            inventoryQuantity,
            price,
            id: vid,
            createdAt,
            image,
          },
        }) => {
          const vprod = new CreateInventoryInput();
          vprod.id = vid;
          vprod.title = title;
          vprod.displayName = `${prod.title} Variant ${title}`;
          vprod.parentId = id;
          vprod.recordType = 'ProductVariant';
          vprod.createdAtShopify = createdAt;
          // vprod.publishedAt = rproduct?.published_at;
          vprod.price = price;
          vprod.shop = shopName;
          // image
          const img = new ProductImage();
          img.src = image && image.src ? image.src : null;

          vprod.image = img;
          vprod.featuredImage = image && image.src ? image.src : null;
          vprod.inventoryQuantity = inventoryQuantity;
          vprod.selectedOptions = selectedOptions.map((item, index) => {
            const sOpt = new SelectedOption();
            sOpt.name = item.name;
            sOpt.value = item.value;
            return sOpt;
          });
          await this.inventryService.create(vprod);
        },
      );

      images.map(async ({ node: { id: vid, src } }) => {
        const vprod = new CreateInventoryInput();
        vprod.id = vid;
        vprod.parentId = id;
        vprod.recordType = 'ProductImage';
        vprod.shop = shopName;
        // image
        vprod.src = src;

        await this.inventryService.create(vprod);
      });

      return `${JSON.stringify(Prd)}
    this product reloaded successfully in groupshop inventory`;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }
  @Get('register')
  async register(@Query('shopName') shopName: any) {
    try {
      const { shop, accessToken } = await this.storesService.findOne(shopName);
      console.log(
        '🚀 ~ file: webhooks.controller.ts ~ line 11 ~ WebhooksController ~ register ~ shop',
        shop,
      );
      const rhook = await this.shopifyService.registerHook(
        shop,
        accessToken,
        // '/webhooks/product-update',
        // 'PRODUCTS_UPDATE',
        '/webhooks/customer-update',
        'CUSTOMERS_UPDATE',
      );
      console.log('yes register');
      console.log(rhook);

      return 'yes done';
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  // http://localhost:5000/webhooks/storeswh?topic=COLLECTIONS_CREATE&path=collection-listing-update
  @Get('storeswh')
  async registerWebHookForAllStores(
    @Query('topic') topic: any,
    @Query('path') path: any,
  ) {
    try {
      const stores = await this.storesService.findAll();

      stores.map(async (store) => {
        const { shop, accessToken } = store;
        const { session } = await this.storesService.withStoreSession(store);
        const client = await this.shopifyService.client(session);
        console.log(
          '🚀 ~ file: webhooks.controller.ts ~ line 288 ~ WebhooksController ~ register ~ shop',
          shop,
        );
        const rhook = await this.shopifyService.registerHook(
          shop,
          accessToken,
          // '/webhooks/product-update',
          // 'PRODUCTS_UPDATE',
          '/webhooks/' + path,
          topic,
        );
        console.log(
          '🚀 ~ file: webhooks.controller.ts:295 ~ stores.map ~ rhook:',
          JSON.stringify(rhook),
        );
        const id =
          rhook['result']['data']['webhookSubscriptionUpdate'][
            'webhookSubscription'
          ]['id'];
        // console.log('yes register');
        console.log(
          'color: #007acc;',
          '%c rhook ->',
          JSON.stringify(
            rhook['result']['data']['webhookSubscriptionUpdate'][
              'webhookSubscription'
            ]['id'],
            null,
            '\t',
          ),
        );
        console.log(rhook);
        const qres = await client.query({
          data: {
            query: `query webhookSubscription($id: ID!){
            
              webhookSubscription(id: $id) {
                id
                    topic
                    endpoint {
                      __typename
                      ... on WebhookHttpEndpoint {
                        callbackUrl
                      }
                      ... on WebhookEventBridgeEndpoint {
                        arn
                      }
                    }
              }
          
        }`,
            variables: {
              id: id,
            },
          },
        });
        console.log('🚀 ~ hook detail', JSON.stringify(qres));
        console.log(
          '-hook detail',
          'color: #007acc;',
          JSON.stringify(qres, null, '\t'),
        );
      });
      return 'done-check console for detail';
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  @Get('price-rule')
  async getPriceRuleById(
    @Query('shopName') shopName: any,
    @Query('id') id: any,
  ) {
    // return 'yes inside';
    try {
      const { shop, session } = await this.storesService.findOne(shopName);

      const client = await this.shopifyService.client(session);
      const qres = await client.query({
        data: {
          query: `query priceRule($id: ID!){
          
            priceRule(id: $id) {
              id
            title
            target
            startsAt
            endsAt
            status
            summary
            }
        
      }`,
          variables: {
            id: id,
          },
        },
      });
      console.log('🚀 ~ price rule detail', JSON.stringify(qres));

      return qres;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }
  @Get('price-rule-edit')
  async updatePriceRuleById(
    @Query('shopName') shopName: any,
    @Query('id') id: any,
  ) {
    // return 'yes inside';
    try {
      const { shop, session } = await this.storesService.findOne(shopName);

      return await this.shopifyService.setDiscountCode(
        shop,
        'Update',
        session,
        'GS7966642363',
        null,
        null,
        new Date('2022-06-08T00:55:27.781+00:00'),
        new Date('2022-07-01T17:29:04.929+00:00'),
        id,
      );

      // return qres;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }
  @Get('scriptTag')
  async scriptTag(@Query('shopName') shopName: any) {
    try {
      const { shop, accessToken } = await this.storesService.findOne(shopName);
      this.shopifyService.accessToken = accessToken;
      this.shopifyService.shop = shop;
      const st = await this.shopifyService.scriptTagList();
      return st;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  @Get('delscriptTag')
  async scriptTagDelete(
    @Query('sid') sid: any,
    @Query('shopName') shopName: any,
  ) {
    // try {
    // console.log(sid);
    const { shop, accessToken } = await this.storesService.findOne(shopName);
    this.shopifyService.accessToken = accessToken;
    this.shopifyService.shop = shop;
    return await this.shopifyService.scriptTagDelete(sid);
    // return 'check console' + sid;
    // } catch (err) {
    // console.log(JSON.stringify(err));
    // }
  }

  @Post('product-create?')
  async createProducts(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rproduct = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        console.log('Webhook : PRODUCT_CREATED : ', JSON.stringify(rproduct));
        const prodinfo = await this.inventryService.findOne(shop, 'Product');
        const nprod = new CreateInventoryInput();

        // add product
        nprod.id = rproduct?.admin_graphql_api_id;
        nprod.createdAtShopify = rproduct?.created_at;
        nprod.publishedAt = rproduct?.published_at;
        nprod.title = rproduct?.title;
        nprod.shop = shop;
        nprod.recordType = 'Product';
        nprod.status = rproduct?.status?.toUpperCase();
        nprod.price = rproduct?.variants[0]?.price;
        nprod.featuredImage = rproduct?.image?.src;
        nprod.createdAt = new Date();
        nprod.outofstock = false;
        nprod.purchaseCount = 0;
        nprod.secondaryCount = generatesecondaryCount();
        // nprod.description = rproduct.body_html.replace(/<\/?[^>]+(>|$)/g, '');
        nprod.description = rproduct.body_html;
        // if product is not active then it will be not purchaseable.
        if (nprod.status !== 'ACTIVE') nprod.outofstock = true;
        nprod.currencyCode = prodinfo?.currencyCode;
        const pcreated = await this.inventryService.create(nprod);
        // console.log(
        //   '🚀 ~ file: webhooks.controller.ts:453 ~ createProducts ~ pcreated',
        //   pcreated,
        // );
        // console.log(
        //   '🚀 ~ file: webhooks.controller.ts:453 ~ createProducts ~ nprod',
        //   nprod,
        // );

        //add variat
        const vprod = nprod;
        rproduct.variants?.map(async (variant) => {
          vprod.id = variant.admin_graphql_api_id;
          vprod.title = variant?.title;
          vprod.parentId = rproduct?.admin_graphql_api_id;
          vprod.recordType = 'ProductVariant';
          vprod.createdAtShopify = variant?.created_at;
          vprod.publishedAt = rproduct?.published_at;
          vprod.inventoryManagement = variant?.inventory_management;
          vprod.inventoryPolicy = variant?.inventory_policy;
          vprod.price = variant.price;
          vprod.compareAtPrice = variant?.compare_at_price;
          vprod.createdAt = new Date();
          vprod.inventoryQuantity = variant?.inventory_quantity;
          const img = new ProductImage();
          img.src = variant.image_id
            ? rproduct.images.filter((img) => img.id === variant.image_id)?.[0]
                .src
            : rproduct.image
            ? rproduct.image.src
            : null;
          vprod.image = img;
          vprod.selectedOptions = rproduct.options.map((item, index) => {
            const sOpt = new SelectedOption();
            sOpt.name = item.name;
            sOpt.value = variant[`option${index + 1}`];
            return sOpt;
          });

          await this.inventryService.create(vprod);
        });
        rproduct.images.map((img) => {
          const vprod = new CreateInventoryInput();
          vprod.id = img.admin_graphql_api_id;
          vprod.parentId = rproduct.admin_graphql_api_id;
          vprod.recordType = 'ProductImage';
          vprod.shop = shop;
          // image
          vprod.src = img.src;

          this.inventryService.create(vprod);
        });

        // this.updateSmartCollection.productId = rproduct?.admin_graphql_api_id;
        // this.updateSmartCollection.shop = shop;
        // this.updateSmartCollection.emit();
      }
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'product-created');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('uninstalled?')
  async uninstalledApp(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      console.log(
        '🚀 ~ file: webhooks.controller.ts ~ line 143 ~ WebhooksController ~ uninstalledApp ~ shop',
        shop,
      );
      const webdata = req.body;
      console.log(
        'WebhooksController ~ uninstalledApp ~ web hook data',
        JSON.stringify(webdata),
      );
      this.uninstallSerivice.deleteStoreByName(shop);
      // const storeInfo = await this.storesService.findOneByName(shop);
      // const updateStore = new UpdateStoreInput();
      // updateStore.status = 'Unistalled';
      // await this.storesService.update(storeInfo.id, updateStore);
      // res.send('store updated..');
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'uninstalled');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('product-update?')
  async productUpdate(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rproduct = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        console.log(
          '🚀 ~ file: webhooks.controller.ts:522 ~ productUpdate ~ rproduct',
          JSON.stringify(rproduct),
        );

        const nprod = new UpdateInventoryInput();
        // nprod.id = rproduct.id;
        nprod.id = rproduct?.admin_graphql_api_id;
        nprod.createdAtShopify = rproduct?.created_at;
        nprod.publishedAt = rproduct?.published_at;
        nprod.title = rproduct?.title;
        nprod.tags =
          typeof rproduct?.tags === 'string'
            ? rproduct?.tags.split(', ')
            : (nprod.tags = rproduct?.tags);
        nprod.vendor = rproduct?.vendor;
        nprod.productCategory = rproduct?.productType;
        nprod.status = rproduct?.status?.toUpperCase();
        nprod.price = rproduct?.variants[0]?.price; //
        nprod.compareAtPrice = rproduct?.variants[0]?.compare_at_price;
        nprod.featuredImage = rproduct?.image?.src;
        // nprod.description = rproduct.body_html.replace(/<\/?[^>]+(>|$)/g, '');
        nprod.description = rproduct.body_html;
        // nprod.secondaryCount = generatesecondaryCount();
        // let qDifference: number;
        // const isAvailable = rproduct.variants.some(
        //   (item) => item.inventory_quantity > 0,
        // );

        // !isAvailable;
        nprod.options = rproduct.options.map(
          ({ id, name, position, values }) => ({
            id,
            name,
            position,
            values,
          }),
        );

        await this.inventryService.removeVariants(
          rproduct?.admin_graphql_api_id,
        );

        // create event for Search Indexing
        this.searchIndexingRefreshEvent.shopName = shop;
        this.searchIndexingRefreshEvent.emit();

        this.inventryService.findOne(shop, 'ProductVideo');
        const variants = [];
        rproduct.variants?.map(async (variant) => {
          const vprod = new CreateInventoryInput();
          vprod.id = variant.admin_graphql_api_id;
          vprod.title = variant?.title;
          vprod.parentId = rproduct?.admin_graphql_api_id;
          vprod.recordType = 'ProductVariant';
          vprod.createdAtShopify = variant?.created_at;
          vprod.publishedAt = rproduct?.published_at;
          vprod.featuredImage = rproduct?.image?.src;
          vprod.shop = shop;
          vprod.inventoryManagement = variant?.inventory_management;
          vprod.inventoryPolicy = variant?.inventory_policy;
          const img = new ProductImage();
          img.src = variant.image_id
            ? rproduct.images.filter((img) => img.id === variant.image_id)?.[0]
                .src
            : rproduct?.image?.src;
          // rproduct?.image && rproduct?.image.src ? rproduct?.image.src : null;

          vprod.image = img;
          vprod.price = variant?.price;
          vprod.compareAtPrice = variant?.compare_at_price;
          vprod.inventoryQuantity = variant?.inventory_quantity;
          // const seOptions = [];
          // console.log(seOptions, 'seOptions');
          // vprod.selectedOptions = [new SelectedOption()];
          vprod.selectedOptions = rproduct.options.map((item, index) => {
            const sOpt = new SelectedOption();
            sOpt.name = item.name;
            sOpt.value = variant[`option${index + 1}`];
            return sOpt;
          });
          variants.push(vprod);
          await this.inventryService.create(vprod);
        });

        rproduct.images.map((img) => {
          const vprod = new CreateInventoryInput();
          vprod.id = img.admin_graphql_api_id;
          vprod.parentId = rproduct.admin_graphql_api_id;
          vprod.recordType = 'ProductImage';
          vprod.shop = shop;
          // image
          vprod.src = img.src;
          this.inventryService.create(vprod);
        });
        // this.updateSmartCollection.productId = rproduct?.admin_graphql_api_id;
        // this.updateSmartCollection.shop = shop;
        // this.updateSmartCollection.emit();

        nprod.outofstock =
          nprod.status !== 'ACTIVE'
            ? true
            : this.inventryService.calculateOutOfStock(variants);
        await this.inventryService.update(nprod);
        // console.log(
        //   '🚀 ~ file: webhooks.controller.ts ~ line 590 ~ WebhooksController ~ productUpdate ~ nprod',
        //   nprod,
        // );
        if (nprod.outofstock) {
          this.campaignStock.shop = shop;
          this.campaignStock.emit();
        }
      }
      // res.send('product updated..');
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'product-updated');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }
  // http://localhost:5000/webhooks/product?shopName=youngandrecklessdev.myshopify.com&id=gid://shopify/Product/3990782902375
  @Get('product')
  async product(@Query('shopName') shopName: any, @Query('id') id: any) {
    try {
      const { session } = await this.storesService.findOne(shopName);

      const client = await this.shopifyService.client(session);
      const Prd = await client.query({
        data: {
          query: `query product($id: ID!){
            product(id: $id) {
              title
              id
              status
              createdAt
              publishedAt
              featuredImage {
                src
              }
              images(first:10, reverse: true){
                edges{
                  node{
                    src
                    id
                    originalSrc
                  }
                }
              }
            options{
                id
                name
                values
                position
              }
              variants(first: 30, reverse: true) {
                edges {
                  node {
                    selectedOptions {
                      name
                      value
                    }
                    image {
                      src
                    }
                    title
                    price
                    inventoryQuantity
                    id
                    createdAt
                    image {
                      src
                    }

                  }
                }
              }
            }
          }`,
          variables: {
            id: id,
          },
        },
      });
      const data1: any = Prd.body;
      const prod = data1.data.product;
      const variants = data1.data.product.variants.edges;
      const images = data1.data.product.images.edges;
      const pid = data1.data.product.id;

      const nprod = new UpdateInventoryInput();
      // nprod.id = rproduct.id;
      nprod.id = id;
      nprod.createdAtShopify = prod?.createdAt;
      nprod.publishedAt = prod?.publishedAt;
      nprod.title = prod?.title;
      nprod.status = prod?.status?.toUpperCase();
      nprod.price = variants[0].node?.price; //
      nprod.featuredImage = prod?.featuredImage?.src;
      let qDifference: number;
      // const isAvailable = variants.some(
      //   ({ node: { inventoryQuantity } }) => inventoryQuantity > 0,
      // );
      // nprod.outofstock = !isAvailable;
      nprod.options = prod.options.map(({ id, name, position, values }) => ({
        id,
        name,
        position,
        values,
      }));
      nprod.outofstock = this.inventryService.calculateOutOfStock(variants);
      await this.inventryService.update(nprod);

      await this.inventryService.removeVariants(pid);

      variants.map(
        async ({
          node: {
            selectedOptions,
            title,
            inventoryQuantity,
            price,
            id: vid,
            createdAt,
            image,
          },
        }) => {
          const vprod = new CreateInventoryInput();
          vprod.id = vid;
          vprod.title = title;
          vprod.displayName = `${prod.title} Variant ${title}`;
          vprod.parentId = id;
          vprod.recordType = 'ProductVariant';
          vprod.createdAtShopify = createdAt;
          // vprod.publishedAt = rproduct?.published_at;
          vprod.price = price;
          vprod.shop = shopName;
          // image
          const img = new ProductImage();
          img.src = image && image.src ? image.src : null;

          vprod.image = img;
          vprod.featuredImage = image && image.src ? image.src : null;
          vprod.inventoryQuantity = inventoryQuantity;
          vprod.selectedOptions = selectedOptions.map((item, index) => {
            const sOpt = new SelectedOption();
            sOpt.name = item.name;
            sOpt.value = item.value;
            return sOpt;
          });
          await this.inventryService.create(vprod);
        },
      );

      images.map(async ({ node: { id: vid, src } }) => {
        const vprod = new CreateInventoryInput();
        vprod.id = vid;
        vprod.parentId = id;
        vprod.recordType = 'ProductImage';
        vprod.shop = shopName;
        // image
        vprod.src = src;

        await this.inventryService.create(vprod);
      });

      return `${JSON.stringify(Prd)}`;
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  @Post('order-create?')
  async orderCreate(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        // console.log(
        //   'WebhooksController ~ orderCreate ~ webhookData',
        //   JSON.stringify(req.body),
        // );
        // const webhook = req.body;
        if (req.body.source_name !== 'pos') {
          this.orderCreatedEvent.webhook = req.body;
          this.orderCreatedEvent.shop = shop;
          this.orderCreatedEvent.emit();
        }
      }
      // res.send('order created..');
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'order-created');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('product-delete?')
  async productDelete(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rproduct = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        console.log(
          'WebhooksController ~ productDelete ~ rproduct',
          JSON.stringify(rproduct),
        );
        const { id: storeId } = await this.storesService.findOne(shop);

        // const { result } = await this.inventryService.remove(
        //   JSON.stringify(rproduct.id),
        // );
        // res.send(result.deletedCount);
        Logger.warn(
          `product : ${rproduct.id} is deleted from ${shop}`,
          'product-deleted',
        );
        const PrdId = `gid://shopify/Product/${rproduct.id}`;

        //  1 products are not deleted from the database but are marked out of stock and set deleted product status to DELETED
        // await this.inventryService.removeVariants(PrdId);

        await this.inventryService.updateProduct(PrdId, {
          status: 'DELETED',
          outofstock: true,
          featuredImage:
            'https://d1o2v5h7slksjm.cloudfront.net/discontinued.png',
        });
        //  2 if they are part of any campaign remove them from campaign products
        // const allCampaign = await this.campaignService.findAll(storeId);
        // const filteredCampaigns = allCampaign.filter((campaign) =>
        //   campaign.products.includes(PrdId),
        // );
        // console.log(
        //   '🚀 ~ file: webhooks.controller.ts:854 ~ productDelete ~ filteredCampaigns',
        //   filteredCampaigns,
        // );
        // filteredCampaigns.map(async (campaign) => {
        //   const updatedPrd = campaign.products.filter((prd) => prd !== PrdId);
        //   return await this.campaignService.update(campaign.id, {
        //     storeId,
        //     products: updatedPrd,
        //     criteria: campaign.criteria,
        //     id: campaign.id,
        //   });
        // });

        // create event for Search Indexing
        this.searchIndexingRefreshEvent.shopName = shop;
        this.searchIndexingRefreshEvent.emit();
      }

      //  3 update groupshop page query so that it can display deleted bought products as discontinued products.
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'product-deleted');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('customer-update?')
  async customerUpdate(@Req() req, @Res() res) {
    res.status(HttpStatus.OK).send();
  }

  @Post('collection-create?')
  async collectionCreate(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rproduct = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        console.log(
          'WebhooksController ~ collection-create ~ rproduct',
          JSON.stringify(rproduct),
          shop,
        );

        // const { result } = await this.inventryService.remove(
        //   JSON.stringify(rproduct.id),
        // );
        // res.send(result.deletedCount);
      }
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'collection-created');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('collection-delete?')
  async collectionDelete(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const collection = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        console.log(
          '🚀 ~ file: webhooks.controller.ts:965 ~ collectionDelete ~ collection:',
          collection,
        );

        const { id } = await this.storesService.findOne(shop);

        this.inventryService
          .removeEntity(
            `gid://shopify/Collection/${collection.id}`,
            RecordType.Collection,
          )
          .then(() => {
            console.log(
              '🚀 ~ file: webhooks.controller.ts:965 ~ collectionDelete',
              `Collection deleted id: gid://shopify/Collection/${collection.id} of ${shop}`,
            );
            Logger.log(
              `Collection deleted id: gid://shopify/Collection/${collection.id} of ${shop}`,
              'collection-delete',
              true,
            );
            // create event for Search Indexing
            this.searchIndexingRefreshEvent.shopName = shop;
            this.searchIndexingRefreshEvent.emit();
          })
          .catch((err) => {
            Logger.error(
              `Can't delete collection id: gid://shopify/Collection/${collection.id} of ${shop} : ${err}`,
              'collection-delete',
            );
          });

        await this.storesService.removeSyncedCollection(
          `gid://shopify/Collection/${collection.id}`,
          id,
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'collection-delete');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('bulk-finish?')
  async bulkFinish(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const bulkData = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        const { session, id, collectionsToUpdate } =
          await this.storesService.findOne(shop);

        const client = await this.shopifyService.client(session);

        console.log(
          'WebhooksController ~ bulk-finish',
          JSON.stringify(bulkData),
          shop,
        );

        const log = await this.appLoggerService.findLatestByCotext(
          'COLLECTIONTOUPDATBULK',
        );

        const bulkOperationId = log.message?.split('-')[1]?.trim();

        await client
          .query({
            data: {
              query: `query {
            node(id: "${bulkOperationId}") {
              ... on BulkOperation {
                url
                partialDataUrl
              }
            }
          }`,
            },
          })
          .then((res) => {
            const resp = JSON.stringify(res.body['data']['node']);
            Logger.log(`${shop} ${resp}`, 'SYNC_COLLECTION_BULKFINISH', true);
            const url = res.body['data']['node'].url;
            this.httpService.get(url).subscribe(async (res) => {
              const checkCollection = res.data?.length
                ? readJsonLines(res.data)
                : [];
              Logger.log(
                `check collection ${JSON.stringify(checkCollection)}`,
                'SYNC_COLLECTION_BULKFINISH',
                true,
              );

              if (
                checkCollection.length
                // checkCollection[0].productsCount > 0
              ) {
                // this.inventryService.getProducts(checkCollection, id, shop);
                const deletedCollectionIds =
                  await this.inventryService.updateCollection(
                    checkCollection,
                    id,
                    shop,
                  );
                // update store status to complete
                // remove store collectiontoupdate entries
                await this.storesService.updateCustom(
                  shop,
                  deletedCollectionIds,
                );
                Logger.log(
                  `${shop} deletedIds ${deletedCollectionIds}`,
                  'SYNC_COLLECTION_UPDATESTORE',
                  true,
                );
                Logger.log(
                  `${shop} updated/sync`,
                  'SYNC_COLLECTION_UPDATESTORE',
                  true,
                );
              } else {
                console.log('No products found');
              }
            });

            // create event for Search Indexing
            this.searchIndexingRefreshEvent.shopName = shop;
            this.searchIndexingRefreshEvent.emit();
          });
      }
    } catch (err) {
      Logger.error(err, 'SYNC_COLLECTION_BULKFINISH');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('collection-update?')
  async collectionUpdate(@Req() req, @Res() res) {
    try {
      // 1. receive collection webhook
      const { shop: shopName } = req.query;
      const rcollection = req.body;
      const storeData = await this.storesService.findOneByName(shopName);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        // let collectionType;
        // if ('rules' in rcollection && rcollection.rules.length) {
        //   collectionType = 'smart';
        // } else {
        //   collectionType = 'custom';
        // }
        console.log(
          'WebhooksController ~ collection-update ~ ',
          JSON.stringify(rcollection),
          shopName,
        );

        // 2. delete all previous products collection
        // await this.inventryService.removeEntity(
        //   rcollection.admin_graphql_api_id,
        //   RecordType.Collection,
        // );

        // 3. get collection detail from shopify IF its a published collection

        const { id } = await this.storesService.findOne(shopName);
        const temp: any = await this.storesService.checkUpdatedCollection(
          rcollection.admin_graphql_api_id,
          false,
          id,
        );

        if (!temp[0].collections?.length) {
          const body = {
            collectionTitle: rcollection.title,
            collectionId: rcollection.admin_graphql_api_id,
            isSynced: false,
            updatedAt: new Date(),
          };
          this.storesService.updateCollectionToSync(id, body);
        } else {
          this.storesService.updateCollectionDate(
            rcollection.admin_graphql_api_id,
            new Date(),
          );
        }

        Logger.log(
          `Collection update receive on ${shopName} with id ${rcollection.admin_graphql_api_id}`,
          'COLLECTION_UPDATE_RECEIVE',
          true,
        );

        // create event for Search Indexing
        this.searchIndexingRefreshEvent.shopName = shopName;
        this.searchIndexingRefreshEvent.emit();
      }
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'collection-updated');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('billing-failure?')
  async billingFailure(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rproduct = req.body;
      console.log(
        'WebhooksController ~ billing-failure ~ rproduct',
        JSON.stringify(rproduct),
        shop,
      );

      // const { result } = await this.inventryService.remove(
      //   JSON.stringify(rproduct.id),
      // );
      // res.send(result.deletedCount);
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'billing-failure');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('billing-success?')
  async billingSuccess(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rproduct = req.body;
      console.log(
        'WebhooksController ~ billing-success ~ rproduct',
        JSON.stringify(rproduct),
        shop,
      );

      // const { result } = await this.inventryService.remove(
      //   JSON.stringify(rproduct.id),
      // );
      // res.send(result.deletedCount);
    } catch (err) {
      console.log(JSON.stringify(err));
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('app-subscription?')
  async appSubscription(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const appsub = req.body;
      console.log(
        'WebhooksController ~ app-subscription ~ rproduct',
        JSON.stringify(appsub),
        shop,
      );
      const subscriptionStatus =
        appsub['app_subscription']['status'].toUpperCase();
      const payload =
        subscriptionStatus === 'ACTIVE'
          ? {
              'subscription.status': subscriptionStatus,
              installationStep: null,
            }
          : {
              'subscription.status': subscriptionStatus,
              installationStep: 5,
              'subscription.confirmationUrl': '',
            };
      // if (appsub['app_subscription']['status'] === 'ACTIVE') {
      this.storesService.updateField(
        {
          shop,
          'subscription.appSubscription.id':
            appsub['app_subscription'].admin_graphql_api_id,
        },
        payload,
      );
      Logger.warn(
        'AppSubscription status: ' +
          subscriptionStatus +
          ' set for shop :' +
          shop,
        'app-subscriptionStatus',
      );
      // }
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'app-Subscription');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Get('load-products')
  async loadProducts(@Query('shopName') shopName: any) {
    try {
      const { shop, session } = await this.storesService.findOne(shopName);
      const products = await this.inventryService.findAllProductsOnly(shop);
      console.log(
        '🚀 ~ webhooks.controller.ts ~ line 812 ~ loadProducts ~ products',
        products[0].recordType,
      );
      // eslint-disable-next-line prefer-const
      let resStr = '';
      products.map(({ id, title }) => {
        console.log(title);
        const res = this.refreshSingleProduct(shop, session, id, shopName);
        resStr = `${resStr} ${JSON.stringify(res)}`;
      });
      return JSON.stringify(resStr);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  @Get('bulkimport')
  async bulkProducts(@Query('shopName') shopName: any) {
    try {
      // http://localhost:5000/webhooks/bulkimport?shopName=native-roots-dev.myshopify.com
      const { session, shop } = await this.storesService.findOne(shopName);
      const client = await this.shopifyService.client(session);
      const qres = await client.query({
        data: {
          query: `mutation {
          bulkOperationRunQuery(
            query:"""
            {
              products(first: 2000, reverse: true)  {
                    edges {
                      node {
                        id
                        title
                        status
                        description
                        options{
                          id
                          name
                          name
                          position
                          values
                        }
                        featuredImage{
                          src
                        }
                        images(first:20, reverse: true){
                          edges{
                            node{
                              src
                              id
                            }
                          }
                        }
                        priceRangeV2{
                          maxVariantPrice{
                            amount
                            currencyCode
                            
                          }
                          minVariantPrice{
                            amount
                            currencyCode
                          }
                        }
                        totalVariants
                        totalInventory
                        status
                        publishedAt
                        onlineStoreUrl
                        createdAtShopify : createdAt
                        collections(first: 1000, reverse: true){
                          edges{
                            node{
                              id
                              title
                              description
                              productsCount
                              sortOrder
                            }
                          }
                        }
                        variants(first: 1000, reverse: true)  {
                          edges {
                            node {
                              id
                              title
                              displayName
                              inventoryQuantity
                              inventoryPolicy
                              inventoryItem{
                                sku
                                tracked
                             }
                              price
                              compareAtPrice
                              selectedOptions{
                                name
                                value
                              }
                              shopifyCreatedAt :createdAt
                              image{
                                src
                                
                              }
                            }
                          }
                        }
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
      // console.log(event);
      // console.log(JSON.stringify(qres));
      // console.log(qres.body['data']['bulkOperationRunQuery']['bulkOperation']);
      // const dopoll = true;
      if (
        qres.body['data']['bulkOperationRunQuery']['bulkOperation'][
          'status'
        ] === 'CREATED'
      ) {
        const pollit = setInterval(async () => {
          const poll = await client.query({
            data: {
              query: `query {
            currentBulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
            }
          }`,
            },
          });

          console.log(poll.body['data']['currentBulkOperation']);
          if (
            poll.body['data']['currentBulkOperation']['status'] === 'COMPLETED'
          ) {
            clearInterval(pollit);

            // fire inventory received event
            const url = poll.body['data']['currentBulkOperation'].url;
            this.httpService.get(url).subscribe(async (res) => {
              const inventoryArray = readJsonLines(res.data);
              // 1- get all inventory
              const inventArr = inventoryArray.map((inventory) => {
                // add record type
                inventory.featuredImage = inventory?.featuredImage?.src;
                inventory.price =
                  inventory?.priceRangeV2?.maxVariantPrice?.amount ||
                  inventory.price;
                inventory.currencyCode =
                  inventory?.priceRangeV2?.maxVariantPrice?.currencyCode;
                // inventory.inventoryManagement = inventory?.inventory_management;
                // inventory.inventoryPolicy = inventory?.inventory_policy;
                //rename inventory __parentId
                if (inventory.__parentId) {
                  inventory.parentId = inventory.__parentId;
                  delete inventory.__parentId;
                }
                // add shop to inventory
                inventory.shop = shop;

                // add record type
                inventory.recordType = inventory.id.split('/')[3];
                //add inventory management details
                if (inventory.recordType === 'ProductVariant')
                  inventory.inventoryManagement = inventory?.inventoryItem
                    ?.tracked
                    ? 'shopify'
                    : null;
                inventory.createdAt = new Date();
                inventory.updatedAt = new Date();
                return inventory;
              });

              // 2. Get products
              const products = inventArr.filter(
                (item) => item.recordType === 'Product',
              );
              // products.map((product) => {
              //   this.inventryService.remove(product.id);
              // });
              // products.map((product) => {
              //   console.log(
              //     '\x1b[36m%s\x1b[0m',
              //     '------ product.title : ',

              //     product.title,
              //   );
              //   // this.inventryService.remove(product.id);
              //   product.purchaseCount = 0;

              //   this.inventryService.update(product);
              //   this.inventryService.removeChildren(product.id);
              //   this.inventryService.insertMany(
              //     inventArr.filter((item) => item.parentId === product.id),
              //   );
              // });
              // setTimeout(
              //   async () =>
              await this.inventryService.removeShop(shop),
                //   5000,
                // );
                setTimeout(
                  async () => await this.inventryService.insertMany(inventArr),
                  5000,
                );
              console.log('color: #26bfa5;', '------------------------------');
              console.log(
                '%cwebhooks.controller.ts line:1114 total inventory received',
                'color: #007acc;',
                inventArr.length,
              );
              console.log(
                '%cwebhooks.controller.ts line:1119 total products',
                'color: white; background-color: #007acc;',
                products.length,
              );
              // OrdersSavedEvent -- Purchase Count
              setTimeout(() => {
                const ordersSavedEvent = new OrdersSavedEvent();
                ordersSavedEvent.shop = shop;
                ordersSavedEvent.session = session;
                this.eventEmitter.emit('orders.saved', ordersSavedEvent);
                // InventorySavedEvent -- out of stock
                const inventorySavedEvent = new InventorySavedEvent();
                inventorySavedEvent.shop = shop;
                inventorySavedEvent.session = session;
                inventorySavedEvent.type = 'outofstock';
                this.eventEmitter.emit(
                  'inventory.outofstock',
                  inventorySavedEvent,
                );
              }, 10000);
            });
          }
        }, 3000);
      } else console.log(JSON.stringify(qres.body['data']));
      return JSON.stringify(JSON.stringify(qres.body['data']));
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'bulkProducts');
    }
  }

  @Get('productImport')
  async productImport(@Query('shopName') shopName: any) {
    try {
      // http://localhost:5000/webhooks/productImport?shopName=native-roots-dev.myshopify.com
      const { session } = await this.storesService.findOne(shopName);
      const client = await this.shopifyService.client(session);
      const qres = await client.query({
        data: {
          query: `mutation {
          bulkOperationRunQuery(
            query:"""
            {
              products(first: 2000, reverse: true)  {
                    edges {
                      node {
                        id
                        title
                        tags
                        productType
                        vendor
                        status
                        description
                        options{
                          id
                          name
                          name
                          position
                          values
                        }
                        featuredImage{
                          src
                        }
                        images(first:20, reverse: true){
                          edges{
                            node{
                              src
                              id
                            }
                          }
                        }
                        priceRangeV2{
                          maxVariantPrice{
                            amount
                            currencyCode
                            
                          }
                          minVariantPrice{
                            amount
                            currencyCode
                          }
                        }
                        totalVariants
                        totalInventory
                        status
                        publishedAt
                        onlineStoreUrl
                        createdAtShopify : createdAt
                        collections(first: 1000, reverse: true){
                          edges{
                            node{
                              id
                              title
                              description
                              productsCount
                              sortOrder
                            }
                          }
                        }
                        variants(first: 1000, reverse: true)  {
                          edges {
                            node {
                              id
                              title
                              displayName
                              inventoryQuantity
                              inventoryPolicy
                              inventoryItem{
                                sku
                                tracked
                             }
                              price
                              compareAtPrice
                              selectedOptions{
                                name
                                value
                              }
                              shopifyCreatedAt :createdAt
                              image{
                                src
                                
                              }
                            }
                          }
                        }
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
      // console.log(event);
      // console.log(JSON.stringify(qres));
      // console.log(qres.body['data']['bulkOperationRunQuery']['bulkOperation']);
      // const dopoll = true;
      if (
        qres.body['data']['bulkOperationRunQuery']['bulkOperation'][
          'status'
        ] === 'CREATED'
      ) {
        const pollit = setInterval(async () => {
          const poll = await client.query({
            data: {
              query: `query {
            currentBulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
            }
          }`,
            },
          });

          console.log(poll.body['data']['currentBulkOperation']);
          if (
            poll.body['data']['currentBulkOperation']['status'] === 'COMPLETED'
          ) {
            clearInterval(pollit);

            // fire inventory received event
            const url = poll.body['data']['currentBulkOperation'].url;
            this.httpService.get(url).subscribe(async (res) => {
              const inventoryArray = readJsonLines(res.data);
              console.log(
                '🚀 ~ file: webhooks.controller.ts:1579 ~ this.httpService.get ~ inventoryArray',
                inventoryArray,
              );
              const blukWrite = inventoryArray
                .filter((item) => item.id.split('/')[3] === 'Product')
                .map((item) => {
                  return {
                    updateOne: {
                      filter: { id: item.id },
                      update: {
                        $set: {
                          tags: item.tags,
                          productCategory: item.productType,
                          vendor: item.vendor,
                          compareAtPrice: item?.compareAtPrice ?? null,
                        },
                      },
                    },
                  };
                });
              await this.inventryService.setPurchaseCount(blukWrite);
              // async () => await this.inventryService.insertMany(inventArr);
              // console.log('color: #26bfa5;', '------------------------------');
            });
          }
        }, 3000);
      } else console.log(JSON.stringify(qres.body['data']));
      return JSON.stringify(JSON.stringify(qres.body['data']));
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'productImport');
    }
  }

  @Get('inevent')
  async importEvents(@Query('shopName') shopName: any) {
    Logger.log(`testlog`, 'WEBHOOKS_REGISTERED', true);
    // try {
    // http://localhost:5000/webhooks/inevent?shopName=native-roots-dev.myshopify.com
    try {
      const { shop, accessToken } = await this.storesService.findOne(shopName);
      // OrdersSavedEvent -- Purchase Count
      const ordersSavedEvent = new OrdersSavedEvent();
      ordersSavedEvent.shop = shop;
      ordersSavedEvent.accessToken = accessToken;
      this.eventEmitter.emit('orders.saved', ordersSavedEvent);
      // InventorySavedEvent -- out of stock
      const inventorySavedEvent = new InventorySavedEvent();
      inventorySavedEvent.shop = shop;
      inventorySavedEvent.accessToken = accessToken;
      inventorySavedEvent.type = 'outofstock';
      this.eventEmitter.emit('inventory.outofstock', inventorySavedEvent);
    } catch (error) {
      Logger.error(error, 'Inevent test log');
    }
  }

  @Post('order-updated?')
  async orderUpdated(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const rorder = req.body;
      const storeData = await this.storesService.findOneByName(shop);
      if (storeData?.drops && storeData?.drops?.status == 'Active') {
        // console.log(
        //   'WebhooksController ~ orderUpdate ~ webhookData',
        //   JSON.stringify(req.body),
        // );

        const order = new UpdateFullOrderInput();
        order.id = rorder.admin_graphql_api_id;
        order.financialStatus = rorder.financial_status;
        if (rorder.financial_status.includes('refund')) {
          order.refundDetail = rorder.refunds?.map((refund) => {
            if (refund.order_adjustments.length > 0)
              return refund.order_adjustments?.map((oj: any) => ({
                date: refund.created_at,
                note: refund.note,
                type: 'amount adjustment',
                amount: oj.amount,
              }));
            else
              return refund.refund_line_items?.map((rl: any) => ({
                date: refund.created_at,
                note: refund.note,
                type: 'lineitem returned',
                lineItemId: rl.line_item.admin_graphql_api_id,
                amount: rl.subtotal,
                quantity: rl.quantity,
              }));
          });
        }
        order.refundDetail = order.refundDetail?.map((rd) => rd[0]);
        this.orderService.update(order);
      }
      // res.send('order created..');
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'order-updated');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Get('sync-pc?')
  async updatePurchaseCount(@Query('shop') shop: any, @Res() res) {
    try {
      // const allShopPrd = await this.inventryService.findAllProductsOnly(shop);
      // console.log(
      //   '🚀 ~ file: webhooks.controller.ts ~ line 1331 ~ WebhooksController ~ updatePurchaseCount ~ allShopPrd',
      //   allShopPrd.length,
      // );
      const nowdate = new Date(Date.now() - 15770000000);
      const PurchasedProducts =
        await this.orderService.getPurchasedProductsLastSixMonth(shop, nowdate);

      // console.log(
      //   '🚀 ~ file: webhooks.controller.ts ~ line 1337 ~ WebhooksController ~ updatePurchaseCount ~ PurchasedProducts',
      //   PurchasedProducts.slice(0, 2),
      // );
      const blukWrite = PurchasedProducts.map((item) => {
        return {
          updateOne: {
            filter: { id: item._id },
            update: { $set: { purchaseCount: item.purchaseCount } },
          },
        };
      });
      await this.inventryService.setPurchaseCount(blukWrite);
      // console.log('Product purchase count updated...');

      res.send({
        shop: PurchasedProducts,
        message: 'purchaseCount updated',
      });
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'updatepurchasecount');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }
  @Post('plan-reset-date')
  async updatePlanResetDateAllStores(@Req() req, @Res() res) {
    try {
      const stores = await this.storesService.findActiveAll();
      stores.map(
        async ({ id, planResetDate, createdAt }) =>
          await this.storesService.update(id, { id, planResetDate: createdAt }),
      );
      res.send(JSON.stringify(stores));
    } catch (err) {
      console.log(JSON.stringify(err));
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Get('load-recentgs')
  async loadRecentGS(@Res() res) {
    try {
      const recentGS = await this.storesService.loadRecentGS();
      res.send(JSON.stringify(recentGS));
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'load-recentgs');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('klaviyo-drops')
  async klaviyoDrops(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      this.dropCreatedEvent.webhook = req.body;
      this.dropCreatedEvent.shop = shop;
      this.dropCreatedEvent.emit();
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'drop-created');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('update-drops-discount-codes-collections')
  async updateDropsDiscountCodesCollections(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;

      const { id, session } = await this.storesService.findOne(shop);

      const dropsGroupshops = await this.dropsGroupshopService.getActiveDrops(
        id,
      );

      for (const dg of dropsGroupshops) {
        const collections =
          await this.dropsCategoryService.getNonSVCollectionIDs(id);
        await this.shopifyService.setDiscountCode(
          shop,
          'Update',
          session,
          dg.discountCode.title,
          null,
          [...new Set(collections)],
          null,
          null,
          dg.discountCode.priceRuleId,
          true,
          true,
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'update-drops-discount-codes-collections');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }

  @Post('add-drops-ended-event')
  async addDropsEndedEvent(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;

      const { id } = await this.storesService.findOne(shop);

      const dropsGroupshops =
        await this.dropsGroupshopService.getLastMilestoneDrops(id);

      dropsGroupshops.forEach((element) => {
        this.lifecyclesrv.create({
          groupshopId: element.id,
          event: EventType.ended,
          dateTime: new Date(),
        });
      });

      console.log(
        '🚀 ~ file: webhooks.controller.ts:2105 ~ addDropsEndedEvent ~ dropsGroupshops:',
        dropsGroupshops,
      );
      res.send(JSON.stringify(dropsGroupshops));
    } catch (err) {
      console.log(JSON.stringify(err));
      Logger.error(err, 'add-drops-ended-event');
    } finally {
      res.status(HttpStatus.OK).send();
    }
  }
}
