'use client';

import { StackNavHeader, StackScrollScreen, SheetSelect } from '@/shared/components/ui/feature-screen';
import { Button, FormErrorBanner, Toggle } from '@/shared/components/ui/index';
import { useStatementImport } from '../../hooks/detection/useStatementImport.hook';
import { useDetectionOptions } from '../../hooks/detection/useDetectionOptions.hook';
import { StatementFilePicker } from '../../components/detection/StatementFilePicker.component';
import { CsvMappingFields } from '../../components/detection/CsvMappingFields.component';
import { ImportPreviewTable } from '../../components/detection/ImportPreviewTable.component';
import { ImportResultSummary } from '../../components/detection/ImportResultSummary.component';
import { hubStyles, importStyles } from '../../styles/detection/detection.styles';

/** `/integrations/import`: bank statement import with a preview before anything is added (plan T6.5). */
export function StatementImportPage() {
  const imp = useStatementImport();
  const options = useDetectionOptions();
  return (
    <StackScrollScreen header={<StackNavHeader title="Import a statement" subtitle="CSV, OFX, QFX, QIF, MT940 or CAMT.053" />}>
      <section className={hubStyles.panel}>
        <span className={hubStyles.panelText}>
          Nothing is added until you press Import. The file is read on our server and deleted straight away; importing the same statement again adds nothing twice.
        </span>
        <StatementFilePicker fileName={imp.fileName} busy={imp.isPreviewing} onChoose={imp.chooseFile} />
        <SheetSelect
          value={imp.financialAccountId}
          options={options.accountIds}
          onChange={imp.setFinancialAccountId}
          getLabel={options.accountLabel}
          title="Which account is this statement for?"
          placeholder="Account (optional)"
        />
        {imp.error ? <FormErrorBanner message={imp.error} /> : null}
      </section>

      {imp.preview?.csv && imp.mapping ? (
        <section className={hubStyles.panel}>
          <span className={hubStyles.panelTitle}>Columns</span>
          {imp.preview.needsMapping ? <span className={hubStyles.panelText}>We couldn't recognise the columns. Choose them below.</span> : null}
          <CsvMappingFields
            columns={imp.csvColumns}
            mapping={imp.mapping}
            setColumn={imp.setColumn}
            setDateOrder={imp.setDateOrder}
            setHeaderRow={imp.setHeaderRow}
          />
          <Button title="Update preview" variant="outline" onPress={imp.refreshPreview} loading={imp.isPreviewing} disabled={!imp.mappingComplete} />
        </section>
      ) : null}

      {imp.preview && !imp.preview.needsMapping ? (
        <section className={hubStyles.panel}>
          <span className={hubStyles.panelTitle}>Preview</span>
          <ImportPreviewTable preview={imp.preview} />
          {imp.preview.possibleDuplicates > 0 ? (
            <label className={importStyles.checkboxRow}>
              <Toggle value={imp.includeDuplicates} onChange={imp.setIncludeDuplicates} label="Import possible duplicates for review" />
              Import possible duplicates too (they wait for your review)
            </label>
          ) : null}
          {imp.result ? <ImportResultSummary result={imp.result} /> : null}
          <Button title="Import" onPress={imp.runImport} loading={imp.isImporting} disabled={!imp.canImport} />
        </section>
      ) : null}
    </StackScrollScreen>
  );
}
