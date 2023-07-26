import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAdminUserInput } from './dto/create-admin-user.input';
import { UpdateAdminUserInput } from './dto/update-admin-user.input';
import AdminUser from './entities/admin-user.model';
import { MongoRepository, getMongoManager } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { validate, validateOrReject, isEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: MongoRepository<AdminUser>,
  ) {}

  async create(createAdminUserInput: CreateAdminUserInput) {
    console.log(
      '🚀 ~ file: admin-users.service.ts:18 ~ AdminUsersService ~ create ~ createAdminUserInput',
      createAdminUserInput,
    );
    try {
      const valid = await validateOrReject(createAdminUserInput);
      console.log(isEmail(createAdminUserInput.email));
      console.log(
        '🚀 ~ file: admin-users.service.ts:20 ~ AdminUsersService ~ create ~ valid',
        valid,
      );
      const id = uuid();
      const usersInput = [];
      usersInput.push({ ...createAdminUserInput });

      const adminUser = this.adminUserRepository.create({
        id,
        ...createAdminUserInput,
      });
      delete usersInput[0]['password'];
      Logger.log(
        '/users',
        'User Management',
        false,
        'CREATE',
        usersInput,
        createAdminUserInput.userId,
        null,
        null,
      );
      return this.adminUserRepository.save(adminUser);
    } catch (errors) {
      console.log(
        'Caught promise rejection (validation failed). Errors: ',
        errors,
      );
      return errors;
    }
  }

  findAll() {
    const agg = [
      {
        $match: {
          email: {
            $ne: null,
          },
        },
      },
      {
        $lookup: {
          from: 'admin_user_role',
          localField: 'userRole',
          foreignField: 'id',
          as: 'userRole',
        },
      },
      {
        $unwind: {
          path: '$userRole',
        },
      },
    ];
    const manager = getMongoManager();
    return manager.aggregate(AdminUser, agg).toArray();
  }

  findOne(fieldname: string, value: any) {
    return this.adminUserRepository.findOne({
      where: {
        [fieldname]: value,
      },
    });
  }

  findOneByUserName(username: string) {
    return this.adminUserRepository.findOne({
      where: {
        username,
      },
    });
  }

  async verify(user: { email: string; password: string }) {
    console.log(
      '🚀 ~ file: admin-users.service.ts:65 ~ AdminUsersService ~ verify ~ user',
      user,
    );
    // find user by email
    const realUser = await this.findOne('email', user.email);
    console.log(
      '🚀 ~ file: admin-users.service.ts:66 ~ AdminUsersService ~ verify ~ realUser',
      realUser,
    );
    if (!realUser) {
      // Check if user exists
      // User not found
      return false;
    }
    // check if password is correct
    const passworMatch = await bcrypt.compare(user.password, realUser.password);
    console.log(
      '🚀 ~ file: admin-users.service.ts:83 ~ AdminUsersService ~ verify ~ passworMatch',
      passworMatch,
    );

    if (!passworMatch) {
      // Invalid credentials
      return false;
    }
    const lastLoginUpdate = {
      id: realUser.id,
      lastLogin: new Date(),
    };
    await this.update(lastLoginUpdate.id, lastLoginUpdate);
    // return the user
    return realUser;
  }

  async update(id: string, updateAdminUserInput: UpdateAdminUserInput) {
    const adminUser = await this.adminUserRepository.findOne({
      where: {
        id,
      },
    });
    console.log(
      '🚀 ~ file: admin-users.service.ts:100 ~ AdminUsersService ~ update ~ adminUser',
      adminUser,
    );
    Logger.log(
      '/users',
      'User Management',
      false,
      'UPDATE',
      updateAdminUserInput,
      updateAdminUserInput.userId,
      adminUser,
      null,
    );
    await this.adminUserRepository.update({ id }, updateAdminUserInput);
    return await this.adminUserRepository.findOne({
      where: {
        id,
      },
    });
  }

  async remove(userId: string, id: string) {
    const oldValue = await this.adminUserRepository.findOne({ where: { id } });
    delete oldValue['password'];
    const usersInput = [];
    usersInput.push(oldValue);

    await this.adminUserRepository.delete({ id });
    Logger.log(
      '/users',
      'User Management',
      false,
      'REMOVE',
      'newValue',
      userId,
      usersInput,
      null,
    );
    return { status: 'User deleted successfully' };
  }
}
