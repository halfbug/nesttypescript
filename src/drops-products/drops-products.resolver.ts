import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DropsProductsService } from './drops-products.service';
import { UpdateDropsProductInput } from './dto/update-drops-product.input';
import { DropsProduct } from './entities/drops-product.entity';

@Resolver('DropsProduct')
export class DropsProductsResolver {
  constructor(private dropsProductsService: DropsProductsService) {}

  @Mutation(() => [DropsProduct])
  async createDropsProducts(
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('products', { type: () => [String] }) products: string[],
  ) {
    return await this.dropsProductsService.create(storeId, products);
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
