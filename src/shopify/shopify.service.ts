import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ApiVersion,
  Session,
  SessionParams,
  DeliveryMethod,
} from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-07';
import { ConfigService } from '@nestjs/config';
import { Shopify } from '@shopify/shopify-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TokenReceivedEvent } from './events/token-received.event';
// import { StoresService } from 'src/stores/stores.service';
import { setTimeout } from 'timers/promises';

@Injectable()
export class ShopifyService {
  public shopify: Shopify;
  public session: Session;
  public shop: string;
  public accessToken: string;
  constructor(
    private configService: ConfigService,
    // @Inject(forwardRef(() => StoresService))
    // private storesService: StoresService,
    // private httpService: HttpService,
    private eventEmitter: EventEmitter2,
  ) {
    this.shopify = shopifyApi({
      apiKey: configService.get<string>('SHOPIFY_API_KEY'),
      apiSecretKey: configService.get<string>('SHOPIFY_API_SECRET'),
      scopes: configService.get<string>('SCOPES')?.split(','),
      hostName: configService.get<string>('HOST').replace(/https:\/\//, ''),
      hostScheme: 'https',
      apiVersion: ApiVersion.July23,
      isEmbeddedApp: true,
      isCustomStoreApp: false,
      userAgentPrefix: 'Custom prefix',
      privateAppStorefrontAccessToken: 'PrivateAccessToken',
      // customShopDomains: ['*.my-custom-domain.io'],
      // billing: {
      //   'My plan': {
      //     amount: 5.0,
      //     currencyCode: 'USD',
      //     interval: BillingInterval.OneTime,
      //   },
      // },
      // logger: {
      //   log: (severity, message) => {
      //     myAppsLogFunction(severity, message);
      //   },
      // },
      restResources,
    });

    // return this.shopify;
  }

  async sanitizeShop(shop: any) {
    return await this.shopify.utils.sanitizeShop(shop, true);
  }

  offlineSession(session: Session) {
    const tokenReceivedEvent = new TokenReceivedEvent();
    tokenReceivedEvent.token = session.accessToken;
    tokenReceivedEvent.session = session.toObject();
    this.eventEmitter.emit('token.received', tokenReceivedEvent);

    return session;
  }

  async clientGQL(sessionParams: SessionParams) {
    try {
      const session = await this.getCurrentSession(sessionParams);
      return new this.shopify.clients.Graphql({ session });
    } catch (err) {
      console.log('err', err);
    }
  }

  async getSessionFromStorage(
    shop: string,
    accessToken: string,
    id: string,
    state: string,
  ) {
    // const {
    //   accessToken,
    //   shopifySessionId: id,
    //   state,
    // } = await this.storesService.findOne(shop);
    return new Session({
      id,
      accessToken,
      shop,
      isOnline: false,
      state,
    });
  }

  async getCurrentSession(session: SessionParams) {
    // console.log('🚀 ~ getCurrentSession ~ session:', session);
    return new Session(session);
  }

  async client(session: Session) {
    try {
      return new this.shopify.clients.Graphql({ session });
    } catch (err) {
      console.log('err', err);
    }
  }

  async storeDetail(session: SessionParams) {
    try {
      const client = await this.clientGQL(session);
      const sdetail = await client.query({
        data: {
          query: `{
            shop{
              name,
              ianaTimezone,
              currencyCode,
                  
            }
          }`,
        },
      });
      // Logger.debug(sdetail, ShopifyService.name);
      return sdetail;
    } catch (err) {
      // console.log(err.message);
      Logger.error(err, ShopifyService.name);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: JSON.stringify(err.message),
        },
        HttpStatus.UNAUTHORIZED,
      );
      // return err;
    }
  }

  async registerHook(shop, path, topic, session) {
    try {
      await setTimeout(1000);
      console.log(new Date().toISOString());

      this.shopify.webhooks.addHandlers({
        [topic]: [
          {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: path + '?shop=' + shop,
          },
        ],
      });

      const response = await this.shopify.webhooks.register({
        session,
      });
      console.log(
        '🚀 ~ file: shopify.service.ts:167 ~ ShopifyService ~ registerHook ~ response:',
        JSON.stringify(response),
      );

      if (!response[topic][0].success) {
        console.log(
          `Failed to register ${topic} webhook: ${response['topic'][0].result}`,
        );
        Logger.error(
          `${topic}-webhook - failed for ${shop}`,
          JSON.stringify(response['topic'][0].result),
          'WEBHOOKS_REGISTERATION_FAILED',
        );
      } else {
        console.log(
          `registerHook ~ response[${topic}][0].success:`,
          response[topic][0],
        );
        Logger.log(
          `${topic}-webhook - registered for ${shop}`,
          'WEBHOOKS_REGISTERED',
          true,
        );
      }
    } catch (error) {
      console.log(`error ${topic} : `, error.response, JSON.stringify(error));
      Logger.error(
        `${topic}-webhook - failed for ${shop}`,
        error.stack,
        'WEBHOOKS_REGISTERATION_FAILED',
      );
    }
  }

  async setDiscountCode(
    shop: string,
    action: string,
    session: Session,
    title?: string,
    percentage?: number,
    products?: string[],
    starts?: Date,
    ends?: Date,
    id?: string,
    isCollection?: boolean,
    shippingDiscounts?: boolean,
  ) {
    // if (percentage) {
    console.log({ title });
    // console.log({ percentage });
    try {
      const client = await this.client(session);
      let priceRule: any;

      if (action === 'Create')
        priceRule = await client.query({
          data: {
            query: `mutation priceRuleCreate($priceRule: PriceRuleInput!, $priceRuleDiscountCode : PriceRuleDiscountCodeInput) {
          priceRuleCreate(priceRule: $priceRule, priceRuleDiscountCode: $priceRuleDiscountCode) {
            priceRule {
              id
              title
              target
              startsAt
              endsAt
              status
              valueV2 {
               ... on PricingPercentageValue{
              percentage
              }
             }
            }
            priceRuleDiscountCode {
              id 
              code
            }
            priceRuleUserErrors {
              message
            }
          }
        }`,
            variables: {
              id: id || null,
              priceRule: {
                title: title,
                target: 'LINE_ITEM',
                value: {
                  percentageValue: -percentage,
                },
                itemEntitlements: {
                  [isCollection ? 'collectionIds' : 'productIds']: [
                    ...new Set(products),
                  ],
                },
                combinesWith: {
                  productDiscounts: true,
                  shippingDiscounts,
                },
                customerSelection: {
                  forAllCustomers: true,
                },
                allocationMethod: 'EACH',
                validityPeriod: {
                  start: starts,
                  end: ends,
                },
              },
              priceRuleDiscountCode: { code: title },
            },
          },
        });
      else {
        // console.log('inside update option');
        let variables: any = { id };
        if (products && starts && ends)
          variables = {
            id,
            priceRule: {
              itemEntitlements: {
                [isCollection ? 'collectionIds' : 'productIds']: [
                  ...new Set(products),
                ],
              },
              validityPeriod: {
                start: starts,
                end: ends,
              },
              combinesWith: {
                productDiscounts: true,
                shippingDiscounts,
              },
            },
          };
        else if (percentage && starts && ends)
          variables = {
            id,
            priceRule: {
              value: {
                percentageValue: -percentage,
              },
              validityPeriod: {
                start: starts,
                end: ends,
              },
              combinesWith: {
                productDiscounts: true,
                shippingDiscounts,
              },
            },
          };
        else if (percentage)
          variables = {
            id,
            priceRule: {
              value: {
                percentageValue: -percentage,
              },
              combinesWith: {
                productDiscounts: true,
                shippingDiscounts,
              },
            },
          };
        else if (products)
          variables = {
            id,
            priceRule: {
              itemEntitlements: {
                [isCollection ? 'collectionIds' : 'productIds']: [
                  ...new Set(products),
                ],
              },
              combinesWith: {
                productDiscounts: true,
                shippingDiscounts,
              },
            },
          };
        else
          variables = {
            id,
            priceRule: {
              validityPeriod: {
                start: starts,
                end: ends,
              },
              combinesWith: {
                productDiscounts: true,
                shippingDiscounts,
              },
            },
          };

        // console.log({ variables });
        console.log(JSON.stringify(variables));
        priceRule = await client.query({
          data: {
            query: `mutation priceRuleUpdate($id: ID!,$priceRule: PriceRuleInput!, $priceRuleDiscountCode : PriceRuleDiscountCodeInput) {
          priceRuleUpdate(id: $id, priceRule: $priceRule, priceRuleDiscountCode: $priceRuleDiscountCode) {
          priceRule {
            id
            title
            target
            startsAt
            endsAt
            status
            valueV2 {
               ... on PricingPercentageValue{
              percentage
            }
          }
          }
          priceRuleDiscountCode {
            id
            code
          }
          priceRuleUserErrors {
            message
          }
        }
      }`,
            variables,
          },
        });
      }
      console.log(
        '🚀 ~ file: shopify.service.ts ~ line 410 ~ ShopifyService ~ priceRule',
        JSON.stringify(priceRule),
      );
      if (
        priceRule.body['data'][`priceRule${action}`].priceRuleUserErrors.length
      )
        Logger.log(JSON.stringify(priceRule), 'setDiscountCodeError', true);
      const {
        [`priceRule${action}`]: {
          priceRule: { id: priceRuleId, title: title1 },
        },
      } = priceRule.body['data'];
      return {
        title: title ?? title1,
        percentage: percentage?.toString(),
        priceRuleId: priceRuleId,
      };
    } catch (err) {
      console.log('err', JSON.stringify(err));
      Logger.error(err, 'setDiscountCode');
      return {
        title: title ?? null,
        percentage: percentage?.toString() ?? null,
        priceRuleId: id ?? null,
      };
    }
  }

  async setAutomaticDiscountCode(
    shop: string,
    action: string,
    session: Session,
    title?: string,
    percentage?: number,
    collectionIds?: string[],
    oldcollectionIds?: string[],
    starts?: Date,
    ends?: Date,
    id?: string,
  ) {
    try {
      // if (percentage) {
      console.log({ title });
      // console.log({ percentage });
      const client = await this.client(session);
      let automaticDiscount: any;

      if (action === 'Create')
        automaticDiscount = await client.query({
          data: {
            query: `mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
            discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
              automaticDiscountNode {
                id,
                automaticDiscount {
                  ... on DiscountAutomaticBasic {
                    title
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                      }
                  }
                }
                
                }
              }
              userErrors {
                field
                message
              }
            }
          }`,
            variables: {
              automaticBasicDiscount: {
                combinesWith: {
                  productDiscounts: true,
                },
                customerGets: {
                  items: {
                    collections: {
                      add: collectionIds,
                    },
                  },
                  value: {
                    percentage: parseFloat((percentage / 100).toString()),
                  },
                },
                minimumRequirement: {
                  quantity: {
                    greaterThanOrEqualToQuantity: '1',
                  },
                },
                startsAt: starts,
                title: title,
              },
            },
          },
        });
      else {
        // console.log('inside update option');
        let variables: any = { id };
        if (percentage && collectionIds && oldcollectionIds) {
          variables = {
            id,
            automaticBasicDiscount: {
              customerGets: {
                value: {
                  percentage: parseFloat((percentage / 100).toString()),
                },
                items: {
                  collections: {
                    add: collectionIds,
                    remove: oldcollectionIds,
                  },
                },
              },
            },
          };
        } else if (percentage) {
          variables = {
            id,
            automaticBasicDiscount: {
              customerGets: {
                value: {
                  percentage: parseFloat((percentage / 100).toString()),
                },
              },
            },
          };
        } else if (collectionIds && oldcollectionIds) {
          variables = {
            id,
            automaticBasicDiscount: {
              customerGets: {
                items: {
                  collections: {
                    add: collectionIds,
                    remove: oldcollectionIds,
                  },
                },
              },
            },
          };
        } else {
          variables = {
            id,
            automaticBasicDiscount: {
              startsAt: starts,
              endsAt: ends,
            },
          };
        }

        automaticDiscount = await client.query({
          data: {
            query: `mutation discountAutomaticBasicUpdate($automaticBasicDiscount: DiscountAutomaticBasicInput!, $id: ID!) {
              discountAutomaticBasicUpdate(automaticBasicDiscount: $automaticBasicDiscount, id: $id) {
                automaticDiscountNode {
                  id,
                  automaticDiscount {
                    ... on DiscountAutomaticBasic {
                      title
                      customerGets {
                        value {
                          ... on DiscountPercentage {
                            percentage
                          }
                        }
                    }
                  }
                  
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
            variables,
          },
        });
      }
      const {
        [`discountAutomaticBasic${action}`]: {
          automaticDiscountNode: {
            id: priceRuleId,
            automaticDiscount: {
              title: title1,
              customerGets: {
                value: { percentage: percentage1 },
              },
            },
          },
        },
      } = automaticDiscount.body['data'];
      return {
        title: title ?? title1,
        percentage: (percentage1 * 100).toFixed(0)?.toString(),
        priceRuleId: priceRuleId,
      };
    } catch (err) {
      console.log(err.message);
      Logger.error(err, ShopifyService.name);
    }
  }

  async addTagsToOrder(
    shop: string,
    session: Session,
    tags: string[],
    note: string,
    id: string,
  ) {
    // console.log({ tags });
    try {
      const client = await this.client(session);

      let variables: any = { id };

      if (tags.length) {
        variables = {
          input: {
            tags,
            note,
            id,
          },
        };
      } else {
        variables = {
          input: {
            note,
            id,
          },
        };
      }

      const res = await client.query({
        data: {
          query: `mutation updateOrderMetafields($input: OrderInput!) {
            orderUpdate(input: $input) {
              order {
                id
                tags
              }
              userErrors {
                message
                field
              }
            }
          }
          `,
          variables,
        },
      });
      // console.log('res', JSON.stringify(res));
      // const {
      //   [`orderUpdate`]: {
      //     order: { id: orderId, tags: updatedTags },
      //     userErrors,
      //   },
      // } = res.body['data'];
      // console.log('orderId', orderId);
      // console.log('updatedTags', updatedTags);
      // console.log('userErrors', userErrors);
    } catch (err) {
      console.log('err', JSON.stringify(err));
      Logger.error(err, 'addTagsToOrder');
    }
  }

  async scriptTagRegister(src: string, scope?: string) {
    try {
      const client = await this.client(this.session);
      const scriptTag = await client.query({
        data: {
          query: `mutation scriptTagCreate($input: ScriptTagInput!) {
              scriptTagCreate(input: $input) {
                scriptTag {
                  cache
                  createdAt
                  displayScope
                  id
                  src 
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
          variables: {
            input: {
              cache:
                this.configService.get('SHOPIFYCACHE') === 'true'
                  ? true
                  : false,
              displayScope: scope ?? 'ONLINE_STORE',
              src: `${this.configService.get('HOST')}/public/${src}`,
            },
          },
        },
      });
      console.log('-------------Register scriptTag');
      console.log(JSON.stringify(scriptTag));
      if (scriptTag.body['data']['scriptTagCreate'])
        return scriptTag.body['data']['scriptTagCreate']['scriptTag'];
      else
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: JSON.stringify(scriptTag),
          },
          HttpStatus.FORBIDDEN,
        );
    } catch (err) {
      console.log(err.message);
      Logger.error(err, ShopifyService.name);
    }
  }

  async scriptTagList() {
    try {
      const client = await this.client(this.session);
      const scriptTag = await client.query({
        data: {
          query: `{
            scriptTags(first: 15, reverse: true) {
              edges {
                node {
                  id
                  src
                  displayScope
                  createdAt
                }
              }
            }
          }`,
        },
      });
      console.log('-------------list scriptTag');
      console.log(JSON.stringify(scriptTag));
      return scriptTag;
    } catch (err) {
      console.log(err.message);
      Logger.error(err, ShopifyService.name);
    }
  }

  async scriptTagDelete(sid: any) {
    try {
      console.log({ sid });
      console.log(this.shop);
      const client = await this.client(this.session);
      const scriptTagDel = await client.query({
        data: {
          query: `mutation scriptTagDelete($id: ID!) {
            scriptTagDelete(id: $id) {
              deletedScriptTagId
              userErrors {
                field
                message
              }
            }
          }`,
          variables: {
            // input: {
            id: sid,
            // },
          },
        },
      });
      console.log('🚀 ~  scriptTagDel', JSON.stringify(scriptTagDel));
      return scriptTagDel;
      // console.log('-------------list scriptTag');

      // if (scriptTag.body['data']['scriptTagCreate'])
      //   return scriptTag.body['data']['scriptTagCreate']['scriptTag'];
      // else
      //   throw new HttpException(
      //     {
      //       status: HttpStatus.FORBIDDEN,
      //       error: JSON.stringify(scriptTag),
      //     },
      //     HttpStatus.FORBIDDEN,
      //   );
    } catch (err) {
      console.log(err.message);
      Logger.error(err, ShopifyService.name);
    }
  }

  async AppSubscriptionCreate(trialDays: number) {
    try {
      const client = await this.client(this.session);
      const AppSubscriptionCreate = await client.query({
        data: {
          query: `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean, $trialDays:Int){
            appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test:$test, trialDays:$trialDays) {
              userErrors {
                field
                message
              }
              appSubscription {
                id
                lineItems {
                  id
                  plan {
                    pricingDetails
                    __typename
                  }
                }
              }
              confirmationUrl
            }
          }`,
          variables: {
            name: `Explore (free for ${trialDays} days) + Cashback charge`,
            returnUrl: `${this.configService.get('FRONT')}/${
              this.shop.split('.')[0]
            }/overview`,
            test:
              this.configService.get('BILLING_LIVE') === 'true' ? false : true,
            trialDays,
            lineItems: [
              {
                plan: {
                  appUsagePricingDetails: {
                    terms: 'Groupshop Usage Charge Detail',
                    cappedAmount: {
                      amount: 2000.0,
                      currencyCode: 'USD',
                    },
                  },
                },
              },
            ],
          },
        },
      });
      Logger.debug(AppSubscriptionCreate, 'Response-AppSubscriptionCreate');
      if (AppSubscriptionCreate.body['data']['appSubscriptionCreate'])
        return AppSubscriptionCreate.body['data']['appSubscriptionCreate'];
    } catch (err) {
      // console.log(err.message);
      Logger.error(err, 'AppSubscriptionCreate');
    }
  }

  async appUsageRecordCreate(
    subscriptionLineItemId: string,
    amount: number,
    description: string,
  ) {
    try {
      const client = await this.client(this.session);
      const AppUsageRecordCreate = await client.query({
        data: {
          query: `mutation appUsageRecordCreate($description: String!, $price: MoneyInput!, $subscriptionLineItemId: ID!) {
            appUsageRecordCreate(description: $description, price: $price, subscriptionLineItemId: $subscriptionLineItemId) {
              userErrors {
                field
                message
              }
              appUsageRecord {
                id
              }
            }
          }`,
          variables: {
            subscriptionLineItemId,
            price: {
              amount,
              currencyCode: 'USD',
            },
            description,
          },
        },
      });
      Logger.debug(AppUsageRecordCreate, 'Response-AppUsageRecordCreate');
      // if (
      //   AppUsageRecordCreate.body['data']['appUsageRecordCreate'][
      //     'appUsageRecord'
      //   ]
      // ) {
      //   console.log('inside');
      return AppUsageRecordCreate.body['data']['appUsageRecordCreate'][
        'appUsageRecord'
      ];
      // } else
      //   return {
      //    appUsageRecordCreate: { appUsageRecord: false },
      //   };
    } catch (err) {
      // console.log(err.message);
      Logger.error(err, 'AppUsageRecordCreate');
    }
  }

  async getCustomerByEmail(session, email: string) {
    try {
      const client = await this.client(session);
      const cdetail = await client.query({
        data: {
          query: `{
            customers(first: 1, query:"${email}") {
              edges {
                node {
                  id
                  lastName                 
                  firstName
                  email                     
                }
              }
            }
          }`,
        },
      });
      // console.log({ cdetail });
      Logger.debug(cdetail, ShopifyService.name);
      return cdetail;
    } catch (err) {
      console.log(err.message);
      Logger.error(err, ShopifyService.name);
    }
  }

  async getLocationsByVariantIds(
    shop: string,
    ids: string[],
    session: Session,
  ) {
    try {
      const client = await this.client(session);
      const subQueries = ids?.map(
        (id, index) =>
          `productVariant${
            index + 1
          }: productVariant(id: "${id}") { inventoryItem { inventoryLevels(first: 1) { edges { node { location { id } } } } } }\n`,
      );

      const ldetail = await client.query({
        data: {
          query: `{
            ${subQueries.map((sq) => sq)}
          }`,
        },
      });
      // console.log({ ldetail });
      Logger.debug(ldetail, ShopifyService.name);
      const arr = Object.values(ldetail.body['data']);
      const locations = arr.map(
        (item) =>
          item['inventoryItem']['inventoryLevels']['edges'][0]['node'][
            'location'
          ]['id'],
      );
      return locations;
    } catch (err) {
      console.log(err.response.errors);
      Logger.error(err, ShopifyService.name);
    }
  }
}
