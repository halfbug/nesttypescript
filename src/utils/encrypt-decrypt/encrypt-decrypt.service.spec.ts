import { Test, TestingModule } from '@nestjs/testing';
import { EncryptDecryptService } from './encrypt-decrypt.service';

describe('EncryptDecryptService', () => {
  let service: EncryptDecryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptDecryptService],
    }).compile();

    service = module.get<EncryptDecryptService>(EncryptDecryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
