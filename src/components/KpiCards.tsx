import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { ARStatus, CustomerAR } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  computeCustomerStatus,
  getRemainingBalance,
  getSuggestedInstallmentAmount,
  getTotalPaid,
} from '../utils/arCalculations';
import { formatIDR } from '../utils/formatters';

interface KpiCardsProps {
  customers: CustomerAR[];
  activeFilter: ARStatus | 'all';
  onFilterChange: (filter: ARStatus | 'all') => void;
  t: TranslationDictionary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  customers,
  activeFilter,
  onFilterChange,
  t,
}) => {
  let totalActiveReceivables = 0;
  let activeCount = 0;
  let dueTomorrowCount = 0;
  let dueTomorrowAmount = 0;
  let overdueCount = 0;
  let overdueBalance = 0;
  let paidOffCount = 0;
  let paidOffCollected = 0;

  for (const c of customers) {
    const status = computeCustomerStatus(c);
    const remaining = getRemainingBalance(c);
    if (status === 'paid_off') {
      paidOffCount += 1;
      paidOffCollected += getTotalPaid(c);
    } else {
      activeCount += 1;
      totalActiveReceivables += remaining;
      if (status === 'due_tomorrow') {
        dueTomorrowCount += 1;
        dueTomorrowAmount += getSuggestedInstallmentAmount(c);
      } else if (status === 'overdue') {
        overdueCount += 1;
        overdueBalance += remaining;
      }
    }
  }

  const cards: Array<{
    key: ARStatus | 'all';
    label: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
    iconBg: string;
    activeRing: string;
    valueColor: string;
  }> = [
    {
      key: 'all',
      label: t.kpi.activeReceivables,
      value: formatIDR(totalActiveReceivables),
      subtext: t.kpi.activeCustomersCount(activeCount),
      icon: <Wallet className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-50 ring-1 ring-blue-100',
      activeRing: 'ring-2 ring-blue-500 border-blue-300',
      valueColor: 'text-slate-900',
    },
    {
      key: 'due_tomorrow',
      label: t.kpi.dueTomorrow,
      value: formatIDR(dueTomorrowAmount),
      subtext: t.kpi.dueTomorrowSub(dueTomorrowCount),
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      iconBg: 'bg-amber-50 ring-1 ring-amber-100',
      activeRing: 'ring-2 ring-amber-500 border-amber-300',
      valueColor: 'text-amber-700',
    },
    {
      key: 'overdue',
      label: t.kpi.overdue,
      value: formatIDR(overdueBalance),
      subtext: t.kpi.overdueSub(overdueCount),
      icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
      iconBg: 'bg-rose-50 ring-1 ring-rose-100',
      activeRing: 'ring-2 ring-rose-500 border-rose-300',
      valueColor: 'text-rose-700',
    },
    {
      key: 'paid_off',
      label: t.kpi.paidOff,
      value: formatIDR(paidOffCollected),
      subtext: t.kpi.paidOffSub(paidOffCount),
      icon: <CheckCircle2 className="h-5 w-5 text-sky-600" />,
      iconBg: 'bg-sky-50 ring-1 ring-sky-100',
      activeRing: 'ring-2 ring-sky-500 border-sky-300',
      valueColor: 'text-sky-700',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isSelected = activeFilter === card.key && card.key !== 'all';
        return (
          <button
            key={card.key}
            type="button"
            onClick={() =>
              onFilterChange(activeFilter === card.key ? 'all' : card.key)
            }
            className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              isSelected
                ? card.activeRing
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </span>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className={`mt-3 tabular-nums text-xl font-extrabold tracking-tight sm:text-2xl ${card.valueColor}`}>
              {card.value}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>{card.subtext}</span>
              <span className="text-[11px] font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                {t.kpi.clickToFilter}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
};
