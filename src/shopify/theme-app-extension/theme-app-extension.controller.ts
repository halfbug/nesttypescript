import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoresService } from 'src/stores/stores.service';
import { Public } from 'src/auth/public.decorator';
import { DropsGroupshopService } from 'src/drops-groupshop/drops-groupshop.service';
import { OrdersService } from 'src/inventory/orders.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { BESTSELLER_SECTION_TITLE } from 'src/utils/constant';
@Public()
@Controller('ext')
export class ThemeAppExtensionController {
  constructor(
    private configService: ConfigService,
    private storesService: StoresService,
    private dropsGroupshopService: DropsGroupshopService,
    private orderService: OrdersService,
    private inventoryService: InventoryService,
  ) {}
  @Get('store')
  async getStoreWithActiveCampaign(@Req() req, @Res() res) {
    try {
      const { shop } = req.query;
      const result = await this.storesService.findOneByName(shop);

      if (result && result?.drops?.status == 'Active') {
        const {
          id,
          currencyCode,
          settings,
          status,
          logoImage,
          brandName,
          drops: { status: dropsStatus, collections, rewards: { maximum } } = {
            rewards: { maximum: 0 },
            collections: [],
            klaviyo: {},
          },
        } = result;

        // console.log(await this.storesService.findOneWithActiveCampaing(shop));
        res.send(
          JSON.stringify({
            id,
            currencyCode,
            status,
            dropsStatus,
            logoImage: `${this.configService.get('IMAGE_PATH')}${
              logoImage?.split('/')[4]
            }`,
            settings,
            brandName,
            shopifyId:
              collections.filter(
                (c) => c.name === BESTSELLER_SECTION_TITLE,
              )?.[0]?.shopifyId ?? '', // Static Bestseller name for idetify collection.
            dropsLastMilestone: maximum,
          }),
        );
      } else {
        res.send(
          JSON.stringify({
            status: 'onHold',
            dropsStatus: 'InActive',
          }),
        );
      }
    } catch (err) {
      Logger.error(err, ThemeAppExtensionController.name);
    } finally {
      // res.status(HttpStatus.OK).send();
    }
  }

  @Post('dropsMember')
  async getDropsMemberDetails(@Req() req, @Res() res) {
    try {
      const { orderId } = req.body;

      const {
        id,
        members,
        url,
        discountCode: { percentage },
      } = await this.dropsGroupshopService.findByOrderId(orderId);

      const activeMember = members.find((member) =>
        member.orderId.includes(orderId),
      );

      const orderDetails = await this.orderService.getMembersOrderDetail(
        members,
      );

      const uniqueMembers = [];

      orderDetails.forEach((o: any) => {
        console.log('phone', o.customer);
        if (
          !uniqueMembers
            .filter(({ email }) => ![undefined, null].includes(email))
            .map((u) => u.email)
            .includes(o.customer?.email) &&
          !uniqueMembers
            .filter(({ phone }) => ![undefined, null].includes(phone))
            .map((u) => u.phone)
            .includes(o.customer?.phone)
        ) {
          uniqueMembers.push({
            email: o.customer?.email,
            phone: o.customer?.phone,
          });
        }
      });

      res.send(
        JSON.stringify({
          id,
          activeMember,
          url,
          percentage,
          members: uniqueMembers.length,
        }),
      );
    } catch (err) {
      // console.log(err);
      res.send(JSON.stringify({ activeMember: null, url: null }));
    } finally {
      // res.status(HttpStatus.OK).send();
    }
  }

  @Post('dropsProducts')
  async getDropsProducts(@Req() req, @Res() res) {
    try {
      const { shop, bestsellerCollectionId } = req.body;

      const bestSellerProducts =
        await this.inventoryService.getProductsByCollectionIDs(
          shop,
          [bestsellerCollectionId],
          true,
        );

      res.send(JSON.stringify({ products: bestSellerProducts }));
    } catch (err) {
      res.send(JSON.stringify({ products: null }));
    } finally {
      // res.status(HttpStatus.OK).send();
    }
  }
  @Post('member')
  async getMemberDetails(@Req() req, @Res() res) {
    try {
      const { orderId, wurl } = req.body;
      console.log('🚀  ~ wurl', wurl);
      console.log({ orderId });

      // const {
      //   members,
      //   members: [owner],
      //   url,
      //   obSettings: { ownerUrl },
      //   discountCode: { percentage },
      // } = await this.groupshopSrv.findByOrderId(orderId);
      // const newURL =
      //   owner.orderId === `gid://shopify/Order/${orderId}` ? ownerUrl : url;
      // console.log(
      //   '🚀 ~ file: theme-app-extension.controller.ts ~ line 101 ~ ThemeAppExtensionController ~ getMemberDetails ~ newURL',
      //   newURL,
      // );
      // console.log(await /this.groupshopSrv.findByOrderId(orderId));
      // const activeMember = members.find((member) =>
      //   member.orderId.includes(orderId),
      // );
      // console.log(
      //   '🚀 ~ file: theme-app-extension.controller.ts ~ line 69 ~ ThemeAppExtensionController ~ getMemberDetails ~ activeMember',
      //   activeMember,
      // );
      res.send(
        JSON.stringify({
          activeMember: null,
          url: null,
          // url,
          percentage: 0,
          members: 0,
        }),
      );
    } catch (err) {
      res.send(JSON.stringify({ activeMember: null, url: null }));
    } finally {
      // res.status(HttpStatus.OK).send();
    }
  }

  @Post('dropsSVIDs')
  async getdropsSVIDs(@Req() req, @Res() res) {
    try {
      const { shop } = req.body;

      const ids = await this.dropsGroupshopService.getVaultSpotlightProducts(
        shop,
      );

      res.send(JSON.stringify({ ids }));
    } catch (err) {
      res.send(JSON.stringify({ ids: null }));
    } finally {
      // res.status(HttpStatus.OK).send();
    }
  }
}
