import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoManager, Like, MongoRepository } from 'typeorm';
import { CreateStoreInput } from './dto/create-store.input';
import { UpdateStoreInput } from './dto/update-store.input';
import Store, { CollectionsToUpdate } from './entities/store.model';
import { v4 as uuid } from 'uuid';
import {
  CodeUpdateStatusTypeEnum,
  CollectionUpdateEnum,
  Resource,
} from './entities/store.entity';
// import { ShopifyService } from 'src/shopify-store/shopify/shopify.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { Product } from 'src/inventory/entities/product.entity';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { DropsCollectionUpdatedEvent } from 'src/drops-groupshop/events/drops-collection-update.event';
import { SearchIndexingRefreshEvent } from 'src/inventory/events/searchIndexing-refresh.event';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storeRepository: MongoRepository<Store>,
    // private shopifyapi: ShopifyService,
    @Inject(forwardRef(() => DropsGroupshopService))
    @Inject(forwardRef(() => InventoryService))
    private dropsService: DropsGroupshopService,
    private dropsCollectionUpdatedEvent: DropsCollectionUpdatedEvent,
    private inventoryService: InventoryService,
    public searchIndexingRefreshEvent: SearchIndexingRefreshEvent,
  ) {}

  static formatSpotlightDiscountTitle(name: string) {
    return `GSL${name}`;
  }

  create(createStoreInput: CreateStoreInput): Promise<Store> {
    const id = uuid();
    const store = this.storeRepository.create({ id, ...createStoreInput });
    return this.storeRepository.save(store);
  }

  async createORupdate(createStoreInput: UpdateStoreInput): Promise<Store> {
    const { id } = createStoreInput;
    console.log(
      '🚀 ~ file: stores.service.ts ~ line 23 ~ StoresService ~ createORupdate ~ id',
      id,
    );
    // return await this.inventoryRepository.update({ id }, updateInvenotryInput);
    // return await this.inventoryRepository.save(updateInvenotryInput);

    const sid = id ?? uuid();
    console.log(
      '🚀 ~ file: stores.service.ts ~ line 31 ~ StoresService ~ createORupdate ~ sid',
      sid,
    );

    const dates = sid
      ? { createdAt: new Date(), updatedAt: new Date() }
      : { updatedAt: new Date() };
    const manager = getMongoManager();
    try {
      await manager.updateOne(
        Store,
        { id },
        { $set: { id: sid, ...createStoreInput, ...dates } },
        {
          upsert: true,
        },
      );
      return this.findById(sid);
    } catch (err) {
      console.log(err);
    }
  }

  findAll() {
    return this.storeRepository.find();
  }

  findActiveAll() {
    return this.storeRepository.find({ where: { status: 'Active' } });
  }
  findWithCollectionUpdate() {
    return this.storeRepository.find({
      where: { collectionsToUpdate: { $exists: true }, status: 'Active' },
    });
  }

  async findById(id: string) {
    return this.storeRepository.findOne({ where: { id } });
  }

  findOne(shop: string) {
    return this.storeRepository.findOne({ where: { shop } });
  }

  async findOneWithCampaings(shop: string) {
    const manager = getMongoManager();
    const agg = [
      {
        $match: {
          shop: {
            $regex: `^${shop}*`,
          },
        },
      },
      {
        $lookup: {
          from: 'campaign',
          localField: 'id',
          foreignField: 'storeId',
          as: 'campaigns',
        },
      },
    ];
    const res = await manager.aggregate(Store, agg).toArray();
    console.log(
      '🚀 ~ file: stores.service.ts ~ line 69 ~ StoresService ~ findOneByName ~ res',
      res[0],
    );
    if (typeof res[0]?.industry === 'string') {
      return { ...res[0], industry: [res[0].industry] };
    } else {
      return { ...res[0] };
    }
  }

  async findOneByName(shop: string) {
    const result = await this.storeRepository.findOne({
      where: {
        shop: { $regex: `^${shop}*` },
      },
    });
    console.log(JSON.stringify(result));
    if (typeof result?.industry === 'string') {
      return { ...result, industry: [result?.industry] };
    } else {
      return result;
    }
  }

  async findDropStore() {
    const manager = getMongoManager();
    const agg = [
      {
        $match: {
          'drops.klaviyo.publicKey': {
            $ne: null,
          },
          'drops.status': 'Active',
        },
      },
    ];
    const res = await manager.aggregate(Store, agg).toArray();
    return res;
  }

  async findOneById(id: string) {
    return await this.storeRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async update(id: string, updateStoreInput: UpdateStoreInput) {
    try {
      if (updateStoreInput?.settings?.layout?.bannerDesign) {
        const bannerDesi = updateStoreInput?.settings?.layout?.bannerDesign;
        if (bannerDesi === '002') {
          updateStoreInput.settings.layout.bannerColor = '#F2F2F1';
        } else if (bannerDesi === '003') {
          updateStoreInput.settings.layout.bannerColor = '#000000';
        } else if (bannerDesi === '004') {
          updateStoreInput.settings.layout.bannerColor = '#FFFFFF';
        } else if (bannerDesi === '101') {
          updateStoreInput.settings.layout.bannerColor = '#FFFFFF';
        } else if (bannerDesi === '102') {
          updateStoreInput.settings.layout.bannerColor = '#171717';
        } else if (bannerDesi === '103') {
          updateStoreInput.settings.layout.bannerColor = '#D3DEDC';
        } else if (bannerDesi === '104') {
          updateStoreInput.settings.layout.bannerColor =
            updateStoreInput?.settings?.layout?.bannerCustomColor;
        } else {
          updateStoreInput.settings.layout.bannerColor = '#EEFF5C';
        }
      }
      const oldValue = await this.findById(updateStoreInput.id);
      if (updateStoreInput?.activity === 'Cart Rewards Management') {
        let operation;
        if (
          updateStoreInput.drops.cartRewards.length >
          oldValue?.drops?.cartRewards?.length
        ) {
          operation = 'CREATE';
        } else if (
          updateStoreInput.drops.cartRewards.length <
          oldValue?.drops?.cartRewards?.length
        ) {
          operation = 'REMOVE';
        } else {
          operation = 'UPDATE';
        }

        Logger.log(
          '/drops',
          'Cart Rewards Management',
          false,
          operation,
          operation === 'CREATE'
            ? Object.values({
                result:
                  updateStoreInput.drops.cartRewards[
                    updateStoreInput.drops.cartRewards.length - 1
                  ],
              })
            : updateStoreInput.drops.cartRewards,
          updateStoreInput.userId,
          oldValue?.drops?.cartRewards,
          updateStoreInput.id,
        );
      } else {
        Logger.log(
          '/drops',
          'Drops Milestone Management',
          false,
          'UPDATE',
          updateStoreInput,
          updateStoreInput.userId,
          oldValue,
          updateStoreInput.id,
        );

        const { shop } = await this.storeRepository.findOne({
          where: {
            id: updateStoreInput.id,
          },
        });
        // create event for Search Indexing
        this.searchIndexingRefreshEvent.shopName = shop;
        this.searchIndexingRefreshEvent.emit();
      }

      await this.storeRepository.update({ id }, updateStoreInput);
    } catch (err) {
      console.log(err, StoresService.name);
      Logger.error(err, StoresService.name);
    }
    return await this.findOneById(id);
  }

  async updateStore(id: string, updateStoreInput: UpdateStoreInput) {
    await this.storeRepository.update({ id }, updateStoreInput);
    return await this.findOneById(id);
  }
  async updateCustom(shop: string, deletedCollectionIds: any[]) {
    const manager = getMongoManager();
    return manager.updateOne(
      Store,
      { shop },
      {
        $pull: {
          collectionsToUpdate: { collectionId: { $in: deletedCollectionIds } },
        } as any,
        $set: { collectionUpdateStatus: CollectionUpdateEnum.COMPLETE },
      },
    );
  }

  async updateCollectionToSync(
    id: string,
    updateStoreInput: CollectionsToUpdate,
  ) {
    const manager = getMongoManager();
    manager.updateOne(Store, { id }, {
      $push: { collectionsToUpdate: updateStoreInput },
    } as any);
  }

  async updateCollectionDate(collectionId: string, date: Date) {
    const manager = getMongoManager();
    const repository = manager.getMongoRepository(Store);
    await repository.updateOne(
      { 'collectionsToUpdate.collectionId': collectionId },
      { $set: { 'collectionsToUpdate.$.updatedAt': date } },
    );
  }

  async removeSyncedCollection(collectionId: string, storeId: string) {
    const manager = getMongoManager();
    const repository = manager.getMongoRepository(Store);
    await repository.updateOne({ id: storeId }, {
      $pull: { collectionsToUpdate: { collectionId: collectionId } },
    } as any);
  }

  async checkUpdatedCollection(id: string, flag: boolean, storeId: string) {
    const agg = [
      {
        $match: {
          id: storeId,
        },
      },
      {
        $addFields: {
          collections: {
            $filter: {
              input: '$collectionsToUpdate',
              as: 'cat',
              cond: {
                $and: [
                  {
                    $eq: ['$$cat.isSynced', flag],
                  },
                  {
                    $eq: ['$$cat.collectionId', id],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          collections: 1,
        },
      },
    ];
    const manager = getMongoManager();
    return await manager.aggregate(Store, agg).toArray();
  }

  async updateField(criteria: any, updateLiteral: any) {
    const manager = getMongoManager();
    manager.updateOne(Store, criteria, {
      $set: { ...updateLiteral, updatedAt: new Date() },
    });
  }

  async updateResource(shop: string, resource: Resource) {
    // console.log('🚀 ~ ~ shop', shop);
    // console.log('🚀 ~ ~ resource', resource);
    try {
      const manager = getMongoManager();
      await manager.updateOne(Store, { shop }, {
        $push: { resources: resource },
      } as any);

      return true;
    } catch (err) {
      Logger.error(err, StoresService.name);
      return false;
    }
  }
  remove(id: string) {
    return this.storeRepository.delete({ id });
  }

  async removeShop(shop: string) {
    return await this.storeRepository.delete({ shop });
  }

  isExist(shop: string) {
    return this.storeRepository.findOne({ where: { shop } });
  }

  async findOneWithActiveCampaing(shop: string): Promise<Store> {
    const manager = getMongoManager();
    const agg = [
      {
        $match: {
          shop: {
            $regex: shop,
          },
        },
      },
      {
        $lookup: {
          from: 'campaign',
          let: {
            store_id: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$storeId', '$$store_id'],
                    },
                    {
                      $eq: ['$isActive', true],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                'campaign.createdAt': -1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: 'activeCampaign',
        },
      },
      {
        $unwind: {
          path: '$activeCampaign',
        },
      },
    ];
    const res = await manager.aggregate(Store, agg).toArray();
    // console.log(
    //   '🚀 ~ file: stores.service.ts ~ line 69 ~ StoresService ~ findOneByName ~ res',
    //   res,
    // );
    // const salesTarget = res[0].salesTarget[0].salesTargets[0];
    return { ...res[0] };
  }

  async findOneWithActiveCampaingProducts(shop: string): Promise<Store> {
    const manager = getMongoManager();
    const agg = [
      {
        $match: {
          shop: {
            $regex: shop,
          },
        },
      },
      {
        $lookup: {
          from: 'campaign',
          let: {
            store_id: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$storeId', '$$store_id'],
                    },
                    {
                      $eq: ['$isActive', true],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                'campaign.createdAt': -1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: 'activeCampaign',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'activeCampaign.products',
          foreignField: 'id',
          as: 'allProducts',
        },
      },
      {
        $unwind: {
          path: '$activeCampaign',
        },
      },
    ];
    const res = await manager.aggregate(Store, agg).toArray();
    // console.log(
    //   '🚀 ~ file: stores.service.ts ~ line 69 ~ StoresService ~ findOneByName ~ res',
    //   res,
    // );
    // const salesTarget = res[0].salesTarget[0].salesTargets[0];
    return { ...res[0] };
  }

  async findOneWithActiveCampaignByStoreId(storeId: string) {
    const manager = getMongoManager();
    const agg = [
      {
        $match: {
          id: storeId,
        },
      },
      {
        $lookup: {
          from: 'campaign',
          let: {
            store_id: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$storeId', '$$store_id'],
                    },
                    {
                      $eq: ['$isActive', true],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                'campaign.createdAt': -1,
              },
            },
          ],
          as: 'activeCampaign',
        },
      },
    ];
    const res = await manager.aggregate(Store, agg).toArray();
    // console.log(
    //   '🚀 ~ file: stores.service.ts ~ line 69 ~ StoresService ~ findOneByName ~ res',
    //   res,
    // );
    // const salesTarget = res[0].salesTarget[0].salesTargets[0];
    return { ...res[0] };
  }

  async updateRecentGS(gs: any) {
    try {
      const manager = getMongoManager();
      await manager.updateOne(
        Store,
        { id: gs.storeId },
        { $set: { recentgs: gs.id } },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async updateDiscoveryTool(storeId: any, updateDiscoveryTool: any) {
    const oldValue = await this.findById(updateDiscoveryTool.id);
    const activityLog = [];
    let newVaue = updateDiscoveryTool?.discoveryTool;
    let operation = 'CREATE';
    if (
      oldValue?.discoveryTool?.matchingBrandName.length ===
      updateDiscoveryTool.discoveryTool.matchingBrandName.length
    ) {
      operation = 'UPDATE';
      newVaue = updateDiscoveryTool?.discoveryTool;
    } else if (
      updateDiscoveryTool.discoveryTool.matchingBrandName.length >
      oldValue?.discoveryTool?.matchingBrandName.length
    ) {
      operation = 'CREATE';
      activityLog.push({
        status: updateDiscoveryTool?.discoveryTool.status,
        id: updateDiscoveryTool?.discoveryTool.matchingBrandName[
          updateDiscoveryTool?.discoveryTool.matchingBrandName.length - 1
        ]['id'],
        brandName:
          updateDiscoveryTool?.discoveryTool.matchingBrandName[
            updateDiscoveryTool?.discoveryTool.matchingBrandName.length - 1
          ]['brandName'],
      });
      newVaue = activityLog;
    } else {
      operation = 'REMOVE';
      newVaue = updateDiscoveryTool?.discoveryTool;
    }

    await this.storeRepository.update(
      { id: updateDiscoveryTool.id },
      updateDiscoveryTool,
    );

    Logger.log(
      '/discoverytools',
      updateDiscoveryTool.activity,
      false,
      operation,
      newVaue,
      updateDiscoveryTool.userId,
      oldValue?.discoveryTool,
      updateDiscoveryTool.id,
    );
    return await this.findOneById(updateDiscoveryTool.id);
  }

  async removeDiscoveryToolsInStoreName(storeId: string) {
    const stores = await this.storeRepository.find();

    const bulkwrite = stores.map((store) => {
      return {
        updateOne: {
          filter: { id: store.id },
          update: {
            $set: {
              discoveryTool: {
                status: store.discoveryTool.status,
                matchingBrandName: store.discoveryTool.matchingBrandName.filter(
                  (storematching) => storematching.id !== storeId,
                ),
              },
            },
          },
        },
      };
    });

    try {
      const manager = getMongoManager();
      return await manager.bulkWrite(Store, bulkwrite);
    } catch (error) {
      console.error(error);
    }
  }

  async findMatchingGS(storeId: string[]) {
    const agg = [
      {
        $match: {
          id: {
            $in: storeId,
          },
        },
      },
      {
        $lookup: {
          from: 'groupshops',
          localField: 'recentgs',
          foreignField: 'id',
          as: 'groupshops',
        },
      },
      {
        $unwind: {
          path: '$groupshops',
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'groupshops.members.orderId',
          foreignField: 'parentId',
          as: 'lineItemsDetails',
        },
      },
      {
        $addFields: {
          lineItemsDetails: {
            $filter: {
              input: '$lineItemsDetails',
              as: 'j',
              cond: {
                $and: [
                  {
                    $gte: ['$$j.price', '1.01'],
                  },
                  {
                    $not: {
                      $in: ['$$j.product.id', '$hideProducts'],
                    },
                  },
                  {
                    $ne: ['$$j.product', null],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'lineItemsDetails.product.id',
          foreignField: 'id',
          as: 'popularProducts',
        },
      },
      {
        $lookup: {
          from: 'campaign',
          localField: 'groupshops.campaignId',
          foreignField: 'id',
          as: 'campaign',
        },
      },
      {
        $unwind: {
          path: '$campaign',
        },
      },
      {
        $addFields: {
          members: {
            $map: {
              input: '$groupshops.members',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    lineItems: {
                      $filter: {
                        input: '$lineItemsDetails',
                        as: 'j',
                        cond: {
                          $eq: ['$$this.orderId', '$$j.parentId'],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'members.orderId',
          foreignField: 'id',
          as: 'orderDetails',
        },
      },
      {
        $addFields: {
          members: {
            $map: {
              input: '$members',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    orderDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$orderDetails',
                            as: 'j',
                            cond: {
                              $and: [
                                {
                                  $eq: ['$$this.orderId', '$$j.id'],
                                },
                                {
                                  $not: {
                                    $in: [
                                      '$$this.lineItemsDetails.product.id',
                                      '$hideProducts',
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  {
                    products: {
                      $map: {
                        input: '$$this.lineItems',
                        in: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$popularProducts',
                                as: 'j',
                                cond: {
                                  $eq: ['$$this.product.id', '$$j.id'],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          popularProducts: {
            $map: {
              input: '$popularProducts',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    lineItems: {
                      $filter: {
                        input: '$lineItemsDetails',
                        as: 'j',
                        cond: {
                          $eq: ['$$this.id', '$$j.product.id'],
                        },
                      },
                    },
                  },
                  {
                    orders: {
                      $filter: {
                        input: '$lineItemsDetails',
                        as: 'j',
                        cond: {
                          $eq: ['$$this.id', '$$j.product.id'],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'campaign.products',
          foreignField: 'id',
          as: 'campaignProducts',
        },
      },
      {
        $addFields: {
          campaignProducts: {
            $filter: {
              input: '$campaignProducts',
              as: 'j',
              cond: {
                $and: [
                  {
                    $gte: ['$$j.price', '1.01'],
                  },
                  {
                    $not: {
                      $in: ['$$j.id', '$hideProducts'],
                    },
                  },
                  {
                    $eq: ['$$j.status', 'ACTIVE'],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'groupshops.dealProducts.productId',
          foreignField: 'id',
          as: 'dealsProducts',
        },
      },
      {
        $addFields: {
          dealsProducts: {
            $filter: {
              input: '$dealsProducts',
              as: 'j',
              cond: {
                $and: [
                  {
                    $gte: ['$$j.price', '1.01'],
                  },
                  {
                    $not: {
                      $in: ['$$j.id', '$hideProducts'],
                    },
                  },
                  {
                    $eq: ['$$j.status', 'ACTIVE'],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          bestSeller: {
            $filter: {
              input: '$campaignProducts',
              as: 'j',
              cond: {
                $gte: ['$$j.purchaseCount', 1],
              },
            },
          },
        },
      },
    ];
    const manager = getMongoManager();
    const storeWithGS = await manager.aggregate(Store, agg).toArray();
    return storeWithGS;
  }

  async loadRecentGS() {
    const agg = [
      {
        $lookup: {
          from: 'groupshops',
          let: { recentgs: '$id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$storeId', '$$recentgs'] }],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: 'recentgs',
        },
      },
      {
        $unwind: {
          path: '$recentgs',
        },
      },
      {
        $addFields: {
          recentgs: '$recentgs.id',
        },
      },
    ];
    const manager = getMongoManager();
    const updateRecentGS = await manager.aggregate(Store, agg).toArray();
    for (let i = 0; i < updateRecentGS.length; i++) {
      await manager.updateOne(
        Store,
        { id: updateRecentGS[i].id },
        { $set: { recentgs: updateRecentGS[i].recentgs } },
      );
    }
    return updateRecentGS;
  }

  async createspotlightDiscount(storeId: string) {
    const {
      shop,
      accessToken,
      _id,
      drops: {
        spotlightDiscount: { percentage },
        spotlightColletionId,
      },
    } = await this.findById(storeId);
    // const spotlightProducts =
    //   await this.inventoryService.getProductsByCollectionIDs(shop, [
    //     spotlightColletionId,
    //   ], false);

    // const discountCode = await this.shopifyapi.setAutomaticDiscountCode(
    //   shop,
    //   'Create',
    //   accessToken,
    //   StoresService.formatSpotlightDiscountTitle(_id),
    //   parseInt(percentage, 10),
    //   [spotlightColletionId],
    //   null,
    //   new Date(),
    // );

    // For Update

    // const discountCode = await this.shopifyapi.setAutomaticDiscountCode(
    //   shop,
    //   'Update',
    //   accessToken,
    //   StoresService.formatSpotlightDiscountTitle(_id),
    //   null, // percentage update parseInt(percentage, 10)
    //   ['gid://shopify/Collection/238360985766'], // new collection id
    //   ['gid://shopify/Collection/238356332710'], // old collection id
    //   null,
    //   null,
    //   'gid://shopify/DiscountAutomaticNode/1396298088614', // id is neccesarry for update
    // );
    // return discountCode;
  }

  async getUpdateDiscountStatus(storeId: string) {
    const {
      drops: { codeUpdateStatus, lastSync, dropsCount },
    } = await this.findById(storeId);
    return { codeUpdateStatus, lastSync, dropsCount };
  }

  async getUpdateCollectionStatus(storeId: string) {
    const { collectionUpdateStatus } = await this.findById(storeId);
    if (collectionUpdateStatus) {
      return { collectionUpdateStatus };
    } else {
      return { collectionUpdateStatus: CollectionUpdateEnum.COMPLETE };
    }
  }
}
