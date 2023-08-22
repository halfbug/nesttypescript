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
import { Product } from 'src/inventory/entities/product.entity';

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
    // console.log(JSON.stringify(res), '==res', JSON.stringify(res.insertedIds));
    return { acknowledged: res.acknowledged, insertedCount: res.insertedCount };
  }

  @Public()
  @Query(() => [DropsProduct])
  async getDropsSelectedProducts(
    @Args('storeId', { type: () => String }) storeId: string,
  ) {
    const res = await this.dropsProductsService.findByStoreId(storeId);
    // console.log('first resolver', res);
    return res;
  }
  @Public()
  @Query(() => [DropsProduct && Product])
  async getDropsPrdObject(
    @Args('storeId', { type: () => String }) storeId: string,
  ) {
    const res = await this.dropsProductsService.findDropsPrdObject(storeId);
    // console.log(
    //   '🚀 ~ file: drops-products.resolver.ts:42 ~ DropsProductsResolver ~ res:',
    //   res,
    // );
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
  @Public()
  @Mutation(() => DropsProduct)
  async updateDropsProducts(
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('shop', { type: () => String }) shop: string,
    @Args('products', { type: () => [String] }) products: string[],
  ) {
    const updateRes = await this.dropsProductsService.updateDropsProduct(
      storeId,
      shop,
      products,
    );
    console.log(
      '🚀 ~ file: drops-products.resolver.ts:71 ~ DropsProductsResolver ~ res:',
      updateRes,
    );
    return { updateRes, _id: '' };
  }

  @Mutation(() => DropsProduct)
  remove(@Args('id') id: string) {
    return this.dropsProductsService.remove(id);
  }
}
