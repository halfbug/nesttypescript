import { Test, TestingModule } from '@nestjs/testing';
import { DropsProductsService } from './drops-products.service';

describe('DropsProductsService', () => {
  let service: DropsProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropsProductsService],
    }).compile();

    service = module.get<DropsProductsService>(DropsProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
