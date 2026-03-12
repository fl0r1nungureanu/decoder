import { Injectable } from '@nestjs/common';
import { DecodableSmartMeter } from './decodable-smart-meter.interface';
import { DecodableSmartMeterMaddalena } from './maddalena.smart-meter';
import { DecodableSmartMeterWaterTech } from './waterTech.smart-meter';
import { CryptoService } from '../crypto/crypto.service';
import { DecodableSmartMeterBMeter } from './bmeter.smart-meter';
import { DecodableSmartMeterSensus } from './sensus.smart-meter';

@Injectable()
export class DecodableSmartMeterFactory {
  constructor(private readonly cryptoService: CryptoService) {}
  getDecodableSmartMeter(marca: string): DecodableSmartMeter {
    switch (marca.toUpperCase()) {
      case 'MAD':
        return new DecodableSmartMeterMaddalena(this.cryptoService);
      case 'BMT':
        return new DecodableSmartMeterBMeter(this.cryptoService);
      case 'WTT':
        return new DecodableSmartMeterWaterTech(this.cryptoService);
      case 'SEN':
        return new DecodableSmartMeterSensus(this.cryptoService);
      default:
        throw new Error(
          `Il decoder per il modello: ${marca} non è stato implementato`,
        );
    }
  }
}
