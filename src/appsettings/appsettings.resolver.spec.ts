import { Test, TestingModule } from '@nestjs/testing';
import { AppsettingsResolver } from './appsettings.resolver';
import { AppsettingsService } from './appsettings.service';

describe('AppsettingsResolver', () => {
  let resolver: AppsettingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppsettingsResolver, AppsettingsService],
    }).compile();

    resolver = module.get<AppsettingsResolver>(AppsettingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
