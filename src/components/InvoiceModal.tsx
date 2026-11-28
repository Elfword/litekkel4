import React from 'react';
import { Download, FileText, Landmark, Printer, X } from 'lucide-react';
import { CustomerAR, Language } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import {
  computeCustomerStatus,
  getNextInstallmentNumber,
  getRemainingBalance,
  getSuggestedInstallmentAmount,
  getTotalPaid,
} from '../utils/arCalculations';
import {
  amountInWords,
  formatDisplayDate,
  formatIDR,
  getTodayDate,
  toISODate,
} from '../utils/formatters';

interface InvoiceModalProps {
  customer: CustomerAR | null;
  lang: Language;
  t: TranslationDictionary;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  customer,
  lang,
  t,
  onClose,
}) => {
  if (!customer) return null;

  const isId = lang === 'id';
  const status = computeCustomerStatus(customer);
  const totalPaid = getTotalPaid(customer);
  const remaining = getRemainingBalance(customer);
  const nextInst = getNextInstallmentNumber(customer);
  const currentDueAmount = getSuggestedInstallmentAmount(customer);
  const issueDateISO = toISODate(getTodayDate());
  const invoiceNo = `INV-${customer.contractCode.replace(/^AR-/, '')}-${String(nextInst).padStart(2, '0')}`;

  const handleDownloadHtml = () => {
    const htmlContent = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<title>${invoiceNo} - ${customer.name}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 32px; background: #fff; }
  .box { max-width: 760px; margin: 0 auto; border: 1.5px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
  .bar { height: 8px; background: linear-gradient(90deg, #1d4ed8, #4f46e5); }
  .inner { padding: 28px 32px; }
  .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
  h1 { margin: 0; font-size: 22px; color: #1e40af; letter-spacing: 1px; }
  h2 { margin: 0; font-size: 15px; }
  .muted { color: #64748b; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; text-align: left; }
  th { background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #475569; }
  .right { text-align: right; }
  .total-box { margin-top: 18px; padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; }
  .amount { font-size: 24px; font-weight: 800; color: #1e3a8a; }
  .bank { margin-top: 18px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; }
</style>
</head>
<body>
  <div class="box">
    <div class="bar"></div>
    <div class="inner">
      <div class="row header">
        <div>
          <h2>${t.companyLegalName}</h2>
          <div class="muted">${t.companyAddress}</div>
          <div class="muted">${t.companyContact}</div>
        </div>
        <div class="right">
          <h1>${isId ? 'INVOICE TAGIHAN' : 'BILLING INVOICE'}</h1>
          <div class="muted">${invoiceNo}</div>
          <div class="muted">${isId ? 'Tanggal Terbit' : 'Issue Date'}: ${formatDisplayDate(issueDateISO, lang, 'long')}</div>
        </div>
      </div>
      <div class="row">
        <div>
          <div class="muted">${isId ? 'Ditagihkan Kepada' : 'Bill To'}</div>
          <strong>${customer.name}</strong> ${customer.company ? `(${customer.company})` : ''}<br/>
          <span class="muted">${customer.phone} • ${customer.address}</span>
        </div>
        <div class="right">
          <div class="muted">${isId ? 'No. Kontrak AR' : 'AR Contract No.'}: <strong>${customer.contractCode}</strong></div>
          <div class="muted">${isId ? 'Jatuh Tempo' : 'Due Date'}: <strong>${formatDisplayDate(customer.nextDueDate, lang, 'long')}</strong></div>
          <div class="muted">Status: <strong>${t.statuses[status]}</strong></div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>${isId ? 'Deskripsi' : 'Description'}</th>
            <th class="right">${isId ? 'Nilai' : 'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${customer.creditDescription} (${customer.installmentCount}x)</td>
            <td class="right">${formatIDR(customer.totalCreditAmount)}</td>
          </tr>
          <tr>
            <td>${isId ? 'Total Sudah Terbayar' : 'Total Paid to Date'} (${customer.payments.length}/${customer.installmentCount})</td>
            <td class="right">- ${formatIDR(totalPaid)}</td>
          </tr>
          <tr>
            <td><strong>${isId ? 'Sisa Piutang Keseluruhan' : 'Total Remaining Balance'}</strong></td>
            <td class="right"><strong>${formatIDR(remaining)}</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="total-box row">
        <div>
          <div class="muted"><strong>${status === 'paid_off' ? (isId ? 'STATUS LUNAS' : 'PAID IN FULL') : isId ? `TAGIHAN ANGSURAN KE-${nextInst} DARI ${customer.installmentCount}` : `INSTALLMENT #${nextInst} OF ${customer.installmentCount} DUE`}</strong></div>
          <div class="muted" style="margin-top:4px;font-style:italic"># ${amountInWords(currentDueAmount, lang)} #</div>
        </div>
        <div class="amount">${formatIDR(currentDueAmount)}</div>
      </div>
      <div class="bank">
        <strong>${isId ? 'Instruksi Pembayaran Transfer:' : 'Bank Transfer Payment Instructions:'}</strong><br/>
        Bank BCA — No. Rek <strong>882-041-9920</strong> a.n. <strong>${t.companyLegalName}</strong><br/>
        ${isId ? 'Mohon cantumkan No. Kontrak pada berita transfer dan lampirkan bukti transfer kepada Admin Keuangan.' : 'Please include your Contract No. in the transfer reference and attach your transfer proof.'}
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNo}_${customer.name.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        {/* Action Bar */}
        <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 px-4 py-2.5 text-white shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <FileText className="h-4 w-4 text-blue-400" />
            <span className="font-mono">{invoiceNo}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isId ? 'Download Invoice' : 'Download Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isId ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t.receipt.closeBtn}</span>
            </button>
          </div>
        </div>

        {/* Printable Formal Invoice Card */}
        <article
          id="printable-receipt"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="h-2 bg-gradient-to-r from-indigo-700 via-blue-600 to-sky-500 print:h-1.5" />
          <div className="p-5 sm:p-6 print:p-4">
            <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-900 pb-4 sm:flex-row sm:items-start print:flex-row">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
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
                <h3 className="text-lg font-black tracking-wider text-indigo-800">
                  {isId ? 'INVOICE TAGIHAN' : 'BILLING INVOICE'}
                </h3>
                <div className="mt-0.5 font-mono text-xs font-bold text-slate-700">{invoiceNo}</div>
                <div className="text-[11px] text-slate-500">
                  {isId ? 'Terbit:' : 'Issued:'} {formatDisplayDate(issueDateISO, lang, 'long')}
                </div>
              </div>
            </div>

            {/* Bill To & Contract Meta */}
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs sm:grid-cols-2 print:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isId ? 'Ditagihkan Kepada' : 'Bill To'}
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">{customer.name}</div>
                {customer.company && <div className="text-slate-600">{customer.company}</div>}
                <div className="mt-0.5 font-mono text-[11px] text-slate-500">{customer.phone}</div>
                <div className="text-[11px] text-slate-500">{customer.address}</div>
              </div>

              <div className="space-y-1.5 text-left sm:text-right print:text-right">
                <div>
                  <span className="text-slate-500">{t.receipt.contractNo}: </span>
                  <strong className="font-mono text-slate-900">{customer.contractCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">{t.arCard.nextDueDate}: </span>
                  <strong className="text-slate-900">
                    {formatDisplayDate(customer.nextDueDate, lang, 'long')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Status: </span>
                  <strong className="text-indigo-700">{t.statuses[status]}</strong>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="mt-5 w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5 text-left">{isId ? 'Rincian Kredit' : 'Credit Summary'}</th>
                  <th className="px-3 py-2.5 text-right">{isId ? 'Jumlah' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-900">{customer.creditDescription}</div>
                    <div className="text-[11px] text-slate-500">
                      {isId ? 'Skema Tenor:' : 'Installment Plan:'} {customer.installmentCount}x @{' '}
                      {formatIDR(customer.monthlyInstallment)} {t.arCard.perMonth}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">
                    {formatIDR(customer.totalCreditAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-slate-600">
                    {isId
                      ? `Total Terbayar (${customer.payments.length} dari ${customer.installmentCount} angsuran)`
                      : `Total Paid (${customer.payments.length} of ${customer.installmentCount} installments)`}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                    - {formatIDR(totalPaid)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-slate-800">
                    {t.arCard.remainingBalance}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-900">
                    {formatIDR(remaining)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Current Amount Due Highlight */}
            <div className="mt-4 flex flex-col justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-5 py-4 sm:flex-row sm:items-center print:flex-row">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                  {status === 'paid_off'
                    ? isId
                      ? 'Tagihan Lunas'
                      : 'Paid in Full'
                    : isId
                      ? `Tagihan Jatuh Tempo — Angsuran ke-${nextInst} dari ${customer.installmentCount}`
                      : `Current Amount Due — Installment #${nextInst} of ${customer.installmentCount}`}
                </div>
                <div className="mt-1 text-xs italic text-slate-600">
                  {t.receipt.amountInWords}:{' '}
                  <span className="font-semibold text-slate-800">
                    # {amountInWords(currentDueAmount, lang)} #
                  </span>
                </div>
              </div>
              <div className="tabular-nums text-2xl font-black text-indigo-900">
                {formatIDR(currentDueAmount)}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <div className="font-bold text-slate-800">
                {isId ? 'Instruksi Pembayaran Transfer Bank:' : 'Bank Transfer Instructions:'}
              </div>
              <p className="mt-1">
                Bank BCA • No. Rek <strong className="font-mono text-slate-900">882-041-9920</strong>{' '}
                a.n. <strong className="text-slate-900">{t.companyLegalName}</strong>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {isId
                  ? `Cantumkan No. Kontrak (${customer.contractCode}) pada catatan transfer dan kirimkan bukti transfer untuk validasi penerbitan kwitansi.`
                  : `Include Contract No. (${customer.contractCode}) in your transfer reference and attach proof of transfer for receipt verification.`}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
