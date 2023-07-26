import { Injectable } from '@nestjs/common';
import { UpdateDropsProductInput } from './dto/update-drops-product.input';
import { getMongoManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import DropsProducts from './entities/drops-products.model';
import { toArray } from 'lodash';

@Injectable()
export class DropsProductsService {
  async create(storeId: string, products: string[]) {
    const manager = getMongoManager();

    const documents = products.map((productId) => ({
      storeId,
      m_product_id: productId,
      isSynced: false,
      created_at: new Date(),
    }));

    try {
      const res = await manager.insertMany(DropsProducts, documents);
      // if (res.result.ok) {
      //   Logger.log(
      //     `${res.insertedCount} Drops products created of store ${storeId}`,
      //     'DROPS_PRODUCTS',
      //     true,
      //   );
      // }
      // return toArray(res.ops);
    } catch (err) {
      Logger.log(
        `Drops products creation failed of store ${storeId} ERR: ${err}`,
        'DROPS_PRODUCTS',
        true,
      );
    }
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
