import { Injectable } from '@nestjs/common';
import * as aesjs from 'aes-js';
import * as crypto from 'crypto';

@Injectable()
export class AESEncryptDecryptService {
  // public key = process.env.AES_SECRET_KEY;
  public key = crypto.randomBytes(16);

  encryptData(data: string): string {
    console.log('first');
    const keyBytes = aesjs.utils.utf8.toBytes(crypto.randomBytes(16));
    const textBytes = aesjs.utils.utf8.toBytes(data);
    // console.log('1111');
    // const iv = crypto.randomBytes(16);
    try {
      const key1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      // The initialization vector (must be 16 bytes)
      const iv1 = [
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      ];
      const aesCbc = new aesjs.ModeOfOperation.cbc(key1, iv1);
      // console.log('2222');
      const blockSize = 16;
      const paddedBytes = aesjs.padding.pkcs7.pad(textBytes, blockSize);
      // console.log('----padded');

      const encryptedBytes = aesCbc.encrypt(paddedBytes);
      // console.log('3333');
      const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
      // console.log('44444');
      console.log('Encrypted data:', encryptedHex);
      return encryptedHex;
    } catch (error) {
      console.log(error);
    }
    return '1';
  }

  decryptData(data: string): string {
    console.log('first');
    // const iv = crypto.randomBytes(16);
    try {
      const key1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      // The initialization vector (must be 16 bytes)
      const iv1 = [
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      ];
      const aesCbc = new aesjs.ModeOfOperation.cbc(key1, iv1);
      console.log('2222');
      const blockSize = 16;
      const encryptedBytes = aesjs.utils.hex.toBytes(data);

      console.log('3333');
      const decryptedBytes = aesCbc.decrypt(encryptedBytes);
      console.log('44444');
      const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
      console.log('decryptedText data:', decryptedText);
      return decryptedText;
    } catch (error) {
      console.log(error);
    }
    return '1';
  }
}
