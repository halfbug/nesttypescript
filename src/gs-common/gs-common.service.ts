import { Injectable } from '@nestjs/common';
import { EncryptDecryptService } from 'src/utils/encrypt-decrypt/encrypt-decrypt.service';

@Injectable()
export class GsCommonService {
  constructor(private readonly crypt: EncryptDecryptService) {}
  identifyGS(code) {
    const prefix = code.substring(0, 3);
    switch (prefix) {
      case 'GSD':
        return 'DROPS';
      case 'GSP':
        return 'PARTNER';
      case 'GSC':
        return 'CHANNEL';
      default:
        return 'GROUPSHOP';
    }
  }
}
