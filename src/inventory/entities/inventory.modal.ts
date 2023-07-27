import { Column, Entity, PrimaryColumn } from 'typeorm';
import { DefaultColumnsService } from 'src/utils/default-columns/default-columns.service';
import { ProductImage, SelectedOption } from './product.entity';
// import { InputType } from '@nestjsgraphql';

@Entity()
class IFeatureImage {
  @Column()
  src: string;
}

@Entity('ProductOption')
export class ProductOption {
  @Column()
  id: string;

  @Column()
  name: string;

  @Column()
  postion: number;

  @Column()
  values: string[];
}

@Entity()
export default class Inventory extends DefaultColumnsService {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  onlineStorePreviewUrl?: string;

  @Column(() => ProductOption)
  options: ProductOption[];

  @Column()
  onlineStoreUrl?: string;

  @PrimaryColumn()
  storefrontId: string;

  @Column()
  descriptionHtml?: string;

  @Column()
  productType?: string;

  @Column()
  totalVariants?: number;

  @Column()
  totalInventory?: number;

  @Column()
  publishedAt?: string;

  @Column()
  createdAtShopify?: string;

  @Column()
  shopifyCreatedAt?: string;

  @Column({ default: 'Product', nullable: true })
  recordType: string;

  @Column({ nullable: true })
  currencyCode?: string;

  @Column()
  __parentId?: string;

  @Column(() => ProductImage)
  image?: ProductImage;

  @Column()
  displayName?: string;

  @Column()
  featuredImage?: string;

  @Column({ default: 'no shop' })
  shop: string;

  @Column()
  parentId?: string;

  @Column({ nullable: true })
  inventoryQuantity?: number;

  @Column({ nullable: true })
  outofstock?: boolean;

  @Column({ nullable: true })
  price: string;

  @Column(() => SelectedOption)
  selectedOptions?: SelectedOption[];
  @Column()
  src?: string;

  @Column({ nullable: true })
  inventoryPolicy?: string;

  @Column({ nullable: true })
  inventoryManagement?: string;

  @Column({ default: 0 })
  purchaseCount: number;

  @Column({ default: 1 })
  secondaryCount: number;

  @Column({ nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  productCategory?: string;

  @Column({ nullable: true })
  vendor?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  compareAtPrice?: string;
}
