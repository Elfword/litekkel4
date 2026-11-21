import React from 'react';
import { ARStatus } from '../types';
import { TranslationDictionary } from '../i18n/translations';

interface StatusBadgeProps {
  status: ARStatus;
  t: TranslationDictionary;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<
  ARStatus,
  { container: string; dot: string }
> = {
  current: {
    container: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  due_tomorrow: {
    container: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/25',
    dot: 'bg-amber-500',
  },
  overdue: {
    container: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
    dot: 'bg-rose-500',
  },
  paid_off: {
    container: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
    dot: 'bg-sky-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, t, size = 'sm' }) => {
  const styles = STATUS_STYLES[status];
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${padding} ${styles.container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {t.statuses[status]}
    </span>
  );
};
