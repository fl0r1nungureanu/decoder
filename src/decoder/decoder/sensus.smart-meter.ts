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
  encryptedStart: number;
}

export class DecodableSmartMeterSensus implements DecodableSmartMeter {
  constructor(private readonly cryptoService: CryptoService) {}

  decodePayload(key: string, payload: string): DecodedSmartMeterInfo {
    const telegram = Buffer.from(payload, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');

    const header = this.parseHeader(telegram);

    const encrypted = telegram.subarray(header.encryptedStart);

    const iv = this.buildIv(header);

    const decrypted = this.cryptoService.decryptAesCbc(
      encrypted,
      keyBuffer,
      iv,
    );

    return this.parsePayload(decrypted, header);
  }

  private parseHeader(buffer: Buffer): WMBusHeader {
    const manufacturer = buffer.subarray(7, 9);
    const address = buffer.subarray(9, 15);

    const meterId = address.subarray(0, 4).reverse().toString('hex');

    const ciField = buffer[17];
    const accessNumber = buffer[18];
    const status = buffer[19];

    const encryptedStart = 20;

    return {
      manufacturer,
      address,
      meterId,
      ciField,
      accessNumber,
      status,
      encryptedStart,
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

  private parsePayload(
    buffer: Buffer,
    header: WMBusHeader,
  ): DecodedSmartMeterInfo {
    let offset = 0;

    let volume = 0;
    let timestamp: Date | null = null;
    let alarms = '';

    while (offset < buffer.length) {
      const dif = buffer[offset++];
      const vif = buffer[offset++];

      const length = this.difLength(dif);

      const data = buffer.subarray(offset, offset + length);
      offset += length;

      if ((vif & 0x7f) === 0x13) {
        volume = data.readUIntLE(0, length);
      }

      if ((vif & 0x7f) === 0x6d) {
        timestamp = this.decodeDate(data);
      }

      if ((vif & 0x7f) === 0xfd) {
        alarms = [...data].map((b) => b.toString(2).padStart(8, '0')).join('');
      }
    }

    return {
      meterId: header.meterId,
      brand: 'Sensus',
      volumeValue: volume,
      dateValue: timestamp ?? new Date(),
      alarmFlags: alarms,
    } as unknown as DecodedSmartMeterInfo;
  }

  private difLength(dif: number): number {
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

  private decodeDate(buffer: Buffer): Date {
    const val = buffer.readUInt32LE(0);

    const minute = val & 0x3f;
    const hour = (val >> 8) & 0x1f;
    const day = (val >> 16) & 0x1f;
    const month = (val >> 24) & 0x0f;

    const year = ((val >> 21) & 0x07) | (((val >> 28) & 0x07) << 3);

    const hundred = (val >> 13) & 0x03;

    const fullYear = 2000 + hundred * 100 + year;

    return new Date(fullYear, month - 1, day, hour, minute);
  }
}
