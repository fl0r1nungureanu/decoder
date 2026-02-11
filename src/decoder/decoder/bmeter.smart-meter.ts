import { DecodableSmartMeter } from './decodable-smart-meter.interface';
import { DecodedSmartMeterInfoWaterTech } from './decoded-smart-meter-info.interface';
import { CryptoService } from '../crypto/crypto.service';

export class DecodableSmartMeterBMeter implements DecodableSmartMeter {
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
    console.log(decrypted);
    return this.parseDecrypted(decrypted);
  }

  private hexToDatetime(hexStr: string): Date {
    console.log(hexStr);
    if (hexStr.length !== 8) {
      console.log('Errore');
    }

    // LITTLE ENDIAN
    const buffer = Buffer.from(hexStr, 'hex');
    const val = buffer.readUInt32LE(0);
    console.log(val);

    // Estrazione dei campi (stessa logica della funzione Python)
    const minute = val & 0x3f; // bits 0-5
    const hour = (val >> 8) & 0x1f; // bits 8-12
    const day = (val >> 16) & 0x1f; // bits 16-20
    const month = (val >> 24) & 0x0f; // bits 24-27
    const year = ((val >> 21) & 0x07) | (((val >> 28) & 0x07) << 3); // bits 21-23 + 28-30
    const hundred = (val >> 13) & 0x03; // bits 13-14

    // Calcolo dell'anno completo
    const fullYear = 2000 * hundred + year;

    return new Date(fullYear, month - 1, day, hour, minute);
  }

  private parseDecrypted(decrypted: Buffer): DecodedSmartMeterInfoWaterTech {
    const aesVerification = decrypted.subarray(0, 2);

    const volumeDif = decrypted.subarray(2, 3);
    const volumeVif = decrypted.subarray(3, 4);

    const volumeValueBuf = decrypted.subarray(12, 16);
    const reversed = Buffer.from(volumeValueBuf).reverse();
    const volumeValue = parseInt(reversed.toString('hex').slice(4), 10);

    const dateDif = decrypted.subarray(8, 9);
    const dateVif = decrypted.subarray(9, 10);
    const dateValue = decrypted.subarray(18, 22);

    const hexStr = dateValue.toString('hex');
    console.log(hexStr);
    const dt = this.hexToDatetime(hexStr);
    console.log(dt);

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
