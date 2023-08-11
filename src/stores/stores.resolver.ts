import { Resolver, Query, Mutation, Args, Int, Info } from '@nestjs/graphql';
import { StoresService } from './stores.service';
import {
  getUpdateCollectionStatus,
  getUpdateDiscountStatus,
  Store,
} from './entities/store.entity';
import { CreateStoreInput } from './dto/create-store.input';
import { UpdateStoreInput } from './dto/update-store.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { AuthDecorator } from 'src/auth/auth.decorator';
import { Public } from 'src/auth/public.decorator';
import { DiscountCode } from 'src/drops-groupshop/entities/groupshop.entity';

@Resolver(() => Store)
@UseGuards(AuthGuard)
export class StoresResolver {
  constructor(private readonly storesService: StoresService) {}

  @Mutation(() => Store)
  createStore(@Args('createStoreInput') createStoreInput: CreateStoreInput) {
    return this.storesService.create(createStoreInput);
  }

  @Public()
  @Query(() => [Store], { name: 'stores' })
  findAll() {
    return this.storesService.findAll();
  }

  @Query(() => [Store], { name: 'activeStores' })
  findActive() {
    return this.storesService.findActiveAll();
  }

  @Public()
  @Query(() => Store, { name: 'storeName' })
  async findOne(
    @Info() info: any,
    // @AuthDecorator('shop') shop: string,
    @Args('shop') shop: string,
  ) {
    const selectedFileds = info.fieldNodes[0].selectionSet.selections.map(
      (item) => item.name.value,
    );
    // const shop = sshop ?? qshop;
    console.log(
      '🚀 ~ file: stores.resolver.ts ~ line 43 ~ StoresResolver ~ shop',
      shop,
    );
    const withCampaigns = selectedFileds.includes('campaigns');
    const res = await this.storesService.findOneWithCampaings(shop);
    // console.log(
    //   '🚀 ~ file: stores.resolver.ts ~ line 28 ~ StoresResolver ~ findOne ~ res',
    //   res,
    // );
    if (withCampaigns) return res;
    else return this.storesService.findOneByName(shop);
  }

  @Public()
  @Query(() => Store, { name: 'activeCampaignWithProducts' })
  async findOneCampaign(@Args('shop') shop: string, @Info() info: any) {
    return this.storesService.findOneWithActiveCampaingProducts(shop);
  }

  @Public()
  @Query(() => Store, { name: 'getDropBanner' })
  dropBanner() {
    return this.storesService.getDropBanner();
  }

  @Query(() => Store, { name: 'store' })
  findOneById(@Args('id') id: string) {
    return this.storesService.findOneById(id);
  }

  @Mutation(() => Store)
  updateStore(@Args('updateStoreInput') updateStoreInput: UpdateStoreInput) {
    return this.storesService.update(updateStoreInput.id, updateStoreInput);
  }

  // @Mutation(() => Store)
  // removeStore(@Args('id', { type: () => String }) id: string) {
  //   return this.storesService.remove(id);
  // }

  @Public()
  @Mutation(() => Store)
  updateDiscoveryTools(
    @Args('UpdateDiscoveryTools') UpdateDiscoveryTools: UpdateStoreInput,
  ) {
    return this.storesService.updateDiscoveryTool(
      UpdateDiscoveryTools.id,
      UpdateDiscoveryTools,
    );
  }

  @Mutation(() => DiscountCode, { name: 'createspotlightDiscount' })
  async createspotlightDiscount(
    @Args('storeId')
    storeId: string,
  ) {
    return await this.storesService.createspotlightDiscount(storeId);
  }

  @Query(() => getUpdateDiscountStatus, { name: 'getUpdateDiscountStatus' })
  async getUpdateDiscountStatus(
    @Args('storeId')
    storeId: string,
  ) {
    return await this.storesService.getUpdateDiscountStatus(storeId);
  }

  @Query(() => getUpdateCollectionStatus, { name: 'getUpdateCollectionStatus' })
  async getUpdateCollectionStatus(
    @Args('storeId')
    storeId: string,
  ) {
    return await this.storesService.getUpdateCollectionStatus(storeId);
  }
}
