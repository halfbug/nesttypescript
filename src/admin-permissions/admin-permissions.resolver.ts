import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminPermission } from './entities/admin-permission.entity';
import { CreateAdminPermissionInput } from './dto/create-admin-permission.input';
import { UpdateAdminPermissionInput } from './dto/update-admin-permission.input';

@Resolver(() => AdminPermission)
export class AdminPermissionsResolver {
  constructor(
    private readonly adminPermissionsService: AdminPermissionsService,
  ) {}

  @Mutation(() => AdminPermission)
  createPermission(
    @Args('createAdminPermissionInput')
    createAdminPermissionInput: CreateAdminPermissionInput,
  ) {
    console.log('createAdminPermissionInput', createAdminPermissionInput);
    const save = this.adminPermissionsService.create(
      createAdminPermissionInput,
    );
    return save;
  }

  @Query(() => [AdminPermission], { name: 'getAdminPermissions' })
  findAll() {
    return this.adminPermissionsService.findAll();
  }

  @Query(() => AdminPermission, { name: 'getAdminPermission' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.adminPermissionsService.findOne(id);
  }

  @Mutation(() => AdminPermission)
  updatePermission(
    @Args('updateAdminRoleInput')
    updateAdminPermissionInput: UpdateAdminPermissionInput,
  ) {
    return this.adminPermissionsService.update(
      updateAdminPermissionInput.id,
      updateAdminPermissionInput,
    );
  }

  @Mutation(() => AdminPermission)
  removePermission(@Args('id', { type: () => String }) id: string) {
    return this.adminPermissionsService.remove(id);
  }
}
