import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { validateOrReject } from 'class-validator';
import { MongoRepository, getMongoManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import AdminUserRole from './entities/admin-role.model';
import {
  CreateAdminRoleInput,
  PermissionInput,
} from './dto/create-admin-role.input';
import { UpdateAdminRoleInput } from './dto/update-admin-role.input';

@Injectable()
export class AdminRolesService {
  constructor(
    @InjectRepository(AdminUserRole)
    private adminUserRoleRepository: MongoRepository<AdminUserRole>,
  ) {}
  async create(createAdminRoleInput: CreateAdminRoleInput) {
    console.log(
      '🚀 ~ file: admin-roles.service.ts:18 ~ AdminRolesService ~ create ~ createAdminRoleInput',
      createAdminRoleInput,
    );
    try {
      const valid = await validateOrReject(createAdminRoleInput);
      console.log(
        '🚀 ~ file: admin-roles.service.ts:20 ~ AdminRolesService ~ create ~ valid',
        valid,
      );

      const adminRole =
        this.adminUserRoleRepository.create(createAdminRoleInput);
      adminRole.permission = [new PermissionInput()];
      adminRole.id = uuid();
      adminRole.permission = createAdminRoleInput.permission;
      const save = this.adminUserRoleRepository.save(adminRole);

      const usersInput = [];
      usersInput.push({
        roleName: adminRole.roleName,
        permission: adminRole.permission,
      });

      Logger.log(
        '/roles',
        'Role Management',
        false,
        'CREATE',
        usersInput,
        createAdminRoleInput.userId,
        null,
        null,
      );

      return save;
    } catch (errors) {
      console.log(
        'Caught promise rejection (validation failed). Errors: ',
        errors,
      );
      return errors;
    }
  }

  findAll() {
    return this.adminUserRoleRepository.find();
  }

  findOne(id: string) {
    return this.adminUserRoleRepository.findOne({ where: { id } });
  }

  async findUserPermissions(userRole: string) {
    const agg = [
      {
        $match: {
          id: userRole,
        },
      },
      {
        $lookup: {
          from: 'admin_permission',
          pipeline: [
            {
              $match: {
                _id: {
                  $ne: null,
                },
              },
            },
          ],
          as: 'generalPermission',
        },
      },
    ];
    const manager = getMongoManager();
    const gs = await manager.aggregate(AdminUserRole, agg).toArray();
    return gs[0];
  }

  async update(id: string, updateAdminRoleInput: UpdateAdminRoleInput) {
    const roles = await this.adminUserRoleRepository.findOne({
      where: {
        id,
      },
    });

    Logger.log(
      '/roles',
      'Role Management',
      false,
      'UPDATE',
      updateAdminRoleInput,
      updateAdminRoleInput.userId,
      roles,
      null,
    );

    await this.adminUserRoleRepository.update({ id }, updateAdminRoleInput);
    const adminUser = await this.adminUserRoleRepository.findOne({
      where: {
        id,
      },
    });
    return adminUser;
  }

  async remove(userId: string, id: string) {
    const oldValue = await this.adminUserRoleRepository.findOne({
      where: { id },
    });
    delete oldValue['id'];
    delete oldValue['_id'];
    const usersInput = [];
    usersInput.push(oldValue);

    Logger.log(
      '/roles',
      'Role Management',
      false,
      'REMOVE',
      'newValue',
      userId,
      usersInput,
      null,
    );
    await this.adminUserRoleRepository.delete({ id });
    return { roleName: 'Admin role deleted successfully' };
  }
}
