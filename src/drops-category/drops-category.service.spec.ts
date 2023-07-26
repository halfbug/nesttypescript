import { Test, TestingModule } from '@nestjs/testing';
import { DropsCategoryService } from './drops-category.service';

describe('DropsCategoryService', () => {
  let service: DropsCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropsCategoryService],
    }).compile();

    service = module.get<DropsCategoryService>(DropsCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
