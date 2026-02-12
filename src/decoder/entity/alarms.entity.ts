import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'alarms', schema: 'dbo' })
export class AlarmsEntity {
  @PrimaryGeneratedColumn({ name: 'id_alarm' })
  idAlarm: number;

  @Index()
  @Column({ name: 'brand', type: 'varchar', length: 20 })
  brand: string;

  @Column({ name: 'position', type: 'int' })
  position: number;

  @Index()
  @Column({ name: 'code', type: 'varchar', length: 20 })
  code: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}
