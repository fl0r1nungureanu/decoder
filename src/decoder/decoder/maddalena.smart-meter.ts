import { DecodableSmartMeter } from './decodable-smart-meter.interface';
import { DecodedSmartMeterInfoMaddalena } from './decoded-smart-meter-info.interface';
import { CryptoService } from '../crypto/crypto.service';

export class DecodableSmartMeterMaddalena implements DecodableSmartMeter {
  constructor(private readonly cryptoService: CryptoService) {}

  decodePayload(key: string, payload: string): DecodedSmartMeterInfoMaddalena {
    const buffer = Buffer.from(payload, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    return this.decode(buffer, keyBuffer);
  }
  decode(buffer: Buffer, key: Buffer): DecodedSmartMeterInfoMaddalena {
    const endOfUseful = buffer.subarray(5, 52);
    console.log(endOfUseful);

    const encrypted = endOfUseful.subarray(-32);
    console.log('criptato:');
    console.log(encrypted);
    const iv = this.getIv(endOfUseful);
    console.log(iv);

    const decrypted = this.cryptoService.decryptAesCbc(encrypted, key, iv);
    return this.parseDecrypted(decrypted);
  }

  private getIv(buffer: Buffer): Buffer {
    const manufacturer = buffer.subarray(2, 10);
    const accessByte = buffer[11];

    const accessNumber = Buffer.alloc(8, accessByte);
    const ivBase = Buffer.concat([manufacturer, accessNumber]);
    const padding = Buffer.alloc(16 - ivBase.length, 0x00);
    console.log(ivBase);
    return Buffer.concat([ivBase, padding]);
  }

  private parseDecrypted(decrypted: Buffer): DecodedSmartMeterInfoMaddalena {
    console.log(decrypted);
    const aesVerification = decrypted.subarray(0, 2);
    const volumeDif = decrypted.subarray(2, 3);
    const volumeVif = decrypted.subarray(3, 4);
    const volumeValue = decrypted.subarray(4, 8);

    const volume = volumeValue.readUIntLE(0, 4);

    const dateDif = decrypted.subarray(8, 9);
    const dateVif = decrypted.subarray(9, 10);
    const dateValue = decrypted.subarray(10, 14);

    const hexStr = dateValue.toString('hex');
    const dt = hexToDatetime(hexStr);

    const alarmDif = decrypted.subarray(14, 15);
    const alarmVif = decrypted.subarray(15, 16);
    const alarmVife = decrypted.subarray(16, 17);
    const alarmFlags = decrypted.subarray(17, 21);
    const binaryString = Array.from(alarmFlags)
      .map((b) => b.toString(2).padStart(8, '0'))
      .join('');

    const periodicVolumeDif = decrypted.subarray(21, 22);
    const periodicVolumeVif = decrypted.subarray(22, 23);
    const periodicVolumeValue = decrypted.subarray(23, 27);

    const periodicDateDif = decrypted.subarray(27, 28);
    const periodicDateVif = decrypted.subarray(28, 29);
    const periodicDateValue = decrypted.subarray(29, 31);

    function hex(buf: Buffer): string {
      return Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
    }

    function hexToDatetime(hexStr: string): Date {
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
      const fullYear = 2000 + 100 * hundred + year;

      return new Date(fullYear, month - 1, day, hour, minute);
    }

    return {
      meterId: 'matricola',
      brand: 'marca',
      aesVerification: hex(aesVerification),
      volumeDif: hex(volumeDif),
      volumeVif: hex(volumeVif),
      volumeValue: volume,
      dateDif: hex(dateDif),
      dateVif: hex(dateVif),
      dateValue: dt,
      alarmDif: hex(alarmDif),
      alarmVif: hex(alarmVif),
      alarmVife: hex(alarmVife),
      alarmFlags: binaryString,
      periodicVolumeDif: hex(periodicVolumeDif),
      periodicVolumeVif: hex(periodicVolumeVif),
      periodicVolumeValue: hex(periodicVolumeValue),
      periodicDateDif: hex(periodicDateDif),
      periodicDateVif: hex(periodicDateVif),
      periodicDateValue: hex(periodicDateValue),
    };
  }
}
