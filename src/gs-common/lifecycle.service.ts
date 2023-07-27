import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoManager, MongoRepository, Repository } from 'typeorm';
import { EventType, Lifecycle } from './entities/lifecycle.modal';

@Injectable()
export class LifecycleService {
  constructor(
    @InjectRepository(Lifecycle)
    private lifecycleRepository: MongoRepository<Lifecycle>, // private shopifyapi: ShopifyService,
  ) {}
  create(eventLifecycle: Lifecycle) {
    if (eventLifecycle.dateTime === null) eventLifecycle.dateTime = new Date();
    return this.lifecycleRepository.save(eventLifecycle);
  }

  createMany(documents) {
    return this.lifecycleRepository.insertMany(documents);
  }

  findAll(groupshopId: string) {
    return this.lifecycleRepository.find({
      where: { groupshopId },
      order: { dateTime: -1 },
    });
  }

  findAllEvents(groupshopId: string, event: EventType) {
    return this.lifecycleRepository.find({
      where: { groupshopId, event },
      order: { dateTime: -1 },
    });
  }

  // async getBillingByDate(storeId: string, sdate: any, edate: any) {
  async getCustomBilling(storeId: string) {
    const agg = [
      {
        $match: {
          $and: [
            {
              storeId,
            },
            {
              event: 'planReset',
            },
          ],
        },
      },
      {
        $group: {
          _id: '$dateTime',
          storeId: {
            $first: '$storeId',
          },
          plan: {
            $first: '$plan',
          },
          dateTime: {
            $first: '$dateTime',
          },
        },
      },
      {
        $addFields: {
          nextDate: {
            $dateAdd: {
              startDate: '$dateTime',
              unit: 'day',
              amount: 30,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'billing',
          localField: 'storeId',
          foreignField: 'storeId',
          as: 'billing',
        },
      },
      {
        $addFields: {
          rangedBilling: {
            $filter: {
              input: '$billing',
              as: 'j',
              cond: {
                $and: [
                  {
                    $lte: ['$$j.createdAt', '$nextDate'],
                  },
                  {
                    $gte: ['$$j.createdAt', '$dateTime'],
                  },
                ],
              },
            },
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
      {
        $addFields: {
          feeTotalGS: {
            $reduce: {
              input: {
                $filter: {
                  input: '$rangedBilling',
                  cond: {
                    $eq: ['$$this.type', 1],
                  },
                },
              },
              initialValue: 0,
              in: {
                $add: ['$$value', '$$this.feeCharges'],
              },
            },
          },
        },
      },
      {
        $addFields: {
          cashBackRec: {
            $filter: {
              input: '$rangedBilling',
              cond: {
                $and: [
                  {
                    $eq: ['$$this.type', 0],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          feeTotalCB: {
            $sum: '$cashBackRec.feeCharges',
          },
        },
      },
      {
        $addFields: {
          revenue: {
            $reduce: {
              input: '$rangedBilling',
              initialValue: 0,
              in: {
                $add: ['$$value', '$$this.revenue'],
              },
            },
          },
          trialDate: '$store.appTrialEnd',
          createdMonthGS: {
            $reduce: {
              input: {
                $filter: {
                  input: '$rangedBilling',
                  cond: {
                    $and: [
                      {
                        $eq: ['$$this.type', 1],
                      },
                    ],
                  },
                },
              },
              initialValue: 0,
              in: {
                $add: ['$$value', 1],
              },
            },
          },
        },
      },
      {
        $addFields: {
          cashBack: {
            $sum: '$cashBackRec.cashBack',
          },
        },
      },
      {
        $addFields: {
          feeChargesGS: {
            $reduce: {
              input: {
                $filter: {
                  input: '$rangedBilling',
                  cond: {
                    $and: [
                      {
                        $eq: ['$$this.type', 1],
                      },
                      {
                        $gt: ['$createdAt', '$trialDate'],
                      },
                    ],
                  },
                },
              },
              initialValue: 0,
              in: {
                $add: ['$$value', '$$this.feeCharges'],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          cashBack: {
            $sum: '$cashBack',
          },
          revenue: {
            $sum: '$revenue',
          },
          feeCharges: {
            $sum: '$feeTotalCB',
          },
          count: {
            $count: {},
          },
          totalGS: {
            $sum: '$createdMonthGS',
          },
          nextDate: {
            $first: '$nextDate',
          },
          feeTotalGS: {
            $first: '$feeTotalGS',
          },
          feeChargesGS: {
            $sum: '$feeChargesGS',
          },
        },
      },
      {
        $project: {
          totalCharges: {
            $add: ['$feeCharges', '$feeTotalGS'],
          },
          cashBack: 1,
          revenue: 1,
          feeCharges: 1,
          feeChargesGS: 1,
          count: 1,
          totalGS: 1,
          nextDate: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ];
    // console.log("🚀 findBillingBydate ~ agg", agg)
    const manager = getMongoManager();
    const TotalRes = await manager.aggregate(Lifecycle, agg).toArray();
    console.log('🚀 get billing by date', TotalRes);
    return TotalRes;
  }

  async insertMany(dgroupshops: any[]) {
    const manager = getMongoManager();

    return await manager.insertMany(Lifecycle, dgroupshops);
  }
}
