import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoManager, MongoRepository } from 'typeorm';
import { CreateDropsCategoryInput } from './dto/create-drops-category.input';
import DropsCategory from './entities/drops-category.model';
import { CollectionType } from './entities/drops-category.entity';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { DropsCollectionUpdatedEvent } from 'src/drops-groupshop/events/drops-collection-update.event';
import { StoresService } from 'src/stores/stores.service';
import { UpdateStoreInput } from 'src/stores/dto/update-store.input';
import { CodeUpdateStatusTypeEnum } from 'src/stores/entities/store.entity';
import { SearchIndexingRefreshEvent } from 'src/inventory/events/searchIndexing-refresh.event';

@Injectable()
export class DropsCategoryService {
  constructor(
    @InjectRepository(DropsCategory)
    private DropsCategoryRepository: MongoRepository<DropsCategory>,
    @Inject(forwardRef(() => DropsGroupshopService))
    private dropsService: DropsGroupshopService,
    private dropsCollectionUpdatedEvent: DropsCollectionUpdatedEvent,
    @Inject(forwardRef(() => StoresService))
    private storesService: StoresService,
    public searchIndexingRefreshEvent: SearchIndexingRefreshEvent,
  ) {}
  create(createDropsCategoryInput: CreateDropsCategoryInput) {
    return 'This action adds a new dropsCategory';
  }

  findAll() {
    return `This action returns all dropsCategory`;
  }

  async findOne(id: string) {
    return await this.DropsCategoryRepository.find({
      where: {
        categoryId: id,
      },
    });
  }

  async findByStoreId(storeId: string) {
    return await this.DropsCategoryRepository.find({
      where: { storeId: storeId },
    });
  }

  async update(
    id: string,
    updateDropsCategoryInput: CreateDropsCategoryInput[],
    collectionUpdateMsg: string,
    userId?: string,
    activity?: string,
  ) {
    if (collectionUpdateMsg !== '') {
      Logger.log(collectionUpdateMsg, 'DROPS_COLLECTION_UPDATED', true);
    }

    let dropCategory;
    let operation;
    if (activity === 'Update Sorting Order') {
      operation = 'UPDATE';
      if (updateDropsCategoryInput.length === 1) {
        dropCategory = await this.findOne(
          updateDropsCategoryInput[0].categoryId,
        );
      } else {
        dropCategory = await this.findByStoreId(id);
      }
    } else {
      dropCategory = await this.findOne(updateDropsCategoryInput[0].categoryId);
      operation =
        activity === 'Drops Navigation Management'
          ? dropCategory.length > 0
            ? 'UPDATE'
            : 'CREATE'
          : dropCategory[0].collections.length !==
            updateDropsCategoryInput[0].collections.length
          ? 'CREATE'
          : 'UPDATE';
    }

    if (collectionUpdateMsg.includes('remove') === true) {
      Logger.log(
        '/drops',
        activity,
        false,
        'REMOVE',
        updateDropsCategoryInput,
        userId,
        dropCategory,
        id,
      );
    } else {
      Logger.log(
        '/drops',
        activity,
        false,
        operation,
        updateDropsCategoryInput,
        userId,
        dropCategory,
        id,
      );
    }

    const blukWrite = updateDropsCategoryInput.map((item) => {
      return {
        updateOne: {
          filter: { categoryId: item.categoryId },
          update: {
            $setOnInsert: { createdAt: new Date() },
            $set: { ...item, updatedAt: new Date() },
          },
          upsert: true,
        },
      };
    });

    // const manager = getMongoManager();
    await this.DropsCategoryRepository.bulkWrite(blukWrite);

    const { shop } = await this.storesService.findById(id);
    // create event for Search Indexing
    this.searchIndexingRefreshEvent.shopName = shop;
    this.searchIndexingRefreshEvent.emit();

    const temp = await this.findByStoreId(id);
    return temp;
  }

  async remove(
    categoryId: [string],
    collectionUpdateMsg: string,
    userId: string,
    storeId: string,
  ) {
    // const manager = getMongoManager();
    const dropCategory = await this.findOne(categoryId[0]);
    Logger.log(
      '/drops',
      'Drops Navigation Management',
      false,
      'REMOVE',
      'newValue',
      userId,
      dropCategory,
      storeId,
    );

    const { shop } = await this.storesService.findById(storeId);
    // create event for Search Indexing
    this.searchIndexingRefreshEvent.shopName = shop;
    this.searchIndexingRefreshEvent.emit();

    Logger.log(collectionUpdateMsg, 'DROPS_COLLECTION_UPDATED', true);
    return await this.DropsCategoryRepository.deleteMany({
      categoryId: { $in: categoryId },
    });
  }

  async removeMany(id: any) {
    // const manager = getMongoManager();
    return await this.DropsCategoryRepository.deleteMany({ storeId: id });
  }

  async getNonSVCollectionIDs(storeId: string): Promise<[string]> {
    const agg = [
      {
        $match: {
          storeId,
        },
      },
      {
        $addFields: {
          ids: {
            $filter: {
              input: '$collections',
              as: 'c',
              cond: {
                $and: [
                  {
                    $ne: ['$$c.type', CollectionType.VAULT],
                  },
                  {
                    $ne: ['$$c.type', CollectionType.SPOTLIGHT],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$ids',
        },
      },
      {
        $group: {
          _id: '$storeId',
          ids: {
            $push: '$ids.shopifyId',
          },
        },
      },
    ];
    // const manager = getMongoManager();
    const gs: (DropsCategory & { ids?: [string] })[] =
      await this.DropsCategoryRepository.aggregate(agg).toArray();
    return gs[0]?.ids;
  }

  async getSVCollectionIDs(storeId: string): Promise<[string]> {
    const agg = [
      {
        $match: {
          storeId,
        },
      },
      {
        $addFields: {
          ids: {
            $filter: {
              input: '$collections',
              as: 'c',
              cond: {
                $or: [
                  {
                    $eq: ['$$c.type', CollectionType.VAULT],
                  },
                  {
                    $eq: ['$$c.type', CollectionType.SPOTLIGHT],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$ids',
        },
      },
      {
        $group: {
          _id: '$storeId',
          ids: {
            $push: '$ids.shopifyId',
          },
        },
      },
    ];
    // const manager = getMongoManager();
    const gs: (DropsCategory & { ids?: [string] })[] =
      await this.DropsCategoryRepository.aggregate(agg).toArray();
    return gs[0].ids;
  }

  async syncDiscountCodes(storeId: string, userId: string) {
    // Bulk Discount Code Update
    const { shop, session, drops } = await this.storesService.findById(storeId);
    const ids = await this.getNonSVCollectionIDs(storeId);
    const dropsGroupshops = await this.dropsService.getActiveDrops(storeId);
    const arr = dropsGroupshops.filter(
      (dg) =>
        dg.discountCode !== null &&
        dg.discountCode.title !== null &&
        dg.discountCode.priceRuleId !== null,
    );

    this.dropsCollectionUpdatedEvent.shop = shop;
    this.dropsCollectionUpdatedEvent.session = session;
    this.dropsCollectionUpdatedEvent.collections = ids;
    this.dropsCollectionUpdatedEvent.dropsGroupshops = arr;
    this.dropsCollectionUpdatedEvent.storeId = storeId;
    this.dropsCollectionUpdatedEvent.drops = drops ?? {};

    if (arr.length) {
      this.dropsCollectionUpdatedEvent.emit();
      const usersInput = { discountCodeUpdated: dropsGroupshops.length };

      if (userId !== '') {
        Logger.log(
          '/drops',
          'Sync Discount Codes',
          false,
          'UPDATE',
          usersInput,
          userId,
          null,
          storeId,
        );
      }

      const updateStoreInput: any = new UpdateStoreInput();
      updateStoreInput.drops = {
        ...drops,
        codeUpdateStatus: CodeUpdateStatusTypeEnum.inprogress,
      };
      await this.storesService.updateStore(storeId, updateStoreInput);
      return {
        codeUpdateStatus: CodeUpdateStatusTypeEnum.inprogress,
      };
    }
    return {
      codeUpdateStatus: CodeUpdateStatusTypeEnum.none,
    };
  }

  // Find drops product and collections for search indexing
  async findDropsproducts(storeId: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          storeId: storeId,
          status: 'active',
        },
      },
      {
        $unwind: {
          path: '$collections',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'collections.shopifyId',
          foreignField: 'id',
          as: 'products',
        },
      },
      {
        $unwind: {
          path: '$products',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'products.parentId',
          foreignField: 'id',
          as: 'products',
        },
      },
      {
        $unwind: {
          path: '$products',
        },
      },
    ];
    const res = await this.DropsCategoryRepository.aggregate(agg).toArray();
    return res;
  }
  async findProductsByCategory(categoryId: string) {
    const agg = [
      {
        $match: {
          categoryId: categoryId,
        },
      },
      {
        $addFields: {
          sections: '$collections',
        },
      },
      {
        $unwind: {
          path: '$sections',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'sections.shopifyId',
          foreignField: 'id',
          // pipeline: [
          //   {
          //     $limit: 20,
          //   },
          // ],
          as: 'products',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'products.parentId',
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
            {
              $sort: {
                _id: -1,
              },
            },
            {
              $limit: 10,
            },
          ],
          as: 'products',
        },
      },
      {
        $addFields: {
          sections: {
            $cond: {
              if: {
                $or: [
                  { $ifNull: ['$sections.isAutoGeneratedBy', false] },
                  { $eq: ['$sections.isVisible', false] },
                ],
              },
              then: {},
              else: '$sections',
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ['$sections', {}] }, // Check if sections is not an empty object
              { $ne: ['$sections', null] }, // Optional: Check if sections is not null
            ],
          },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          collections: {
            $first: '$collections',
          },
          categoryId: {
            $first: '$categoryId',
          },
          sortOrder: {
            $first: '$sortOrder',
          },
          title: {
            $first: '$title',
          },
          parentId: {
            $first: '$parentId',
          },
          sections: {
            $push: {
              name: '$sections.name',
              mergedIds: '$sections.mergedIds',
              shopifyId: '$sections.shopifyId',
              type: '$sections.type',
              products: '$products',
            },
          },
        },
      },
    ];
    // const manager = getMongoManager();
    const gs = await this.DropsCategoryRepository.aggregate(agg).toArray();
    return gs[0];
  }

  async findDropGroupshopForYouSections(categories: string[]) {
    const agg = [
      {
        $match: {
          categoryId: {
            $in: categories,
          },
        },
      },
      {
        $unwind: {
          path: '$collections',
          // includeArrayIndex: "sections",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'collections.shopifyId',
          foreignField: 'id',
          // pipeline: [
          //   {
          //     $limit: 20,
          //   },
          // ],
          as: 'collectionDetails',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'collectionDetails.parentId',
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
            {
              $sort: {
                _id: -1,
              },
            },
            {
              $limit: 10,
            },
          ],
          as: 'products',
        },
      },
      {
        $addFields: {
          collections: {
            $mergeObjects: [
              '$collections',
              {
                products: '$products',
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$id',
          rest: {
            $first: '$$ROOT',
          },
          forYouSections: {
            $push: {
              name: '$title',
              id: '$categoryId',
              sections: '$collections',
            },
          },
        },
      },
      {
        $unwind: {
          path: '$forYouSections',
          // includeArrayIndex: "forYouSections",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            id: '$_id',
            name: '$forYouSections.name',
            categoryId: '$forYouSections.id',
          },
          rest: {
            $first: '$rest',
          },
          sections: {
            $push: '$forYouSections.sections',
          },
        },
      },
      {
        $addFields: {
          sections: {
            $cond: {
              if: {
                $anyElementTrue: {
                  $map: {
                    input: '$sections',
                    as: 'cal',
                    in: {
                      $eq: ['$$cal.type', 'allproduct'],
                    },
                  },
                },
              },
              then: {
                $filter: {
                  input: '$sections',
                  as: 'cal',
                  cond: {
                    $or: [
                      {
                        $eq: ['$$cal.type', 'allproduct'],
                      },
                      {
                        $eq: ['$$cal.type', 'vault'],
                      },
                      {
                        $eq: ['$$cal.type', 'spotlight'],
                      },
                    ],
                  },
                },
              },
              else: [],
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.id',
          rest: {
            $first: '$rest',
          },
          forYouSections: {
            $push: {
              name: '$_id.name',
              id: '$_id.categoryId',
              sections: '$sections',
            },
          },
        },
      },
      {
        $addFields: {
          mergeDocument: {
            $mergeObjects: ['$$ROOT', '$rest'],
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$mergeDocument',
        },
      },
      {
        $project: {
          forYouSections: 1,
        },
      },
    ];
    const gs = await this.DropsCategoryRepository.aggregate(agg).toArray();
    return gs[0];
  }
}
