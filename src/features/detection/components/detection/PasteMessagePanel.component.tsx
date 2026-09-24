'use client';

import { Button, Input } from '@/shared/components/ui/index';
import { OptionChips, SheetSelect } from '@/shared/components/ui/feature-screen';
import type { ChangeEvent } from 'react';
import type { PasteKind } from '../../hooks/detection/useDetectionHub.hook';
import { hubStyles } from '../../styles/detection/detection.styles';

type InputHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

export interface PasteMessagePanelProps {
  kind: PasteKind;
  text: string;
  sender: string;
  subject: string;
  institutionId: string;
  needsBank: boolean;
  institutionIds: string[];
  institutionLabel: (id: string) => string;
  isSubmitting: boolean;
  result: { tone: 'success' | 'info' | 'error'; text: string } | null;
  requestError: string | null;
  setKind: (kind: PasteKind) => void;
  onText: InputHandler;
  onSender: InputHandler;
  onSubject: InputHandler;
  setInstitutionId: (id: string) => void;
  submit: () => void;
}

const KIND_LABELS: Record<PasteKind, string> = { sms: 'Bank SMS', email: 'Bank email' };
const kindLabel = (kind: PasteKind) => KIND_LABELS[kind];
const RESULT_STYLE = { success: hubStyles.resultSuccess, info: hubStyles.resultInfo, error: hubStyles.resultError } as const;

/** Paste a bank message or email (plan T6.2). It is read on our server and not kept. */
export function PasteMessagePanel(props: PasteMessagePanelProps) {
  return (
    <section className={hubStyles.panel}>
      <span className={hubStyles.panelTitle}>Add from a message</span>
      <OptionChips<PasteKind> options={['sms', 'email']} value={props.kind} onChange={props.setKind} getLabel={kindLabel} />
      <Input
        label={props.kind === 'email' ? 'From address' : 'Sender (optional)'}
        value={props.sender}
        onChange={props.onSender}
        placeholder={props.kind === 'email' ? 'alerts@yourbank.com' : 'e.g. VM-HDFCBK'}
      />
      {props.kind === 'email' ? <Input label="Subject" value={props.subject} onChange={props.onSubject} placeholder="Optional" /> : null}
      <Input label={props.kind === 'email' ? 'Email text' : 'Message'} value={props.text} onChange={props.onText} multiline placeholder="Paste the bank's message here" maxLength={20000} />
      {props.needsBank ? (
        <SheetSelect
          value={props.institutionId}
          options={props.institutionIds}
          onChange={props.setInstitutionId}
          getLabel={props.institutionLabel}
          title="Which bank sent this?"
          placeholder="Choose your bank"
          error="We couldn't tell which bank sent this. Pick the bank and try again."
        />
      ) : null}
      {props.result ? <span className={RESULT_STYLE[props.result.tone]}>{props.result.text}</span> : null}
      {props.requestError ? <span className={hubStyles.resultError}>{props.requestError}</span> : null}
      <Button title="Read message" onPress={props.submit} loading={props.isSubmitting} disabled={!props.text.trim()} />
      <span className={hubStyles.privacy}>
        We read the amount, date, merchant, the last digits of the account and the reference. The message itself is not stored.
      </span>
    </section>
  );
}
