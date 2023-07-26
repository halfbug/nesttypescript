import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AdminUsersService } from './admin-users.service';
import { AdminUser } from './entities/admin-user.entity';
import { CreateAdminUserInput } from './dto/create-admin-user.input';
import { UpdateAdminUserInput } from './dto/update-admin-user.input';

@Resolver(() => AdminUser)
export class AdminUsersResolver {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Mutation(() => AdminUser)
  createAdminUser(
    @Args('createAdminUserInput') createAdminUserInput: CreateAdminUserInput,
  ) {
    return this.adminUsersService.create(createAdminUserInput);
  }

  @Query(() => [AdminUser], { name: 'getAdminUsers' })
  async findAll() {
    return await this.adminUsersService.findAll();
  }

  @Query(() => AdminUser, { name: 'getAdminUser' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.adminUsersService.findOne('id', id);
  }

  @Query(() => AdminUser, { name: 'getAdminUserByUserName' })
  adminUserByUserName(
    @Args('username', { type: () => String }) username: string,
  ) {
    return this.adminUsersService.findOneByUserName(username);
  }

  @Mutation(() => AdminUser)
  updateAdminUser(
    @Args('updateAdminUserInput') updateAdminUserInput: UpdateAdminUserInput,
  ) {
    return this.adminUsersService.update(
      updateAdminUserInput.id,
      updateAdminUserInput,
    );
  }

  @Mutation(() => AdminUser)
  removeAdminUser(
    @Args('userId', { type: () => String }) userId: string,
    @Args('id', { type: () => String }) id: string,
  ) {
    return this.adminUsersService.remove(userId, id);
  }
}
