import { Test, TestingModule } from '@nestjs/testing';
import { DropsProductsResolver } from './drops-products.resolver';
import { DropsProductsService } from './drops-products.service';

describe('DropsProductsResolver', () => {
  let resolver: DropsProductsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropsProductsResolver, DropsProductsService],
    }).compile();

    resolver = module.get<DropsProductsResolver>(DropsProductsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
