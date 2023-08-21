import { Injectable } from '@nestjs/common';
import { UpdateDropsProductInput } from './dto/update-drops-product.input';
import { MongoRepository } from 'typeorm';
import { Logger } from '@nestjs/common';
import DropsProducts from './entities/drops-products.model';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryService } from 'src/inventory/inventory.service';

@Injectable()
export class DropsProductsService {
  constructor(
    @InjectRepository(DropsProducts)
    private dropsProductsrepository: MongoRepository<DropsProducts>,
    private inventoryService: InventoryService,
  ) {}

  async create(storeId: string, shop: string, products: string[]) {
    // service get variant of products from inv
    // [{m_variant_id, d_variant_id: null}]
    const res = await this.inventoryService.getProductVariants(shop, products);
    const documents = res.map((product: any) => {
      return {
        storeId,
        shop,
        m_product_id: product._id,
        variants: product.variants.map((variant) => ({
          m_variant_id: variant,
          d_variant_id: '',
        })),
        isSelected: true,
        isSynced: false,
        created_at: new Date(),
      };
    });
    console.log(
      '🚀 ~ file: drops-products.service.ts:32 ~ DropsProductsService ~ create ~ documents:',
      documents,
    );
    // const documents = products.map((productId) => ({
    //   storeId,
    //   m_product_id: productId,
    //   variants: [],
    //   isSynced: false,
    //   created_at: new Date(),
    // }));

    try {
      const res = await this.dropsProductsrepository.insertMany(documents);
      if (res.insertedCount) {
        Logger.log(
          `${res.insertedCount} Drops products created of store ${storeId}`,
          'DROPS_PRODUCTS',
          true,
        );
      }
      return res;
    } catch (err) {
      Logger.log(
        `Drops products creation failed of store ${storeId} ERR: ${err}`,
        'DROPS_PRODUCTS',
        true,
      );
    }
  }

  async findByStoreId(storeId: string) {
    console.log(storeId);
    return await this.dropsProductsrepository.find({
      where: {
        storeId,
      },
    });
  }

  findAll() {
    return `This action returns all dropsProducts`;
  }

  findOne(id: string) {
    return `This action returns a #${id} dropsProduct`;
  }

  update(id: string, updateDropsProductInput: UpdateDropsProductInput) {
    return `This action updates a #${id} dropsProduct`;
  }

  remove(id: string) {
    return `This action removes a #${id} dropsProduct`;
  }
}
