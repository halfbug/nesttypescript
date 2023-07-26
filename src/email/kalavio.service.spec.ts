import { Test, TestingModule } from '@nestjs/testing';
import { KalavioService } from './kalavio.service';

describe('KalavioService', () => {
  let service: KalavioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KalavioService],
    }).compile();

    service = module.get<KalavioService>(KalavioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
