import { Test, TestingModule } from '@nestjs/testing';
import { DropsGroupshopService } from './drops-groupshop.service';

describe('DropsGroupshopService', () => {
  let service: DropsGroupshopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropsGroupshopService],
    }).compile();

    service = module.get<DropsGroupshopService>(DropsGroupshopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
