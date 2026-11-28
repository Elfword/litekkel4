import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FilePlus2,
  FileText,
  Gauge,
  Landmark,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CustomerAR,
  Language,
  PaymentMethod,
  PaymentRecord,
  RecordPaymentInput,
  UserRole,
} from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  computeCustomerStatus,
  getCreditLimitUsage,
  getCustomerInvoices,
  getNextInstallmentNumber,
  getPaymentProgressPercent,
  getRemainingBalance,
  getSuggestedInstallmentAmount,
  getTotalPaid,
  isTransferPaymentMethod,
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
  allCustomers: CustomerAR[];
  initialShowPaymentForm: boolean;
  lang: Language;
  userRole: UserRole;
  t: TranslationDictionary;
  onClose: () => void;
  onSwitchInvoice: (invoice: CustomerAR) => void;
  onAddInvoiceForCustomer: (customer: CustomerAR) => void;
  onRecordPayment: (customerId: string, input: RecordPaymentInput) => void;
  onPrintReceipt: (customer: CustomerAR, payment: PaymentRecord) => void;
  onDownloadInvoice: (customer: CustomerAR) => void;
  onEditCustomer: (customer: CustomerAR) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const DigitalARCardModal: React.FC<DigitalARCardModalProps> = ({
  customer,
  allCustomers,
  initialShowPaymentForm,
  lang,
  userRole,
  t,
  onClose,
  onSwitchInvoice,
  onAddInvoiceForCustomer,
  onRecordPayment,
  onPrintReceipt,
  onDownloadInvoice,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const isId = lang === 'id';
  const [showPaymentForm, setShowPaymentForm] = useState(initialShowPaymentForm);
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(toISODate(getTodayDate()));
  const [methodInput, setMethodInput] = useState<PaymentMethod>('cash');
  const [notesInput, setNotesInput] = useState('');
  const [transferProofDataUrl, setTransferProofDataUrl] = useState<string | undefined>(undefined);
  const [transferProofName, setTransferProofName] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [previewProof, setPreviewProof] = useState<{ name: string; dataUrl?: string } | null>(null);

  useEffect(() => {
    const status = computeCustomerStatus(customer);
    const shouldOpen = initialShowPaymentForm && status !== 'paid_off';
    setShowPaymentForm(shouldOpen);
    const suggested = getSuggestedInstallmentAmount(customer);
    setAmountInput(suggested > 0 ? String(suggested) : '');
    setDateInput(toISODate(getTodayDate()));
    setMethodInput('cash');
    setNotesInput('');
    setTransferProofDataUrl(undefined);
    setTransferProofName(undefined);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [customer.id, initialShowPaymentForm]);

  const status = computeCustomerStatus(customer);
  const totalPaid = getTotalPaid(customer);
  const remaining = getRemainingBalance(customer);
  const progress = getPaymentProgressPercent(customer);
  const nextInstallment = getNextInstallmentNumber(customer);
  const suggestedAmount = getSuggestedInstallmentAmount(customer);
  const siblingInvoices = getCustomerInvoices(allCustomers, customer.customerId);
  const limitUsage = getCreditLimitUsage(customer, allCustomers);

  const isTransfer = isTransferPaymentMethod(methodInput);
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
    setMethodInput('cash');
    setNotesInput('');
    setTransferProofDataUrl(undefined);
    setTransferProofName(undefined);
    setFormError(null);
    setShowPaymentForm(true);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setFormError(
        isId
          ? 'Ukuran file bukti transfer maksimal 4 MB.'
          : 'Transfer proof file must be under 4 MB.'
      );
      return;
    }
    setTransferProofName(file.name);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTransferProofDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
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
    if (isTransfer && !transferProofName) {
      setFormError(
        isId
          ? 'Wajib lampirkan bukti transfer (gambar/PDF) untuk metode Transfer sebelum menyimpan & mencetak kwitansi.'
          : 'Transfer proof (image/PDF) is required for Transfer payments before saving and printing the receipt.'
      );
      return;
    }
    setFormError(null);
    onRecordPayment(customer.id, {
      amount: parsedAmount,
      date: dateInput || toISODate(getTodayDate()),
      method: methodInput,
      notes: notesInput,
      transferProofDataUrl: isTransfer ? transferProofDataUrl : undefined,
      transferProofName: isTransfer ? transferProofName : undefined,
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onDownloadInvoice(customer)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-600 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isId ? 'Download Invoice' : 'Download Invoice'}</span>
          </button>

          <button
            type="button"
            onClick={() => onEditCustomer(customer)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>{isId ? 'Edit Data' : 'Edit Data'}</span>
          </button>

          {userRole === 'super_admin' && (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-600 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isId ? 'Hapus' : 'Delete'}</span>
            </button>
          )}

          {status !== 'paid_off' && waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{t.arCard.sendWhatsAppBtn}</span>
            </a>
          )}

          {status !== 'paid_off' && !showPaymentForm && (
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
      </div>

      {/* Multi-Invoice Switcher Bar for Same Customer */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isId
              ? `Daftar Invoice ${customer.name} (${siblingInvoices.length}):`
              : `${customer.name}'s Invoices (${siblingInvoices.length}):`}
          </span>
          {siblingInvoices.map((inv, idx) => {
            const invStatus = computeCustomerStatus(inv);
            const active = inv.id === customer.id;
            return (
              <button
                key={inv.id}
                type="button"
                onClick={() => onSwitchInvoice(inv)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>
                  #{idx + 1} {inv.contractCode}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {t.statuses[invStatus]}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onAddInvoiceForCustomer(customer)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span>{isId ? '+ Tambah Invoice Baru' : '+ Add New Invoice'}</span>
        </button>
      </section>

      {/* Customer Profile, Financial Summary & Credit Limit Card */}
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
              className={`mt-1.5 tabular-nums text-xl font-extrabold ${
                remaining === 0 ? 'text-sky-700' : 'text-slate-900'
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

        {/* Credit Limit Management Bar (Julie) */}
        <div
          className={`mt-4 rounded-xl border p-4 ${
            limitUsage.isOverLimit
              ? 'border-rose-200 bg-rose-50/70'
              : limitUsage.isNearLimit
                ? 'border-amber-200 bg-amber-50/60'
                : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gauge
                className={`h-4 w-4 ${
                  limitUsage.isOverLimit
                    ? 'text-rose-600'
                    : limitUsage.isNearLimit
                      ? 'text-amber-600'
                      : 'text-blue-600'
                }`}
              />
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                {isId ? 'Manajemen Limit Kredit' : 'Credit Limit Management'}
              </span>
              {limitUsage.isOverLimit && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  <AlertTriangle className="h-3 w-3" />
                  OVER LIMIT ({limitUsage.utilizationPercent}%)
                </span>
              )}
              {limitUsage.isNearLimit && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {isId ? 'Mendekati Limit' : 'Near Limit'} ({limitUsage.utilizationPercent}%)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onEditCustomer(customer)}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              {isId ? 'Atur Limit Kredit' : 'Adjust Credit Limit'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
            <div>
              <span className="text-slate-500">{isId ? 'Limit Kredit:' : 'Credit Limit:'}</span>{' '}
              <strong className="tabular-nums text-slate-900">{formatIDR(customer.creditLimit)}</strong>
            </div>
            <div>
              <span className="text-slate-500">
                {isId
                  ? `Terpakai (${limitUsage.invoiceCount} Invoice):`
                  : `Used (${limitUsage.invoiceCount} Invoices):`}
              </span>{' '}
              <strong className="tabular-nums text-slate-900">{formatIDR(limitUsage.used)}</strong>
            </div>
            <div>
              <span className="text-slate-500">{isId ? 'Sisa Limit Tersedia:' : 'Available Limit:'}</span>{' '}
              <strong
                className={`tabular-nums ${
                  limitUsage.isOverLimit ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {formatIDR(limitUsage.available)}
              </strong>
            </div>
          </div>

          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/90 ring-1 ring-slate-200/80">
            <div
              className={`h-full rounded-full transition-all ${
                limitUsage.isOverLimit
                  ? 'bg-rose-500'
                  : limitUsage.isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, limitUsage.utilizationPercent)}%` }}
            />
          </div>
        </div>

        {/* Repayment Progress Bar */}
        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                status === 'paid_off'
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

      {/* Auto-Installment Record Payment Form (with Kezia's Cash vs Transfer + Proof requirement) */}
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
              {/* Amount */}
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

              {/* Payment Method Toggle: Cash vs Transfer (Kezia) */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  {t.paymentForm.methodLabel}
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMethodInput('cash');
                      setFormError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all ${
                      methodInput === 'cash'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    <span>{isId ? 'Tunai (Cash)' : 'Cash'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (methodInput === 'cash') setMethodInput('bank_transfer');
                      setFormError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all ${
                      isTransfer
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                    <span>{isId ? 'Transfer (TF / VA / QRIS)' : 'Transfer (Bank / VA / QRIS)'}</span>
                  </button>
                </div>

                {isTransfer && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(['bank_transfer', 'virtual_account', 'qris'] as PaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethodInput(m)}
                        className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                          methodInput === m
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.paymentMethods[m]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mandatory Transfer Proof Upload when Transfer is chosen */}
              {isTransfer && (
                <div className="sm:col-span-2 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                      <Upload className="h-4 w-4 text-amber-700" />
                      <span>
                        {isId
                          ? 'Lampiran Bukti Transfer (Wajib sebelum cetak kwitansi) *'
                          : 'Transfer Proof Attachment (Required before printing receipt) *'}
                      </span>
                    </label>
                    {transferProofName && (
                      <button
                        type="button"
                        onClick={() => {
                          setTransferProofDataUrl(undefined);
                          setTransferProofName(undefined);
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        {isId ? 'Hapus' : 'Remove'}
                      </button>
                    )}
                  </div>

                  {!transferProofName ? (
                    <label className="mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-white/90 px-4 py-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30">
                      <Upload className="h-5 w-5 text-amber-600" />
                      <span className="mt-1.5 text-xs font-bold text-slate-800">
                        {isId
                          ? 'Klik untuk unggah foto/screenshot bukti transfer'
                          : 'Click to upload transfer proof image or PDF'}
                      </span>
                      <span className="mt-0.5 text-[11px] text-slate-500">
                        JPG, PNG, WEBP, PDF (max 4 MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleProofFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-2.5">
                      {transferProofDataUrl && transferProofDataUrl.startsWith('data:image/') ? (
                        <img
                          src={transferProofDataUrl}
                          alt={transferProofName}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-slate-900">
                          {transferProofName}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          ✓ {isId ? 'Bukti transfer siap diverifikasi' : 'Transfer proof attached'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                      className={`tabular-nums text-base font-extrabold ${
                        projectedRemaining === 0 ? 'text-sky-700' : 'text-slate-900'
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
                {isTransfer && !transferProofName && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
                    {isId
                      ? 'Lampirkan bukti transfer terlebih dahulu untuk mengaktifkan tombol cetak kwitansi.'
                      : 'Attach transfer proof first to enable receipt printing.'}
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
                  disabled={isTransfer && !transferProofName}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>{t.paymentForm.submitBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Chronological Payment History Table */}
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
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span>{t.paymentMethods[payment.method]}</span>
                          {payment.method !== 'cash' && payment.transferProofName && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewProof({
                                  name: payment.transferProofName!,
                                  dataUrl: payment.transferProofDataUrl,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
                            >
                              <Eye className="h-3 w-3" />
                              <span>{isId ? 'Bukti TF' : 'Proof'}</span>
                            </button>
                          )}
                        </div>
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

      {/* Transfer Proof Lightbox */}
      {previewProof && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewProof(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isId ? 'Lampiran Bukti Transfer' : 'Transfer Proof Attachment'}
                </h4>
                <p className="font-mono text-xs text-slate-500">{previewProof.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {previewProof.dataUrl && previewProof.dataUrl.startsWith('data:image/') ? (
                <img
                  src={previewProof.dataUrl}
                  alt={previewProof.name}
                  className="max-h-[60vh] w-full rounded-xl object-contain bg-slate-50"
                />
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-xs text-emerald-900">
                  <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-2 font-bold">{previewProof.name}</p>
                  <p className="mt-1 text-emerald-700">
                    {isId
                      ? 'Bukti transfer telah terverifikasi pada sistem.'
                      : 'Transfer proof has been verified in the system.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {confirmDeleteOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900">
              {isId ? 'Hapus Data Pelanggan?' : 'Delete Customer Record?'}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {isId
                ? `Anda yakin ingin menghapus ${customer.name} (${customer.contractCode}) beserta riwayat pembayarannya? Tindakan ini akan dicatat di Audit Trail.`
                : `Are you sure you want to delete ${customer.name} (${customer.contractCode}) and its payment history? This action will be logged in the Audit Trail.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  onDeleteCustomer(customer.id);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                {isId ? 'Ya, Hapus Permanen' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
