import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { TokenReceivedEvent } from '../events/token-received.event';
// import { ShopifyService } from '../shopify/shopify.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryReceivedEvent } from '../events/inventory-received.event';
import { oldThemeFoundEvent } from '../events/old-theme-found.event';
import { ShopifyService } from '../shopify.service';

@Injectable()
export class TokenReceivedListener {
  constructor(
    private shopifyapi: ShopifyService,
    private configSevice: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}
  @OnEvent('token.received')
  async bulkProductsQuery(event: TokenReceivedEvent) {
    const { shop, accessToken } = event.session;

    const client = await this.shopifyapi.clientGQL(event.session);
    const qres = await client.query({
      data: {
        query: `mutation {
          bulkOperationRunQuery(
            query:"""
            {
              products(first: 10000, reverse: true, query:"status:ACTIVE")  {
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
                        images(first:10, reverse: true){
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
                              ruleSet {
                                rules {
                                  condition
                                }
                              }
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
                              inventoryPolicy
                              inventoryItem{
                                sku
                                tracked
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
    console.log('bulkProduct', JSON.stringify(qres));
    console.log(
      'bulkProduct',
      qres.body['data']['bulkOperationRunQuery']['bulkOperation'],
    );
    // const dopoll = true;
    if (
      qres.body['data']['bulkOperationRunQuery']['bulkOperation']['status'] ===
      'CREATED'
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

          const inventoryReceivedEvent = new InventoryReceivedEvent();
          inventoryReceivedEvent.bulkOperationResponse =
            poll.body['data']['currentBulkOperation'];
          inventoryReceivedEvent.shop = shop;
          inventoryReceivedEvent.accessToken = accessToken;

          this.eventEmitter.emit('inventory.received', inventoryReceivedEvent);
        } else if (
          poll.body['data']['currentBulkOperation']['status'] === 'FAILED'
        ) {
          clearInterval(pollit);

          Logger.error(
            { message: 'Product bulk failed' },
            ' token-received.listener.ts:186 ~ TokenReceivedListener',
            TokenReceivedListener.name,
          );
        }
      }, 3000);
    } else console.log('Bulk Result ', JSON.stringify(qres.body['data']));
  }

  // @OnEvent('token.received')
  // async getThemeDetail(event: TokenReceivedEvent) {
  //   const { shop, accessToken } = event.session;

  //   // Specify the name of the template the app will integrate with
  //   const APP_BLOCK_TEMPLATES = ['product'];

  //   // Create a new client for the specified shop
  //   const client = await this.shopifyapi.restClient(shop, accessToken);

  //   // Use `client.get` to request a list of themes on the shop
  //   const {
  //     body: { themes },
  //   }: any = await client.get({
  //     path: 'themes',
  //   });
  //   console.log(
  //     '🚀 ~ file: token-received.listener.ts ~ line 177 ~ TokenReceivedListener ~ getStoreDetail ~ themes',
  //     JSON.stringify(themes),
  //   );

  //   // Find the published theme
  //   const publishedTheme = themes.find(
  //     (theme: { role: string }) => theme.role === 'main',
  //   );
  //   // Retrieve a list of assets in the published theme
  //   const {
  //     body: { assets },
  //   }: any = await client.get({
  //     path: `themes/${publishedTheme.id}/assets`,
  //   });
  //   // Check if JSON template files exist for the template specified in APP_BLOCK_TEMPLATES
  //   const templateJSONFiles = assets.filter((file: { key: string }) => {
  //     return APP_BLOCK_TEMPLATES.some(
  //       (template) => file.key === `templates/${template}.json`,
  //     );
  //   });
  //   console.log('🚀 ~ file: ~ APP_BLOCK_TEMPLATES', APP_BLOCK_TEMPLATES.length);

  //   if (templateJSONFiles.length === APP_BLOCK_TEMPLATES.length) {
  //     console.log('All desired templates support sections everywhere!');
  //   } else if (templateJSONFiles.length) {
  //     console.log(
  //       'Only some of the desired templates support sections everywhere.',
  //     );
  //   }
  //   // Retrieve the body of JSON templates and find what section is set as `main`
  //   const templateMainSections = (
  //     await Promise.all(
  //       templateJSONFiles.map(async (file: { key: any }, index: any) => {
  //         const acceptsAppBlock = false;
  //         const {
  //           body: { asset },
  //         }: any = await client.get({
  //           path: `themes/${publishedTheme.id}/assets`,
  //           query: { 'asset[key]': file.key },
  //         });

  //         const json: any = JSON.parse(asset.value);
  //         const main: any = Object.entries(json.sections).find(
  //           ([id, section]: [string, any]) =>
  //             id === 'main' || (section && section?.type?.startsWith('main-')),
  //         );
  //         console.log('🚀  ~  ~ main', main);
  //         if (main) {
  //           return assets.find(
  //             (file: { key: string }) =>
  //               file.key === `sections/${main[1]?.type}.liquid`,
  //           );
  //         }
  //       }),
  //     )
  //   ).filter((value) => value);

  //   // Request the content of each section and check if it has a schema that contains a
  //   // block of type '@app'
  //   const sectionsWithAppBlock = (
  //     await Promise.all(
  //       templateMainSections.map(async (file: any, index) => {
  //         let acceptsAppBlock = false;
  //         const {
  //           body: { asset },
  //         }: any = await client.get({
  //           path: `themes/${publishedTheme.id}/assets`,
  //           query: { 'asset[key]': file?.key },
  //         });

  //         const match = asset.value.match(
  //           /\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m,
  //         );
  //         const schema = JSON.parse(match[1]);

  //         if (schema && schema.blocks) {
  //           acceptsAppBlock = schema.blocks.some(
  //             (b: { type: string }) => b.type === '@app',
  //           );
  //         }

  //         return acceptsAppBlock ? file : null;
  //       }),
  //     )
  //   ).filter((value) => value);
  //   if (
  //     templateJSONFiles.length === sectionsWithAppBlock.length &&
  //     templateJSONFiles.lenght &&
  //     sectionsWithAppBlock.length
  //   ) {
  //     console.log(
  //       'All desired templates have main sections that support app blocks!',
  //     );
  //   } else if (sectionsWithAppBlock.length) {
  //     console.log('Only some of the desired templates support app blocks.');
  //   } else {
  //     console.log('None of the desired templates support app blocks');

  //     const oldThemeFound = new oldThemeFoundEvent();
  //     oldThemeFound.shop = shop;
  //     oldThemeFound.accessToken = accessToken;

  //     this.eventEmitter.emit('old.theme.found', oldThemeFound);
  //   }
  // }
}
