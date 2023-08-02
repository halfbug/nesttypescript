import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateDropsGroupshopInput } from './dto/create-drops-groupshop.input';
import { UpdateDropsGroupshopInput } from './dto/update-drops-groupshop.input';
import { v4 as uuid } from 'uuid';
import DropsGroupshop from './entities/dropsgroupshop.model';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StoresService } from 'src/stores/stores.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { ShopifyService } from 'src/shopify/shopify.service';
import { FilterOption } from './dto/paginationArgs.input';
import { PaginationService } from 'src/utils/pagination.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { Product } from 'src/inventory/entities/product.entity';
import DropsCategory from 'src/drops-category/entities/drops-category.model';
import { DropsCategoryService } from 'src/drops-category/drops-category.service';
import Store from 'src/stores/entities/store.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DropsGroupshopService {
  constructor(
    @InjectRepository(DropsGroupshop)
    private DropsGroupshopRepository: MongoRepository<DropsGroupshop>,
    @Inject(forwardRef(() => StoresService))
    private storesService: StoresService,
    @Inject(forwardRef(() => ShopifyService))
    private shopifyService: ShopifyService,
    private paginateService: PaginationService,
    @Inject(forwardRef(() => InventoryService))
    private inventoryService: InventoryService,
    @Inject(forwardRef(() => DropsCategoryService))
    private dropsCategoryService: DropsCategoryService,
    private configService: ConfigService,
  ) {}

  async create(createDropsGroupshopInput: CreateDropsGroupshopInput) {
    console.log(
      '🚀 ~ file: drops-groupshop.service ~ line 19 ~ groupshop.service ~ create ~ createDropsGroupshopInput',
      createDropsGroupshopInput,
    );
    const id = uuid();

    const {
      drops: {
        rewards: { baseline },
      },
    } = await this.storesService.findById(createDropsGroupshopInput.storeId);

    const dropsGroupshop = await this.DropsGroupshopRepository.create({
      id,
      ...createDropsGroupshopInput,
    });

    const dgroupshop = await this.DropsGroupshopRepository.save(dropsGroupshop);

    dgroupshop.milestones = [{ activatedAt: new Date(), discount: baseline }];
    dgroupshop.members = [];

    this.update(id, dgroupshop);
  }

  async findDropsGS(discountCode: string) {
    const agg = [
      {
        $match: {
          'discountCode.title': discountCode,
        },
      },
    ];
    // const manager = getMongoManager();
    const gs = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return gs[0];
  }

  async findDropsLifetimeCashback(klaviyoId: string) {
    const agg = [
      {
        $match: {
          'customerDetail.klaviyoId': klaviyoId,
        },
      },
      {
        $addFields: {
          lifetime_referral_count: {
            $subtract: [
              {
                $size: '$members',
              },
              1,
            ],
          },
          refundItems: {
            $reduce: {
              input: '$members.refund',
              initialValue: [],
              in: {
                $concatArrays: ['$$value', '$$this'],
              },
            },
          },
        },
      },
      {
        $match: {
          lifetime_referral_count: {
            $gt: 0,
          },
        },
      },
      {
        $addFields: {
          refund: {
            $sum: '$refundItems.amount',
          },
        },
      },
      {
        $group: {
          _id: null,
          lifetime_referral_count: {
            $sum: '$lifetime_referral_count',
          },
          lifetime_gs_cashback: {
            $sum: '$refund',
          },
        },
      },
    ];
    // const manager = getMongoManager();
    const gs = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return gs;
  }

  findAll() {
    return this.DropsGroupshopRepository.find();
  }

  async addFavoriteProduct(dropsId: string, productId: string) {
    // const manager = getMongoManager();
    try {
      await this.DropsGroupshopRepository.updateOne(
        DropsGroupshop,
        { id: dropsId },
        {
          $push: { favorite: productId },
        } as any,
      );

      Logger.log(
        `Product added (${productId}) in favorite of Drops GS ${dropsId}`,
        'FAVORITE_PRODUCT',
        true,
      );

      return await this.getFavoriteProducts(dropsId);
    } catch (err) {
      Logger.error(
        `Failed to add product (${productId}) in favorite of Drops GS ${dropsId}. (err) : ${err} `,
        'FAVORITE_PRODUCT',
        true,
      );
    }
  }

  async removeFavoriteProduct(dropsId: string, productId: string) {
    // const manager = getMongoManager();
    // const repository =
    //   this.DropsGroupshopRepository.getMongoRepository(DropsGroupshop);
    try {
      await this.DropsGroupshopRepository.updateOne({ id: dropsId }, {
        $pull: { favorite: productId },
      } as any);

      Logger.log(
        `Product removed (${productId}) from favorite of Drops GS ${dropsId}`,
        'FAVORITE_PRODUCT',
        true,
      );

      return await this.getFavoriteProducts(dropsId);
    } catch (err) {
      Logger.error(
        `Failed to remove product (${productId}) from favorite of Drops GS ${dropsId} (err) : ${err}`,
        'FAVORITE_PRODUCT',
        true,
      );
    }
  }

  async getFavoriteProducts(dropsId: string) {
    // const manager = getMongoManager();
    const agg = [
      {
        $match: {
          id: dropsId,
          status: 'active',
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'favorite',
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
          as: 'favorite',
        },
      },
      {
        $project: {
          favorite: 1,
        },
      },
    ];

    const temp = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return temp[0];
  }

  async getdrops({ pagination, filters, sorting, startdate, endDate }) {
    try {
      const { skip, take } = pagination;

      let criteria = {};
      let agg: any[] = [
        {
          $skip: skip,
        },
        {
          $limit: take,
        },
      ];
      const dateField = {
        $addFields: {
          strDate: {
            $dateToString: {
              format: '%m/%d/%Y',
              date: '$createdAt',
            },
          },
        },
      };

      if (sorting.length) {
        agg = [
          {
            $sort: {
              [sorting[0].field]: sorting[0].sort === 'asc' ? 1 : -1,
            },
          },
          ...agg,
        ];
      }
      if (filters.length) {
        if (filters[0].columnField === 'createdAt') {
          filters[0].columnField = 'strDate';
        }
        switch (filters[0].operatorValue) {
          case FilterOption.CONTAINS:
            criteria = {
              $regex: `(?i)${filters[0].value}`,
            };
            break;
          case FilterOption.STARTS_WITH:
            criteria = {
              $regex: `^(?i)${filters[0].value}`,
            };
            break;
          case FilterOption.ENDS_WITH:
            criteria = {
              $regex: `${filters[0].value}$`,
            };
            break;
          case FilterOption.EQUALS:
            criteria = {
              $regex: `^${filters[0].value}$`,
            };
            break;
          case FilterOption.IS_EMPTY:
            criteria = {
              $eq: '',
            };
            break;
          case FilterOption.IS_NOT_EMPTY:
            criteria = {
              $ne: '',
            };
            break;
          case FilterOption.IS_ANY_OF:
            criteria = { $in: filters[0].value };
            break;
          default:
            break;
        }
        agg = [
          dateField,
          {
            $match: {
              [filters[0].columnField]: criteria,
            },
          },
          ...agg,
        ];
      }

      agg = [
        {
          $match: {
            createdAt: {
              $gte: startdate,
              $lte: endDate,
            },
          },
        },
        {
          $lookup: {
            from: 'store',
            localField: 'storeId',
            foreignField: 'id',
            as: 'store',
          },
        },
        {
          $unwind: {
            path: '$store',
          },
        },
        ...agg,
      ];

      // const manager = getMongoManager();
      const gs = await this.DropsGroupshopRepository.aggregate(agg).toArray();
      console.log(
        '🚀 ~ file: drops-groupshop.service.ts:221 ~ DropsGroupshopService ~ getdrops ~ agg:',
        JSON.stringify(agg),
      );
      const result = gs;
      agg.pop();
      agg.pop();
      agg.push({
        $count: 'total',
      });
      const gscount: (DropsGroupshop & { total?: number })[] =
        await this.DropsGroupshopRepository.aggregate(agg).toArray();
      const total = gscount[0]?.total ?? 0;
      return {
        result,
        pageInfo: this.paginateService.paginate(result, total, take, skip),
      };
    } catch (err) {
      console.log(
        '🚀 ~ file: drops-groupshop.service.ts:227 ~ DropsGroupshopService ~ getdrops ~ err:',
        err,
      );
      Logger.error(err, DropsCategoryService.name);
    }
  }
  async createDropDiscountCode(gs) {
    // console.log('createDropDiscountCode ', gs);
    const {
      shop,
      accessToken,
      drops: {
        rewards: { baseline },
      },
      session,
    } = await this.storesService.findById(gs.storeId);
    const discountTitle = gs?.discountCode.title;
    const collections = await this.dropsCategoryService.getNonSVCollectionIDs(
      gs.storeId,
    );
    const discountCode = await this.shopifyService.setDiscountCode(
      shop,
      'Create',
      session,
      discountTitle,
      parseInt(baseline, 10),
      [...new Set(collections)],
      new Date(),
      null,
      null,
      true,
      true,
    );
    return discountCode;
  }

  findAllNullDiscounts() {
    return this.DropsGroupshopRepository.find({
      where: { 'discountCode.title': null },
    });
  }

  async findDropGroupshopByCode(discountCode: string) {
    const agg = [
      {
        $match: {
          'discountCode.title': discountCode,
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'favorite',
          foreignField: 'id',
          as: 'favorite',
        },
      },
      {
        $addFields: {
          favorite: {
            $filter: {
              input: '$favorite',
              as: 'j',
              cond: {
                $and: [
                  {
                    $ne: ['$$j.publishedAt', null],
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
          localField: 'members.lineItems.product.id',
          foreignField: 'id',
          as: 'products',
        },
      },
      {
        $addFields: {
          members: {
            $map: {
              input: '$members',
              as: 'me',
              in: {
                $mergeObjects: [
                  '$$me',
                  {
                    products: {
                      $map: {
                        input: '$$me.lineItems',
                        in: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: {
                                  $concatArrays: [
                                    {
                                      $ifNull: ['$products', []],
                                    },
                                  ],
                                },
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
        $lookup: {
          from: 'orders',
          localField: 'members.orderId',
          foreignField: 'id',
          as: 'orders',
        },
      },
      {
        $addFields: {
          members: {
            $map: {
              input: '$members',
              as: 'me',
              in: {
                $mergeObjects: [
                  '$$me',
                  {
                    orderDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$orders',
                            as: 'j',
                            cond: {
                              $eq: ['$$me.orderId', '$$j.id'],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          createdAt: 1,
          customerDetail: 1,
          storeId: 1,
          shortUrl: 1,
          url: 1,
          obSettings: 1,
          expiredUrl: 1,
          expiredShortUrl: 1,
          expiredAt: 1,
          discountCode: 1,
          members: 1,
          milestones: 1,
          id: 1,
          updatedAt: 1,
          favorite: 1,
        },
      },
    ];
    // const manager = getMongoManager();
    const gs = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return gs[0];
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
          pipeline: [
            {
              $limit: 12,
            },
          ],
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
              $limit: 10,
            },
          ],
          as: 'products',
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
              shopifyId: '$sections.shopifyId',
              type: '$sections.type',
              products: '$products',
            },
          },
        },
      },
    ];
    // const manager = getMongoManager();
    const gs = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return gs[0];
  }

  async updateExpireDate(
    updateGroupshopInput: UpdateDropsGroupshopInput,
    code: string,
  ) {
    const { id, oldStatus } = updateGroupshopInput;
    delete updateGroupshopInput.oldStatus;
    delete updateGroupshopInput.id;
    await this.DropsGroupshopRepository.update(
      {
        id,
        status: oldStatus,
        customerDetail: {
          klaviyoId: updateGroupshopInput.customerDetail.klaviyoId,
        },
      },
      updateGroupshopInput,
    );
    return await this.findDropsGS(code);
  }

  async findOne(id: string) {
    const agg = [
      {
        $match: {
          id,
        },
      },
    ];
    // const manager = getMongoManager();
    const gs = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return gs[0];
  }

  findOneByURL(url: string) {
    return this.DropsGroupshopRepository.findOne({
      where: {
        url,
      },
    });
  }

  async update(
    id: string,
    updateDropsGroupshopInput: UpdateDropsGroupshopInput,
  ) {
    await this.DropsGroupshopRepository.update(
      { id },
      {
        ...updateDropsGroupshopInput,
      },
    );
    return await this.findOne(id);
  }

  remove(id: string) {
    return `This action removes a #${id} dropsGroupshop`;
  }

  async findExpiredDropGroupshhop() {
    const agg = [
      {
        $match: {
          $and: [
            {
              status: 'active',
            },
            {
              expiredAt: {
                $lte: new Date(),
              },
            },
          ],
        },
      },
    ];
    // const manager = getMongoManager();
    const result = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return result;
  }

  async findMissingDropShortLinks() {
    const agg = [
      {
        $match: {
          $or: [
            {
              shortUrl: {
                $regex: 'https://app.groupshop.co',
              },
            },
            {
              expiredShortUrl: {
                $regex: 'https://app.groupshop.co',
              },
            },
          ],
        },
      },
      {
        $limit: 10,
      },
    ];
    // const manager = getMongoManager();
    const result = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return result;
  }

  async findOneByKlaviyoId(klaviyoId: string) {
    return await this.DropsGroupshopRepository.findOne({
      where: {
        'customerDetail.klaviyoId': klaviyoId,
      },
    });
  }

  async findByOrderId(orderId) {
    return await this.DropsGroupshopRepository.findOne({
      where: {
        'members.orderId': { $regex: `${orderId}` },
      },
    });
  }

  async getGroupshopByKlaviyoId(klaviyoId: string) {
    const agg = [
      {
        $match: {
          'customerDetail.klaviyoId': klaviyoId,
          status: 'pending',
        },
      },
    ];
    // const manager = getMongoManager();
    const result = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return result;
  }

  async getActiveDropsNonFullyExpired(storeId: string) {
    const agg = [
      {
        $match: {
          storeId,
          discountCode: {
            $ne: null,
          },
          status: {
            $ne: 'pending',
          },
        },
      },
      {
        $lookup: {
          from: 'lifecycle',
          let: {
            gid: '$id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$groupshopId', '$$gid'],
                    },
                    {
                      $eq: ['$event', EventType.ended],
                    },
                  ],
                },
              },
            },
          ],
          as: 'revisedList',
        },
      },
      {
        $addFields: {
          arrayLength: {
            $size: '$revisedList',
          },
        },
      },
      {
        $addFields: {
          isFullyExpired: {
            $cond: {
              if: {
                $and: [
                  {
                    $lt: ['$expiredAt', new Date()],
                  },
                  {
                    $eq: ['$arrayLength', 1],
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          isFullyExpired: false,
        },
      },
      {
        $project: {
          discountCode: 1,
        },
      },
    ];
    // const manager = getMongoManager();
    const result = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return result;
  }

  async getActiveDrops(storeId: string) {
    const agg = [
      {
        $match: {
          storeId,
          discountCode: {
            $ne: null,
          },
          status: 'active',
        },
      },
      {
        $project: {
          discountCode: 1,
        },
      },
    ];
    // const manager = getMongoManager();
    const result = await this.DropsGroupshopRepository.aggregate(agg).toArray();
    return result;
  }

  async getVaultSpotlightProducts(shop: string) {
    const { id } = await this.storesService.findOne(shop);
    const collections = await this.dropsCategoryService.getSVCollectionIDs(id);
    return await (
      await this.inventoryService.getProductsByCollectionIDs(
        shop,
        [...new Set(collections)],
        false,
      )
    ).map((p: Product) => p.id);
  }

  async getNonVaultSpotlightLineitems(shop: string, lineitems: any) {
    const VSProductIds = await this.getVaultSpotlightProducts(shop);
    return lineitems.filter((l) => !VSProductIds.includes(l.product.id));
  }

  async getLastMilestoneDrops(storeId: string) {
    return this.DropsGroupshopRepository.find({
      where: { storeId, milestones: { $size: 3 } },
    });
  }

  async getAllPendingDropsByIds(ids: string[]) {
    const pendingDropGroupshop = this.DropsGroupshopRepository.find({
      where: { 'customerDetail.klaviyoId': { $in: ids }, status: 'pending' },
    });

    return (await pendingDropGroupshop).map((dgropshop) => {
      return dgropshop.id;
    });
  }

  async insertMany(dgroupshops: any[]) {
    // const manager = getMongoManager();
    return await this.DropsGroupshopRepository.insertMany(dgroupshops);
  }

  async updateBulkDgroupshops(dgroupshops: any) {
    const bulkwrite = dgroupshops.map((dgroupshop) => {
      return {
        updateOne: {
          filter: { id: dgroupshop },
          update: {
            $set: {
              status: 'expired',
              expiredAt: new Date(),
            },
          },
        },
      };
    });
    try {
      // const manager = getMongoManager();
      return await this.DropsGroupshopRepository.bulkWrite(bulkwrite);
    } catch (error) {
      console.error(error);
    }
  }
}
