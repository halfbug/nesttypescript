import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { CreateAppsettingInput } from './dto/create-appsetting.input';
import { Appsetting } from './entities/appsetting.model';
import { v4 as uuid } from 'uuid';
import { Reward, SalesTarget } from './entities/sales-target.model';

@Injectable()
export class AppsettingsService {
  constructor(
    @InjectRepository(Appsetting)
    private appRepository: MongoRepository<Appsetting>,
  ) {}

  create(createAppsettingInput: CreateAppsettingInput) {
    // console.log(
    //   '🚀 ~ file: appsettings.service.ts ~ line 15 ~ AppsettingsService ~ create ~ createAppsettingInput',
    //   JSON.stringify(createAppsettingInput),
    // );
    if (createAppsettingInput.salestargets) {
      const { salestargets } = createAppsettingInput;
      const apsettings: Appsetting = new Appsetting();

      apsettings.id = uuid();
      apsettings.salestargets = [
        ...salestargets.map((target) => {
          target.id = uuid();
          const nrewards = target.rewards.map((rew) => {
            rew.id = uuid();
            const { id, discount, customerCount } = rew;
            return new Reward(id, discount, customerCount);
          });
          target.rewards = [...nrewards];
          const { id, name, rogsMin, rogsMax, status, rewards } = target;
          return new SalesTarget(id, name, rogsMin, rogsMax, status, rewards);
        }),
      ];

      // console.log(
      //   '🚀 ~ file: appsettings.service.ts ~ line 23 ~ AppsettingsService ~ create ~ apsettings',
      //   apsettings,
      // );
      return this.appRepository.save(apsettings);
      // createAppsettingInput.salestargets = { ...nsalestarget };
    } else {
      const appsetting = this.appRepository.create({
        id: uuid(),
        ...createAppsettingInput,
      });
      return this.appRepository.save(appsetting);
    }
  }

  findAll() {
    return this.appRepository.find();
  }

  async findSalesTargetAll() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const qurer = await this.appRepository.find({
      where: { salestargets: { $ne: null } },
      order: {
        'salestargets.rogsMin': -1,
      },
    });

    // console.log(
    //   '🚀 ~ file: appsettings.service.ts ~ line 62 ~ AppsettingsService ~ findSalesTargetAll ~ qurer',
    //   qurer,
    // );
    const starget = qurer.map((rec) => {
      return rec.salestargets[0];
    });
    // console.log(
    //   '🚀 ~ file: appsettings.service.ts ~ line 69 ~ AppsettingsService ~ starget ~ starget',
    //   starget,
    // );
    return starget;
  }
  findOne(field: string) {
    return this.appRepository.find({
      where: { [field]: { $ne: null } },
    });
  }

  // update(id: string, updateAppsettingInput: UpdateAppsettingInput) {
  //   return `This action updates a #${id} appsetting`;
  // }

  // remove(id: string) {
  //   return `This action removes a #${id} appsetting`;
  // }

  // async findbytype(type: string) {
  //   const temp = await this.appRepository.findOne({
  //     where: { type: type },
  //   });
  //   return temp;
  // }
}
