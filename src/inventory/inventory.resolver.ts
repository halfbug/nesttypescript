import { Resolver, Query, Args, Info, Mutation } from '@nestjs/graphql';
import { InventoryService } from './inventory.service';
import {
  CollectionListOfShop,
  CollectionStatusList,
  Inventory,
  GetLocationsOutput,
  SearchResult,
} from './entities/inventory.entity';
import { Collection } from './entities/collection.entity';
import { Product } from './entities/product.entity';
import { ProductQueryInput } from './dto/product-query.input';
import { TotalProducts } from './entities/totalProducts.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/auth/public.decorator';
import { StoresService } from 'src/stores/stores.service';
import { CollectionUpdateEnum } from 'src/stores/entities/store.entity';
// import { GetLocationsInput } from './dto/create-inventory.input';
// import { ShopifyService } from 'src/shopify/shopify.service';
// import { ProductsPaginated } from './entities/products-paginated.entity';
import { ProductsPaginatedArgs } from './dto/products-paginated.input';
import { ProductsPaginated } from './entities/products-paginated.entity';
import { UpdateInventoryInput } from './dto/update-inventory.input';
import { GetLocationsInput } from './dto/create-inventory.input';
import { ShopifyService } from 'src/shopify/shopify.service';
@UseGuards(AuthGuard)
@Resolver(() => Inventory)
export class InventoryResolver {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly storeService: StoresService,
    private shopifyapi: ShopifyService,
  ) {}

  @Query(() => TotalProducts, { name: 'TotalProducts' })
  findStoreTotalProducts(@Args('shop') shop: string) {
    return this.inventoryService.findTotalProducts(shop);
  }

  @Query(() => [Collection], { name: 'collections' })
  findStoreCollections(@Args('shop') shop: string, @Info() info: any) {
    const selectedFileds = info.fieldNodes[0].selectionSet.selections.map(
      (item) => item.name.value,
    );
    // console.log(
    //   '🚀 ~ file: inventory.resolver.ts ~ line 38 ~ InventoryResolver ~ findStoreCollections ~ selectedFileds',
    //   selectedFileds,
    // );
    const withproducts = selectedFileds.includes('products');
    const collections = this.inventoryService.findStoreCollections(
      shop,
      withproducts,
    );
    return collections;
  }

  @Public()
  @Query(() => [Product], { name: 'products' })
  findStoreProducts(
    @Args('productQueryInput') productQueryInput: ProductQueryInput,
  ) {
    return this.inventoryService.findStoreProducts(productQueryInput);
  }

  @Public()
  @Query(() => Product, { name: 'productById' })
  findProductById(@Args('id') id: string) {
    console.log({ id });
    return this.inventoryService.findProductById(id);
  }

  @Public()
  @Query(() => Product, { name: 'PlatformFeeById' })
  findPlatformFeeById() {
    return this.inventoryService.findPlatformFeeById();
  }

  @Query(() => Inventory, { name: 'inventory' })
  findOne(@Args('shop') shop: string, @Args('recordType') recordType: string) {
    return this.inventoryService.findOne(shop, recordType);
  }

  @Query(() => [Inventory], { name: 'findById' })
  findById(@Args('id') id: string) {
    return this.inventoryService.findById(id);
  }

  @Query(() => [Product], { name: 'findAllProducts' })
  async findAllProducts(@Args('shop') shop: string) {
    const res = await this.inventoryService.findAllProducts(shop);
    // console.log(
    //   '🚀 ~ file: inventory.resolver.ts ~ line 57 ~ InventoryResolver ~ res',
    //   res,
    // );
    return res;
  }

  @Public()
  @Query(() => Boolean, { name: 'createSearchIndex' })
  async createSearchIndex(@Args('shop') shop: string) {
    const result = await this.inventoryService.createSearchIndex(shop);
    return result;
  }

  @Public()
  @Query(() => [SearchResult], { name: 'searchProducts' })
  async searchProducts(
    @Args('searchTerm') searchTerm: string,
    @Args('shop') shop: string,
  ) {
    const productsData = await this.inventoryService.searchProducts(
      searchTerm,
      shop,
    );
    return [{ products: productsData }];
  }

  @Query(() => [Inventory], { name: 'syncCollection' })
  async syncCollection(@Args('storeId') storeId: string) {
    const store = await this.storeService.findById(storeId);
    // const res = await this.inventoryService.runSyncCollectionCron(store);
    // console.log(
    //   '🚀 ~ file: inventory.resolver.ts ~ line 57 ~ InventoryResolver ~ res',
    //   res,
    // );
    return [{ status: CollectionUpdateEnum.PROGRESS }];
  }

  @Public()
  @Query(() => CollectionListOfShop, { name: 'getCollectionList' })
  async getCollectionList(@Args('shop') shop: string) {
    const temp = await this.inventoryService.findCollectionsWithSyncedStatus(
      shop,
    );
    return temp[0];
  }

  @Public()
  @Query(() => GetLocationsOutput, { name: 'getLocations' })
  async getLocations(
    @Args('getLocationsInput') getLocationsInput: GetLocationsInput,
  ) {
    const { shop, variantIds } = getLocationsInput;

    const { session } = await this.storeService.findOne(shop);

    const locations = await this.shopifyapi.getLocationsByVariantIds(
      shop,
      variantIds,
      session,
    );

    return { locations };
  }

  @Public()
  @Query(() => ProductsPaginated, { name: 'getPaginatedProducts' })
  async getDrops(@Args('productArgs') productArgs: ProductsPaginatedArgs) {
    // console.log(
    //   '🚀 ~ file: inventory.resolver.ts:145 ~ InventoryResolver ~ getDrops ~ productArgs:',
    //   productArgs,
    // );
    return await this.inventoryService.getPaginatedProductsByCollectionIDs(
      productArgs,
    );
  }
  // @Mutation(() => Inventory)
  // updateInventory(
  //   @Args('updateInventoryInput') updateInventoryInput: UpdateInventoryInput,
  // ) {
  //   return this.inventoryService.update(updateInventoryInput);
  // }

  // @Mutation(() => Inventory)
  // removeInventory(@Args('id', { type: () => Int }) id: number) {
  //   return this.inventoryService.remove(id);
  // }
}
