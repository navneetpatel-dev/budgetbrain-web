'use client';

import { EmptyState } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import type { MerchantRule } from '../../types/detection.types';
import { RuleItem } from './RuleItem.component';
import { listStyles } from '../../styles/detection/detection.styles';

export interface RuleListProps {
  rules: MerchantRule[];
  isLoading: boolean;
  isError: boolean;
  categoryIds: string[];
  categoryLabel: (id: string) => string;
  categoryColor: (id: string) => string | undefined;
  onChange: (id: string, categoryId: string) => void;
  onRemove: (id: string) => void;
  onRetry: () => void;
}

export function RuleList({ rules, isLoading, isError, onRetry, ...rest }: RuleListProps) {
  if (isLoading) return <ListRowsSkeleton count={4} variant="transaction" />;
  if (isError) return <EmptyState title="Couldn’t load your rules" subtitle="Check your connection and try again" icon="activity" action="Retry" onAction={onRetry} />;
  if (rules.length === 0) {
    return <EmptyState title="No learned rules yet" subtitle="When you change a detected transaction's category, the merchant is remembered here" icon="category" />;
  }
  return (
    <div className={listStyles.list}>
      {rules.map((rule) => (
        <RuleItem key={rule.id} rule={rule} {...rest} />
      ))}
    </div>
  );
}
