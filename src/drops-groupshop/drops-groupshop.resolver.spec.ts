import { Test, TestingModule } from '@nestjs/testing';
import { DropsGroupshopResolver } from './drops-groupshop.resolver';
import { DropsGroupshopService } from './drops-groupshop.service';

describe('DropsGroupshopResolver', () => {
  let resolver: DropsGroupshopResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropsGroupshopResolver, DropsGroupshopService],
    }).compile();

    resolver = module.get<DropsGroupshopResolver>(DropsGroupshopResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
