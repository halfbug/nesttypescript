import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { getMongoManager, MongoRepository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { StoresService } from 'src/stores/stores.service';
import { lastValueFrom, map } from 'rxjs';
import { CreateSignUpInput } from './dto/create-signup.input';
import * as qrcode from 'qrcode';

@Injectable()
export class KalavioService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private storesService: StoresService,
  ) {}

  sendKlaviyoEmail(body) {
    const urlKlaviyo = this.configService.get('KLAVIYO_TRACK_URL');
    const token = this.configService.get('KLAVIYO_PUBLIC_KEY');
    const newbody = JSON.stringify({ token, ...body });
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    this.httpService
      .post(urlKlaviyo, newbody, options)
      .subscribe(async (res: any) => {
        //console.log(res: any);
      });
  }

  updateKlaviyoProfileStatus(klaviyoId, shortURL, dgroupshop) {
    if (typeof klaviyoId !== 'undefined') {
      this.getProfilesById(klaviyoId, dgroupshop.storeId).then((res: any) => {
        const latestShortUrl = res?.data.attributes.properties?.groupshop_url;
        if (shortURL === latestShortUrl) {
          const params = new URLSearchParams({
            groupshop_status: 'active',
          });
          const data = params.toString();
          this.klaviyoProfileUpdate(klaviyoId, data, dgroupshop.storeId);
        }
      });
    }
  }

  createKlaviyoSubscribes(body: any) {
    const PRIVATE_KEY = this.configService.get('KLAVIYO_PRIVATE_KEY');
    const urlKlaviyo = `${this.configService.get(
      'KLAVIYO_BASE_URL',
    )}${'/v2/list/'}${'UHgKGu'}${'/subscribe?api_key='}${PRIVATE_KEY}`;
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    this.httpService
      .post(urlKlaviyo, body, options)
      .subscribe(async (res: any) => {
        // console.log(res: any);
      });
  }

  async klaviyoSignUp(createSignUpInput) {
    const listId = this.configService.get('KLAVIYO_LIST_ID');
    const PRIVATE_KEY = this.configService.get('KLAVIYO_PRIVATE_KEY');
    const urlKlaviyo = `${this.configService.get(
      'KLAVIYO_BASE_URL',
    )}${'/v2/list/'}${listId}${'/subscribe?api_key='}${PRIVATE_KEY}`;
    console.log(urlKlaviyo);
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({
      profiles: [
        {
          email: createSignUpInput.email,
        },
      ],
    });
    try {
      const res: any = await lastValueFrom(
        this.httpService
          .post(urlKlaviyo, body, options)
          .pipe(map((res: any) => res.data)),
      );
      const status = res.length > 0 ? true : false;

      const result = {
        email: status === true ? res[0]?.id : '',
      };
      return result;
    } catch (err) {
      console.log({ err });
      console.log(JSON.stringify(err));
      Logger.error(err, KalavioService.name);
      return false;
    }
  }

  async getProfilesById(profileId, storeId) {
    const storeData = await this.storesService.findById(storeId);
    const PRIVATE_KEY = storeData?.drops?.klaviyo?.privateKey ?? '';
    const urlKlaviyo = `${this.configService.get(
      'KLAVIYO_BASE_URL',
    )}${'/profiles/'}${profileId}`;
    if (PRIVATE_KEY !== '') {
      try {
        const options = {
          headers: {
            Authorization: `${'Klaviyo-API-Key '}${PRIVATE_KEY}`,
            accept: 'application/json',
            revision: '2023-02-22',
          },
        };
        const getProfiles = await lastValueFrom(
          this.httpService
            .get(urlKlaviyo, options)
            .pipe(map((res: any) => res.data)),
        );
        return getProfiles;
      } catch (err) {
        console.error(err);
      }
    }
  }

  async getProfilesByListId(listId, nextPage, PRIVATE_KEY) {
    let urlKlaviyo;
    if (nextPage == '') {
      urlKlaviyo = `${this.configService.get(
        'KLAVIYO_BASE_URL',
      )}${'/lists/'}${listId}${'/profiles/?'}${nextPage}&page[size]=100`;
    } else {
      urlKlaviyo = nextPage;
    }

    try {
      const options = {
        headers: {
          Authorization: `${'Klaviyo-API-Key '}${PRIVATE_KEY}`,
          accept: 'application/json',
          revision: '2023-06-15',
        },
      };
      const getProfiles = await lastValueFrom(
        this.httpService
          .get(urlKlaviyo, options)
          .pipe(map((res: any) => res.data)),
      );
      return getProfiles;
    } catch (err) {
      Logger.error(err, KalavioService.name);
      console.error(err);
    }
  }

  async getProfilesBySegmentId(segementId, nextPage, PRIVATE_KEY) {
    let urlKlaviyo;
    if (nextPage == '') {
      urlKlaviyo = `${this.configService.get(
        'KLAVIYO_BASE_URL',
      )}${'/segments/'}${segementId}${'/profiles/?'}${nextPage}&page[size]=100`;
    } else {
      urlKlaviyo = nextPage;
    }

    try {
      const options = {
        headers: {
          Authorization: `${'Klaviyo-API-Key '}${PRIVATE_KEY}`,
          accept: 'application/json',
          revision: '2023-06-15',
        },
      };
      const getProfiles = await lastValueFrom(
        this.httpService
          .get(urlKlaviyo, options)
          .pipe(map((res: any) => res.data)),
      );
      return getProfiles;
    } catch (err) {
      Logger.error(err, KalavioService.name);
      console.error(err);
    }
  }

  async klaviyoProfileSmsUpdate(input) {
    const PRIVATE_KEY = this.configService.get('KLAVIYO_PRIVATE_KEY');
    const customerEmail = input.email;
    const urlKlaviyo = `${this.configService.get(
      'KLAVIYO_BASE_URL',
    )}${'/v2/people/search?email='}${customerEmail}${'&api_key='}${PRIVATE_KEY}`;
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const getProfile: any = await lastValueFrom(
      this.httpService.get(urlKlaviyo).pipe(map((res: any) => res.data)),
    );
    const ProfileId = getProfile?.id || null;
    if (ProfileId !== null) {
      const profileUrlKlaviyo = `${this.configService.get(
        'KLAVIYO_BASE_URL',
      )}${'/v1/person/'}${ProfileId}${'?sms_marketing_consent='}${
        input.sms_marketing
      }${'&api_key='}${PRIVATE_KEY}`;
      console.log(profileUrlKlaviyo);
      await lastValueFrom(
        this.httpService
          .put(profileUrlKlaviyo, options)
          .pipe(map((res: any) => res.data)),
      );
    }
  }

  async klaviyoProfileUpdate(ProfileId, postData, storeId) {
    const storeData = await this.storesService.findById(storeId);
    const PRIVATE_KEY = storeData?.drops?.klaviyo?.privateKey ?? '';
    if (PRIVATE_KEY !== '') {
      const options = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };
      const profileUrlKlaviyo = `${this.configService.get(
        'KLAVIYO_BASE_URL',
      )}${'/v1/person/'}${ProfileId}${'?'}${postData}${'&api_key='}${PRIVATE_KEY}`;
      try {
        await lastValueFrom(
          this.httpService
            .put(profileUrlKlaviyo, options)
            .pipe(map((res: any) => res.data)),
        );
      } catch (err) {
        console.error(err);
        Logger.error(err, 'klaviyoProfileUpdate');
      }
    }
  }

  async generateShortLink(link: string) {
    const URL = '/links/public';
    const apiUrl = `${this.configService.get('SHORT_LINK_BASE_URL')}${URL}`;
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.configService.get('SHORT_LINK_PUBLIC_KEY'),
      },
    };
    const body = JSON.stringify({
      allowDuplicates: true,
      domain: 'group.shop',
      originalURL: link,
      title: 'GroupShop',
    });
    try {
      const res: any = await lastValueFrom(
        this.httpService
          .post(apiUrl, body, options)
          .pipe(map((res: any) => res.data)),
      );
      return res?.shortURL;
    } catch (err) {
      console.error(err);
      Logger.error(err, KalavioService.name);
      return link;
    }
  }

  async generateBulkShortLink(links: string[]) {
    const URL = '/links/bulk';
    const apiUrl = `${this.configService.get('SHORT_LINK_BASE_URL')}${URL}`;
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.configService.get('SHORT_BULK_LINK_PUBLIC_KEY'),
      },
    };
    const body = JSON.stringify({
      allowDuplicates: true,
      domain: 'group.shop',
      links: links,
    });
    try {
      const res: any = await lastValueFrom(
        this.httpService
          .post(apiUrl, body, options)
          .pipe(map((res: any) => res.data)),
      );
      return res;
    } catch (err) {
      console.error(err);
      Logger.error(err, KalavioService.name);
    }
  }

  async generateQrCode(text: string) {
    try {
      return await qrcode.toDataURL(text);
    } catch (err) {
      console.error(err);
      Logger.error(err, KalavioService.name);
      return false;
    }
  }

  async createKlaviyoList(listName, PRIVATE_KEY) {
    const urlKlaviyo = `${this.configService.get(
      'KLAVIYO_BASE_URL',
    )}${'/lists/'}`;
    const options = {
      headers: {
        Authorization: `${'Klaviyo-API-Key '}${PRIVATE_KEY}`,
        Accept: 'application/json',
        'content-type': 'application/json',
        revision: '2023-02-22',
      },
    };
    const body = JSON.stringify({
      data: {
        type: 'list',
        attributes: {
          name: listName,
        },
      },
    });
    try {
      const res = await lastValueFrom(
        this.httpService
          .post(urlKlaviyo, body, options)
          .pipe(map((res: any) => res.data)),
      );
      return res;
    } catch (err) {
      console.log({ err });
      console.log(JSON.stringify(err));
      Logger.error(err, KalavioService.name);
      return false;
    }
  }

  async getKlaviyoList(nextPage, PRIVATE_KEY) {
    try {
      const options = {
        headers: {
          Authorization: `${'Klaviyo-API-Key '}${PRIVATE_KEY}`,
          accept: 'application/json',
          revision: '2023-02-22',
        },
      };
      const getProfiles = await lastValueFrom(
        this.httpService
          .get(nextPage, options)
          .pipe(map((res: any) => res.data)),
      );
      return getProfiles;
    } catch (err) {
      Logger.error(err, KalavioService.name);
      console.error(err);
    }
  }

  async findKlaviyoList(storeId, PRIVATE_KEY) {
    // const storeData = await this.storesService.findById(storeId);
    let smsListId = '';
    if (PRIVATE_KEY !== '') {
      let urlKlaviyo = `${this.configService.get(
        'KLAVIYO_BASE_URL',
      )}${'/lists/'}`;
      try {
        do {
          const lists: any = await this.getKlaviyoList(urlKlaviyo, PRIVATE_KEY);
          urlKlaviyo = lists?.links?.next ? lists?.links?.next : '';
          lists?.data.forEach((list: any) => {
            const listName = list.attributes.name;
            const listId = list.id;
            if (listName === 'Groupshop SMS Subscribers') {
              smsListId = listId;
              return { listId: smsListId };
            }
          });
        } while (urlKlaviyo !== '');
        {
          if (smsListId == '') {
            const lists: any = await this.createKlaviyoList(
              'Groupshop SMS Subscribers',
              PRIVATE_KEY,
            );
            smsListId = lists?.data.id ?? '';
          }
        }
        return { listId: smsListId };
      } catch (err) {
        console.log({ err });
        console.log(JSON.stringify(err));
        Logger.error(err, KalavioService.name);
        return false;
      }
    }
  }

  async enableSmsConsent(phone_number, profileId, storeId) {
    const storeData = await this.storesService.findById(storeId);
    const PRIVATE_KEY = storeData?.drops?.klaviyo?.privateKey ?? '';
    const subscriberListId = storeData?.drops?.klaviyo?.subscriberListId ?? '';
    if (PRIVATE_KEY !== '' && subscriberListId !== '') {
      const urlKlaviyo = `${this.configService.get(
        'KLAVIYO_BASE_URL',
      )}${'/profile-subscription-bulk-create-jobs/'}`;
      const options = {
        headers: {
          Authorization: `${'Klaviyo-API-Key '}${PRIVATE_KEY}`,
          Accept: 'application/json',
          'content-type': 'application/json',
          revision: '2023-02-22',
        },
      };
      const body = JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            list_id: subscriberListId, // SMS Subscribers klaviyo list Id
            custom_source: 'Marketing Event',
            subscriptions: [
              {
                channels: {
                  sms: ['MARKETING'],
                },
                phone_number: phone_number,
                profile_id: profileId,
              },
            ],
          },
        },
      });
      try {
        const res = this.httpService
          .post(urlKlaviyo, body, options)
          .subscribe(async (res: any) => {
            // console.log(res: any);
          });
        return res;
      } catch (err) {
        console.log({ err });
        console.log(JSON.stringify(err));
        Logger.error(err, KalavioService.name);
        return false;
      }
    }
  }
}
