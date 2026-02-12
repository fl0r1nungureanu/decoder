import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  Post,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { SmartMeterService } from '../service/smart-meter.service';
import { DecodeSmartMeterDto } from '../dto/decode-smart-meter.dto';
import { DecodedSmartMeterInfoMaddalenaDto } from '../dto/decoded-smart-meter-info.dto';
import type { DecodedSmartMeterInfo } from '../decoder/decoded-smart-meter-info.interface';

@ApiTags('Smart Meter')
@Controller('api')
export class SmartMeterController {
  private readonly logger = new Logger(SmartMeterController.name);
  constructor(private readonly smartMeterService: SmartMeterService) {}

  @Post('/decode')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({
    summary: 'Decodifica un payload smart meter',
    description:
      'Seleziona il decoder in base a `marca` e decodifica `payload` usando `key`.',
    operationId: 'decodeSmartMeter',
  })
  @ApiBody({
    type: DecodeSmartMeterDto,
    examples: {
      base: {
        summary: 'Esempio base',
        value: {
          marca: 'WTT',
          key: 'e78130803cba48566ee6590d969d5445',
          payload:
            '01FE2840008144945E6501000013078C20117AA50070257027DD390104D28E0B183C430CE0FFBE63CDC0FED9C90CA598C0CE5B434286B4C1CC68EE555676B1E4B8EEEBA6833452BBBD9A57DC428CFFACCD5648AC88C2392B7C1B50A01AB82EF8ED9CDE0F6CB8ECF71A97872F71446022A6A892C5F5BA5953D6F8D08E6EAF705CF1BBA6070AE094FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Payload decodificato correttamente',
    type: DecodedSmartMeterInfoMaddalenaDto,
  })
  decodeSmartMeter(@Body() item: DecodeSmartMeterDto): DecodedSmartMeterInfo {
    this.logger.log(
      'Data: ',
      JSON.stringify(this.smartMeterService.decode(item)),
    );
    return this.smartMeterService.decode(item);
  }
}
