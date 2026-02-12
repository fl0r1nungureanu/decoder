import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmsEntity } from '../entity/alarms.entity';
import { VisitAlarmsEntity } from '../entity/visit-alarms.entity';
import { CreateVisitAlarmsDto } from '../dto/create-visit-alarms.dto';
@Injectable()
export class VisitAlarmsService {
  constructor(
    @InjectRepository(AlarmsEntity)
    private readonly alarmRepo: Repository<AlarmsEntity>,

    @InjectRepository(VisitAlarmsEntity)
    private readonly visitAlarmRepo: Repository<VisitAlarmsEntity>,
  ) {}

  async assignAlarms(dto: CreateVisitAlarmsDto) {
    // 1️⃣ carica allarmi della marca
    const alarms = await this.alarmRepo.find({
      where: { brand: dto.brand },
      order: { position: 'ASC' },
    });

    if (!alarms.length) {
      throw new BadRequestException(
        `No alarms configured for brand ${dto.brand}`,
      );
    }

    // 2️⃣ verifica lunghezza stringa
    const maxPosition = Math.max(...alarms.map((a) => a.position));

    if (dto.alarms.length <= maxPosition) {
      throw new BadRequestException(
        `Alarm string too short. Expected at least ${maxPosition + 1} chars`,
      );
    }

    // 3️⃣ filtra allarmi attivi
    const activeAlarms = alarms.filter((alarm) => {
      return dto.alarms[alarm.position] === '1';
    });

    if (!activeAlarms.length) {
      return {
        recoutSapId: dto.recoutSapId,
        brand: dto.brand,
        alarms: [],
      };
    }

    // 4️⃣ prepara insert
    const rows = activeAlarms.map((alarm) => ({
      idRecout: dto.recoutSapId,
      idAlarm: alarm.idAlarm,
    }));

    // 5️⃣ inserisci (ignora duplicati)
    await this.visitAlarmRepo
      .createQueryBuilder()
      .insert()
      .values(rows)
      .orIgnore()
      .execute();

    // 6️⃣ response
    return {
      recoutSapId: dto.recoutSapId,
      brand: dto.brand,
      alarms: activeAlarms.map((a) => ({
        idAlarm: a.idAlarm,
        code: a.code,
        position: a.position,
      })),
    };
  }
}
