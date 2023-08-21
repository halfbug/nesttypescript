import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DropsProductsService } from './drops-products.service';
import { UpdateDropsProductInput } from './dto/update-drops-product.input';
import {
  DropsProduct,
  DropsProductResponse,
} from './entities/drops-product.entity';
import { Public } from 'src/auth/public.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => DropsProduct)
export class DropsProductsResolver {
  constructor(private readonly dropsProductsService: DropsProductsService) {}
  @Public()
  @Mutation(() => DropsProductResponse)
  async createDropsProducts(
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('shop', { type: () => String }) shop: string,
    @Args('products', { type: () => [String] }) products: string[],
  ) {
    const res = await this.dropsProductsService.create(storeId, shop, products);
    console.log(JSON.stringify(res), '==res', JSON.stringify(res.insertedIds));
    return { acknowledged: res.acknowledged, insertedCount: res.insertedCount };
  }

  @Public()
  @Query(() => [DropsProduct])
  async getDropsSelectedProducts(
    @Args('storeId', { type: () => String }) storeId: string,
  ) {
    const res = await this.dropsProductsService.findByStoreId(storeId);
    console.log('first resolver', res);
    return res;
  }

  @Query(() => DropsProduct)
  findAll() {
    return this.dropsProductsService.findAll();
  }

  @Query(() => DropsProduct)
  findOne(@Args('id') id: string) {
    return this.dropsProductsService.findOne(id);
  }

  @Mutation(() => DropsProduct)
  update(
    @Args('updateDropsProductInput')
    updateDropsProductInput: UpdateDropsProductInput,
  ) {
    return this.dropsProductsService.update(
      updateDropsProductInput._id,
      updateDropsProductInput,
    );
  }

  @Mutation(() => DropsProduct)
  remove(@Args('id') id: string) {
    return this.dropsProductsService.remove(id);
  }
}
