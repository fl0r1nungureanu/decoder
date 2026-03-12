import { DecodableSmartMeter } from './decodable-smart-meter.interface';
import { CryptoService } from '../crypto/crypto.service';
import { DecodedSmartMeterInfo } from './decoded-smart-meter-info.interface';

interface WMBusHeader {
  manufacturer: Buffer;
  address: Buffer;
  meterId: string;
  ciField: number;
  accessNumber: number;
  status: number;
  encryptedOffset: number;
}

export class DecodableSmartMeterSensus implements DecodableSmartMeter {
  constructor(private readonly cryptoService: CryptoService) {}

  decodePayload(key: string, payload: string): DecodedSmartMeterInfo {
    const telegram = Buffer.from(payload, 'hex');
    const aesKey = Buffer.from(key, 'hex');

    const header = this.parseHeader(telegram);

    const encrypted = telegram.subarray(
      header.encryptedOffset,
      header.encryptedOffset + 16,
    );

    const iv = this.buildIv(header);

    const decrypted = this.cryptoService.decryptAesCbc(encrypted, aesKey, iv);

    return this.parseDecryptedPayload(decrypted, header);
  }

  private parseHeader(buffer: Buffer): WMBusHeader {
    const manufacturer = buffer.subarray(7, 9);

    const serial = buffer.subarray(9, 13);
    const version = buffer.subarray(13, 14);
    const deviceType = buffer.subarray(14, 15);

    const address = Buffer.concat([serial, version, deviceType]);

    const meterId = Buffer.from(serial).reverse().toString('hex');

    const ciField = buffer[15];
    const accessNumber = buffer[16];
    const status = buffer[17];

    return {
      manufacturer,
      address,
      meterId,
      ciField,
      accessNumber,
      status,
      encryptedOffset: 20,
    };
  }

  private buildIv(header: WMBusHeader): Buffer {
    const acc = Buffer.alloc(7, header.accessNumber);

    return Buffer.concat([
      header.manufacturer,
      header.address,
      Buffer.from([header.ciField]),
      acc,
    ]);
  }

  private parseDecryptedPayload(
    buffer: Buffer,
    header: WMBusHeader,
  ): DecodedSmartMeterInfo {
    let offset = 0;

    let volume = 0;
    let flow = 0;
    let timestamp: Date | null = null;
    let alarms = '0000000000000000';

    while (offset < buffer.length) {
      if (buffer[offset] === 0x2f) {
        offset++;
        continue;
      }

      const dif = buffer[offset++];
      const vif = buffer[offset++];

      let vife: number | null = null;

      if (vif === 0xfd || vif === 0xfb) {
        vife = buffer[offset++];
      }

      const length = this.difDataLength(dif);
      const data = buffer.subarray(offset, offset + length);

      offset += length;

      if ((vif & 0x7f) === 0x13) {
        volume = data.readUIntLE(0, length);
      }

      if ((vif & 0x7f) === 0x3b) {
        flow = data.readUInt16LE(0);
      }

      if ((vif & 0x7f) === 0x6d) {
        timestamp = this.decodeOmsTimestamp(data);
      }

      if (vif === 0xfd && vife === 0x17) {
        const alarmValue = data.readUInt16LE(0);

        alarms = alarmValue.toString(2).padStart(16, '0');
      }
    }

    return {
      meterId: header.meterId,
      brand: 'Sensus',
      volumeValue: volume,
      flowValue: flow,
      dateValue: timestamp,
      alarmFlags: alarms,
    } as unknown as DecodedSmartMeterInfo;
  }

  private difDataLength(dif: number): number {
    const map: Record<number, number> = {
      0x00: 0,
      0x01: 1,
      0x02: 2,
      0x03: 3,
      0x04: 4,
      0x05: 4,
      0x06: 6,
      0x07: 8,
    };

    return map[dif & 0x0f] ?? 0;
  }

  private decodeOmsTimestamp(buffer: Buffer): Date {
    const value = buffer.readUInt32LE(0);

    const minute = value & 0x3f;
    const hour = (value >> 8) & 0x1f;
    const day = (value >> 16) & 0x1f;
    const month = (value >> 24) & 0x0f;

    const year = ((value >> 21) & 0x07) | (((value >> 28) & 0x07) << 3);

    const century = (value >> 13) & 0x03;

    const fullYear = 2000 + century * 100 + year;

    return new Date(fullYear, month - 1, day, hour, minute);
  }
}
