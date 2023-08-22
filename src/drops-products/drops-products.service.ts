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
    // console.log(
    //   '🚀 ~ file: drops-products.service.ts:32 ~ DropsProductsService ~ create ~ documents:',
    //   documents,
    // );

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
  async findDropsPrdObject(storeId: string) {
    const agg = [
      {
        $match: {
          storeId,
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'm_product_id',
          foreignField: 'id',
          as: 'product',
        },
      },
      {
        $unwind: {
          path: '$product',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$product', '$$ROOT'],
          },
        },
      },
      {
        $project: {
          product: 0,
        },
      },
    ];
    const res = await this.dropsProductsrepository.aggregate(agg).toArray();
    return res;
  }
  findAll() {
    return `This action returns all dropsProducts`;
  }

  findOne(id: string) {
    return `This action returns a #${id} dropsProduct`;
  }
  async getVariants(
    shop: string,
    storeId: string,
    ids: string[],
  ): Promise<
    {
      parentId: any;
      variants: any;
    }[]
  > {
    const res = await this.inventoryService.getProductVariants(shop, ids);
    console.log(
      '🚀 ~ file: drops-products.service.ts:112 ~ DropsProductsService ~ getVariants ~ res:',
      res,
      ids,
    );
    const documents = res.map((product: any) => {
      return {
        parentId: product._id,
        variants: product.variants.map((variant) => ({
          m_variant_id: variant,
          d_variant_id: '',
        })),
      };
    });
    console.log(
      '🚀 ~ file: drops-products.service.ts:126 ~ DropsProductsService ~ documents ~ documents:',
      documents,
    );
    return documents;
  }

  async updateDropsProduct(storeId: string, shop: string, products: string[]) {
    try {
      // Update existing documents
      await this.dropsProductsrepository.update(
        { storeId },
        { isSelected: false },
      );
      const variants = await this.getVariants(shop, storeId, products);
      console.log(
        '🚀 ~ file: drops-products.service.ts:146 ~ DropsProductsService ~ updateDropsProduct ~ variants:',
        variants,
      );

      // Bulk operations for upsert and update
      const bulkOps = products.map((product) => ({
        updateOne: {
          filter: { m_product_id: product },
          update: {
            $set: { isSelected: true },
            $setOnInsert: {
              storeId,
              shop,
              m_product_id: product,
              variants: variants.filter((item) => item.parentId === product)[0]
                .variants,
              // isSelected: true,
              isSynced: false,
              created_at: new Date(),
            },
          },
          upsert: true,
        },
      }));
      console.log(
        '🚀 ~ file: drops-products.service.ts:164 ~ DropsProductsService ~ bulkOps ~ bulkOps:',
        bulkOps,
      );

      // Execute bulk update operations
      const updateRes = await this.dropsProductsrepository.bulkWrite(bulkOps);
      console.log(
        '🚀 ~ file: drops-products.service.ts:167 ~ DropsProductsService ~ updateDropsProduct ~ updateRes:',
        updateRes,
      );

      // // Bulk operations for upsert
      // const upsertOps = products.map((product) => ({
      //   updateOne: {
      //     filter: { m_product_id: product },
      //     update: {
      //       $setOnInsert: {
      //         storeId,
      //         shop,
      //         m_product_id: product,
      //         variants: [this.getVariants(shop, storeId, product)],
      //         isSelected: true,
      //         isSynced: false,
      //         created_at: new Date(),
      //       },
      //     },
      //     upsert: true,
      //   },
      // }));

      // // Execute bulk upsert operations
      // const upsertRes = await this.dropsProductsrepository.bulkWrite(upsertOps);

      return updateRes;
    } catch (error) {
      console.log(
        '🚀 ~ file: drops-products.service.ts:148 ~ DropsProductsService ~ updateDropsProduct ~ error:',
        error,
      );
      // Handle error appropriately
    }
  }

  remove(id: string) {
    return `This action removes a #${id} dropsProduct`;
  }
}
