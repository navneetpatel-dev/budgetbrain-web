'use client';

import type { ChangeEvent } from 'react';
import { cardStyles, importStyles } from '../../styles/detection/detection.styles';

export interface StatementFilePickerProps {
  fileName: string | null;
  busy: boolean;
  onChoose: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ACCEPT = '.csv,.txt,.ofx,.qfx,.qif,.sta,.mt940,.940,.xml';

export function StatementFilePicker({ fileName, busy, onChoose }: StatementFilePickerProps) {
  return (
    <div className={importStyles.fileRow}>
      <label className={cardStyles.buttonPrimary}>
        {busy ? 'Reading…' : fileName ? 'Choose another file' : 'Choose statement file'}
        <input type="file" accept={ACCEPT} className={importStyles.fileInput} onChange={onChoose} disabled={busy} />
      </label>
      {fileName ? <span className={importStyles.fileName}>{fileName}</span> : null}
    </div>
  );
}
