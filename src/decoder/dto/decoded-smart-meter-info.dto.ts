import { ApiProperty } from '@nestjs/swagger';

export class DecodedSmartMeterInfoMaddalenaDto {
  @ApiProperty({
    description: 'Identificativo contatore (matricola)',
    example: '123456',
  })
  meterId: string;

  @ApiProperty({ description: 'Marca/brand del dispositivo', example: 'MADD' })
  brand: string;

  @ApiProperty({
    description: 'Campo AES verification (hex con spazi)',
    example: 'aa bb',
  })
  aesVerification: string;

  @ApiProperty({ description: 'DIF volume (hex)', example: '0c' })
  volumeDif: string;

  @ApiProperty({ description: 'VIF volume (hex)', example: '13' })
  volumeVif: string;

  @ApiProperty({ description: 'DIF data (hex)', example: '04' })
  dateDif: string;

  @ApiProperty({ description: 'VIF data (hex)', example: '6d' })
  dateVif: string;

  @ApiProperty({
    description: 'Valore data (hex con spazi)',
    example: '20 01 31 12',
  })
  dateValue: string;

  @ApiProperty({ description: 'DIF allarme (hex)', example: '02' })
  alarmDif: string;

  @ApiProperty({ description: 'VIF allarme (hex)', example: 'fd' })
  alarmVif: string;

  @ApiProperty({ description: 'VIFE allarme (hex)', example: '17' })
  alarmVife: string;

  @ApiProperty({
    description: 'Flags allarme (hex con spazi)',
    example: '00 00 00 00',
  })
  alarmFlags: string;

  @ApiProperty({ description: 'DIF volume periodico (hex)', example: '0c' })
  periodicVolumeDif: string;

  @ApiProperty({ description: 'VIF volume periodico (hex)', example: '13' })
  periodicVolumeVif: string;

  @ApiProperty({
    description: 'Valore volume periodico (hex con spazi)',
    example: '10 00 00 00',
  })
  periodicVolumeValue: string;

  @ApiProperty({ description: 'DIF data periodica (hex)', example: '04' })
  periodicDateDif: string;

  @ApiProperty({ description: 'VIF data periodica (hex)', example: '6d' })
  periodicDateVif: string;

  @ApiProperty({
    description: 'Valore data periodica (hex con spazi)',
    example: '31 12',
  })
  periodicDateValue: string;

  @ApiProperty({ description: 'Valore numerico già calcolato', example: 12345 })
  volumeValue: number;
}
