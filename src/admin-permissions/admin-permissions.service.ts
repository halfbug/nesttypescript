import { Injectable } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { validateOrReject } from 'class-validator';
import { MongoRepository } from 'typeorm';
import { CreateAdminPermissionInput } from './dto/create-admin-permission.input';
import { UpdateAdminPermissionInput } from './dto/update-admin-permission.input';
import AdminPermission from './entities/admin-permission.model';

@Injectable()
export class AdminPermissionsService {
  constructor(
    @InjectRepository(AdminPermission)
    private adminPermissionRepository: MongoRepository<AdminPermission>,
  ) {}
  async create(createAdminPermissionInput: CreateAdminPermissionInput) {
    console.log(
      '🚀 ~ file: admin-permission.service.ts:18 ~ AdminRolesService ~ create ~ createAdminPermissionInput',
      createAdminPermissionInput,
    );
    try {
      const valid = await validateOrReject(createAdminPermissionInput);
      console.log(
        '🚀 ~ file: admin-roles.service.ts:20 ~ AdminRolesService ~ create ~ valid',
        valid,
      );

      const adminPermission = this.adminPermissionRepository.create(
        createAdminPermissionInput,
      );
      return this.adminPermissionRepository.save(adminPermission);
    } catch (errors) {
      console.log(
        'Caught promise rejection (validation failed). Errors: ',
        errors,
      );
      return errors;
    }
  }

  findAll() {
    return this.adminPermissionRepository.find();
  }

  findOne(id: string) {
    return this.adminPermissionRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateAdminPermissionInput: UpdateAdminPermissionInput,
  ) {
    await this.adminPermissionRepository.update(
      { id },
      updateAdminPermissionInput,
    );
    const adminPermission = await this.adminPermissionRepository.findOne({
      where: {
        id,
      },
    });
    return adminPermission;
  }

  remove(id: string) {
    return this.adminPermissionRepository.delete({ id });
  }
}
