export type DecodedSmartMeterInfo =
  | DecodedSmartMeterInfoMaddalena
  | DecodedSmartMeterInfoWaterTech;

export interface DecodedSmartMeterInfoMaddalena {
  meterId: string;
  brand: string;
  aesVerification: string;
  volumeDif: string;
  volumeVif: string;
  volumeValue: number;
  dateDif: string;
  dateVif: string;
  dateValue: Date;
  alarmDif: string;
  alarmVif: string;
  alarmVife: string;
  alarmFlags: string;
  periodicVolumeDif: string;
  periodicVolumeVif: string;
  periodicVolumeValue: string;
  periodicDateDif: string;
  periodicDateVif: string;
  periodicDateValue: string;
}

export interface DecodedSmartMeterInfoWaterTech {
  meterId: string;
  brand: string;
  aesVerification: string;
  dateDif: string;
  dateVif: string;
  dateValue: Date;
  volumeDif: string;
  volumeVif: string;
  volumeValue: number;
  alarmDif: string;
  alarmVif: string;
  alarmVife: string;
  alarmFlags: string;
  versionDif: string;
  versionVif: string;
  versionVife: string;
  versionValue: string;
}
