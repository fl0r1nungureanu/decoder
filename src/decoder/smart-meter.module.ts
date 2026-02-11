import { Module } from '@nestjs/common';
import { SmartMeterController } from './controller/smart-meter.controller';
import { SmartMeterService } from './service/smart-meter.service';
import { DecodableSmartMeterFactory } from './decoder/decodable-smart-meter.factory';
import { CryptoService } from './crypto/crypto.service';

@Module({
  controllers: [SmartMeterController],
  providers: [SmartMeterService, DecodableSmartMeterFactory, CryptoService],
  exports: [SmartMeterService],
})
export class SmartMeterModule {}
