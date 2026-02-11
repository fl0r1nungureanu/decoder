import { DecodedSmartMeterInfo } from './decoded-smart-meter-info.interface';

export interface DecodableSmartMeter {
  decodePayload(key: string, payload: string): DecodedSmartMeterInfo;
}
