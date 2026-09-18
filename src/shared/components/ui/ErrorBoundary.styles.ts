export const errorBoundaryStyles = {
  container: 'flex flex-col items-center justify-center min-h-[50vh] p-xl text-center',
  fullScreenContainer: 'flex flex-col items-center justify-center min-h-screen bg-background text-text p-xl text-center',
  iconWrapper: 'w-16 h-16 rounded-full bg-danger-soft flex items-center justify-center mb-lg border border-danger/20',
  title: 'text-2xl font-bold text-text mb-sm',
  description: 'text-text-secondary text-sm max-w-md mb-xl leading-relaxed',
  actions: 'flex items-center gap-md flex-wrap justify-center',
  primaryButton: 'px-lg py-sm rounded-lg bg-primary text-on-primary font-semibold shadow-md hover:opacity-90 transition-opacity cursor-pointer text-sm inline-flex items-center gap-2',
  secondaryButton: 'px-lg py-sm rounded-lg border border-border bg-surface text-text font-semibold hover:bg-surface-hover transition-colors cursor-pointer text-sm inline-flex items-center gap-2',
  detailsBox: 'mt-xl p-md rounded-lg bg-surface-container border border-border-subtle text-left max-w-lg w-full text-xs font-mono text-text-tertiary overflow-auto max-h-40',
} as const;
