import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  Printer,
  Search,
} from 'lucide-react';
import { CustomerAR, Language, PaymentRecord } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  computeCustomerStatus,
  getNextInstallmentNumber,
  getPaymentProgressPercent,
  getRemainingBalance,
  getSuggestedInstallmentAmount,
  getTotalPaid,
} from '../utils/arCalculations';
import { formatDisplayDate, formatIDR } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface SelfCheckPortalProps {
  customers: CustomerAR[];
  lang: Language;
  t: TranslationDictionary;
  isPublicMode?: boolean;
  onBackToLogin?: () => void;
  onDownloadInvoice: (customer: CustomerAR) => void;
  onPrintReceipt: (customer: CustomerAR, payment: PaymentRecord) => void;
}

export const SelfCheckPortal: React.FC<SelfCheckPortalProps> = ({
  customers,
  lang,
  t,
  isPublicMode = false,
  onBackToLogin,
  onDownloadInvoice,
  onPrintReceipt,
}) => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const isId = lang === 'id';

  // Returns ALL invoices belonging to the matched customer (supporting multiple invoices per customer!)
  const matchedInvoices = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return [];
    const digitsOnly = q.replace(/\D/g, '');

    const exact =
      customers.find((c) => {
        if (c.contractCode.toLowerCase() === q) return true;
        if (c.name.toLowerCase() === q) return true;
        if (digitsOnly.length >= 8 && c.phone.replace(/\D/g, '').includes(digitsOnly)) {
          return true;
        }
        return false;
      }) ||
      customers.find(
        (c) =>
          c.contractCode.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );

    if (!exact) return [];
    return customers.filter((c) => c.customerId === exact.customerId);
  }, [customers, submittedQuery]);

  useEffect(() => {
    if (matchedInvoices.length === 0) {
      setSelectedInvoiceId(null);
      return;
    }
    const q = submittedQuery.trim().toLowerCase();
    const directCodeMatch = matchedInvoices.find(
      (inv) => inv.contractCode.toLowerCase() === q
    );
    setSelectedInvoiceId((directCodeMatch || matchedInvoices[0]).id);
  }, [matchedInvoices, submittedQuery]);

  const matchedCustomer =
    matchedInvoices.find((inv) => inv.id === selectedInvoiceId) ||
    matchedInvoices[0] ||
    null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
  };

  const quickLookup = (term: string) => {
    setQuery(term);
    setSubmittedQuery(term);
  };

  const status = matchedCustomer ? computeCustomerStatus(matchedCustomer) : null;
  const totalPaid = matchedCustomer ? getTotalPaid(matchedCustomer) : 0;
  const remaining = matchedCustomer ? getRemainingBalance(matchedCustomer) : 0;
  const progress = matchedCustomer ? getPaymentProgressPercent(matchedCustomer) : 0;
  const nextInst = matchedCustomer ? getNextInstallmentNumber(matchedCustomer) : 0;
  const nextAmount = matchedCustomer ? getSuggestedInstallmentAmount(matchedCustomer) : 0;
  const combinedRemainingAllInvoices = matchedInvoices.reduce(
    (sum, inv) => sum + getRemainingBalance(inv),
    0
  );

  // Deduplicated quick sample chips
  const quickChips = useMemo(() => {
    const seen = new Set<string>();
    const list: CustomerAR[] = [];
    for (const c of customers) {
      if (!seen.has(c.customerId)) {
        seen.add(c.customerId);
        list.push(c);
      }
      if (list.length >= 4) break;
    }
    return list;
  }, [customers]);

  return (
    <div className={isPublicMode ? 'min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8' : 'space-y-6'}>
      <div className="mx-auto max-w-5xl space-y-6">
        {isPublicMode && onBackToLogin && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isId ? 'Kembali ke Halaman Login' : 'Back to Login'}</span>
            </button>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              LiteKai AR • {isId ? 'Portal Pelanggan Mandiri' : 'Customer Self-Service'}
            </span>
          </div>
        )}

        {/* Search Banner */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <FileSearch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {isId ? 'Cek Tagihan Mandiri & Unduh Invoice' : 'Self-Service Bill Check & Invoice Download'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isId
                  ? 'Masukkan Nomor Kontrak (misal: AR-2026-001), Nama, atau Nomor HP/WhatsApp untuk melihat semua invoice aktif Anda dan mengunduh tagihan.'
                  : 'Enter your Contract Number (e.g., AR-2026-001), Name, or WhatsApp Phone to view all of your invoices and download billing statements.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isId
                    ? 'Ketik No. Kontrak (AR-2026-001), Nama (Budi Santoso), atau No. HP'
                    : 'Type Contract No. (AR-2026-001), Name (Budi Santoso), or Phone'
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              <span>{isId ? 'Cek Tagihan' : 'Check Bill'}</span>
            </button>
          </form>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {isId ? 'Contoh cepat:' : 'Quick test:'}
            </span>
            {quickChips.map((c) => {
              const count = customers.filter((x) => x.customerId === c.customerId).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => quickLookup(c.name)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {c.name.split(' ')[0]} ({c.contractCode}
                  {count > 1 ? ` • ${count} Inv` : ''})
                </button>
              );
            })}
          </div>
        </section>

        {/* Not Found State */}
        {submittedQuery.trim() && matchedInvoices.length === 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-bold text-amber-900">
              {isId
                ? `Data tagihan untuk "${submittedQuery}" tidak ditemukan.`
                : `No billing record found for "${submittedQuery}".`}
            </p>
            <p className="mt-1 text-xs text-amber-800">
              {isId
                ? 'Pastikan nomor kontrak, nama, atau nomor HP sesuai dengan yang terdaftar.'
                : 'Please verify your contract number, name, or registered phone number.'}
            </p>
          </section>
        )}

        {/* Multi-Invoice Switcher when Customer Has > 1 Invoice */}
        {matchedInvoices.length > 1 && matchedCustomer && (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-indigo-950">
                {isId
                  ? `${matchedCustomer.name} memiliki ${matchedInvoices.length} Invoice:`
                  : `${matchedCustomer.name} has ${matchedInvoices.length} Invoices:`}
              </span>
              {matchedInvoices.map((inv, idx) => {
                const invStatus = computeCustomerStatus(inv);
                const active = inv.id === matchedCustomer.id;
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-100/60'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      #{idx + 1} {inv.contractCode}
                    </span>
                    <span className={active ? 'text-indigo-200' : 'text-slate-500'}>
                      ({t.statuses[invStatus]})
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-semibold text-indigo-900">
              {isId ? 'Total Sisa Semua Invoice:' : 'Total Remaining Across Invoices:'}{' '}
              <strong className="tabular-nums">{formatIDR(combinedRemainingAllInvoices)}</strong>
            </div>
          </section>
        )}

        {/* Result Statement */}
        {matchedCustomer && status && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {matchedCustomer.contractCode}
                    </span>
                    <StatusBadge status={status} t={t} size="md" />
                  </div>
                  <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                    {matchedCustomer.name}
                  </h3>
                  <p className="text-sm text-slate-600">{matchedCustomer.creditDescription}</p>
                  {matchedCustomer.company && (
                    <p className="mt-0.5 text-xs text-slate-500">{matchedCustomer.company}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadInvoice(matchedCustomer)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  <span>{isId ? 'Download / Cetak Invoice' : 'Download / Print Invoice'}</span>
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">{t.arCard.totalCredit}</div>
                  <div className="mt-1 tabular-nums text-lg font-extrabold text-slate-900">
                    {formatIDR(matchedCustomer.totalCreditAmount)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">{t.arCard.totalPaid}</div>
                  <div className="mt-1 tabular-nums text-lg font-extrabold text-emerald-700">
                    {formatIDR(totalPaid)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    {t.arCard.remainingBalance}
                  </div>
                  <div className="mt-1 tabular-nums text-lg font-extrabold text-slate-900">
                    {formatIDR(remaining)}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                  <div className="text-xs font-semibold text-blue-800">
                    {status === 'paid_off'
                      ? isId
                        ? 'Status Tagihan'
                        : 'Billing Status'
                      : isId
                        ? `Tagihan Angsuran ke-${nextInst}`
                        : `Installment #${nextInst} Due`}
                  </div>
                  <div className="mt-1 tabular-nums text-lg font-extrabold text-blue-900">
                    {status === 'paid_off' ? 'LUNAS' : formatIDR(nextAmount)}
                  </div>
                  {matchedCustomer.nextDueDate && (
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                      <Calendar className="h-3 w-3" />
                      {formatDisplayDate(matchedCustomer.nextDueDate, lang, 'long')}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>{t.arCard.repaymentProgress}</span>
                  <span>
                    {t.table.installmentProgress(
                      matchedCustomer.payments.length,
                      matchedCustomer.installmentCount
                    )}{' '}
                    ({progress}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {status === 'paid_off' && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-900">
                  <CheckCircle2 className="h-4 w-4 text-sky-600" />
                  <span>{t.arCard.accountPaidOffBanner}</span>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h4 className="text-sm font-bold text-slate-900">{t.arCard.paymentHistoryTitle}</h4>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {t.arCard.paymentHistoryCount(matchedCustomer.payments.length)}
                </span>
              </div>
              {matchedCustomer.payments.length === 0 ? (
                <div className="px-6 py-10 text-center text-xs text-slate-500">
                  {t.arCard.noPaymentsYet}
                </div>
              ) : (
                <table className="w-full table-auto border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 pl-6 pr-3">{t.arCard.colInstallment}</th>
                      <th className="px-3 py-3">{t.arCard.colDate}</th>
                      <th className="px-3 py-3">{t.arCard.colReceiptNo}</th>
                      <th className="px-3 py-3">{t.arCard.colMethod}</th>
                      <th className="px-3 py-3 text-right">{t.arCard.colAmount}</th>
                      <th className="py-3 pl-3 pr-6 text-right">{t.arCard.colReceipt}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {[...matchedCustomer.payments]
                      .sort((a, b) => b.installmentNumber - a.installmentNumber)
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3 pl-6 pr-3 font-bold text-slate-900">
                            {t.arCard.installmentLabel(p.installmentNumber)}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {formatDisplayDate(p.date, lang, 'long')}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-slate-600">
                            {p.receiptNo}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {t.paymentMethods[p.method]}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums font-bold text-emerald-700">
                            {formatIDR(p.amount)}
                          </td>
                          <td className="py-3 pl-3 pr-6 text-right">
                            <button
                              type="button"
                              onClick={() => onPrintReceipt(matchedCustomer, p)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>{t.arCard.printReceiptBtn}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
