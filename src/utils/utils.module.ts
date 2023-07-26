import { Global, Module } from '@nestjs/common';
import { AnyScalar } from './any.scalarType';
import { DefaultColumnsService } from './default-columns/default-columns.service';
import { EncryptDecryptService } from './encrypt-decrypt/encrypt-decrypt.service';
import { PaginationService } from './pagination.service';
import { AESEncryptDecryptService } from './encrypt-decrypt/aes-encrypt-decrypt.service';

@Global()
@Module({
  providers: [
    DefaultColumnsService,
    EncryptDecryptService,
    PaginationService,
    AESEncryptDecryptService,
  ],
  exports: [
    DefaultColumnsService,
    EncryptDecryptService,
    PaginationService,
    AESEncryptDecryptService,
  ],
})
export class UtilsModule {}
