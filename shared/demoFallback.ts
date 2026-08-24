export function withListDemoFallback<T>(records: T[] | null | undefined, demoRecords: T[]): { data: T[]; isDemo: boolean } {
  if (records && records.length > 0) return { data: records, isDemo: false };
  return { data: demoRecords, isDemo: true };
}

export function withObjectDemoFallback<T>(record: T | null | undefined, hasRecordData: boolean, demoRecord: T): { data: T; isDemo: boolean } {
  if (record && hasRecordData) return { data: record, isDemo: false };
  return { data: demoRecord, isDemo: true };
}
