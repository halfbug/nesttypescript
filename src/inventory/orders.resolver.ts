import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  GqlExecutionContext,
} from '@nestjs/graphql';
import {
  PendingGroupshop,
  TotalOrders,
  MostViralProducts,
  OrderLineItems,
} from 'src/inventory/entities/orders.entity';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(private readonly OrderService: OrdersService) {}

  @Query(() => TotalOrders, { name: 'getOrderCount' })
  getOrderCount(@Args('shop') shop: string) {
    const data = this.OrderService.getOrderCount(shop);
    return data;
  }

  @Query(() => [PendingGroupshop], { name: 'findpendinggroupshop' })
  async findpendinggroupshop(
    @Args('shop') shop: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('minOrderValue') minOrderValue: string,
  ) {
    let startDateFormat = '';
    const d = new Date(startDate);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    startDateFormat = `${year}${'-'}${month}${'-'}${day}`;

    let endDateFormat = '';
    const endd = new Date(endDate);
    const endyear = endd.getFullYear();
    const endmonth = ('0' + (endd.getMonth() + 1)).slice(-2);
    const endday = ('0' + endd.getDate()).slice(-2);
    endDateFormat = `${endyear}${'-'}${endmonth}${'-'}${endday}`;

    return await this.OrderService.findpendinggroupshop(
      shop,
      startDateFormat,
      endDateFormat,
      minOrderValue,
    );
  }

  @Query(() => [MostViralProducts], { name: 'mostViralProducts' })
  async mostViralProducts(
    @Args('shop') shop: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    if (shop !== '') {
      return await this.OrderService.findMostViralProducts(
        shop,
        startDate,
        endDate,
      );
    }
  }

  @Query(() => [MostViralProducts], { name: 'partnerMostViralProducts' })
  async partnerMostViralProducts(
    @Args('shop') shop: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    if (shop !== '') {
      return await this.OrderService.findPartnerViralProducts(
        shop,
        startDate,
        endDate,
      );
    }
  }

  @Query(() => [OrderLineItems], { name: 'orderLineItems' })
  async orderLineItems(@Args('parentId') parentId: string) {
    if (parentId !== '') {
      const data = await this.OrderService.findOrderLineItems(parentId);
      console.log(JSON.stringify(data));
      return data;
    }
  }
}
