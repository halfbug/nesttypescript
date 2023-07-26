import { IsUUID } from 'class-validator';
import { Product } from 'src/inventory/entities/product.entity';
import { v4 as uuid } from 'uuid';
export const TEST = 'test';
export const GS_CHARGE_CASHBACK = 10;
export const GS_CHARGE_FEE_LAUNCH = 0.25;
export const GS_CHARGE_FEE_GROWTH = 0.2;
export const GS_CHARGE_FEE_ENTERPRISE = 0.1;
// export const GS_CHARGE_FEE_CURRENCY_CODE = 'cent';
export const GS_PLAN1_START_COUNT = 1;
export const GS_PLAN1_END_COUNT = 100;
export const GS_PLAN2_START_COUNT = 101;
export const GS_PLAN2_END_COUNT = 1000;
export const GS_PLAN3_START_COUNT = 1001;
export const GS_PLAN3_END_COUNT = 2500;
export const GS_PLAN4_START_COUNT = 2501;

export const GS_FEES = [
  0,
  GS_CHARGE_FEE_LAUNCH,
  GS_CHARGE_FEE_GROWTH,
  GS_CHARGE_FEE_ENTERPRISE,
];

export const FIRST_EXPIRE_DAYS = 14;
export const SECOND_EXPIRE_DAYS = 7;
export const DROPS_EXPIRE_DAYS = 1;
export const dummyProduct = (): Product => {
  const obj = {
    id: 'PDELETED',
    description: 'this product is deleted from the store. ',
    status: 'DELETED',
    title: 'Discontinued Product',
    price: '000',
    outofstock: true,
    featuredImage: 'https://d1o2v5h7slksjm.cloudfront.net/discontinued.png',
  };
  return { ...obj, id: uuid() };
};
export const BESTSELLER_SECTION_TITLE = 'bestsellers';
export const VAULT_SECTION_TITLE = 'The Vault';
export const SPOTLIGHT_SECTION_TITLE = 'Today’s Spotlight';

export const RecordType = {
  Collection: 'Collection',
  Product: 'Product',
  ProductImage: 'ProductImage',
};
