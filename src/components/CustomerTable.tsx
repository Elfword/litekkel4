import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CreditCard,
  FileText,
  MessageCircle,
  Search,
  X,
} from 'lucide-react';
import { ARStatus, CustomerAR, Language } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  computeCustomerStatus,
  getNextInstallmentNumber,
  getPaymentProgressPercent,
  getRemainingBalance,
  getStatusSortWeight,
  getSuggestedInstallmentAmount,
} from '../utils/arCalculations';
import {
  buildWhatsAppReminderUrl,
  diffInCalendarDays,
  formatDisplayDate,
  formatIDR,
} from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

type SortOption = 'priority' | 'due_date' | 'balance_desc' | 'name_asc';

interface CustomerTableProps {
  customers: CustomerAR[];
  statusFilter: ARStatus | 'all';
  onStatusFilterChange: (filter: ARStatus | 'all') => void;
  onSelectCustomer: (customer: CustomerAR, autoOpenPayment?: boolean) => void;
  lang: Language;
  t: TranslationDictionary;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  statusFilter,
  onStatusFilterChange,
  onSelectCustomer,
  lang,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const statusCounts = useMemo(() => {
    const counts: Record<ARStatus | 'all', number> = {
      all: customers.length,
      overdue: 0,
      due_tomorrow: 0,
      current: 0,
      paid_off: 0,
    };
    for (const c of customers) {
      counts[computeCustomerStatus(c)] += 1;
    }
    return counts;
  }, [customers]);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = customers.filter((c) => {
      const status = computeCustomerStatus(c);
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.contractCode.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phone.toLowerCase().includes(q) ||
        c.creditDescription.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const statusA = computeCustomerStatus(a);
      const statusB = computeCustomerStatus(b);

      if (sortBy === 'priority') {
        const weightDiff = getStatusSortWeight(statusA) - getStatusSortWeight(statusB);
        if (weightDiff !== 0) return weightDiff;
        if (a.nextDueDate && b.nextDueDate) return a.nextDueDate.localeCompare(b.nextDueDate);
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'due_date') {
        if (!a.nextDueDate && !b.nextDueDate) return 0;
        if (!a.nextDueDate) return 1;
        if (!b.nextDueDate) return -1;
        return a.nextDueDate.localeCompare(b.nextDueDate);
      }
      if (sortBy === 'balance_desc') {
        return getRemainingBalance(b) - getRemainingBalance(a);
      }
      return a.name.localeCompare(b.name);
    });
  }, [customers, searchQuery, statusFilter, sortBy]);

  const filterTabs: Array<{ key: ARStatus | 'all'; label: string }> = [
    { key: 'all', label: t.table.filterAll },
    { key: 'overdue', label: t.statuses.overdue },
    { key: 'due_tomorrow', label: t.statuses.due_tomorrow },
    { key: 'current', label: t.statuses.current },
    { key: 'paid_off', label: t.statuses.paid_off },
  ];

  const renderRelativeDueHint = (customer: CustomerAR, status: ARStatus) => {
    if (status === 'paid_off' || !customer.nextDueDate) {
      return <span className="text-[11px] font-medium text-sky-600">{t.table.settledTag}</span>;
    }
    const diff = diffInCalendarDays(customer.nextDueDate);
    if (diff < 0) {
      return (
        <span className="text-[11px] font-semibold text-rose-600">
          {t.table.daysOverdue(Math.abs(diff))}
        </span>
      );
    }
    if (diff === 1) {
      return <span className="text-[11px] font-semibold text-amber-700">{t.table.dueTomorrowTag}</span>;
    }
    if (diff === 0) {
      return <span className="text-[11px] font-semibold text-amber-700">{t.table.dueTodayTag}</span>;
    }
    return <span className="text-[11px] text-slate-500">{t.table.inDaysTag(diff)}</span>;
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      {/* Section Header */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.table.title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t.table.subtitle}</p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.table.searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative flex items-center">
              <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label={t.table.sortLabel}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-7 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-auto"
              >
                <option value="priority">{t.table.sortPriority}</option>
                <option value="due_date">{t.table.sortDueDate}</option>
                <option value="balance_desc">{t.table.sortBalanceDesc}</option>
                <option value="name_asc">{t.table.sortNameAsc}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                >
                  {statusCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-sm font-bold text-slate-800">{t.table.emptyTitle}</p>
          <p className="mt-1 text-xs text-slate-500">{t.table.emptyDesc}</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onStatusFilterChange('all');
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            {t.table.clearFilters}
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Ledger Table (Full-width, no horizontal scrollbar) */}
          <div className="hidden md:block">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 pl-5 pr-3">{t.table.colCustomer}</th>
                  <th className="px-3 py-3.5">{t.table.colItem}</th>
                  <th className="px-3 py-3.5">{t.table.colProgress}</th>
                  <th className="px-3 py-3.5 text-right">{t.table.colRemaining}</th>
                  <th className="px-3 py-3.5">{t.table.colNextDue}</th>
                  <th className="px-3 py-3.5">{t.table.colStatus}</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">{t.table.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAndSorted.map((customer) => {
                  const status = computeCustomerStatus(customer);
                  const remaining = getRemainingBalance(customer);
                  const progress = getPaymentProgressPercent(customer);
                  const nextInst = getNextInstallmentNumber(customer);
                  const suggestedAmount = getSuggestedInstallmentAmount(customer);
                  const showWhatsApp = status === 'due_tomorrow' || status === 'overdue';

                  const waUrl =
                    showWhatsApp && customer.nextDueDate
                      ? buildWhatsAppReminderUrl({
                        phone: customer.phone,
                        customerName: customer.name,
                        installmentNumber: nextInst,
                        totalInstallments: customer.installmentCount,
                        amountDue: suggestedAmount,
                        dueDateISO: customer.nextDueDate,
                        creditDescription: customer.creditDescription,
                        lang,
                        isOverdue: status === 'overdue',
                      })
                      : null;

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer, false)}
                      className="group cursor-pointer transition-colors hover:bg-blue-50/40"
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                            {customer.name
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-700">
                              {customer.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
                              <span className="font-mono text-[11px]">{customer.contractCode}</span>
                              {customer.company && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{customer.company}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="text-xs font-medium text-slate-800">
                          {customer.creditDescription}
                        </div>
                        <div className="mt-0.5 tabular-nums text-[11px] text-slate-500">
                          {formatIDR(customer.totalCreditAmount)} ({customer.installmentCount}x)
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="w-32 lg:w-40">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">
                              {t.table.installmentProgress(
                                customer.payments.length,
                                customer.installmentCount
                              )}
                            </span>
                            <span className="tabular-nums font-bold text-slate-500">{progress}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${status === 'paid_off'
                                  ? 'bg-sky-500'
                                  : status === 'overdue'
                                    ? 'bg-rose-500'
                                    : status === 'due_tomorrow'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-right whitespace-nowrap">
                        <div className="tabular-nums font-bold text-slate-900">
                          {formatIDR(remaining)}
                        </div>
                        {status !== 'paid_off' && (
                          <div className="mt-0.5 tabular-nums text-[11px] text-slate-500">
                            {formatIDR(suggestedAmount)} {t.arCard.perMonth}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800">
                          {formatDisplayDate(customer.nextDueDate, lang)}
                        </div>
                        <div className="mt-0.5">{renderRelativeDueHint(customer, status)}</div>
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <StatusBadge status={status} t={t} />
                      </td>

                      <td
                        className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={t.table.whatsappReminder}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {status !== 'paid_off' && (
                            <button
                              type="button"
                              onClick={() => onSelectCustomer(customer, true)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>{t.table.recordPay}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectCustomer(customer, false)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-500" />
                            <span>{t.table.viewCard}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Card List */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredAndSorted.map((customer) => {
              const status = computeCustomerStatus(customer);
              const remaining = getRemainingBalance(customer);
              const progress = getPaymentProgressPercent(customer);

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer, false)}
                  className="cursor-pointer p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{customer.name}</div>
                      <div className="text-xs text-slate-500">
                        {customer.contractCode}
                        {customer.company ? ` • ${customer.company}` : ''}
                      </div>
                    </div>
                    <StatusBadge status={status} t={t} />
                  </div>

                  <p className="mt-2 text-xs text-slate-600">{customer.creditDescription}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                    <div>
                      <div className="text-[11px] text-slate-500">{t.table.colRemaining}</div>
                      <div className="tabular-nums text-sm font-bold text-slate-900">
                        {formatIDR(remaining)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">{t.table.colNextDue}</div>
                      <div className="text-xs font-semibold text-slate-800">
                        {formatDisplayDate(customer.nextDueDate, lang)}
                      </div>
                      <div>{renderRelativeDueHint(customer, status)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>
                          {t.table.installmentProgress(
                            customer.payments.length,
                            customer.installmentCount
                          )}
                        </span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {status !== 'paid_off' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(customer, true);
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {t.table.recordPay}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
