import { Test, TestingModule } from '@nestjs/testing';
import { DropsCategoryResolver } from './drops-category.resolver';
import { DropsCategoryService } from './drops-category.service';

describe('DropsCategoryResolver', () => {
  let resolver: DropsCategoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropsCategoryResolver, DropsCategoryService],
    }).compile();

    resolver = module.get<DropsCategoryResolver>(DropsCategoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
