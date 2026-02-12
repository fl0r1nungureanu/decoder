import { IsString, IsInt, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisitAlarmsDto {
  @ApiProperty({
    example: 'MADDALENA',
    description: 'Smart meter brand',
  })
  @IsString()
  brand: string;

  @ApiProperty({
    example: 12345,
    description: 'RecoutSap visit ID',
  })
  @IsInt()
  recoutSapId: number;

  @ApiProperty({
    example: '0000110000',
    description:
      'Binary alarm string where position = alarm.position and value = 1 means active',
  })
  @IsString()
  @Length(1, 100)
  alarms: string;
}
