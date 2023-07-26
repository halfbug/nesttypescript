import { Test, TestingModule } from '@nestjs/testing';
import { AdminPermissionsService } from './admin-permissions.service';

describe('AdminPermissionsService', () => {
  let service: AdminPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminPermissionsService],
    }).compile();

    service = module.get<AdminPermissionsService>(AdminPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
