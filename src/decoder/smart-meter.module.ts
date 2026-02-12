import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmartMeterController } from './controller/smart-meter.controller';
import { SmartMeterService } from './service/smart-meter.service';
import { DecodableSmartMeterFactory } from './decoder/decodable-smart-meter.factory';
import { CryptoService } from './crypto/crypto.service';

import { VisitAlarmsEntity } from './entity/visit-alarms.entity';
import { AlarmsEntity } from './entity/alarms.entity';
import { VisitAlarmsService } from './service/alarm-visits.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmsEntity, VisitAlarmsEntity])],
  controllers: [SmartMeterController],
  providers: [
    SmartMeterService,
    DecodableSmartMeterFactory,
    CryptoService,
    VisitAlarmsService,
  ],
  exports: [SmartMeterService],
})
export class SmartMeterModule {}
