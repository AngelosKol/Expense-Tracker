export enum MeasuringType {
  UNIT = 'UNIT',
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
  UNKNOWN = 'UNKNOWN',
}

export const MeasuringTypeConversionFactor: Record<MeasuringType, number> = {
  [MeasuringType.UNIT]: 1,
  [MeasuringType.WEIGHT]: 1000,
  [MeasuringType.VOLUME]: 1000,
  [MeasuringType.UNKNOWN]: 1,
};
