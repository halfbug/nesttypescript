import { Test, TestingModule } from '@nestjs/testing';
import { AdminRolesResolver } from './admin-roles.resolver';
import { AdminRolesService } from './admin-roles.service';

describe('AdminRolesResolver', () => {
  let resolver: AdminRolesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminRolesResolver, AdminRolesService],
    }).compile();

    resolver = module.get<AdminRolesResolver>(AdminRolesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
