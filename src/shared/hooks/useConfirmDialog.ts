'use client';

import { useCallback, useState } from 'react';
import type { ConfirmCopy } from '@/shared/constants/confirmations';

interface PendingConfirm extends ConfirmCopy {
  resolve: (confirmed: boolean) => void;
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((copy: ConfirmCopy) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...copy, resolve });
    });
  }, []);

  const cancel = useCallback(() => {
    pending?.resolve(false);
    setPending(null);
  }, [pending]);

  const accept = useCallback(() => {
    pending?.resolve(true);
    setPending(null);
  }, [pending]);

  return {
    confirm,
    cancel,
    accept,
    copy: pending,
    open: pending != null,
  };
}