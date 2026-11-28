import { CustomerAR } from '../types';
import {
  computeCustomerStatus,
  getRemainingBalance,
  getSuggestedInstallmentAmount,
  getTotalPaid,
} from './arCalculations';
import { diffInCalendarDays } from './formatters';
import * as XLSX from 'xlsx';

export type ExportScope = 'all' | 'customers' | 'credits' | 'payments' | 'outstanding';

function buildCustomerSheetRows(customers: CustomerAR[]) {
  return customers.map((c) => {
    const remaining = getRemainingBalance(c);
    const utilization = c.creditLimit > 0 ? Math.round((remaining / c.creditLimit) * 100) : 0;
    return {
      'ID Pelanggan': c.customerId,
      'No. Kontrak / Invoice': c.contractCode,
      'Admin PIC': `@${c.assignedAdminUsername}`,
      'Nama Pelanggan': c.name,
      'Perusahaan / Usaha': c.company || '-',
      'No. WhatsApp': c.phone,
      Alamat: c.address,
      'Limit Kredit (Rp)': c.creditLimit,
      'Terpakai / Sisa Piutang (Rp)': remaining,
      'Sisa Limit Tersedia (Rp)': Math.max(0, c.creditLimit - remaining),
      'Utilisasi Limit (%)': `${utilization}%`,
      Status: computeCustomerStatus(c),
    };
  });
}

function buildCreditSheetRows(customers: CustomerAR[]) {
  return customers.map((c) => ({
    'No. Kontrak': c.contractCode,
    'Nama Pelanggan': c.name,
    'Deskripsi Kredit / Barang': c.creditDescription,
    'Tanggal Mulai': c.startDate,
    'Tenor (Bulan)': c.installmentCount,
    'Angsuran / Bulan (Rp)': c.monthlyInstallment,
    'Total Kredit (Rp)': c.totalCreditAmount,
    'Total Terbayar (Rp)': getTotalPaid(c),
    'Sisa Piutang (Rp)': getRemainingBalance(c),
    'Angsuran Terbayar': `${c.payments.length} / ${c.installmentCount}`,
    'Jatuh Tempo Berikutnya': c.nextDueDate || 'LUNAS',
    Status: computeCustomerStatus(c),
  }));
}

function buildPaymentHistoryRows(customers: CustomerAR[]) {
  const rows: Array<Record<string, string | number>> = [];
  for (const c of customers) {
    for (const p of c.payments) {
      rows.push({
        'No. Kwitansi': p.receiptNo,
        'Tanggal Bayar': p.date,
        'No. Kontrak': c.contractCode,
        'Nama Pelanggan': c.name,
        'Angsuran Ke': p.installmentNumber,
        'Total Tenor': c.installmentCount,
        'Metode Pembayaran': p.method,
        'Nominal Dibayar (Rp)': p.amount,
        'Sisa Saldo Setelah Bayar (Rp)': p.remainingBalanceAfter,
        'Bukti Transfer': p.method === 'cash' ? 'Tunai (Tidak Wajib)' : p.transferProofName || 'Terlampir',
        Catatan: p.notes || '-',
      });
    }
  }
  return rows.sort((a, b) => String(b['Tanggal Bayar']).localeCompare(String(a['Tanggal Bayar'])));
}

function buildOutstandingRows(customers: CustomerAR[]) {
  return customers
    .filter((c) => getRemainingBalance(c) > 0)
    .map((c) => {
      const remaining = getRemainingBalance(c);
      const diff = c.nextDueDate ? diffInCalendarDays(c.nextDueDate) : 0;
      return {
        'No. Kontrak': c.contractCode,
        'Nama Pelanggan': c.name,
        'Perusahaan / Usaha': c.company || '-',
        'No. WhatsApp': c.phone,
        'Fasilitas Kredit': c.creditDescription,
        Status: computeCustomerStatus(c),
        'Jatuh Tempo Berikutnya': c.nextDueDate || '-',
        'Selisih Hari (vs Hari Ini)': diff < 0 ? `Terlambat ${Math.abs(diff)} hari` : diff === 1 ? 'Besok (H-1)' : `${diff} hari lagi`,
        'Tagihan Angsuran Berikutnya (Rp)': getSuggestedInstallmentAmount(c),
        'Sisa Piutang (Rp)': remaining,
      };
    });
}

function appendAutoSizedSheet(
  wb: XLSX.WorkBook,
  rows: Array<Record<string, string | number>>,
  sheetName: string
) {
  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Info: 'Tidak ada data' }]);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Info'];
  ws['!cols'] = headers.map((h) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? '').length)
    );
    return { wch: Math.min(42, Math.max(14, maxLen + 3)) };
  });
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

export function exportARToExcel(customers: CustomerAR[], scope: ExportScope): string {
  const wb = XLSX.utils.book_new();
  const dateStamp = new Date().toISOString().slice(0, 10);

  if (scope === 'all' || scope === 'customers') {
    appendAutoSizedSheet(wb, buildCustomerSheetRows(customers), 'Data Pelanggan');
  }
  if (scope === 'all' || scope === 'credits') {
    appendAutoSizedSheet(wb, buildCreditSheetRows(customers), 'Transaksi Kredit');
  }
  if (scope === 'all' || scope === 'payments') {
    appendAutoSizedSheet(wb, buildPaymentHistoryRows(customers), 'Riwayat Pembayaran');
  }
  if (scope === 'all' || scope === 'outstanding') {
    appendAutoSizedSheet(wb, buildOutstandingRows(customers), 'Piutang Berjalan');
  }

  const fileNames: Record<ExportScope, string> = {
    all: `LiteKai_AR_Laporan_Lengkap_${dateStamp}.xlsx`,
    customers: `LiteKai_AR_Data_Pelanggan_${dateStamp}.xlsx`,
    credits: `LiteKai_AR_Transaksi_Kredit_${dateStamp}.xlsx`,
    payments: `LiteKai_AR_Riwayat_Pembayaran_${dateStamp}.xlsx`,
    outstanding: `LiteKai_AR_Piutang_Berjalan_${dateStamp}.xlsx`,
  };

  const fileName = fileNames[scope];
  XLSX.writeFile(wb, fileName);
  return fileName;
}
