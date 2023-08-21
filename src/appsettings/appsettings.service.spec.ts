import { Test, TestingModule } from '@nestjs/testing';
import { AppsettingsService } from './appsettings.service';

describe('AppsettingsService', () => {
  let service: AppsettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppsettingsService],
    }).compile();

    service = module.get<AppsettingsService>(AppsettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
