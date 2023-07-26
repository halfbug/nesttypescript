import { Injectable } from '@nestjs/common';
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptDecryptService {
  iv = randomBytes(16);
  password = 'Password used to generate key';
  async sencrypt(text: string) {
    const key = (await promisify(scrypt)(this.password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, this.iv);

    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);

    return encryptedText.toString('base64');
  }

  async sdicrypt(text: string) {
    const key = (await promisify(scrypt)(this.password, 'salt', 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, this.iv);
    const decryptedText = Buffer.concat([
      decipher.update(text, 'base64'),
      decipher.final(),
    ]);
    return decryptedText.toString();
  }

  encrypt(text: string) {
    return Buffer.from(text).toString('base64');
  }

  decrypt(text: string) {
    return Buffer.from(text, 'base64').toString('ascii');
  }
}
