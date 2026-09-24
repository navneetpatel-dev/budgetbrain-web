'use client';

import { SheetSelect } from '@/shared/components/ui/feature-screen';
import type { MerchantRule } from '../../types/detection.types';
import { cardStyles } from '../../styles/detection/detection.styles';

export interface RuleItemProps {
  rule: MerchantRule;
  categoryIds: string[];
  categoryLabel: (id: string) => string;
  categoryColor: (id: string) => string | undefined;
  onChange: (id: string, categoryId: string) => void;
  onRemove: (id: string) => void;
}

/** One learned rule: new detections at this merchant get this category. */
export function RuleItem({ rule, categoryIds, categoryLabel, categoryColor, onChange, onRemove }: RuleItemProps) {
  const handleChange = (categoryId: string) => onChange(rule.id, categoryId);
  const handleRemove = () => onRemove(rule.id);
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.topRow}>
        <div className={cardStyles.info}>
          <span className={cardStyles.title}>{rule.merchant}</span>
          <span className={cardStyles.subtitle}>Learned {new Date(rule.updatedAt).toLocaleDateString()}</span>
        </div>
        <SheetSelect compact value={rule.categoryId} options={categoryIds} onChange={handleChange} getLabel={categoryLabel} getColor={categoryColor} title="Category" />
      </div>
      <div className={cardStyles.actions}>
        <button type="button" className={cardStyles.buttonDanger} onClick={handleRemove} aria-label={`Forget the rule for ${rule.merchant}`}>
          Forget
        </button>
      </div>
    </div>
  );
}
