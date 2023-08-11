import { Inject, forwardRef, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generatesecondaryCount } from 'src/utils/functions';
import { getMongoManager, MongoRepository } from 'typeorm';
import { CreateInventoryInput } from './dto/create-inventory.input';
import { ProductQueryInput } from './dto/product-query.input';
import { UpdateInventoryInput } from './dto/update-inventory.input';
import Inventory from './entities/inventory.modal';
import { ProductVariant } from './entities/product.entity';
import { StoresService } from 'src/stores/stores.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { HttpService } from '@nestjs/axios';
import { log } from 'console';
import readJsonLines from 'read-json-lines-sync';
import { RecordType } from 'src/utils/constant';
import { Document } from 'flexsearch';
import * as fs from 'fs';
import { CollectionUpdateEnum } from 'src/stores/entities/store.entity';
import { DropsCategoryService } from 'src/drops-category/drops-category.service';
import { PaginationService } from 'src/utils/pagination.service';
import { ConfigService } from '@nestjs/config';
import { DropsCategory } from 'src/drops-category/entities/drops-category.entity';

const options = {
  tokenize: function (str) {
    return str.split(/\s-\//g);
  },
  optimize: true,
  resolution: 9,
  id: 'id',
  index: [
    {
      field: 'title',
      tokenize: 'forward',
    },
    {
      field: 'collection',
      tokenize: 'forward',
    },
    {
      field: 'description',
      tokenize: 'strict',
      resolution: 5,
      minlength: 3,
      context: {
        depth: 1,
        resolution: 3,
      },
    },
    {
      field: 'tags[]',
    },
  ],
};

const searchIndexPath = './src/utils/searchIndexes/';

@Injectable()
export class InventoryService {
  private inventoryManager: any;
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: MongoRepository<Inventory>, // private inventoryManager: EntityManager,
    @Inject(forwardRef(() => StoresService))
    private storeService: StoresService,
    private shopifyService: ShopifyService,
    @Inject(forwardRef(() => DropsCategoryService))
    private dropsCategoryService: DropsCategoryService,
    private httpService: HttpService,
    private paginateService: PaginationService,
    private configService: ConfigService,
  ) {
    // // this.inventoryManager = getMongoManager();
    // // this.inventoryManager = getMongoManager();
  }

  async create(createInventoryInput: CreateInventoryInput): Promise<Inventory> {
    try {
      // console.log(
      //   '🚀 ~ file: inventory.service.ts ~ line 21 ~ InventoryService ~ create ~ CreateInventoryInput',
      //   createInventoryInput,
      // );
      const inventory = this.inventoryRepository.create(createInventoryInput);
      // console.log(
      //   '🚀 ~ file: inventory.service.ts:26 ~ InventoryService ~ create ~ inventory',
      //   inventory,
      // );
      if (createInventoryInput.recordType === 'ProductVariant') {
        inventory.selectedOptions = [...createInventoryInput.selectedOptions];
        inventory.image = createInventoryInput.image ?? null;
      }

      return await this.inventoryRepository.save(inventory);
    } catch (error) {
      Logger.error(error, InventoryService.name);
      console.log(error);
    }
  }

  async update(updateInvenotryInput: UpdateInventoryInput) {
    const { id } = updateInvenotryInput;
    // await this.remove(id);
    // return await this.inventoryRepository.update({ id }, updateInvenotryInput);
    // return await this.inventoryRepository.save(updateInvenotryInput);
    // const manager = getMongoManager();
    try {
      return await this.inventoryRepository.updateOne(
        { id },
        { $set: { ...updateInvenotryInput } },
        {
          upsert: true,
        },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async updateInventory(id: string, dif: number, field: string) {
    // const manager = getMongoManager();
    // console.log('updateInventory', id, dif, field, 'updateInventory');

    try {
      return await this.inventoryRepository.findOneAndUpdate(
        { id },
        { $inc: { [field]: dif } },
      );
    } catch (err) {
      console.log(err, 'updateInventory err');
    }
  }

  async updateProduct(id: string, updatedfields: any) {
    // const manager = getMongoManager();
    console.log('updateInventory', id, updatedfields);

    try {
      return await this.inventoryRepository.findOneAndUpdate(
        { id },
        // { ...updatedfields },
        { $set: { ...updatedfields } },
      );
    } catch (err) {
      console.log(err, 'updateInventory err');
    }
  }

  async remove(id: string) {
    Logger.warn(
      `product ${id} is removed from database`,
      InventoryService.name,
    );
    console.log(
      '%c ',
      'font-size: 1px; padding: 240px 123.5px; background-size: 247px 480px; background: no-repeat url(https://i2.wp.com/i.giphy.com/media/11ZSwQNWba4YF2/giphy-downsized.gif?w=770&amp;ssl=1);',
      id,
    );
    // this.inventoryManager = getMongoManager();
    return await this.inventoryManager.deleteMany(Inventory, {
      $or: [{ id: { $regex: id } }, { parentId: { $regex: id } }],
    });
  }

  async removeChildren(id: string) {
    console.log(id, 'remove children');
    // this.inventoryManager = getMongoManager();

    return await this.inventoryManager.deleteMany(Inventory, { parentId: id });
  }
  async removeVariants(id: string) {
    console.log(id, 'removevariants');
    // this.inventoryManager = getMongoManager();

    return await this.inventoryRepository.deleteMany({
      $and: [
        { parentId: id },
        {
          $or: [
            { recordType: 'ProductVariant' },
            { recordType: 'ProductImage' },
            { recordType: 'ProductVideo' },
          ],
        },
      ],
    });
  }

  async removeProductCollections(id: string) {
    console.log(id, 'removevariants');
    // this.inventoryManager = getMongoManager();

    return await this.inventoryManager.deleteMany(Inventory, {
      $and: [
        { parentId: id },
        {
          recordType: 'Collection',
        },
      ],
    });
  }

  async removeEntity(id: string, recordType) {
    console.log(id, 'removevariants');
    // this.inventoryManager = getMongoManager();

    return await this.inventoryManager.deleteMany(Inventory, {
      $and: [
        { id: id },
        {
          recordType: recordType,
        },
      ],
    });
  }

  async removeMultiPleEntities(ids: string[], recordType) {
    // this.inventoryManager = getMongoManager();

    return await this.inventoryRepository.deleteMany({
      $and: [
        { id: { $in: ids } },
        {
          recordType: recordType,
        },
      ],
    });
  }

  async removeShop(shop: string) {
    return await this.inventoryRepository.delete({ shop });
  }

  async findTotalProducts(shop: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          $and: [
            {
              shop,
            },
            {
              recordType: 'Product',
            },
            {
              status: 'ACTIVE',
            },
            {
              outofstock: false,
            },
            {
              publishedAt: { $ne: null },
            },
          ],
        },
      },
      {
        $count: 'count',
      },
    ];
    // this.inventoryManager = getMongoManager();

    const tp = await this.inventoryManager.aggregate(Inventory, agg).toArray();
    // console.log(
    //   '🚀 ~ file: inventory.service.ts ~ line 55 ~ InventoryService ~ findTotalProducts ~ tp',
    //   tp,
    // );
    return tp[0];
  }

  async findOne(shop: string, recordType: string) {
    return await this.inventoryRepository.findOne({
      where: {
        shop,
        recordType,
      },
    });
  }

  async findId(id: string): Promise<Inventory> {
    return await this.inventoryRepository.findOne({
      where: {
        id,
      },
    });
  }
  async findStoreCollections(shop: string, withproducts: boolean) {
    // const collections = await manager.distinct(Inventory, 'title', {
    //   shop,
    //   recordType: 'Collection',
    // });
    const query = withproducts
      ? [
          {
            $match: {
              $and: [
                {
                  shop,
                },
                {
                  recordType: 'Collection',
                },
              ],
            },
          },
          {
            $group: {
              _id: {
                id: '$id',
              },
              id: {
                $first: '$id',
              },
              title: {
                $first: '$title',
              },
              productsCount: {
                $first: '$productsCount',
              },
              productslist: {
                $addToSet: '$parentId',
              },
            },
          },
          {
            $lookup: {
              from: 'inventory',
              localField: 'productslist',
              foreignField: 'id',
              as: 'products',
            },
          },
          {
            $addFields: {
              products: {
                $filter: {
                  input: '$products',
                  as: 'j',
                  cond: {
                    $and: [
                      {
                        $ne: ['$$j.publishedAt', null],
                      },
                      {
                        $ne: ['$$j.outofstock', true],
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
            $project: {
              id: 1,
              title: 1,
              products: 1,
              productsCount: {
                $size: '$products',
              },
            },
          },
          {
            $match: {
              productsCount: {
                $gte: 1,
              },
            },
          },
        ]
      : [
          { $match: { $and: [{ shop }, { recordType: 'Collection' }] } },
          {
            $group: {
              _id: { id: '$id' },
              id: { $first: '$id' },
              title: { $first: '$title' },
              productsCount: { $first: '$productsCount' },
              // storefrontId: { $first: '$storefrontId' },
            },
          },
          {
            $match: {
              productsCount: {
                $gte: 1,
              },
            },
          },
        ];

    const collections = await this.inventoryRepository
      .aggregate(query)
      .toArray();

    return collections;
  }

  async findCollectionsWithSyncedStatus(shop: string) {
    const agg = [
      {
        $match: {
          recordType: 'Collection',
          shop,
        },
      },
      {
        $lookup: {
          from: 'store',
          localField: 'shop',
          foreignField: 'shop',
          as: 'store',
        },
      },
      {
        $unwind: {
          path: '$store',
        },
      },
      {
        $lookup: {
          from: 'store',
          localField: 'id',
          foreignField: 'collectionsToUpdate.collectionId',
          as: 'storeCollections',
        },
      },
      {
        $addFields: {
          isSynced: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: '$storeCollections',
                  },
                  0,
                ],
              },
              then: false,
              else: true,
            },
          },
          collectionTitle: {
            $ifNull: ['$title', 'Untitled Collection'],
          },
        },
      },
      {
        $group: {
          _id: {
            collectionId: '$id',
          },
          collectionTitle: {
            $first: '$collectionTitle',
          },
          collectionId: {
            $first: '$id',
          },
          productCount: {
            $first: '$productsCount',
          },
          isSynced: {
            $first: '$isSynced',
          },
          store: {
            $first: '$store',
          },
        },
      },
      {
        $group: {
          _id: null,
          collections: {
            $push: {
              collectionTitle: '$collectionTitle',
              collectionId: '$collectionId',
              productCount: '$productCount',
              isSynced: '$isSynced',
            },
          },
          collectionsToUpdate: {
            $first: '$store.collectionsToUpdate',
          },
        },
      },
      {
        $match: {
          'collections.collectionId': { $exists: true },
        },
      },
      {
        $project: {
          collections: 1,
          collectionsToUpdate: {
            $ifNull: ['$collectionsToUpdate', []],
          },
          _id: 0,
        },
      },
    ];
    return await this.inventoryRepository.aggregate(agg).toArray();
  }

  async findStoreProducts(productQueryInput: ProductQueryInput) {
    const { shop, sort, limit } = productQueryInput;

    const agg = [
      {
        $match: {
          $and: [
            {
              shop,
            },
            {
              recordType: 'Product',
            },
            {
              status: 'ACTIVE',
            },
            {
              outofstock: false,
            },
            {
              publishedAt: { $ne: null },
            },
          ],
        },
      },
      {
        $sort: {
          publishedAt: sort,
        },
      },
      {
        $limit: limit,
      },
    ];
    return await this.inventoryRepository.aggregate(agg).toArray();
  }

  async insertMany(inventory: any[]) {
    // const manager = getMongoManager();

    return await this.inventoryRepository.insertMany(inventory);
  }

  async setPurchaseCount(inventory: any) {
    // console.log(
    //   '🚀 ~ file: inventory.service.ts:320 ~ InventoryService ~ setPurchaseCount ~ inventory',
    //   JSON.stringify(inventory),
    // );
    try {
      // // const manager = getMongoManager();

      return await this.inventoryRepository.bulkWrite(inventory);
    } catch (error) {
      console.error(error);
    }
  }

  async getBestSellerProducts(shop: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          $and: [
            {
              purchaseCount: {
                $gt: 0,
              },
            },
            {
              shop,
            },
            {
              status: 'ACTIVE',
            },
            {
              outofstock: false,
            },
            {
              publishedAt: { $ne: null },
            },
          ],
        },
      },
      {
        $sort: {
          purchaseCount: -1,
        },
      },
      {
        $limit: 80,
      },
    ];
    return await this.inventoryRepository.aggregate(agg).toArray();
  }

  async getCollectionNameByProductId(shop: string, productId: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          $and: [
            {
              shop,
            },
            {
              recordType: 'Collection',
            },
            {
              parentId: productId,
            },
          ],
        },
      },
    ];
    return await this.inventoryRepository.aggregate(agg).toArray();
  }

  async findProductById(id: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          id,
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            pid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$$pid', '$parentId'],
                    },
                    {
                      $eq: ['$recordType', 'ProductVariant'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'variants',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            pid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$$pid', '$parentId'],
                    },
                    {
                      $eq: ['$recordType', 'ProductImage'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'images',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            pid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$$pid', '$parentId'],
                    },
                    {
                      $eq: ['$recordType', 'ProductVideo'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'videos',
        },
      },
    ];
    const res = await this.inventoryRepository.aggregate(agg).toArray();
    // console.log(
    //   '🚀 ~ file: inventory.service.ts ~ line 329 ~ InventoryService ~ findProductById ~ res',
    //   res[0].length,
    //   res[0],
    // );
    // console.log('🎈 res[0]', res[0]);
    return res.length && res[0].status !== 'ACTIVE'
      ? { ...res[0], outofstock: true }
      : res[0];

    // return await manager.aggregate(Inventory, agg).toArray();
  }

  async findPlatformFeeById() {
    const id = this.configService.get('PLATFORM_FEE_ID');
    // // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          id,
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            pid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$$pid', '$parentId'],
                    },
                    {
                      $eq: ['$recordType', 'ProductVariant'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'variants',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            pid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$$pid', '$parentId'],
                    },
                    {
                      $eq: ['$recordType', 'ProductImage'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'images',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            pid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$$pid', '$parentId'],
                    },
                    {
                      $eq: ['$recordType', 'ProductVideo'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'videos',
        },
      },
    ];
    const res = await this.inventoryRepository.aggregate(agg).toArray();
    // console.log(
    //   '🚀 ~ file: inventory.service.ts ~ line 329 ~ InventoryService ~ findProductById ~ res',
    //   res[0].length,
    //   res[0],
    // );
    // console.log('🎈 res[0]', res[0]);
    return res.length && res[0].status !== 'ACTIVE'
      ? { ...res[0], outofstock: true }
      : res[0];

    // return await manager.aggregate(Inventory, agg).toArray();
  }

  // it find all products, variants, collection, images
  async findAllProducts(shop: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          shop,
          recordType: 'Product',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            product_id: '$id',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ['$parentId', '$$product_id'],
                    },
                  },
                  {
                    recordType: 'ProductVariant',
                  },
                ],
              },
            },
          ],
          as: 'variants',
        },
      },
      // {
      //   $lookup: {
      //     from: 'inventory',
      //     let: {
      //       product_id: '$id',
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $and: [
      //             {
      //               $expr: {
      //                 $eq: ['$parentId', '$$product_id'],
      //               },
      //             },
      //             {
      //               recordType: 'ProductImage',
      //             },
      //           ],
      //         },
      //       },
      //     ],
      //     as: 'imagesObj',
      //   },
      // },
      {
        $lookup: {
          from: 'inventory',
          let: {
            product_id: '$id',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ['$parentId', '$$product_id'],
                    },
                  },
                  {
                    recordType: 'Collection',
                  },
                ],
              },
            },
          ],
          as: 'collections',
        },
      },
    ];
    // console.log(
    //   '🚀 ~ file: inventory.service.ts ~ line 446 ~ InventoryService ~ findAllProducts ~ agg',
    //   JSON.stringify(agg),
    // );
    const res = await this.inventoryRepository.aggregate(agg).toArray();
    // console.log('🚀 ~ file: InventoryService ~ findAllProducts ~ res', res);
    return res;
    // return await manager.aggregate(Inventory, agg).toArray();
  }

  // find specific collection products
  async getProductsByCollectionIDs(shop: string, ids: string[], limit) {
    // const manager = getMongoManager();
    const pipeline: any[] = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $ne: ['$publishedAt', null],
              },
              {
                $eq: ['$status', 'ACTIVE'],
              },
              {
                $ne: ['$outofstock', true],
              },
            ],
          },
        },
      },
    ];
    if (limit) {
      pipeline.push({ $limit: 15 });
    }

    const agg: any[] = [
      {
        $match: {
          shop,
          id: {
            $in: ids,
          },
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'parentId',
          foreignField: 'id',
          as: 'products',
          pipeline,
        },
      },
      // {
      //   $addFields: {
      //     products: {
      //       $filter: {
      //         input: '$products',
      //         as: 'j',
      //         cond: {
      //           $and: [
      //             {
      //               $ne: ['$$j.publishedAt', null],
      //             },
      //             {
      //               $ne: ['$$j.outofstock', true],
      //             },
      //             {
      //               $eq: ['$$j.status', 'ACTIVE'],
      //             },
      //           ],
      //         },
      //       },
      //     },
      //   },
      // },
      {
        $unwind: {
          path: '$products',
        },
      },
      {
        $group: {
          _id: '$recordType',
          products: {
            $push: '$products',
          },
        },
      },
      {
        $project: {
          products: 1,
        },
      },
    ];

    const res: (Inventory & { products?: any })[] =
      await this.inventoryRepository.aggregate(agg).toArray();
    return [...new Set(res[0].products)];
  }

  // it find all products, variants, collection, images
  async findAllProductsOnly(shop: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          shop,
          recordType: 'Product',
        },
      },
    ];
    const res = await this.inventoryRepository.aggregate(agg).toArray();
    // console.log('🚀 ~ file: InventoryService ~ findAllProducts ~ res', res);
    return res;
    // return await manager.aggregate(Inventory, agg).toArray();
  }

  async getRandomPurchaseCount(productsArray) {
    const blukWrite = productsArray.map((item) => {
      return {
        updateOne: {
          filter: { id: item.id },
          update: {
            $set: { secondaryCount: generatesecondaryCount() },
          },
        },
      };
    });
    await this.setPurchaseCount(blukWrite);
  }

  calculateOutOfStock(variants: ProductVariant[]) {
    /* if product inventory policy is continue then it will be always in stock
        * if product inventory management is null the item will be in stock;
        * if product inventory policy is deny and all products variants quantiy is 0 then it will be in out of stock.
        
        */
    return variants.reduce((isProductOutofStock, variant) => {
      const isVariantOutoStock = variant.inventoryManagement
        ? variant.inventoryPolicy.toLocaleLowerCase() === 'continue' ||
          variant.inventoryQuantity > 0
          ? false
          : true
        : false;
      return isProductOutofStock && isVariantOutoStock;
    }, true);
  }

  async updateProductCount(colId: string, count: number) {
    // const manager = getMongoManager();
    try {
      return await this.inventoryRepository.updateMany(
        { id: colId },
        { $set: { productsCount: count } },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async findById(id: string) {
    // const manager = getMongoManager();
    try {
      const agg = [
        {
          $match: {
            id: id,
          },
        },
      ];
      return await this.inventoryRepository.aggregate(agg).toArray();
    } catch (err) {
      console.log(err);
    }
  }

  // CRON FUNCTIONS START
  async runSyncCollectionCron(store: any) {
    try {
      const { shop, accessToken, collectionsToUpdate, id, session } =
        await this.storeService.withStoreSession(store);
      console.log(
        '🚀 ~ file: inventory.service.ts:1090 ~ InventoryService ~ runSyncCollectionCron ~ collectionsToUpdate:',
        collectionsToUpdate,
      );
      if (store?.drops && store?.drops?.status == 'Active') {
        const client = await this.shopifyService.client(session);
        console.log(
          '🚀 ~ file: inventory.service.ts:1093 ~ InventoryService ~ runSyncCollectionCron ~ client:',
          session,
        );

        if (!collectionsToUpdate.length) {
          log('No collections to update');
        }

        const queryString = collectionsToUpdate
          .map((collection) => {
            if (collection.isSynced === false) {
              return `(title:${collection.collectionTitle})`;
            }
          })
          .join(' OR ');
        console.log(
          '🚀 ~ file: inventory.service.ts:1109 ~ InventoryService ~ runSyncCollectionCron ~ queryString:',
          queryString,
        );

        await client
          .query({
            data: {
              query: `mutation {
    bulkOperationRunQuery(
      query:"""
      {
          collections(first: 1000, query: "${queryString}") {
            edges {
              node {
                id
                title
                productsCount
                descriptionHtml
                ruleSet {
                  rules {
                    condition
                    column
                    relation
                  }
                }
                sortOrder
                image {
                  src
                }
                products(first:10000,sortKey:COLLECTION_DEFAULT){
                  edges{
                    node{
                      title
                      id
                      status
                      createdAt
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
          })
          .then((res) => {
            const bulkOperationId =
              res.body['data']['bulkOperationRunQuery']['bulkOperation']['id'];
            Logger.log(
              `collection to update bulk register with id - ${bulkOperationId}`,
              'COLLECTIONTOUPDATBULK',
              true,
            );
          });
      }
    } catch (err) {
      Logger.error(err, 'SYNC_COLLECTION_SERVICE');
    }
  }

  async pollIt(client, id, shop) {
    let poll;
    const timer = setInterval(async () => {
      poll = await client.query({
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
      if (poll.body['data']['currentBulkOperation']['status'] === 'COMPLETED') {
        clearInterval(timer);
        const url = poll.body['data']['currentBulkOperation'].url;
        this.httpService.get(url).subscribe(async (res) => {
          const checkCollection = res.data?.length
            ? readJsonLines(res.data)
            : [];
          if (checkCollection.length && checkCollection[0].productsCount > 0) {
            this.getProducts(checkCollection, id, shop);
          } else {
            Logger.log(`No products found`, 'SYNC_COLLECTION_SERVICE', true);
          }
        });
      }
    }, 5000);
  }

  async updateCollection(products, id, shop) {
    console.log(products);
    // delete old collections send [id, id]
    // map product array.
    // 1 get colid and find in collection[] and make obj
    // 2. return arr of obj
    //3. use this and insert many
    // after insert many ,
    // remove collectionIds in collectiontoupdate arr and update store collectionstatus to complete
    const collection = [];
    const productsArray = [];

    // seperate products and collections
    products.map((ele) => {
      if ('productsCount' in ele) {
        collection.push(ele);
      }
      if (ele.id.includes('Product')) {
        productsArray.push(ele);
      }
    });
    const collectionIds = collection.map((item) => item.id);

    try {
      await this.removeMultiPleEntities(
        collectionIds,
        RecordType.Collection,
      ).then(() => {
        log(`${collectionIds.length} collection removed`);
        Logger.log(
          `${collectionIds.length} collection removed`,
          'SYNC_COLLECTION_SERVICE',
          true,
        );
      });
    } catch (err) {
      Logger.error(err, 'SYNC_COLLECTION_SERVICE');
    }
    const collectionObjects = productsArray.map((item) => {
      const col = collection.find((coll) => coll.id === item.__parentId);
      const collectionType =
        'rules' in col && col.rules.length ? 'smart' : 'custom';

      return {
        id: col.id,
        title: col.title,
        type: collectionType,
        description: col.descriptionHtml,
        productsCount: col.productsCount,
        sortOrder: col.sortOrder.toUpperCase(),
        featuredImage: col?.image?.src,
        parentId: item.id,
        shop: shop,
        recordType: 'Collection',
      };
    });
    await this.insertMany(collectionObjects);
    return collectionIds;
  } //updatecollection new function

  async getProducts(products, id, shop) {
    const collection = [];
    const productsArray = [];

    products.map((ele) => {
      if ('productsCount' in ele) {
        collection.push(ele);
      }
      if (ele.id.includes('Product')) {
        productsArray.push(ele);
      }
    });

    const collectionsWithProducts: any = collection.map((item) => {
      return {
        ...item,
        products: products.filter((ele) => ele.__parentId === item.id),
      };
    });

    const collectionIds = collection.map((item) => item.id);

    try {
      await this.removeMultiPleEntities(
        collectionIds,
        RecordType.Collection,
      ).then(() => {
        log(`${collectionIds.length} collection removed`);
        Logger.log(
          `${collectionIds.length} collection removed`,
          'SYNC_COLLECTION_SERVICE',
          true,
        );
      });
    } catch (err) {
      Logger.error(err, 'SYNC_COLLECTION_SERVICE');
    }

    // const colObj = collectionsWithProducts.map((item) => {});
    for (const [index, col] of collectionsWithProducts.entries()) {
      let collectionType;
      if ('rules' in col && col.rules.length) {
        collectionType = 'smart';
      } else {
        collectionType = 'custom';
      }

      const collectionObjs = col.products.map((product) => ({
        id: col.id,
        title: col.title,
        type: collectionType,
        description: col.descriptionHtml,
        productsCount: col.productsCount,
        sortOrder: col.sortOrder.toUpperCase(),
        featuredImage: col?.image?.src,
        parentId: product.id,
        shop: shop,
        recordType: 'Collection',
      }));

      await this.insertMany(collectionObjs)
        .then(() => {
          log(`${index + 1} of ${collection.length} Collections saved`);
          this.storeService.removeSyncedCollection(col.id, id);
          if (collectionsWithProducts?.length - 1 === index) {
            this.storeService.updateStore(id, {
              collectionUpdateStatus: CollectionUpdateEnum.COMPLETE,
              id,
            });
          }
        })
        .catch((err) => {
          Logger.error(err, 'SYNC_COLLECTION_SERVICE');
        });
    }
  }
  // CRON FUNCTIONS ENDS

  async createSearchIndex(shop: string) {
    const { id: storeId } = await this.storeService.findOne(shop);
    const dropsProducts: (DropsCategory & {
      products?: { id?: any; description?: any; title?: any; tags?: any };
      collections?: {
        shopifyId?: any;
        name?: any;
      };
    })[] = await this.dropsCategoryService.findDropsproducts(storeId);
    // console.log('dropsProducts', JSON.stringify(dropsProducts));
    const index = new Document(options);
    const collectionIds = [];

    dropsProducts.forEach((collection) => {
      if (!collectionIds.includes(collection.collections.shopifyId)) {
        index.add({
          id: collection.collections.shopifyId,
          collection: collection.collections.name,
        });
        collectionIds.push(collection.collections.shopifyId);
      }

      index.add({
        id: collection.products.id,
        description: collection.products.description,
        title: collection.products.title,
        tags: collection.products?.tags ?? [],
      });
    });

    // //console.log('index.search(searchTerm)', index.search('wome'));
    fs.mkdir(`${searchIndexPath}${shop}`, { recursive: true }, (err) => {
      if (err) throw err;
    });
    index.export((key, data: string | NodeJS.ArrayBufferView | null) =>
      fs.writeFileSync(
        `${searchIndexPath}${shop}/${key}.json`,
        data !== undefined ? data : 'null',
      ),
    );
    return true;
  }

  async findMultiPlePorductsById(ids: string[]) {
    return await this.inventoryRepository.find({
      where: {
        $and: [
          { id: { $in: ids } },
          {
            recordType: 'Product',
          },
          {
            status: 'ACTIVE',
          },
        ],
      },
    });
  }

  async searchProducts(searchTerm: string, shop: string) {
    let index = new Document(options);
    index = this.retrieveIndex(shop, index);
    const result = index.search(searchTerm, 0, { suggest: true });
    console.log('searchTerm', searchTerm);
    console.log(
      '🚀 ~ file: inventory.service.ts:789 ~ InventoryService ~ index.search ~ result:',
      result,
    );
    const filterProducts: any = [];
    let collectionIds: any = null;
    result?.forEach((search: any) => {
      const fieldType = search.field;
      if (fieldType === 'collection') {
        collectionIds = search.result;
      } else {
        search.result.forEach((productId: any) => {
          if (!filterProducts.includes(productId)) {
            filterProducts.push(productId);
          }
        });
      }
    });
    if (collectionIds !== null) {
      const collectionProducts = await this.getProductsByCollectionIDs(
        shop,
        collectionIds,
        false,
      );
      collectionProducts.forEach((product: any) => {
        if (!filterProducts.includes(product.id)) {
          filterProducts.push(product.id);
        }
      });
    }
    const productsData = await this.findMultiPlePorductsById(filterProducts);
    return productsData;
  }

  retrieveIndex = (shop: string, index) => {
    const keys = fs
      .readdirSync(`${searchIndexPath}${shop}/`, { withFileTypes: true })
      .filter((item) => !item.isDirectory())
      .map((item) => item.name.slice(0, -5));

    for (let i = 0, key; i < keys.length; i += 1) {
      key = keys[i];
      const data = fs.readFileSync(
        `${searchIndexPath}${shop}/${key}.json`,
        'utf8',
      );
      index.import(key, data ?? null);
    }
    return index;
  };

  async getPaginatedProductsByCollectionIDs({ pagination, collection_id }) {
    try {
      // const manager = getMongoManager();
      const { skip, take } = pagination;
      const agg: any = [
        {
          $match: {
            id: collection_id,
          },
        },

        {
          $lookup: {
            from: 'inventory',
            localField: 'parentId',
            foreignField: 'id',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $ne: ['$publishedAt', null],
                      },
                      {
                        $eq: ['$status', 'ACTIVE'],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'products',
          },
        },
        {
          $unwind: {
            path: '$products',
          },
        },
        {
          $replaceRoot: {
            newRoot: '$products',
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: take,
        },
      ];
      const result = await this.inventoryRepository.aggregate(agg).toArray();
      agg.pop();
      agg.pop();
      agg.push({
        $count: 'total',
      });
      const prodcount: (Inventory & { total?: number })[] =
        await this.inventoryRepository.aggregate(agg).toArray();
      const total = prodcount[0]?.total ?? 0;
      // Logger.log(
      //   `Products paginated for collection off (${collection_id}) `,
      //   'PAGINATE_PRODUCTS',
      //   true,
      // );
      return {
        result,
        pageInfo: this.paginateService.paginate(result, total, take, skip),
      };
    } catch (err) {
      Logger.error(
        `Failed to paginate products for collection (${collection_id}) : ${err}`,
        'PAGINATE_PRODUCTS',
        true,
      );
    }
    // console.log(
    //   '🚀 ~ file: inventory.service.ts:1328 ~ InventoryService ~ getPaginatedProductsByCollectionIDs ~ res:',
    //   res[0],
    // );
    // return res;
  }

  async updateProductVendor(products: any[]) {
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { id: product.id },
        update: { $set: { vendor: product.vendor } },
      },
    }));

    try {
      await this.inventoryRepository.bulkWrite(bulkOps);
      console.log('Product vendors updated successfully.');
      Logger.log(
        'Product vendor updated',
        'PRODUCT_VENDOR_TO_UPDATE_BULK',
        true,
      );
    } catch (error) {
      console.error('Error updating product vendors:', error);
      Logger.error(
        `Error updating product vendors: ${error}`,
        'PRODUCT_VENDOR_TO_UPDATE_BULK',
        true,
      );
    }
  }
}
