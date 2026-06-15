import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';

/** Matches mobile AuthShell `form` container: gap xs between fields */
export function authFormStyle(theme: AppTheme): CSSProperties {
  return {
    margin: 0,
    padding: 0,
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };
}

export function AuthForm({
  children,
  onSubmit,
  style,
}: {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  style?: CSSProperties;
}) {
  const theme = useTheme();

  return (
    <form onSubmit={onSubmit} style={{ ...authFormStyle(theme), ...style }}>
      {children}
    </form>
  );
}
