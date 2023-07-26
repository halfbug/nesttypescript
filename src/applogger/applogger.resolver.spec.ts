import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerResolver } from './applogger.resolver';
import { AppLoggerService } from './applogger.service';

describe('AppLoggerResolver', () => {
  let resolver: AppLoggerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppLoggerResolver, AppLoggerService],
    }).compile();

    resolver = module.get<AppLoggerResolver>(AppLoggerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
