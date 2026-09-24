/** Tailwind class dictionaries for the detection pages (plan T6.4, T6.5). Theme tokens only. */

export const cardStyles = {
  card: 'flex flex-col gap-md rounded-card border border-border-subtle bg-surface p-lg',
  topRow: 'flex items-start justify-between gap-md',
  info: 'flex min-w-0 flex-col gap-xs',
  title: 'truncate text-[15px] font-semibold text-text',
  subtitle: 'truncate text-xs text-text-tertiary',
  amount: 'shrink-0 text-[15px] font-semibold tabular-nums text-text',
  pills: 'flex flex-wrap items-center gap-xs',
  pill: 'rounded-full bg-surface-hover px-sm py-[3px] text-[11px] font-semibold text-text-secondary',
  pillWarning: 'rounded-full bg-warning-soft px-sm py-[3px] text-[11px] font-semibold text-warning',
  actions: 'flex flex-wrap items-center justify-end gap-sm',
  button: 'rounded-full border border-border-subtle px-lg py-[6px] text-xs font-semibold text-text-secondary transition hover:bg-surface-hover disabled:opacity-50',
  buttonDanger: 'rounded-full border border-border-subtle px-lg py-[6px] text-xs font-semibold text-danger transition hover:bg-danger-soft disabled:opacity-50',
  buttonPrimary: 'rounded-full bg-primary px-lg py-[6px] text-xs font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-50',
} as const;

export const listStyles = {
  list: 'flex flex-col gap-md',
  section: 'flex flex-col gap-md',
  sectionTitle: 'text-xs font-semibold uppercase tracking-wider text-text-tertiary',
  banner: 'rounded-lg bg-surface-hover p-md text-sm text-text-secondary',
} as const;

export const editStyles = {
  form: 'mt-sm flex flex-col gap-md border-t border-border-subtle pt-md',
  row: 'grid grid-cols-1 gap-md sm:grid-cols-2',
  footer: 'flex justify-end gap-sm',
} as const;

export const hubStyles = {
  grid: 'grid grid-cols-1 gap-lg lg:grid-cols-2',
  panel: 'flex flex-col gap-md rounded-card border border-border-subtle bg-surface p-lg',
  panelTitle: 'text-[15px] font-semibold text-text',
  panelText: 'text-sm text-text-secondary',
  stats: 'grid grid-cols-2 gap-md',
  stat: 'flex flex-col gap-[2px] rounded-lg bg-surface-hover p-md',
  statValue: 'text-xl font-semibold tabular-nums text-text',
  statLabel: 'text-xs text-text-tertiary',
  sourceRow: 'flex items-center justify-between gap-md border-t border-border-subtle pt-sm text-sm',
  sourceName: 'font-medium text-text',
  sourceMeta: 'text-xs text-text-tertiary',
  links: 'flex flex-col gap-sm',
  link: 'flex items-center justify-between rounded-lg border border-border-subtle px-lg py-md text-sm font-medium text-text transition hover:bg-surface-hover',
  linkBadge: 'rounded-full bg-primary px-sm py-[2px] text-[11px] font-semibold text-on-primary',
  toggleRow: 'flex items-center justify-between gap-md',
  toggleText: 'flex flex-col gap-[2px]',
  resultSuccess: 'rounded-lg bg-success-soft p-md text-sm text-success',
  resultInfo: 'rounded-lg bg-primary-soft p-md text-sm text-primary',
  resultError: 'rounded-lg bg-danger-soft p-md text-sm text-danger',
  privacy: 'text-xs text-text-tertiary',
} as const;

export const importStyles = {
  fileInput: 'hidden',
  fileRow: 'flex flex-wrap items-center gap-md',
  fileName: 'truncate text-sm text-text-secondary',
  mappingGrid: 'grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3',
  summary: 'flex flex-wrap gap-sm',
  summaryPill: 'rounded-full bg-surface-hover px-md py-[4px] text-xs font-medium text-text-secondary',
  table: 'w-full border-collapse text-sm',
  th: 'border-b border-border-subtle px-sm py-xs text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary',
  td: 'border-b border-border-subtle px-sm py-xs text-text',
  tdAmount: 'border-b border-border-subtle px-sm py-xs text-right tabular-nums text-text',
  tdDuplicate: 'border-b border-border-subtle px-sm py-xs text-xs font-semibold text-warning',
  tableWrap: 'overflow-x-auto',
  errors: 'flex flex-col gap-[2px] text-xs text-danger',
  checkboxRow: 'flex items-center gap-sm text-sm text-text-secondary',
} as const;

export const chipStyles = {
  chip: 'inline-flex items-center gap-xs self-start rounded-full bg-warning-soft px-md py-[6px] text-xs font-semibold text-warning transition hover:opacity-90',
} as const;
