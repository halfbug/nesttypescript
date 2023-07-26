import { Test, TestingModule } from '@nestjs/testing';
import { DefaultColumnsService } from './default-columns.service';

describe('DefaultColumnsService', () => {
  let service: DefaultColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultColumnsService],
    }).compile();

    service = module.get<DefaultColumnsService>(DefaultColumnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
