import { Test, TestingModule } from '@nestjs/testing';
import { KalavioResolver } from './kalavio.resolver';

describe('KalavioResolver', () => {
  let resolver: KalavioResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KalavioResolver],
    }).compile();

    resolver = module.get<KalavioResolver>(KalavioResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
