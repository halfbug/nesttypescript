import { Injectable } from '@nestjs/common';
import { UpdateDropsProductInput } from './dto/update-drops-product.input';
import { MongoRepository } from 'typeorm';
import { Logger } from '@nestjs/common';
import DropsProducts from './entities/drops-products.model';
import { ShopifyService } from 'src/shopify/shopify.service';
import { StoresService } from 'src/stores/stores.service';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import readJsonLines from 'read-json-lines-sync';
import { CollectionObject } from './entities/drops-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryService } from 'src/inventory/inventory.service';

@Injectable()
export class DropsProductsService {
  constructor(
    @InjectRepository(DropsProducts)
    private dropsProductsrepository: MongoRepository<DropsProducts>,
    private inventoryService: InventoryService,
    private shopifyService: ShopifyService,
    private readonly storesService: StoresService,
    private httpService: HttpService,
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
  async findProductsByStoreId(storeId: string) {
    const agg = [
      {
        $match: {
          storeId,
          isSynced: false,
        },
      },
      {
        $group: {
          _id: '$storeId',
          m_product_ids: {
            $push: '$m_product_id',
          },
        },
      },
      {
        $lookup: {
          from: 'inventory',
          localField: 'm_product_ids',
          foreignField: 'id',
          as: 'products',
        },
      },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            product_id: '$products.id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$parentId', '$$product_id'],
                    },
                    {
                      $eq: ['$recordType', 'ProductVariant'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'products.variants',
        },
      },
      {
        $lookup: {
          from: 'inventory',
          let: {
            product_id: '$products.id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$parentId', '$$product_id'],
                    },
                    {
                      $eq: ['$recordType', 'ProductImage'],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                src: '$src',
              },
            },
          ],
          as: 'products.images',
        },
      },
      {
        $group: {
          _id: '$_id',
          products: {
            $push: '$products',
          },
        },
      },
    ];

    const res = await this.dropsProductsrepository.aggregate(agg).toArray();
    return res[0];
  }

  async createJSONL(storeId: string) {
    const arr = [];
    const merchantProducts: any = await this.findProductsByStoreId(storeId);
    const store = await this.storesService.findOneById(storeId);
    merchantProducts.products.forEach((ele) => {
      arr.push({
        input: {
          collectionsToJoin: [store.drops.collectionId],
          collectionsToLeave: [],
          descriptionHtml: ele.description,
          id: ele.id,
          images: ele.images,
          options: ele.options.map((item) => item.name),
          published: true,
          publishedAt: ele.publishedAt,
          status: ele.status,
          tags: ele.tags,
          title: ele.title,
          metafields: [
            {
              key: 'merchant_id',
              type: 'single_line_text_field',
              value: ele.id,
            },
          ],
          variants: ele.variants.map((item) => {
            return {
              compareAtPrice: item.compareAtPrice,
              id: item.id,
              imageSrc: item?.image?.src ?? '',
              inventoryManagement: item.inventoryManagement?.toUpperCase(),
              inventoryPolicy: item.inventoryPolicy,
              // inventoryQuantities: [
              //   {
              //     availableQuantity: 1,
              //     locationId: '',
              //   },
              // ],
              options: item.selectedOptions.map((item) => item.value),
              position: 1,
              price: item.price,
              productId: ele.id,
              title: item.title,
              // mediaSrc: item?.image?.src ? [item?.image?.src] : [],
              metafields: [
                {
                  key: 'merchant_variant_id',
                  type: 'single_line_text_field',
                  value: item.id,
                },
              ],
            };
          }),
          vendor: ele.vendor,
        },
        media: [
          {
            alt: '',
            mediaContentType: 'IMAGE',
            originalSource: ele.featuredImage,
          },
        ],
      });
    });
    const publicFolderPath = path.join(process.cwd(), 'public/bulk');
    const fileName = `bluk_${new Date().getTime()}.jsonl`;
    const filePath = path.join(publicFolderPath, fileName);
    const stream = fs.createWriteStream(filePath, { flags: 'a' });

    arr.forEach((object) => {
      const json = JSON.stringify(object);
      stream.write(`${json}\n`);
    });
    stream.end();

    Logger.log(
      `${fileName} JSONL file created for store: ${storeId}`,
      'BULK_PRODUCTS_CREATION',
      true,
    );

    // STAGE UPLOAD
    const { session } = await this.storesService.findById(storeId);
    const client = await this.shopifyService.client(session);
    client
      .query({
        data: {
          query: `mutation {
          stagedUploadsCreate(
            input: {resource: BULK_MUTATION_VARIABLES, filename: "product-bulk-imoprt", mimeType: "text/jsonl", httpMethod: POST}
          ) {
            userErrors {
              field
              message
            }
            stagedTargets {
              url
              resourceUrl
              parameters {
                name
                value
              }
            }
          }
        }`,
        },
      })
      .then((res) => {
        const URL =
          res.body['data']['stagedUploadsCreate']['stagedTargets'][0]['url'];
        const para =
          res.body['data']['stagedUploadsCreate']['stagedTargets'][0][
            'parameters'
          ];
        const fileStream = fs.readFileSync(filePath);

        if (para && para.length) {
          const formData = new FormData();
          let key = '';
          para.forEach((ele) => {
            if (ele.name === 'key') {
              key = ele.value;
            }
            formData.append(ele.name, ele.value);
          });
          formData.append('file', fileStream, { filename: fileName });

          try {
            this.httpService
              .post(URL, formData, {
                headers: {
                  ...formData.getHeaders(),
                  'Content-Type': 'multipart/form-data',
                },
              })
              .subscribe({
                next: () => {
                  Logger.log(
                    `${fileName} JSONL file uploaded for store: ${storeId}`,
                    'BULK_PRODUCTS_CREATION',
                    true,
                  );

                  client
                    .query({
                      data: {
                        query: `mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
                        bulkOperationRunMutation(
                          mutation: $mutation
                          stagedUploadPath: $stagedUploadPath
                        ) {
                          bulkOperation {
                            id
                            status
                            url
                            objectCount
                          }
                          userErrors {
                            field
                            message
                            code
                            __typename
                          }
                        }
                      }`,
                        variables: {
                          mutation:
                            'mutation call($input: ProductInput!) { productCreate(input: $input) { product {id title  metafield(key: "merchant_id") { id value } variants(first: 10) {edges {node {id title inventoryQuantity metafield(key: "merchant_variant_id") { id value }}}}} userErrors { message field } } }',
                          stagedUploadPath: key,
                        },
                      },
                    })
                    .then((res) => {
                      Logger.log(
                        `${merchantProducts.products.length} products created to Shopify for store: ${storeId}`,
                        'BULK_PRODUCTS_CREATION',
                        true,
                      );
                      const bulkOperationId =
                        res.body['data']['bulkOperationRunMutation'][
                          'bulkOperation'
                        ]['id'];
                      Logger.log(
                        `Product sync to merchant store bulk register with id - ${bulkOperationId}`,
                        'SYNC_PRODUCTS_TO_MERCHANT_STORE',
                        true,
                      );
                      fs.unlinkSync(filePath);
                    });
                },
                error: (error) => {
                  console.error('Error uploading file:', error.response);
                },
              });
          } catch (err) {
            console.log('err', err);
          }
        }
      });
    return merchantProducts;
  }

  async createCollectionShopify(
    storeId: string,
    collectionObject: CollectionObject,
  ) {
    const { title, description } = collectionObject;
    const { session } = await this.storesService.findById(storeId);
    const client = await this.shopifyService.client(session);

    return await client.query({
      data: {
        query: `mutation collectionCreate($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              title
              image {
                url
                id
                altText
              }
              descriptionHtml
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: {
          input: {
            descriptionHtml: description,
            title: title,
          },
        },
      },
    });
  }

  async updateMerchantProductIds(data, id) {
    const productData = readJsonLines(data);

    const validProductData = productData
      .map(
        (entry) => entry.data.productCreate.product && entry.data.productCreate,
      )
      .filter(Boolean);

    const productUpdates = validProductData.map((item) => {
      const metafieldValue = item.product.metafield.value;
      const productId = item.product.id;

      const variants = item.product.variants.edges.map((variantEdge) => {
        return {
          variantId: variantEdge.node.id,
          variantMetafieldValue: variantEdge.node.metafield.value,
        };
      });

      return {
        metafieldValue,
        productId,
        variants,
      };
    });

    const bulkUpdateOperations = [];

    for (const update of productUpdates) {
      const updateOperation = {
        updateOne: {
          filter: { m_product_id: update.metafieldValue },
          update: {
            $set: {
              d_product_id: update.productId,
              isSynced: true,
              variants: update.variants.map((variant) => ({
                m_variant_id: variant.variantMetafieldValue,
                d_variant_id: variant.variantId,
              })),
            },
          },
        },
      };

      bulkUpdateOperations.push(updateOperation);
    }

    try {
      await this.dropsProductsrepository.bulkWrite(bulkUpdateOperations);
      Logger.log(
        `Merchant drops product synced with DB, Shopify for store: ${id}`,
        'BULK_PRODUCTS_CREATION',
        true,
      );
    } catch (error) {
      console.error('Error performing bulk write:', error);
      Logger.error(
        `Merchant drops product sync failed with DB, Shopify for store: ${id}`,
        'BULK_PRODUCTS_CREATION',
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

  async update(updateDropsProductInput: UpdateDropsProductInput) {
    console.log('updateDropsProductInput', updateDropsProductInput);
    this.dropsProductsrepository.update(
      { m_product_id: updateDropsProductInput.m_product_id },
      updateDropsProductInput,
    );
  }
}
