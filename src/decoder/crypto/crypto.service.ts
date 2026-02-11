import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  decryptAesCbc(cipher: Buffer, key: Buffer, iv: Buffer): Buffer {
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    decipher.setAutoPadding(false); // importante per WMBus
    return Buffer.concat([decipher.update(cipher), decipher.final()]);
  }
}
