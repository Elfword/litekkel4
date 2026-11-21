import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Sparkles,
} from 'lucide-react';
import { CustomerAR, Language, PaymentMethod, PaymentRecord, RecordPaymentInput } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  computeCustomerStatus,
  getNextInstallmentNumber,
  getPaymentProgressPercent,
  getRemainingBalance,
  getSuggestedInstallmentAmount,
  getTotalPaid,
} from '../utils/arCalculations';
import {
  addMonthsSafe,
  buildWhatsAppReminderUrl,
  formatDisplayDate,
  formatIDR,
  getTodayDate,
  toISODate,
} from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface DigitalARCardModalProps {
  customer: CustomerAR;
  initialShowPaymentForm: boolean;
  lang: Language;
  t: TranslationDictionary;
  onClose: () => void;
  onRecordPayment: (customerId: string, input: RecordPaymentInput) => void;
  onPrintReceipt: (customer: CustomerAR, payment: PaymentRecord) => void;
}

export const DigitalARCardModal: React.FC<DigitalARCardModalProps> = ({
  customer,
  initialShowPaymentForm,
  lang,
  t,
  onClose,
  onRecordPayment,
  onPrintReceipt,
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(initialShowPaymentForm);
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(toISODate(getTodayDate()));
  const [methodInput, setMethodInput] = useState<PaymentMethod>('bank_transfer');
  const [notesInput, setNotesInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const status = computeCustomerStatus(customer);
    const shouldOpen = initialShowPaymentForm && status !== 'paid_off';
    setShowPaymentForm(shouldOpen);
    const suggested = getSuggestedInstallmentAmount(customer);
    setAmountInput(suggested > 0 ? String(suggested) : '');
    setDateInput(toISODate(getTodayDate()));
    setMethodInput('bank_transfer');
    setNotesInput('');
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [customer.id, initialShowPaymentForm]);

  const status = computeCustomerStatus(customer);
  const totalPaid = getTotalPaid(customer);
  const remaining = getRemainingBalance(customer);
  const progress = getPaymentProgressPercent(customer);
  const nextInstallment = getNextInstallmentNumber(customer);
  const suggestedAmount = getSuggestedInstallmentAmount(customer);

  const parsedAmount = Number(amountInput.replace(/[^\d]/g, '')) || 0;
  const projectedRemaining = Math.max(0, remaining - parsedAmount);
  const projectedNextDue =
    projectedRemaining === 0
      ? null
      : addMonthsSafe(customer.nextDueDate || dateInput, 1);

  const waUrl =
    customer.nextDueDate && status !== 'paid_off'
      ? buildWhatsAppReminderUrl({
        phone: customer.phone,
        customerName: customer.name,
        installmentNumber: nextInstallment,
        totalInstallments: customer.installmentCount,
        amountDue: suggestedAmount,
        dueDateISO: customer.nextDueDate,
        creditDescription: customer.creditDescription,
        lang,
        isOverdue: status === 'overdue',
      })
      : null;

  const handleOpenPaymentForm = () => {
    setAmountInput(String(suggestedAmount));
    setDateInput(toISODate(getTodayDate()));
    setNotesInput('');
    setFormError(null);
    setShowPaymentForm(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setFormError(t.paymentForm.errorInvalidAmount);
      return;
    }
    if (parsedAmount > remaining) {
      setFormError(t.paymentForm.errorExceedsBalance);
      return;
    }
    setFormError(null);
    onRecordPayment(customer.id, {
      amount: parsedAmount,
      date: dateInput || toISODate(getTodayDate()),
      method: methodInput,
      notes: notesInput,
    });
    setShowPaymentForm(false);
  };

  const chronologicalPayments = [...customer.payments].sort(
    (a, b) => b.installmentNumber - a.installmentNumber
  );

  return (
    <div className="space-y-6">
      {/* Full-Page Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.arCard.backToDashboard}</span>
        </button>

        {status !== 'paid_off' && (
          <div className="flex flex-wrap items-center gap-2.5">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.arCard.sendWhatsAppBtn}</span>
              </a>
            )}
            {!showPaymentForm && (
              <button
                type="button"
                onClick={handleOpenPaymentForm}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4" />
                <span>{t.arCard.recordPaymentBtn}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Customer Profile & Credit Header Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {t.arCard.title}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-500">
                {customer.contractCode}
              </span>
              <StatusBadge status={status} t={t} size="md" />
            </div>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-slate-900">
              {customer.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {customer.creditDescription}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              {customer.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {customer.company}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {customer.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {customer.address}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left lg:min-w-[230px] lg:text-right">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{t.arCard.nextDueDate}</span>
            </div>
            <div className="mt-1 text-base font-extrabold text-slate-900">
              {formatDisplayDate(customer.nextDueDate, lang, 'long')}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {t.arCard.repaymentProgress}:{' '}
              <strong className="text-blue-700">
                {t.table.installmentProgress(customer.payments.length, customer.installmentCount)} ({progress}%)
              </strong>
            </div>
          </div>
        </div>

        {/* Financial Summary Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-xs font-semibold text-slate-500">{t.arCard.totalCredit}</div>
            <div className="mt-1.5 tabular-nums text-xl font-extrabold text-slate-900">
              {formatIDR(customer.totalCreditAmount)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-xs font-semibold text-slate-500">{t.arCard.totalPaid}</div>
            <div className="mt-1.5 tabular-nums text-xl font-extrabold text-emerald-700">
              {formatIDR(totalPaid)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-xs font-semibold text-slate-500">
              {t.arCard.remainingBalance}
            </div>
            <div
              className={`mt-1.5 tabular-nums text-xl font-extrabold ${remaining === 0 ? 'text-sky-700' : 'text-slate-900'
                }`}
            >
              {formatIDR(remaining)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-xs font-semibold text-slate-500">
              {t.arCard.installmentPlan}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                {customer.installmentCount}x
              </span>
              <span className="tabular-nums text-xs font-semibold text-slate-500">
                @ {formatIDR(customer.monthlyInstallment)} {t.arCard.perMonth}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
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

          {status === 'paid_off' && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-900">
              <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-sky-600" />
              <span>{t.arCard.accountPaidOffBanner}</span>
            </div>
          )}
        </div>
      </section>

      {/* Auto-Installment Record Payment Form */}
      {showPaymentForm && status !== 'paid_off' && (
        <form
          onSubmit={handleSubmitPayment}
          className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/60 to-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900">{t.paymentForm.title}</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              {t.paymentForm.autoDetectedBadge(nextInstallment, customer.installmentCount)}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Inputs Column */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    {t.paymentForm.amountLabel}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAmountInput(String(suggestedAmount))}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      {t.paymentForm.useStandardBtn}
                    </button>
                    {remaining > suggestedAmount && (
                      <button
                        type="button"
                        onClick={() => setAmountInput(String(remaining))}
                        className="rounded-md bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-200"
                      >
                        {t.paymentForm.payFullBtn}
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={remaining}
                    step={1}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 font-mono text-base font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {t.paymentForm.standardHint(formatIDR(suggestedAmount))}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  {t.paymentForm.dateLabel}
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  {t.paymentForm.methodLabel}
                </label>
                <select
                  value={methodInput}
                  onChange={(e) => setMethodInput(e.target.value as PaymentMethod)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="bank_transfer">{t.paymentMethods.bank_transfer}</option>
                  <option value="virtual_account">{t.paymentMethods.virtual_account}</option>
                  <option value="qris">{t.paymentMethods.qris}</option>
                  <option value="cash">{t.paymentMethods.cash}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  {t.paymentForm.notesLabel}
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder={t.paymentForm.notesPlaceholder}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Live Preview & Submit Column */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.paymentForm.previewAfterTitle}
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <span className="text-xs text-slate-500">
                      {t.paymentForm.newRemainingLabel}
                    </span>
                    <span
                      className={`tabular-nums text-base font-extrabold ${projectedRemaining === 0 ? 'text-sky-700' : 'text-slate-900'
                        }`}
                    >
                      {formatIDR(projectedRemaining)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">
                      {t.paymentForm.nextDueAfterLabel}
                    </span>
                    <span className="text-right text-xs font-bold text-slate-800">
                      {projectedRemaining === 0 ? (
                        <span className="text-sky-700">{t.paymentForm.willBePaidOff}</span>
                      ) : (
                        formatDisplayDate(projectedNextDue, lang, 'long')
                      )}
                    </span>
                  </div>
                </div>
                {parsedAmount > 0 && parsedAmount < suggestedAmount && projectedRemaining > 0 && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800">
                    • {t.paymentForm.partialPaymentNotice}
                  </p>
                )}
                {formError && (
                  <p className="mt-3 text-xs font-semibold text-rose-600">{formError}</p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.paymentForm.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4" />
                  <span>{t.paymentForm.submitBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Chronological Payment History Table (Full-Width, Zero Horizontal Scrollbar) */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">{t.arCard.paymentHistoryTitle}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {t.arCard.paymentHistoryCount(customer.payments.length)}
          </span>
        </div>

        {chronologicalPayments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            {t.arCard.noPaymentsYet}
          </div>
        ) : (
          <>
            {/* Desktop Full-Width Table */}
            <div className="hidden md:block">
              <table className="w-full table-auto border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-3">{t.arCard.colInstallment}</th>
                    <th className="px-3 py-3.5">{t.arCard.colDate}</th>
                    <th className="px-3 py-3.5">{t.arCard.colReceiptNo}</th>
                    <th className="px-3 py-3.5">{t.arCard.colMethod}</th>
                    <th className="px-3 py-3.5 text-right">{t.arCard.colAmount}</th>
                    <th className="px-3 py-3.5 text-right">{t.arCard.colBalanceAfter}</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">{t.arCard.colReceipt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {chronologicalPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pl-6 pr-3 font-bold text-slate-900 whitespace-nowrap">
                        {t.arCard.installmentLabel(payment.installmentNumber)}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        {formatDisplayDate(payment.date, lang, 'long')}
                      </td>
                      <td className="px-3 py-3.5 font-mono text-xs font-medium text-slate-600 whitespace-nowrap">
                        {payment.receiptNo}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-slate-600">
                        <div>{t.paymentMethods[payment.method]}</div>
                        {payment.notes && (
                          <div className="mt-0.5 text-[11px] text-slate-400">{payment.notes}</div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right tabular-nums font-bold text-emerald-700 whitespace-nowrap">
                        {formatIDR(payment.amount)}
                      </td>
                      <td className="px-3 py-3.5 text-right tabular-nums text-slate-700 whitespace-nowrap">
                        {formatIDR(payment.remainingBalanceAfter)}
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(customer, payment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>{t.arCard.printReceiptBtn}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="divide-y divide-slate-100 md:hidden">
              {chronologicalPayments.map((payment) => (
                <div key={payment.id} className="flex flex-col gap-2.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {t.arCard.installmentLabel(payment.installmentNumber)}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {payment.receiptNo} • {formatDisplayDate(payment.date, lang)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="tabular-nums text-sm font-bold text-emerald-700">
                        {formatIDR(payment.amount)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.paymentMethods[payment.method]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {t.arCard.colBalanceAfter}:{' '}
                      <strong className="tabular-nums text-slate-800">
                        {formatIDR(payment.remainingBalanceAfter)}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onPrintReceipt(customer, payment)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>{t.arCard.printReceiptBtn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
