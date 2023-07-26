import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdminActivityLogsService } from './admin-activity-logs.service';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { CreateAdminActivityLogInput } from './dto/create-admin-activity-log.input';
import { UpdateAdminActivityLogInput } from './dto/update-admin-activity-log.input';

@Resolver(() => AdminActivityLog)
export class AdminActivityLogsResolver {
  constructor(
    private readonly adminActivityLogsService: AdminActivityLogsService,
  ) {}

  @Mutation(() => AdminActivityLog)
  createAdminActivityLog(
    @Args('createAdminActivityLogInput')
    createAdminActivityLogInput: CreateAdminActivityLogInput,
  ) {
    return this.adminActivityLogsService.create(createAdminActivityLogInput);
  }

  @Query(() => [AdminActivityLog], { name: 'adminActivityLogs' })
  findAll() {
    return this.adminActivityLogsService.findAll();
  }

  @Query(() => AdminActivityLog, { name: 'adminActivityLog' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.adminActivityLogsService.findOne(id);
  }

  @Mutation(() => AdminActivityLog)
  updateAdminActivityLog(
    @Args('updateAdminActivityLogInput')
    updateAdminActivityLogInput: UpdateAdminActivityLogInput,
  ) {
    return this.adminActivityLogsService.update(
      updateAdminActivityLogInput.id,
      updateAdminActivityLogInput,
    );
  }

  @Query(() => [AdminActivityLog], { name: 'dropsActivity' })
  async dropsActivity(
    @Args('route', { type: () => String }) route: string,
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('filter', { type: () => String }) filter: string,
  ) {
    const result = await this.adminActivityLogsService.dropsActivity(
      route,
      storeId,
      filter,
    );
    return result;
  }

  @Query(() => [AdminActivityLog], { name: 'adminActivity' })
  async adminActivity(
    @Args('route', { type: () => String }) route: string,
    @Args('filter', { type: () => String }) filter: string,
  ) {
    const result = await this.adminActivityLogsService.adminActivity(
      route,
      filter,
    );
    return result;
  }

  @Mutation(() => AdminActivityLog)
  removeAdminActivityLog(@Args('id', { type: () => String }) id: string) {
    return this.adminActivityLogsService.remove(id);
  }
}
