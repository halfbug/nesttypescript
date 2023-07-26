import { Test, TestingModule } from '@nestjs/testing';
import { AdminActivityLogsService } from './admin-activity-logs.service';

describe('AdminActivityLogsService', () => {
  let service: AdminActivityLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminActivityLogsService],
    }).compile();

    service = module.get<AdminActivityLogsService>(AdminActivityLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
