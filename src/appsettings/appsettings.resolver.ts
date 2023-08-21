import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AppsettingsService } from './appsettings.service';
import { Appsetting } from './entities/appsetting.entity';
import { CreateAppsettingInput } from './dto/create-appsetting.input';
import { SalesTarget } from './entities/sales-target.entity';
import { Public } from 'src/auth/public.decorator';
// import { UpdateAppsettingInput } from './dto/update-appsetting.input';

@Resolver(() => Appsetting)
export class AppsettingsResolver {
  constructor(private readonly appsettingsService: AppsettingsService) {}

  @Mutation(() => Appsetting)
  createAppsetting(
    @Args('createAppsettingInput') createAppsettingInput: CreateAppsettingInput,
  ) {
    console.log(JSON.stringify(createAppsettingInput));

    return this.appsettingsService.create(createAppsettingInput);
  }

  @Query(() => [Appsetting], { name: 'appsettings' })
  findAll() {
    return this.appsettingsService.findAll();
  }
  @Public()
  @Query(() => [SalesTarget], { name: 'salesTarget' })
  findSalesTargetAll() {
    console.log('first');
    return this.appsettingsService.findSalesTargetAll();
  }

  // @Query(() => Appsetting, { name: 'appsetting' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.appsettingsService.findOne(id);
  // }

  // @Mutation(() => Appsetting)
  // updateAppsetting(
  //   @Args('updateAppsettingInput') updateAppsettingInput: UpdateAppsettingInput,
  // ) {
  //   return this.appsettingsService.update(
  //     updateAppsettingInput.id,
  //     updateAppsettingInput,
  //   );
  // }

  // @Mutation(() => Appsetting)
  // removeAppsetting(@Args('id') id: string) {
  //   return this.appsettingsService.remove(id);
  // }

  // @Public()
  // @Query(() => Appsetting, { name: 'findDrops' })
  // findDrops(@Args('type') type: string) {
  //   return this.appsettingsService.findbytype(type);
  // }
}
