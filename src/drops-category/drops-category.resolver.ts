import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DropsCategoryService } from './drops-category.service';
import {
  CodeUpdateStatusType,
  DropsCategory,
} from './entities/drops-category.entity';
import {
  CreateDropsCategoryForFront,
  CreateDropsCategoryInput,
} from './dto/create-drops-category.input';

@Resolver(() => DropsCategory)
export class DropsCategoryResolver {
  constructor(private readonly dropsCategoryService: DropsCategoryService) {}

  @Mutation(() => DropsCategory)
  createDropsCategory(
    @Args('createDropsCategoryInput')
    createDropsCategoryInput: CreateDropsCategoryInput,
  ) {
    return this.dropsCategoryService.create(createDropsCategoryInput);
  }

  @Query(() => [DropsCategory], { name: 'dropsCategory' })
  findAll() {
    return this.dropsCategoryService.findAll();
  }

  @Query(() => DropsCategory, { name: 'dropsCategory' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.dropsCategoryService.findOne(id);
  }

  @Query(() => [DropsCategory])
  findByStoreId(@Args('storeId', { type: () => String }) storeId: string) {
    return this.dropsCategoryService.findByStoreId(storeId);
  }

  @Mutation(() => [DropsCategory])
  updateDropsCategory(
    @Args('CreateDropsCategoryForFront')
    updateDropsCategoryInput: CreateDropsCategoryForFront,
  ) {
    return this.dropsCategoryService.update(
      updateDropsCategoryInput.id,
      updateDropsCategoryInput.categoryData,
      updateDropsCategoryInput.collectionUpdateMsg,
      updateDropsCategoryInput?.userId,
      updateDropsCategoryInput?.activity,
    );
  }

  @Mutation(() => DropsCategory)
  removeDropsCategory(
    @Args('id', { type: () => [String] }) id: [string],
    @Args('collectionUpdateMsg', { type: () => String })
    collectionUpdateMsg: string,
    @Args('userId', { type: () => String })
    userId: string,
    @Args('storeId', { type: () => String })
    storeId: string,
  ) {
    return this.dropsCategoryService.remove(
      id,
      collectionUpdateMsg,
      userId,
      storeId,
    );
  }

  @Mutation(() => CodeUpdateStatusType)
  syncDiscountCodes(@Args('storeId', { type: () => String }) storeId: string) {
    return this.dropsCategoryService.syncDiscountCodes(storeId);
  }
}
