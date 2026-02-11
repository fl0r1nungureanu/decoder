// src/decoder/decoded-smart-meter-info.interface.ts

// Forma restituita da DecodableSmartMeterMaddalena.parseDecrypted(...)
export interface DecodedSmartMeterInfoMaddalena {
  /** Identificativo contatore (matricola) */
  meterId: string; // es. "123456"
  /** Marca/brand del dispositivo */
  brand: string; // es. "MADD" / "Maddalena"

  /** Campi hex (rappresentati come stringhe con spazi tra byte) */
  aesVerification: string; // "xx xx"
  volumeDif: string; // "xx"
  volumeVif: string; // "xx"
  dateDif: string; // "xx"
  dateVif: string; // "xx"
  dateValue: string; // "xx xx xx xx"
  alarmDif: string; // "xx"
  alarmVif: string; // "xx"
  alarmVife: string; // "xx"
  alarmFlags: string; // "xx xx xx xx"
  periodicVolumeDif: string; // "xx"
  periodicVolumeVif: string; // "xx"
  periodicVolumeValue: string; // "xx xx xx xx"
  periodicDateDif: string; // "xx"
  periodicDateVif: string; // "xx"
  periodicDateValue: string; // "xx xx"

  /** Valore numerico già calcolato */
  volumeValue: number; // es. 12345
}

// Se in futuro avrai altri brand con shape diverse, puoi definire altre
// interfacce e una union:
// export type DecodedSmartMeterInfo = DecodedSmartMeterInfoMaddalena | DecodedSmartMeterInfoAltroBrand;
export type DecodedSmartMeterInfo = DecodedSmartMeterInfoMaddalena;
