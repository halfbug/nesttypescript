import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoManager, Repository } from 'typeorm';
import { CreateOrderInput, DiscountInfo } from './dto/create-order.input';
import { UpdateFullOrderInput } from './dto/update-fullorder.input';
import { UpdateOrderInput } from './dto/update-order.input';
import Orders from './entities/orders.modal';
import { Member } from 'src/drops-groupshop/entities/groupshop.modal';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
  ) {}

  async insertMany(orders: []) {
    const manager = getMongoManager();

    return await manager.insertMany(Orders, orders);
  }

  async getPurchasedProducts(shop: string) {
    const agg = [
      {
        $match: {
          $and: [
            {
              id: {
                $regex: 'LineItem',
              },
            },
            {
              shop,
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            id: '$product.id',
          },
          purchaseCount: {
            $sum: 1,
          },
          id: {
            $first: '$id',
          },
          __parentId: {
            $first: '$__parentId',
          },
          productId: {
            $first: '$product.id',
          },
        },
      },
    ];

    const manager = getMongoManager();

    return await manager.aggregate(Orders, agg).toArray();
  }
  async getPurchasedProductsLastSixMonth(shop: string, nowdate: Date) {
    const agg = [
      {
        $match: {
          $and: [
            {
              id: {
                $regex: 'Order',
              },
            },
            {
              shop,
            },
          ],
        },
      },
      {
        $project: {
          createDate: {
            $dateFromString: {
              dateString: '$shopifyCreateAt',
            },
          },
          id: 1,
        },
      },
      {
        $match: {
          createDate: {
            $gte: new Date(Date.now() - 15770000000),
          },
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'parentId',
          as: 'LI',
        },
      },
      {
        $unwind: {
          path: '$LI',
        },
      },
      {
        $group: {
          _id: '$LI.product.id',
          purchaseCount: {
            $sum: {
              $multiply: [1, '$LI.quantity'],
            },
          },
        },
      },
    ];

    const manager = getMongoManager();

    return await manager.aggregate(Orders, agg).toArray();
  }

  async getDataByOrderId(orderId: string) {
    const agg = [
      {
        $match: {
          id: orderId,
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'parentId',
          as: 'lineItems',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'lineItems.product.id',
          foreignField: 'id',
          as: 'products',
        },
      },
    ];

    const manager = getMongoManager();

    return await manager.aggregate(Orders, agg).toArray();
  }

  async getCustomerNameByOrderId(orderId: string) {
    const agg = [
      {
        $match: {
          id: orderId,
        },
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    return gs;
  }

  async getOrderDetailsByOrderId(orderId: string) {
    const agg = [
      {
        $match: {
          id: orderId,
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'parentId',
          as: 'lineItems',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'lineItems.product.id',
          foreignField: 'id',
          as: 'products',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'products.id',
          foreignField: 'parentId',
          as: 'variants',
        },
      },
      {
        $addFields: {
          Products: {
            $map: {
              input: '$products',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    variants: {
                      $filter: {
                        input: '$variants',
                        as: 'j',
                        cond: {
                          $and: [
                            {
                              $eq: ['$$this.id', '$$j.parentId'],
                            },
                            {
                              $eq: ['$$j.recordType', 'ProductVariant'],
                            },
                          ],
                        },
                      },
                    },
                  },
                  {
                    image: {
                      $filter: {
                        input: '$variants',
                        as: 'j',
                        cond: {
                          $and: [
                            {
                              $eq: ['$$this.id', '$$j.parentId'],
                            },
                            {
                              $eq: ['$$j.recordType', 'ProductImage'],
                            },
                          ],
                        },
                      },
                    },
                  },
                  {
                    collections: {
                      $filter: {
                        input: '$variants',
                        as: 'j',
                        cond: {
                          $and: [
                            {
                              $eq: ['$$this.id', '$$j.parentId'],
                            },
                            {
                              $eq: ['$$j.recordType', 'Collection'],
                            },
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
        $project: {
          products: 0,
          variants: 0,
        },
      },
      {
        $addFields: {
          LineItems: {
            $map: {
              input: '$lineItems',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    product: {
                      $filter: {
                        input: '$Products',
                        as: 'j',
                        cond: {
                          $eq: ['$$this.product.id', '$$j.id'],
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
        $project: {
          lineItems: 0,
          Products: 0,
        },
      },
    ];

    const manager = getMongoManager();

    return await manager.aggregate(Orders, agg).toArray();
  }

  async getOrderCount(shop: string) {
    const agg = [
      {
        $match: {
          $and: [
            {
              confirmed: true,
            },
            {
              shop: shop,
            },
          ],
        },
      },
      {
        $count: 'countTotalOrders',
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    const response = {
      countTotalOrders: gs[0]?.countTotalOrders || 0,
    };
    return response;
  }

  async findpendinggroupshop(
    shop: string,
    startDate: string,
    endDate: string,
    minOrderValue: string,
  ) {
    const agg: any = [
      {
        $match: {
          $and: [
            {
              shop: shop,
            },
            {
              confirmed: true,
            },
          ],
        },
      },
      {
        $project: {
          createDate: {
            $dateFromString: {
              dateString: '$shopifyCreateAt',
            },
          },
          id: 1,
          price: 1,
          shop: 1,
          confirmed: 1,
          currencyCode: 1,
          totalDiscounts: 1,
          discountCode: 1,
          discountInfo: 1,
          customer: 1,
          shopifyCreateAt: 1,
          name: 1,
        },
      },
      {
        $match: {
          $and: [
            {
              createDate: {
                $gte: new Date(startDate),
              },
            },
            {
              createDate: {
                $lt: new Date(endDate),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'groupshops',
          localField: 'id',
          foreignField: 'members.orderId',
          as: 'groupshops',
        },
      },
      {
        $addFields: {
          haveGroupshop: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: '$groupshops',
                  },
                  0,
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
          haveGroupshop: false,
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'parentId',
          as: 'lineItems',
        },
      },
    ];

    if (minOrderValue !== '')
      agg?.push({
        $match: {
          $expr: {
            $gte: [
              {
                $toDecimal: '$price',
              },
              +minOrderValue,
            ],
          },
        },
      });

    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    return gs;
  }

  async findMostViralProducts(
    shop: string,
    startDate: string,
    endDate: string,
  ) {
    let fullDate = '';
    const d = new Date();
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    fullDate = `${year}${'-'}${month}${'-'}${day}`;
    if (startDate === '-') {
      startDate = '2021-01-21';
      endDate = fullDate;
    }
    const agg = [
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  $and: [
                    {
                      discountCode: {
                        $not: {
                          $regex: '^GSP.*',
                        },
                      },
                    },
                    {
                      discountCode: {
                        $not: {
                          $regex: '^GSC.*',
                        },
                      },
                    },
                    {
                      discountCode: {
                        $regex: '^GS',
                      },
                    },
                  ],
                },
              ],
            },
            {
              shop: shop,
            },
            {
              createdAt: {
                $gte: new Date(`${startDate}${'T00:00:01'}`),
                $lte: new Date(`${endDate}${'T23:59:59'}`),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'parentId',
          as: 'LI',
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
        $unwind: {
          path: '$LI',
        },
      },
      {
        $addFields: {
          hideStatus: {
            $in: ['$LI.product.id', '$store.hideProducts'],
          },
        },
      },
      {
        $match: {
          hideStatus: false,
        },
      },
      {
        $group: {
          _id: '$LI.product.id',
          purchaseCount: {
            $sum: {
              $multiply: [1, '$LI.quantity'],
            },
          },
          revenue: {
            $sum: {
              $multiply: ['$LI.discountedPrice', '$LI.quantity'],
            },
          },
        },
      },
      {
        $sort: {
          purchaseCount: -1,
          revenue: -1,
          'LI.product.title': 1,
        },
      },
      {
        $limit: 4,
      },
      {
        $lookup: {
          from: 'inventory',
          localField: '_id',
          foreignField: 'id',
          as: 'productDetails',
        },
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    return gs;
  }

  async findPartnerViralProducts(
    shop: string,
    startDate: string,
    endDate: string,
  ) {
    let fullDate = '';
    const d = new Date();
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    fullDate = `${year}${'-'}${month}${'-'}${day}`;
    if (startDate === '-') {
      startDate = '2021-01-21';
      endDate = fullDate;
    }
    const agg = [
      {
        $match: {
          $and: [
            {
              discountCode: {
                $regex: '^GSP.*',
              },
            },
            {
              shop: shop,
            },
            {
              createdAt: {
                $gte: new Date(`${startDate}${'T00:00:01'}`),
                $lte: new Date(`${endDate}${'T23:59:59'}`),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'parentId',
          as: 'LI',
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
        $unwind: {
          path: '$LI',
        },
      },
      {
        $addFields: {
          hideStatus: {
            $in: ['$LI.product.id', '$store.hideProducts'],
          },
        },
      },
      {
        $match: {
          hideStatus: false,
        },
      },
      {
        $group: {
          _id: '$LI.product.id',
          purchaseCount: {
            $sum: {
              $multiply: [1, '$LI.quantity'],
            },
          },
          revenue: {
            $sum: {
              $multiply: ['$LI.discountedPrice', '$LI.quantity'],
            },
          },
        },
      },
      {
        $sort: {
          purchaseCount: -1,
          revenue: -1,
          'LI.product.title': 1,
        },
      },
      {
        $limit: 4,
      },
      {
        $lookup: {
          from: 'inventory',
          localField: '_id',
          foreignField: 'id',
          as: 'productDetails',
        },
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    return gs;
  }

  async create(createOrderInput: CreateOrderInput) {
    try {
      const order = this.ordersRepository.create(createOrderInput);
      order.discountInfo = [new DiscountInfo()];
      order.discountInfo = createOrderInput.discountInfo;

      return await this.ordersRepository.save(order);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  async updateBulkOrders(orderData: any) {
    const manager = getMongoManager();
    return await manager.bulkWrite(Orders, orderData);
  }

  async smsUpdate(updateOrderInput: UpdateOrderInput) {
    const criteria = {
      shop: updateOrderInput.shop,
      'customer.email': updateOrderInput.email,
    };
    try {
      const manager = getMongoManager();
      manager.updateMany(Orders, criteria, {
        $set: { 'customer.sms_marketing': updateOrderInput.sms_marketing },
      });
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }

  async removeShop(shop: string) {
    return await this.ordersRepository.delete({ shop });
  }

  async update(updateOrderInput: UpdateFullOrderInput) {
    const { id } = updateOrderInput;
    return await this.ordersRepository.update({ id }, updateOrderInput);
  }

  async findOrderLineItems(parentId: string) {
    const agg = [
      {
        $match: {
          parentId: parentId,
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'product.id',
          foreignField: 'id',
          as: 'product',
        },
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    return gs;
  }

  async getMembersOrderDetail(members: Member[]) {
    const orderIds = members.map((m) => m.orderId);
    const agg = [
      {
        $match: {
          id: {
            $in: orderIds,
          },
        },
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(Orders, agg).toArray();
    return gs;
  }
}
