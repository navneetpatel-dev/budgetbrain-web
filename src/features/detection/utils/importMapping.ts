import type { CsvMapping } from '../types/detection.types';

/** A CSV mapping the server can read: a date, a description and some amount column. */
export function isMappingComplete(mapping: Partial<CsvMapping> | null): mapping is CsvMapping {
  return !!mapping && !!mapping.dateColumn && !!mapping.descriptionColumn && !!(mapping.amountColumn || mapping.debitColumn || mapping.creditColumn);
}

/** The mapping to start from: the server's guess, or an empty one on the first row. */
export function startingMapping(suggested: CsvMapping | null): Partial<CsvMapping> {
  return suggested ?? { headerRow: 1, dateOrder: 'DMY', amountSign: 'debit_negative' };
}

/** Sets or clears one column of the mapping; a single amount column and debit/credit columns exclude each other. */
export function setMappingColumn(
  mapping: Partial<CsvMapping>,
  key: 'dateColumn' | 'descriptionColumn' | 'amountColumn' | 'debitColumn' | 'creditColumn' | 'referenceColumn',
  column: string
): Partial<CsvMapping> {
  const next: Partial<CsvMapping> = { ...mapping, [key]: column || undefined };
  if (key === 'amountColumn' && column) {
    delete next.debitColumn;
    delete next.creditColumn;
  }
  if ((key === 'debitColumn' || key === 'creditColumn') && column) delete next.amountColumn;
  return next;
}
