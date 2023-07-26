import { Test, TestingModule } from '@nestjs/testing';
import { AdminActivityLogsResolver } from './admin-activity-logs.resolver';
import { AdminActivityLogsService } from './admin-activity-logs.service';

describe('AdminActivityLogsResolver', () => {
  let resolver: AdminActivityLogsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminActivityLogsResolver, AdminActivityLogsService],
    }).compile();

    resolver = module.get<AdminActivityLogsResolver>(AdminActivityLogsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
