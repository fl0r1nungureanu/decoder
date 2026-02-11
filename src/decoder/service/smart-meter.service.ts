import { Injectable } from '@nestjs/common';
import { DecodableSmartMeterFactory } from '../decoder/decodable-smart-meter.factory';
import { DecodedSmartMeterInfo } from '../decoder/decoded-smart-meter-info.interface';

type DecodeInput = { marca: string; key: string; payload: string };

@Injectable()
export class SmartMeterService {
  constructor(private readonly factory: DecodableSmartMeterFactory) {}

  decode(item: DecodeInput): DecodedSmartMeterInfo {
    const decoder = this.factory.getDecodableSmartMeter(item.marca);
    return decoder.decodePayload(item.key, item.payload);
  }
}
