import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  CreditCard,
  History,
  AlertCircle,
  X,
} from 'lucide-react';
import { CustomerAR, Language } from '../types';
import { ExportScope } from '../utils/excelExport';
import { getRemainingBalance } from '../utils/arCalculations';

interface ExcelExportModalProps {
  isOpen: boolean;
  customers: CustomerAR[];
  lang: Language;
  onClose: () => void;
  onExport: (scope: ExportScope) => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  customers,
  lang,
  onClose,
  onExport,
}) => {
  if (!isOpen) return null;

  const isId = lang === 'id';
  const totalPayments = customers.reduce((sum, c) => sum + c.payments.length, 0);
  const outstandingCount = customers.filter((c) => getRemainingBalance(c) > 0).length;

  const items: Array<{
    scope: ExportScope;
    title: string;
    desc: string;
    badge: string;
    icon: React.ReactNode;
    primary?: boolean;
  }> = [
    {
      scope: 'all',
      title: isId ? 'Export Lengkap (Semua 4 Sheet dalam 1 File Excel)' : 'Full Workbook (All 4 Sheets in 1 Excel File)',
      desc: isId
        ? 'Berisi sheet Data Pelanggan, Transaksi Kredit, Riwayat Pembayaran, dan Piutang Berjalan.'
        : 'Contains Customer Data, Credit Transactions, Payment History, and Outstanding Receivables sheets.',
      badge: '4 Sheets (.xlsx)',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      primary: true,
    },
    {
      scope: 'customers',
      title: isId ? 'Data Pelanggan & Limit Kredit' : 'Customer Data & Credit Limits',
      desc: isId
        ? 'Profil pelanggan, kontak, alamat, limit kredit, sisa limit, dan utilisasi.'
        : 'Customer profiles, contact details, addresses, credit limits, and utilization.',
      badge: `${customers.length} ${isId ? 'pelanggan' : 'customers'}`,
      icon: <Users className="h-4 w-4" />,
    },
    {
      scope: 'credits',
      title: isId ? 'Transaksi Kredit' : 'Credit Transactions',
      desc: isId
        ? 'Detail fasilitas kredit, tenor, angsuran bulanan, total kredit, terbayar, dan sisa saldo.'
        : 'Credit items, tenors, monthly installments, totals, paid amounts, and balances.',
      badge: `${customers.length} ${isId ? 'kontrak' : 'contracts'}`,
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      scope: 'payments',
      title: isId ? 'Riwayat Pembayaran (Payment History)' : 'Payment History',
      desc: isId
        ? 'Seluruh catatan pembayaran, nomor kwitansi, metode bayar, dan status bukti transfer.'
        : 'All recorded installment payments, receipt numbers, methods, and transfer proof status.',
      badge: `${totalPayments} ${isId ? 'transaksi' : 'payments'}`,
      icon: <History className="h-4 w-4" />,
    },
    {
      scope: 'outstanding',
      title: isId ? 'Piutang Berjalan (Outstanding Receivables)' : 'Outstanding Receivables',
      desc: isId
        ? 'Khusus akun aktif yang belum lunas beserta status jatuh tempo dan tagihan berikutnya.'
        : 'Unpaid active accounts only with due date aging and next installment amounts.',
      badge: `${outstandingCount} ${isId ? 'akun aktif' : 'active'}`,
      icon: <AlertCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {isId ? 'Export Laporan ke Excel (.xlsx)' : 'Export Reports to Excel (.xlsx)'}
              </h2>
              <p className="text-xs text-slate-500">
                {isId
                  ? 'Unduh laporan siap pakai dalam format Microsoft Excel (.xlsx).'
                  : 'Download ready-to-use spreadsheets in Microsoft Excel (.xlsx) format.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {items.map((item) => (
            <button
              key={item.scope}
              type="button"
              onClick={() => {
                onExport(item.scope);
                onClose();
              }}
              className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                item.primary
                  ? 'border-emerald-300 bg-emerald-50/80 hover:border-emerald-500 hover:bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.primary
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.primary
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>

              <div
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                  item.primary
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>.xlsx</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
