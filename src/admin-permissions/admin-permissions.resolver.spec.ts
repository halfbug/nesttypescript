import { Test, TestingModule } from '@nestjs/testing';
import { AdminPermissionsResolver } from './admin-permissions.resolver';
import { AdminPermissionsService } from './admin-permissions.service';

describe('AdminPermissionsResolver', () => {
  let resolver: AdminPermissionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminPermissionsResolver, AdminPermissionsService],
    }).compile();

    resolver = module.get<AdminPermissionsResolver>(AdminPermissionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
