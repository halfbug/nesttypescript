import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdminRolesService } from './admin-roles.service';
import { AdminRole } from './entities/admin-role.entity';
import { CreateAdminRoleInput } from './dto/create-admin-role.input';
import { UpdateAdminRoleInput } from './dto/update-admin-role.input';

@Resolver(() => AdminRole)
export class AdminRolesResolver {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Mutation(() => AdminRole)
  createAdminRole(
    @Args('createAdminRoleInput') createAdminRoleInput: CreateAdminRoleInput,
  ) {
    console.log('createAdminRoleInput', createAdminRoleInput);
    const save = this.adminRolesService.create(createAdminRoleInput);
    return save;
  }

  @Query(() => [AdminRole], { name: 'getAdminRoles' })
  findAll() {
    return this.adminRolesService.findAll();
  }

  @Query(() => AdminRole, { name: 'getAdminRole' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.adminRolesService.findOne(id);
  }

  @Query(() => AdminRole, { name: 'findUserPermissions' })
  async findUserPermissions(
    @Args('userRole', { type: () => String }) userRole: string,
  ) {
    return await this.adminRolesService.findUserPermissions(userRole);
  }

  @Mutation(() => AdminRole)
  updateAdminRole(
    @Args('updateAdminRoleInput') updateAdminRoleInput: UpdateAdminRoleInput,
  ) {
    return this.adminRolesService.update(
      updateAdminRoleInput.id,
      updateAdminRoleInput,
    );
  }

  @Mutation(() => AdminRole)
  removeAdminRole(
    @Args('userId', { type: () => String }) userId: string,
    @Args('id', { type: () => String }) id: string,
  ) {
    return this.adminRolesService.remove(userId, id);
  }
}
