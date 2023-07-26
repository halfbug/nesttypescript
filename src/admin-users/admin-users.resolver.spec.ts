import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersResolver } from './admin-users.resolver';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersResolver', () => {
  let resolver: AdminUsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminUsersResolver, AdminUsersService],
    }).compile();

    resolver = module.get<AdminUsersResolver>(AdminUsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
