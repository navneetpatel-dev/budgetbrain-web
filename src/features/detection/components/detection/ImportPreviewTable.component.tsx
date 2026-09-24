'use client';

import { formatCurrency } from '@/shared/utils/currency';
import type { ImportPreview } from '../../types/detection.types';
import { typeLabel } from '../../utils/detectionLabels';
import { importStyles } from '../../styles/detection/detection.styles';

export interface ImportPreviewTableProps {
  preview: ImportPreview;
}

/** What the import would add: counts, the first rows, and lines that couldn't be read. */
export function ImportPreviewTable({ preview }: ImportPreviewTableProps) {
  return (
    <>
      <div className={importStyles.summary}>
        <span className={importStyles.summaryPill}>{preview.format.toUpperCase()}</span>
        <span className={importStyles.summaryPill}>{preview.validRows} of {preview.totalRows} rows readable</span>
        {preview.dateRange ? <span className={importStyles.summaryPill}>{preview.dateRange.from} to {preview.dateRange.to}</span> : null}
        {preview.alreadyImported > 0 ? <span className={importStyles.summaryPill}>{preview.alreadyImported} already imported</span> : null}
        {preview.possibleDuplicates > 0 ? <span className={importStyles.summaryPill}>{preview.possibleDuplicates} look like existing transactions</span> : null}
      </div>
      <div className={importStyles.tableWrap}>
        <table className={importStyles.table}>
          <thead>
            <tr>
              <th className={importStyles.th}>Date</th>
              <th className={importStyles.th}>Merchant</th>
              <th className={importStyles.th}>Type</th>
              <th className={importStyles.th}>Amount</th>
              <th className={importStyles.th} aria-label="Duplicate check" />
            </tr>
          </thead>
          <tbody>
            {/* At most the first 50 rows; the server caps the preview. */}
            {preview.rows.map((row) => (
              <tr key={row.line}>
                <td className={importStyles.td}>{row.date}</td>
                <td className={importStyles.td}>{row.merchant ?? '—'}</td>
                <td className={importStyles.td}>{typeLabel(row.transactionType)}</td>
                <td className={importStyles.tdAmount}>
                  {row.direction === 'DEBIT' ? '−' : '+'}
                  {formatCurrency(Number(row.amount), row.currency)}
                </td>
                <td className={importStyles.tdDuplicate}>{row.possibleDuplicate ? 'Possible duplicate' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview.errors.length > 0 ? (
        <div className={importStyles.errors}>
          {/* The server sends at most 50 errors. */}
          {preview.errors.map((e) => (
            <span key={`${e.line}-${e.error}`}>
              Line {e.line}: {e.error}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
