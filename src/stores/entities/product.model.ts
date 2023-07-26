import { Column, Entity } from 'typeorm';

@Entity()
export default class Product {
  @Column()
  id: string;
}
