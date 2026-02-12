import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'visit_alarms', schema: 'dbo' })
export class VisitAlarmsEntity {
  @PrimaryColumn({ name: 'id_recout', type: 'int' })
  idRecout: number;

  @PrimaryColumn({ name: 'id_alarm', type: 'int' })
  idAlarm: number;
}
