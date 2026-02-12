import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartMeterModule } from './decoder/smart-meter.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'nest_user',
      password: 'StrongPass123!',
      database: 'GETWEB',

      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // DEV
      logging: true,

      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),

    SmartMeterModule,
  ],
})
export class AppModule {}
