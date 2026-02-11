import { Module } from '@nestjs/common';
import { SmartMeterModule } from './decoder/smart-meter.module';

@Module({
  imports: [SmartMeterModule],
})
export class AppModule {}
