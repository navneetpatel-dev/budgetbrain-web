'use client';

import type { ChangeEvent } from 'react';
import { Input } from '@/shared/components/ui/index';
import { OptionChips, SheetSelect } from '@/shared/components/ui/feature-screen';
import type { CsvMapping, DateOrder } from '../../types/detection.types';
import type { MappingColumnKey } from '../../hooks/detection/useStatementImport.hook';
import { importStyles } from '../../styles/detection/detection.styles';

export interface CsvMappingFieldsProps {
  columns: string[];
  mapping: Partial<CsvMapping>;
  setColumn: (key: MappingColumnKey) => (column: string) => void;
  setDateOrder: (order: DateOrder) => void;
  setHeaderRow: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FIELDS: { key: MappingColumnKey; label: string; optional?: boolean }[] = [
  { key: 'dateColumn', label: 'Date' },
  { key: 'descriptionColumn', label: 'Description' },
  { key: 'amountColumn', label: 'Amount (one column, money out negative)', optional: true },
  { key: 'debitColumn', label: 'Money out', optional: true },
  { key: 'creditColumn', label: 'Money in', optional: true },
  { key: 'referenceColumn', label: 'Reference', optional: true },
];

const ORDER_LABELS: Record<DateOrder, string> = { DMY: 'Day first', MDY: 'Month first', YMD: 'Year first' };
const orderLabel = (o: DateOrder) => ORDER_LABELS[o];
const columnLabel = (c: string) => c || 'Not used';

/** Which CSV columns hold what (plan T6.5). The server's guess is filled in; the user corrects it. */
export function CsvMappingFields({ columns, mapping, setColumn, setDateOrder, setHeaderRow }: CsvMappingFieldsProps) {
  const options = ['', ...columns];
  return (
    <div className={importStyles.mappingGrid}>
      {/* A fixed set of six fields. */}
      {FIELDS.map((field) => (
        <SheetSelect
          key={field.key}
          value={mapping[field.key] ?? ''}
          options={options}
          onChange={setColumn(field.key)}
          getLabel={columnLabel}
          title={field.label}
          placeholder={field.optional ? `${field.label}: not used` : `${field.label}: choose a column`}
        />
      ))}
      <OptionChips<DateOrder> options={['DMY', 'MDY', 'YMD']} value={mapping.dateOrder ?? 'DMY'} onChange={setDateOrder} getLabel={orderLabel} />
      <Input label="Header row" type="number" value={String(mapping.headerRow ?? 1)} onChange={setHeaderRow} min="1" max="50" />
    </div>
  );
}
