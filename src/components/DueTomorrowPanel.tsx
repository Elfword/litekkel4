import React from 'react';
import { BellRing, CheckCircle2, CreditCard, MessageCircle } from 'lucide-react';
import { CustomerAR, Language } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  getNextInstallmentNumber,
  getSuggestedInstallmentAmount,
} from '../utils/arCalculations';
import {
  buildWhatsAppReminderUrl,
  formatDisplayDate,
  formatIDR,
} from '../utils/formatters';

interface DueTomorrowPanelProps {
  dueTomorrowCustomers: CustomerAR[];
  lang: Language;
  t: TranslationDictionary;
  onSelectCustomer: (customer: CustomerAR, autoOpenPayment?: boolean) => void;
}

export const DueTomorrowPanel: React.FC<DueTomorrowPanelProps> = ({
  dueTomorrowCustomers,
  lang,
  t,
  onSelectCustomer,
}) => {
  if (dueTomorrowCustomers.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-950">{t.h1Alert.allClearTitle}</h2>
            <p className="text-xs text-emerald-800/90">{t.h1Alert.allClearDesc}</p>
          </div>
        </div>
      </section>
    );
  }

  const totalDueTomorrow = dueTomorrowCustomers.reduce(
    (sum, c) => sum + getSuggestedInstallmentAmount(c),
    0
  );

  return (
    <section
      aria-label={t.h1Alert.title}
      className="overflow-hidden rounded-2xl border border-amber-300/90 bg-gradient-to-br from-amber-50 via-amber-50/60 to-white shadow-sm"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 bg-amber-100/50 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/25">
            <BellRing className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-amber-950 sm:text-base">
                {t.h1Alert.title}
              </h2>
              <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-bold text-white">
                {dueTomorrowCustomers.length}
              </span>
              <span className="hidden rounded-full border border-amber-300 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800 sm:inline-block">
                {t.h1Alert.badge}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-amber-900/80">{t.h1Alert.subtitle}</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white/90 px-3.5 py-2 text-right">
          <div className="text-[11px] font-medium text-slate-500">{t.h1Alert.totalDueTomorrow}</div>
          <div className="tabular-nums text-sm font-extrabold text-amber-900 sm:text-base">
            {formatIDR(totalDueTomorrow)}
          </div>
        </div>
      </div>

      {/* H-1 Customer Reminder Items */}
      <div className="divide-y divide-amber-200/60">
        {dueTomorrowCustomers.map((customer) => {
          const nextInst = getNextInstallmentNumber(customer);
          const amountDue = getSuggestedInstallmentAmount(customer);
          const dueDate = customer.nextDueDate || '';
          const waUrl = buildWhatsAppReminderUrl({
            phone: customer.phone,
            customerName: customer.name,
            installmentNumber: nextInst,
            totalInstallments: customer.installmentCount,
            amountDue,
            dueDateISO: dueDate,
            creditDescription: customer.creditDescription,
            lang,
            isOverdue: false,
          });

          return (
            <div
              key={customer.id}
              className="flex flex-col justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-amber-50/70 md:flex-row md:items-center"
            >
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => onSelectCustomer(customer, false)}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-bold text-slate-900 hover:text-blue-700">
                    {customer.name}
                  </span>
                  {customer.company && (
                    <span className="text-xs font-medium text-slate-500">
                      • {customer.company}
                    </span>
                  )}
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                    {t.h1Alert.installmentOf(nextInst, customer.installmentCount)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="truncate">{customer.creditDescription}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-medium text-amber-900">
                    {t.h1Alert.dueTomorrowDate(formatDisplayDate(dueDate, lang, 'long'))}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                <div className="mr-1 text-left md:text-right">
                  <div className="tabular-nums text-base font-extrabold text-slate-900">
                    {formatIDR(amountDue)}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">{customer.phone}</div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCustomer(customer, true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{t.h1Alert.payNow}</span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{t.h1Alert.sendWhatsApp}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
