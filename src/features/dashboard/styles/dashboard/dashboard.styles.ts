export const dashboardPageStyles = {
  page: 'flex flex-col gap-xl',
  metrics: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md',
  section: 'flex flex-col gap-sm',
} as const;

export const spendingTrendStyles = {
  header: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4',
  titleRow: 'flex items-center gap-2',
  chart: 'pt-2',
  bar: 'group relative flex-1 flex flex-col items-center h-full justify-end',
  tooltip: 'opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[calc(100%+4px)] z-10 pointer-events-none px-2 py-1 rounded text-[11px] whitespace-nowrap shadow-md',
  tooltipLabel: 'font-semibold',
} as const;
