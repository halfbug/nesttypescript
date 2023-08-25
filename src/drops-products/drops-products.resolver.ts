import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DropsProductsService } from './drops-products.service';
import {
  DropsProduct,
  DropsProductResponse,
  CollectionObject,
} from './entities/drops-product.entity';
import { Public } from 'src/auth/public.decorator';

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

  @Query(() => DropsProduct)
  async createJSONL() {
    return await this.dropsProductsService.createJSONL('');
  }

  @Mutation(() => DropsProduct)
  async createCollectionShopify(
    @Args('storeId') storeId: string,
    @Args('collectionObject') collectionObject: CollectionObject,
  ) {
    return await this.dropsProductsService.createCollectionShopify(
      storeId,
      collectionObject,
    );
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
