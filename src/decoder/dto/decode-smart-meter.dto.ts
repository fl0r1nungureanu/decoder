import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DecodeSmartMeterDto {
  @ApiProperty({
    description:
      'Chiave necessaria per decodificare il payload (formato dipende dalla marca)',
    example: '00112233445566778899AABBCCDDEEFF',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description:
      'Marca del contatore (usata per selezionare il decoder corretto)',
    example: 'WTT',
  })
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty({
    description:
      'Payload grezzo da decodificare (hex/base64 a seconda della marca)',
    example: 'A1B2C3D4E5F6',
  })
  @IsString()
  @IsNotEmpty()
  payload: string;
}
