import React from 'react';
import { CheckCircle2, Landmark, Printer, X } from 'lucide-react';
import { ActiveReceipt, Language } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  amountInWords,
  formatDisplayDate,
  formatIDR,
} from '../utils/formatters';

interface ReceiptModalProps {
  receipt: ActiveReceipt | null;
  lang: Language;
  t: TranslationDictionary;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  lang,
  t,
  onClose,
}) => {
  if (!receipt) return null;

  const { customer, payment } = receipt;
  const isSettled = payment.remainingBalanceAfter === 0;

  return (
    <div
      className="print-only-wrapper fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Bar (hidden when printing) */}
        <div className="no-print mb-3 flex items-center justify-between rounded-xl bg-slate-900/90 px-4 py-2.5 text-white shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-mono">{payment.receiptNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t.receipt.printBtn}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t.receipt.closeBtn}</span>
            </button>
          </div>
        </div>

        {/* Printable Formal Kwitansi Card */}
        <article
          id="printable-receipt"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Top Accent Strip */}
          <div className="h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 print:h-1.5" />

          <div className="p-5 sm:p-6 print:p-4">
            {/* Company & Document Header */}
            <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-900 pb-4 sm:flex-row sm:items-start print:flex-row print:items-start print:pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white print:h-10 print:w-10">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-wide text-slate-900">
                    {t.companyLegalName}
                  </h2>
                  <p className="mt-0.5 max-w-xs text-[11px] leading-relaxed text-slate-500">
                    {t.companyAddress}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{t.companyContact}</p>
                </div>
              </div>

              <div className="text-left sm:text-right print:text-right">
                <h3 className="text-lg font-black tracking-wider text-blue-800">
                  {t.receipt.documentTitle}
                </h3>
                <p className="text-[11px] font-medium text-slate-500">
                  {t.receipt.documentSubtitle}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border-2 border-emerald-600 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black tracking-widest text-emerald-700 print:mt-1.5">
                  {isSettled ? t.receipt.settledStamp : t.receipt.paidStamp}
                </div>
              </div>
            </div>

            {/* Metadata Row */}
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs sm:grid-cols-3 print:mt-3 print:grid-cols-3 print:py-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t.receipt.receiptNo}
                </div>
                <div className="mt-0.5 font-mono font-bold text-slate-900">
                  {payment.receiptNo}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t.receipt.paymentDate}
                </div>
                <div className="mt-0.5 font-bold text-slate-900">
                  {formatDisplayDate(payment.date, lang, 'long')}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t.receipt.contractNo}
                </div>
                <div className="mt-0.5 font-mono font-bold text-slate-900">
                  {customer.contractCode}
                </div>
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="mt-5 divide-y divide-slate-100 text-xs print:mt-3">
              <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-3 print:grid-cols-3 print:py-1.5">
                <span className="font-semibold text-slate-500">{t.receipt.receivedFrom}</span>
                <div className="sm:col-span-2 print:col-span-2">
                  <span className="text-sm font-bold text-slate-900">{customer.name}</span>
                  {customer.company && (
                    <span className="ml-1.5 text-slate-500">({customer.company})</span>
                  )}
                  <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {customer.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-3 print:grid-cols-3 print:py-1.5">
                <span className="font-semibold text-slate-500">{t.receipt.paymentFor}</span>
                <div className="sm:col-span-2 print:col-span-2">
                  <div className="font-bold text-slate-900">
                    {t.receipt.installmentDetail(
                      payment.installmentNumber,
                      customer.installmentCount
                    )}
                  </div>
                  <div className="mt-0.5 text-slate-600">{customer.creditDescription}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-3 print:grid-cols-3 print:py-1.5">
                <span className="font-semibold text-slate-500">{t.receipt.paymentMethod}</span>
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2 print:col-span-2">
                  <span className="font-semibold text-slate-900">
                    {t.paymentMethods[payment.method]}
                  </span>
                  {payment.method !== 'cash' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                      ✓ {lang === 'id' ? 'Bukti Transfer Terverifikasi' : 'Transfer Proof Verified'}
                      {payment.transferProofName ? ` (${payment.transferProofName})` : ''}
                    </span>
                  )}
                </div>
              </div>

              {payment.notes && (
                <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-3 print:grid-cols-3 print:py-1.5">
                  <span className="font-semibold text-slate-500">{t.receipt.notes}</span>
                  <span className="text-slate-700 sm:col-span-2 print:col-span-2">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Prominent Financial Amount & Remaining Balance Box */}
            <div className="mt-5 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 print:mt-3">
              <div className="flex flex-col justify-between gap-2 border-b border-blue-200/80 px-5 py-4 sm:flex-row sm:items-center print:flex-row print:items-center print:px-4 print:py-2.5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    {t.receipt.amountPaid}
                  </div>
                  <div className="mt-1 text-xs italic text-slate-600 print:mt-0.5">
                    {t.receipt.amountInWords}:{' '}
                    <span className="font-semibold text-slate-800">
                      # {amountInWords(payment.amount, lang)} #
                    </span>
                  </div>
                </div>
                <div className="tabular-nums text-2xl font-black text-blue-900 print:text-xl">
                  {formatIDR(payment.amount)}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white px-5 py-3 text-xs print:px-4 print:py-2">
                <span className="font-semibold text-slate-600">
                  {t.receipt.remainingBalance}
                </span>
                <span
                  className={`tabular-nums text-sm font-extrabold ${isSettled ? 'text-sky-700' : 'text-slate-900'
                    }`}
                >
                  {isSettled ? t.receipt.paidOffNote : formatIDR(payment.remainingBalanceAfter)}
                </span>
              </div>
            </div>

            {/* Formal Signature Area */}
            <div className="mt-6 grid grid-cols-2 gap-8 pt-1 text-center text-xs print:mt-4 print:pt-0">
              <div>
                <p className="font-semibold text-slate-600">{t.receipt.paidBy}</p>
                <div className="mx-auto mt-10 w-44 border-b border-slate-400 print:mt-8" />
                <p className="mt-1.5 font-bold text-slate-900">{customer.name}</p>
                <p className="text-[11px] text-slate-500">{t.receipt.customerRole}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-600">{t.receipt.receivedBy}</p>
                <div className="mx-auto mt-10 w-44 border-b border-slate-400 print:mt-8" />
                <p className="mt-1.5 font-bold text-slate-900">{t.receipt.financeAdmin}</p>
                <p className="text-[11px] text-slate-500">{t.companyLegalName}</p>
              </div>
            </div>

            {/* Footer Verification Line */}
            <div className="mt-5 border-t border-dashed border-slate-200 pt-2.5 text-center text-[10px] text-slate-400 print:mt-3 print:pt-2">
              {t.receipt.footerNote}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
