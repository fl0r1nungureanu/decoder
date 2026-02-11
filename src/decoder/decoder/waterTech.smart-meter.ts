import { DecodableSmartMeter } from './decodable-smart-meter.interface';
import { DecodedSmartMeterInfoWaterTech } from './decoded-smart-meter-info.interface';
import { CryptoService } from '../crypto/crypto.service';

export class DecodableSmartMeterWaterTech implements DecodableSmartMeter {
  constructor(private readonly cryptoService: CryptoService) {}

  decodePayload(key: string, payload: string): DecodedSmartMeterInfoWaterTech {
    const buffer = Buffer.from(payload.slice(0, 270), 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    return this.decode(buffer, keyBuffer);
  }
  // Initialization Vector: 945E6501000013071C1C1C1C1C1C1C1C -  94 5e 65 01 00 00 13 07 1c 1c 1c 1c 1c 1c 1c 1c
  private getIv(buffer: Buffer): Buffer {
    const manufacturer = buffer.subarray(2, 10);
    const accessByte = buffer[14];

    const accessNumber = Buffer.alloc(8, accessByte);
    const ivBase = Buffer.concat([manufacturer, accessNumber]);
    const padding = Buffer.alloc(16 - ivBase.length, 0x00);
    return Buffer.concat([ivBase, padding]);
  }

  decode(buffer: Buffer, key: Buffer): DecodedSmartMeterInfoWaterTech {
    const payload = buffer.subarray(5);
    const iv = this.getIv(payload);
    const encrypted = payload.subarray(18);

    const decrypted = this.cryptoService.decryptAesCbc(encrypted, key, iv);

    return this.parseDecrypted(decrypted);
  }

  private hexToDateTime(hexStr: string): Date {
    if (hexStr.length !== 12) {
      throw new Error('Hex string deve essere di 12 caratteri (6 byte)');
    }

    const buf = Buffer.from(hexStr, 'hex');

    let val = 0n;
    for (let i = 0; i < 6; i++) {
      val |= BigInt(buf[i]) << BigInt(8 * i);
    }

    const getBits = (v: bigint, start: number, length: number): number => {
      const mask = (1n << BigInt(length)) - 1n;
      return Number((v >> BigInt(start)) & mask);
    };

    const second = getBits(val, 0, 6);
    const minute = getBits(val, 8, 6);
    const hour = getBits(val, 16, 5);
    const day = getBits(val, 24, 5);
    const month = getBits(val, 32, 4);

    const yLow = getBits(val, 29, 3);
    const yHigh = getBits(val, 36, 4);
    const year2 = (yHigh << 3) | yLow;
    const year = 2000 + year2;

    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  private parseDecrypted(decrypted: Buffer): DecodedSmartMeterInfoWaterTech {
    const aesVerification = decrypted.subarray(0, 2);

    const dateDif = decrypted.subarray(2, 3);
    const dateVif = decrypted.subarray(3, 4);
    const dateValue = decrypted.subarray(4, 10);

    const hexStr = dateValue.toString('hex');
    const dt = this.hexToDateTime(hexStr);

    const volumeDif = decrypted.subarray(10, 11);
    const volumeVif = decrypted.subarray(11, 12);

    const volumeValueBuf = decrypted.subarray(12, 16);
    const volumeValue = volumeValueBuf.readUInt32LE(0);

    const alarmDif = decrypted.subarray(16, 17);
    const alarmVif = decrypted.subarray(17, 18);
    const alarmVife = decrypted.subarray(18, 19);
    const alarmFlags = decrypted.subarray(19, 21);
    const binaryString = Array.from(alarmFlags)
      .map((b) => b.toString(2).padStart(8, '0'))
      .join('');

    const versionDif = decrypted.subarray(21, 22);
    const versionVif = decrypted.subarray(22, 23);
    const versionVife = decrypted.subarray(23, 24);
    const versionValue = decrypted.subarray(24, 26);

    function hex(buf: Buffer): string {
      return Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
    }

    return {
      meterId: 'matricola',
      brand: 'marca',
      aesVerification: hex(aesVerification),
      dateDif: hex(dateDif),
      dateVif: hex(dateVif),
      dateValue: dt,
      volumeDif: hex(volumeDif),
      volumeVif: hex(volumeVif),
      volumeValue: volumeValue,
      alarmDif: hex(alarmDif),
      alarmVif: hex(alarmVif),
      alarmVife: hex(alarmVife),
      alarmFlags: binaryString,
      versionDif: hex(versionDif),
      versionVif: hex(versionVif),
      versionVife: hex(versionVife),
      versionValue: hex(versionValue),
    };
  }
}
