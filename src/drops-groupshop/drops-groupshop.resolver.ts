import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DropsGroupshopService } from './drops-groupshop.service';
import { DropsGroupshop } from './entities/drops-groupshop.entity';
import { CreateDropsGroupshopInput } from './dto/create-drops-groupshop.input';
import { UpdateDropsGroupshopInput } from './dto/update-drops-groupshop.input';
import { Public } from 'src/auth/public.decorator';
import { Logger, NotFoundException, UseInterceptors } from '@nestjs/common';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';
import { ViewedInterceptor } from 'src/gs-common/viewed.inceptor';
import { addDays, getDateDifference } from 'src/utils/functions';
import { LifecycleService } from 'src/gs-common/lifecycle.service';
import { KalavioService } from 'src/email/kalavio.service';
import { EventType } from 'src/gs-common/entities/lifecycle.modal';
import { StoresService } from 'src/stores/stores.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { GridArgs } from './dto/paginationArgs.input';
import { DropsPage } from './entities/drops-paginate.entity';
import { DropsCategory } from 'src/drops-category/entities/drops-category.entity';
import { DropsCategoryService } from 'src/drops-category/drops-category.service';
import { Store } from 'src/stores/entities/store.entity';

@Resolver(() => DropsGroupshop)
export class DropsGroupshopResolver {
  constructor(
    private readonly dropsGroupshopService: DropsGroupshopService,
    private readonly crypt: EncryptDecryptService,
    private kalavioService: KalavioService,
    private readonly lifecyclesrv: LifecycleService,
    private storesService: StoresService,
    private shopifyapi: ShopifyService,
    private dropsCategoryService: DropsCategoryService,
  ) {}

  @Public()
  @Mutation(() => DropsGroupshop)
  createDropsGroupshop(
    @Args('createDropsGroupshopInput')
    createDropsGroupshopInput: CreateDropsGroupshopInput,
  ) {
    return this.dropsGroupshopService.create(createDropsGroupshopInput);
  }

  @Query(() => [DropsGroupshop], { name: 'dropsGroupshops' })
  findAll() {
    return this.dropsGroupshopService.findAll();
  }

  @Query(() => DropsPage, { name: 'getDrops' })
  getDrops(@Args('gridArgs') gridArgs: GridArgs) {
    return this.dropsGroupshopService.getdrops(gridArgs);
  }
  @Query(() => DropsGroupshop, { name: 'dropsGroupshop' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.dropsGroupshopService.findOne(id);
  }

  async expireAtUpdate(groupshop, Dcode, eventType) {
    const newExpiredate = addDays(new Date(), 1);

    let updatedDiscountCode = groupshop.discountCode;

    const {
      shop,
      drops: {
        rewards: { baseline },
      },
      session,
    } = await this.storesService.findById(groupshop?.storeId);

    const collections = await this.dropsCategoryService.getNonSVCollectionIDs(
      groupshop?.storeId,
    );
    if (eventType === EventType.started) {
      if (collections.length) {
        updatedDiscountCode = await this.shopifyapi.setDiscountCode(
          shop,
          'Create',
          session,
          groupshop.discountCode.title,
          parseInt(baseline, 10),
          [...new Set(collections)],
          new Date(),
          newExpiredate,
          null,
          true,
          true,
        );
      }
    } else {
      await this.shopifyapi.setDiscountCode(
        shop,
        'Update',
        session,
        groupshop.discountCode.title,
        null,
        [...new Set(collections)],
        groupshop.createdAt,
        newExpiredate,
        groupshop.discountCode.priceRuleId,
        true,
        true,
      );

      this.lifecyclesrv.create({
        groupshopId: groupshop.id,
        event: EventType.ended,
        dateTime: newExpiredate,
      });
    }
    const updateGS = await this.dropsGroupshopService.updateExpireDate(
      {
        ...groupshop,
        status: 'active',
        discountCode: updatedDiscountCode ?? groupshop.discountCode,
        expiredAt: newExpiredate,
        id: groupshop.id,
        oldStatus: groupshop.status,
      },
      Dcode,
    );

    // add lifcycle event for revised groupshop

    const documents = [
      {
        groupshopId: groupshop.id,
        event: eventType,
        dateTime: new Date(),
      },
      {
        groupshopId: groupshop.id,
        event: EventType.expired,
        dateTime: newExpiredate ?? new Date(),
      },
    ];

    this.lifecyclesrv.createMany(documents);

    return updateGS;
  }

  @Public()
  @UseInterceptors(ViewedInterceptor)
  @Query(() => DropsGroupshop, { name: 'DropGroupshop' })
  async findDropsGroupshopByCode(
    @Args('code') code: string,
    @Args('status') status: string,
  ) {
    let rCount = undefined;
    const Dcode = await this.crypt.decrypt(code);
    const groupshop = await this.dropsGroupshopService.findDropsGS(Dcode);
    const res = await this.lifecyclesrv.findAllEvents(
      groupshop.id,
      EventType.ended,
    );
    // if (groupshop.status === 'pending' && groupshop.expiredAt === null) {
    //   // executes on first view
    //   await this.expireAtUpdate(groupshop, Dcode, EventType.started);
    // }

    if (status === 'activated' && groupshop.expiredAt) {
      const isExpired = !(getDateDifference(groupshop.expiredAt).time > -1);
      if (isExpired && res?.length < 1) {
        await this.expireAtUpdate(groupshop, Dcode, EventType.revised);
        rCount = 1;

        // Update status on Klaviyo profile
        const shortURL = groupshop.shortUrl;
        const klaviyoId = groupshop.customerDetail.klaviyoId;

        const currentProfile: { data: any } =
          (await this.kalavioService.getProfilesById(
            klaviyoId,
            groupshop.storeId,
          )) as { data: any };
        const latestShortUrl =
          currentProfile?.data.attributes.properties?.groupshop_url;
        if (shortURL === latestShortUrl) {
          const params = new URLSearchParams({
            groupshop_status: 'active',
          });
          const data = params.toString();
          await this.kalavioService.klaviyoProfileUpdate(
            klaviyoId,
            data,
            groupshop.storeId,
          );
        }
      }
    }
    const gs = await this.dropsGroupshopService.findDropGroupshopByCode(
      // code,
      await this.crypt.decrypt(code),
    );
    if (gs) {
      return { ...gs, revisedCount: rCount ?? res.length };
    } else {
      throw new NotFoundException(`Not Found drops groupshop`);
    }
  }

  @Public()
  @Query(() => DropsCategory, { name: 'collectionByCategory' })
  async getCollectionByCategory(@Args('categoryId') categoryId: string) {
    return await this.dropsGroupshopService.findProductsByCategory(categoryId);
  }

  @Public()
  @Query(() => Store, { name: 'DropGroupshopSections' })
  async getDropsSections() {
    return await this.storesService.findDropGroupshopSections();
  }

  @Public()
  @Mutation(() => DropsGroupshop)
  updateDropsGroupshop(
    @Args('updateDropsGroupshopInput')
    updateDropsGroupshopInput: UpdateDropsGroupshopInput,
  ) {
    return this.dropsGroupshopService.update(
      updateDropsGroupshopInput.id,
      updateDropsGroupshopInput,
    );
  }

  @Public()
  @Mutation(() => DropsGroupshop)
  async addFavoriteProduct(
    @Args('dropsId') dropsId: string,
    @Args('productId') productId: string,
  ) {
    return await this.dropsGroupshopService.addFavoriteProduct(
      dropsId,
      productId,
    );
  }

  @Public()
  @Mutation(() => DropsGroupshop)
  async removeFavoriteProduct(
    @Args('dropsId') dropsId: string,
    @Args('productId') productId: string,
  ) {
    return await this.dropsGroupshopService.removeFavoriteProduct(
      dropsId,
      productId,
    );
  }

  @Mutation(() => DropsGroupshop)
  removeDropsGroupshop(@Args('id', { type: () => String }) id: string) {
    return this.dropsGroupshopService.remove(id);
  }

  @Public()
  @Mutation(() => DropsGroupshop)
  async createOnBoardingDiscountCode(@Args('gid') gid: string) {
    try {
      const dgroupshop = await this.dropsGroupshopService.findOne(gid);
      const dGroupshop = {
        ...dgroupshop,
        obSettings: { ...dgroupshop.obSettings, step: 1 },
      };

      const klaviyoId = dGroupshop?.customerDetail?.klaviyoId;
      const shortURL = dGroupshop?.shortUrl;

      // Update status on Klaviyo profile
      this.kalavioService.updateKlaviyoProfileStatus(
        klaviyoId,
        shortURL,
        dGroupshop,
      );

      const updateDropsGroupshop = await this.expireAtUpdate(
        dGroupshop,
        dGroupshop.discountCode.title,
        EventType.started,
      );

      return updateDropsGroupshop;
    } catch (err) {
      console.log(err);
      Logger.error(err, 'createOnBoardingDiscountCode');
    }
  }
}
