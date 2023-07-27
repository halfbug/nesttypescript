import { Injectable } from '@nestjs/common';
import { MongoRepository, getMongoManager } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAdminActivityLogInput,
  fieldDetails,
} from './dto/create-admin-activity-log.input';
import { UpdateAdminActivityLogInput } from './dto/update-admin-activity-log.input';
import AdminActivityLogs from './entities/admin-activity-log.model';
import { validateOrReject } from 'class-validator';
import { StoresService } from 'src/stores/stores.service';
import { DropsCategoryService } from 'src/drops-category/drops-category.service';

@Injectable()
export class AdminActivityLogsService {
  constructor(
    @InjectRepository(AdminActivityLogs)
    private adminActivityLogsRepository: MongoRepository<AdminActivityLogs>,
    private readonly storesService: StoresService,
    private readonly dropsCategoryService: DropsCategoryService,
  ) {}
  async create(createAdminActivityLogInput: CreateAdminActivityLogInput) {
    // console.log(
    //   '🚀 ~ file: admin-activity-logs.service.ts:18 ~ AdminActivityLogsService ~ create ~ createAdminActivityLogInput',
    //   createAdminActivityLogInput,
    // );
    try {
      const adminActivity = this.adminActivityLogsRepository.create(
        createAdminActivityLogInput,
      );
      adminActivity.changes = [new fieldDetails()];
      adminActivity.id = uuid();
      adminActivity.changes = createAdminActivityLogInput.changes;
      return this.adminActivityLogsRepository.save(adminActivity);
    } catch (errors) {
      console.log(
        'Caught promise rejection (validation failed). Errors: ',
        errors,
      );
      return errors;
    }
  }

  findAll() {
    return this.adminActivityLogsRepository.find();
  }

  async dropsActivity(route: string, storeId: string, filter: string) {
    let agg: any[] = [
      {
        $lookup: {
          from: 'admin_user',
          localField: 'userId',
          foreignField: 'id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    if (filter == 'All Fields') {
      agg = [
        {
          $match: {
            route: route,
            storeId: storeId,
          },
        },
        ...agg,
      ];
    } else {
      agg = [
        {
          $match: {
            $and: [
              {
                route: route,
              },
              {
                storeId: storeId,
              },
              {
                $or: [
                  {
                    'changes.fieldname': filter,
                  },
                  {
                    [`changes.${filter}`]: {
                      $exists: true,
                    },
                  },
                  {
                    [`changes.collection.${filter}`]: {
                      $exists: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        ...agg,
      ];
    }

    const manager = getMongoManager();
    const gs = await manager.aggregate(AdminActivityLogs, agg).toArray();
    return gs;
  }

  async adminActivity(route: string, filter: string) {
    let agg: any[] = [
      {
        $lookup: {
          from: 'admin_user',
          localField: 'userId',
          foreignField: 'id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    if (filter == 'All Fields') {
      agg = [
        {
          $match: {
            route: route,
          },
        },
        ...agg,
      ];
    } else {
      agg = [
        {
          $match: {
            $and: [
              {
                route: route,
              },
              {
                $or: [
                  {
                    'changes.fieldname': filter,
                  },
                  {
                    [`changes.${filter}`]: {
                      $exists: true,
                    },
                  },
                  {
                    [`changes.collection.${filter}`]: {
                      $exists: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        ...agg,
      ];
    }

    const manager = getMongoManager();
    const gs = await manager.aggregate(AdminActivityLogs, agg).toArray();
    return gs;
  }

  async compareDropsArrays(oldValue: any, newValue: any) {
    const activityLog = [];
    Object.keys(newValue)?.map((key) => {
      if (key !== 'userId' && key !== 'activity') {
        if (
          newValue[key] !== oldValue[key] &&
          typeof newValue[key] !== 'object'
        ) {
          activityLog.push({
            fieldname: key,
            oldvalue: oldValue[key],
            newValue: newValue[key],
          });
        }
        if (typeof newValue[key] === 'object') {
          this.innerDropsArrays(
            newValue[key],
            oldValue[key] === undefined ? [] : oldValue[key],
            activityLog,
            oldValue[0]?.title,
          );
        }
      }
    });
    return activityLog;
  }

  innerDropsArrays(newObject: any, oldValue: any, activityLog: any, title) {
    Object.keys(newObject ?? {})?.map((ikey) => {
      if (newObject[ikey] !== null) {
        if (typeof newObject[ikey] !== 'object') {
          if (oldValue[ikey] !== undefined || oldValue[ikey] !== null) {
            if (
              newObject[ikey] !== oldValue[ikey] &&
              ikey !== 'codeUpdateStatus' &&
              ikey !== 'dropsCount'
            ) {
              activityLog.push({
                parentTitle: title,
                fieldname: ikey,
                oldvalue: oldValue[ikey],
                newValue: newObject[ikey],
              });
            }
          } else {
            if (ikey !== 'codeUpdateStatus' && ikey !== 'dropsCount') {
              activityLog.push({
                parentTitle: title,
                fieldname: ikey,
                oldvalue: null,
                newValue: newObject[ikey],
              });
            }
          }
        }
        if (typeof newObject[ikey] === 'object') {
          const hasKey = ikey in oldValue;
          this.innerDropsArrays(
            newObject[ikey],
            hasKey ? oldValue[ikey] : [],
            activityLog,
            title,
          );
        }
      }
    });
    return activityLog;
  }

  async compareVideoArrays(oldValue: any, newValues: any) {
    const activityLog = [];
    console.log('activityLog');
    oldValue.forEach((field, key) => {
      const result = newValues.find((item) => item.id == field._id);
      if (typeof result !== 'undefined') {
        if (field.orderId != result.orderId) {
          activityLog.push({
            parentTitle: field.name,
            fieldname: 'sortOrder',
            oldvalue: field.orderId,
            newValue: result.orderId,
          });
        }
        if (field.status !== result.status) {
          activityLog.push({
            parentTitle: field.name,
            fieldname: 'status',
            oldvalue: field.status,
            newValue: result.status,
          });
        }
      } else {
        if (field.status !== 'InActive') {
          activityLog.push({
            parentTitle: field.name,
            fieldname: 'status',
            oldvalue: field.status,
            newValue: 'InActive',
          });
        }
        if (field.orderId != 0) {
          activityLog.push({
            parentTitle: field.name,
            fieldname: 'sortOrder',
            oldvalue: field.orderId,
            newValue: 0,
          });
        }
      }
    });
    return activityLog;
  }

  async compareDiscoveryArrays(oldValue: any, newValues: any) {
    const activityLog = [];
    oldValue?.matchingBrandName.forEach((field, key) => {
      const result = newValues.matchingBrandName.find(
        (item) => item.id == field.id,
      );
      if (typeof result === 'undefined') {
        activityLog.push({
          id: field.id,
          brandName: field.brandName,
        });
      }
    });
    return activityLog;
  }

  async compareUserArrays(oldValue: any, newValue: any) {
    const activityLog = [];
    Object.keys(newValue)?.map((key) => {
      if (
        key !== 'userId' &&
        key !== 'activity' &&
        key !== 'createdAt' &&
        key !== 'updatedAt'
      ) {
        if (
          newValue[key] !== oldValue[key] &&
          typeof newValue[key] !== 'object'
        ) {
          activityLog.push({
            fieldname: key,
            oldvalue: oldValue[key],
            newValue: newValue[key],
          });
        }
      }
    });
    return activityLog;
  }

  async compareRoleArrays(oldValue: any, newValue: any) {
    const activityLog = [];
    if (typeof newValue !== 'object') {
      Object.keys(newValue)?.map((key) => {
        if (
          key !== 'userId' &&
          key !== 'activity' &&
          key !== 'createdAt' &&
          key !== 'updatedAt'
        ) {
          if (
            newValue[key] !== oldValue[key] &&
            typeof newValue[key] !== 'object'
          ) {
            activityLog.push({
              fieldname: key,
              oldvalue: oldValue[key],
              newValue: newValue[key],
            });
          }
        }
      });
    }
    if (typeof newValue === 'object') {
      const differenceOld = oldValue.permission.filter(
        (e) => !newValue.permission.find((a) => e.name === a.name),
      );
      differenceOld.forEach((key: any) => {
        activityLog.push({
          parentTitle: newValue.roleName,
          fieldname: 'Permission (Remove)',
          oldvalue: key.name,
          newValue: null,
        });
      });
      const differenceNew = newValue.permission.filter(
        (e) => !oldValue.permission.find((a) => e.name === a.name),
      );
      differenceNew.forEach((key: any) => {
        activityLog.push({
          parentTitle: newValue.roleName,
          fieldname: 'Permission (Added)',
          oldvalue: null,
          newValue: key.name,
        });
      });
    }
    return activityLog;
  }

  async compareDiscoverySortingArrays(oldValue: any, newValue: any) {
    const activityLog = [];
    if (oldValue.status !== newValue.status) {
      activityLog.push({
        parentTitle: null,
        fieldname: 'status',
        oldvalue: oldValue.status,
        newValue: newValue.status,
      });
    }
    oldValue?.matchingBrandName?.forEach((key: any, index) => {
      if (key.id !== newValue?.matchingBrandName[index].id) {
        activityLog.push({
          parentTitle: 'Sorting',
          fieldname: 'brandName',
          oldvalue: key.brandName,
          newValue: newValue?.matchingBrandName[index].brandName,
        });
      }
    });
    return activityLog;
  }

  async removeCompareArrays(oldValue: any, newValue: any, context: string) {
    let activityLog = [];
    if (
      context === 'Drops Navigation Management' ||
      context === 'Manage Section Content'
    ) {
      Object.keys(oldValue)?.map((key) => {
        if (key !== 'userId' && key !== 'activity' && key !== '_id') {
          activityLog.push(oldValue[key]);
          if (typeof oldValue[key] === 'object') {
            activityLog = this.innerRemoveCompareArrays(
              oldValue[key],
              newValue[key],
              activityLog,
            );
          }
        }
      });
    } else {
      const difference = oldValue.filter(
        (e) => !newValue.find((a) => e.id === a.id),
      );
      activityLog = difference;
    }
    return activityLog;
  }

  innerRemoveCompareArrays(oldValue: any, newValue: any, activityLog: any) {
    Object.keys(oldValue)?.map((ikey) => {
      if (oldValue[ikey] !== null) {
        if (
          typeof oldValue[ikey] === 'object' &&
          ikey !== 'createdAt' &&
          ikey !== 'updatedAt' &&
          ikey !== '_id'
        ) {
          const difference = oldValue[ikey].filter(
            (e) => !newValue[ikey].find((a) => e.name === a.name),
          );
          activityLog[0][ikey] = difference;
        }
      }
    });
    return activityLog;
  }

  async compareSortingArrays(oldValue: any, newValue: any) {
    const activityLog = [];
    if (newValue.length > 1) {
      oldValue.forEach((field, key) => {
        const result = newValue.find((item) => item.title === field.title);
        if (typeof result !== 'undefined') {
          if (field.sortOrder !== result.sortOrder) {
            activityLog.push({
              parentTitle: field.title,
              fieldname: 'sortOrder',
              oldvalue: field.sortOrder,
              newValue: result.sortOrder,
            });
          }
        }
      });
    } else {
      oldValue[0]?.collections.forEach((field, key) => {
        activityLog.push({
          parentTitle: field.title,
          fieldname: 'sortOrder',
          oldvalue: field.name,
          newValue: newValue[0].collections[key].name,
        });
      });
    }
    return activityLog;
  }

  async syncDiscountArrays(oldValue: any, newValue: any) {
    const activityLog = [];
    Object.keys(newValue)?.map((key) => {
      activityLog.push({
        fieldname: key,
        oldvalue: null,
        newValue: newValue[key],
      });
    });
    return activityLog;
  }

  async createAdminActivity(
    message,
    context,
    operation,
    mfields,
    userId,
    oldValue,
    storeId,
  ) {
    let compareResult;
    if (operation === 'UPDATE') {
      if (context === 'Update Sorting Order') {
        compareResult = await this.compareSortingArrays(oldValue, mfields);
      } else if (context === 'Video Management') {
        compareResult = await this.compareVideoArrays(oldValue, mfields);
      } else if (context === 'User Management') {
        compareResult = await this.compareUserArrays(oldValue, mfields);
      } else if (context === 'Role Management') {
        compareResult = await this.compareRoleArrays(oldValue, mfields);
      } else if (context === 'Discovery Tools Management') {
        compareResult = await this.compareDiscoverySortingArrays(
          oldValue,
          mfields,
        );
      } else if (context === 'Sync Discount Codes') {
        compareResult = await this.syncDiscountArrays(oldValue, mfields);
      } else {
        compareResult = await this.compareDropsArrays(oldValue, mfields);
      }
    } else if (operation === 'REMOVE') {
      if (
        context == 'Manage Section Content' ||
        context === 'Cart Rewards Management'
      ) {
        compareResult = await this.removeCompareArrays(
          oldValue,
          mfields,
          context,
        );
      } else if (context === 'Discovery Tools Management') {
        compareResult = await this.compareDiscoveryArrays(oldValue, mfields);
      } else {
        compareResult = oldValue;
      }
    } else {
      compareResult = mfields;
    }
    const result = {
      route: message,
      userId: userId,
      storeId: storeId,
      context: mfields?.activity ?? context,
      operation: operation,
      changes: compareResult,
    };
    console.log('compareResult', compareResult);
    if (compareResult?.length > 0) {
      this.create(result);
    }
  }

  findOne(id: string) {
    return this.adminActivityLogsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAdminRoleInput: UpdateAdminActivityLogInput) {
    await this.adminActivityLogsRepository.update({ id }, updateAdminRoleInput);
    const adminUser = await this.adminActivityLogsRepository.findOne({
      where: {
        id,
      },
    });
    return adminUser;
  }

  remove(id: string) {
    return this.adminActivityLogsRepository.delete({ id });
  }
}
