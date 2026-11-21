import { CustomerAR, PaymentMethod, PaymentRecord } from '../types';
import { addDays, addMonthsSafe, generateReceiptNo, getTodayDate } from '../utils/formatters';

interface SeedBlueprint {
  id: string;
  contractCode: string;
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  totalCreditAmount: number;
  installmentCount: number;
  paidCount: number;
  /** Days offset from today for nextDueDate (null if paid off) */
  dueOffsetDays: number | null;
  preferredMethod: PaymentMethod;
}

/**
 * Builds realistic chronological payment history leading up to the current due date.
 */
function buildSeedCustomer(bp: SeedBlueprint, receiptCounter: { val: number }, today: Date): CustomerAR {
  const monthlyInstallment = Math.round(bp.totalCreditAmount / bp.installmentCount);
  const nextDueDate = bp.dueOffsetDays === null ? null : addDays(today, bp.dueOffsetDays);

  // Anchor the first installment due date relative to nextDueDate (or today if paid off)
  const anchorDate = nextDueDate ?? addDays(today, -6);
  const startDate = addMonthsSafe(anchorDate, -(bp.paidCount + 1));

  const payments: PaymentRecord[] = [];
  let runningBalance = bp.totalCreditAmount;

  for (let i = 1; i <= bp.paidCount; i++) {
    const isFinal = i === bp.installmentCount && bp.dueOffsetDays === null;
    const amount = isFinal ? runningBalance : Math.min(monthlyInstallment, runningBalance);
    runningBalance = Math.max(0, runningBalance - amount);

    // Scheduled payment date: i months after startDate, paid 0-2 days before scheduled date
    const scheduledDate = addMonthsSafe(startDate, i);
    const paymentDate = addDays(scheduledDate, -(i % 2));

    receiptCounter.val += 1;
    payments.push({
      id: `${bp.id}-pay-${i}`,
      receiptNo: generateReceiptNo(paymentDate, receiptCounter.val),
      installmentNumber: i,
      date: paymentDate,
      amount,
      remainingBalanceAfter: runningBalance,
      method: bp.preferredMethod,
      notes: isFinal ? 'Pelunasan akhir / Final settlement' : undefined,
    });
  }

  return {
    id: bp.id,
    contractCode: bp.contractCode,
    name: bp.name,
    company: bp.company,
    phone: bp.phone,
    address: bp.address,
    creditDescription: bp.creditDescription,
    totalCreditAmount: bp.totalCreditAmount,
    installmentCount: bp.installmentCount,
    monthlyInstallment,
    startDate,
    nextDueDate,
    payments,
  };
}

/**
 * Generates 8 realistic Indonesian customer AR accounts dynamically calculated
 * relative to `new Date()` so every visit always showcases:
 * - 2 Jatuh Tempo H-1 (Due Tomorrow: today + 1 day)
 * - 2 Menunggak (Overdue: today - 4 days, today - 11 days)
 * - 3 Lancar (Current: today + 7 days, today + 15 days, today + 23 days)
 * - 1 Lunas (Paid Off: remainingBalance = 0)
 */
export function generateDemoCustomers(): CustomerAR[] {
  const today = getTodayDate();
  const year = today.getFullYear();
  const receiptCounter = { val: 100 };

  const blueprints: SeedBlueprint[] = [
    // === 2 JATUH TEMPO H-1 (DUE TOMORROW: today + 1) ===
    {
      id: 'cust-001',
      contractCode: `AR-${year}-001`,
      name: 'Budi Santoso',
      company: 'Kopi Nusantara Roastery',
      phone: '0812-8451-9023',
      address: 'Jl. Kemang Raya No. 48, Jakarta Selatan',
      creditDescription: 'Mesin Espresso Komersial 2 Group',
      totalCreditAmount: 36_000_000,
      installmentCount: 12,
      paidCount: 3,
      dueOffsetDays: 1,
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-002',
      contractCode: `AR-${year}-002`,
      name: 'Siti Rahmawati',
      company: 'CV Berkah Makmur Sejahtera',
      phone: '0813-9022-4418',
      address: 'Jl. Diponegoro No. 112, Bandung',
      creditDescription: 'Pengadaan 4 Unit Printer Laser & Scanner',
      totalCreditAmount: 18_000_000,
      installmentCount: 6,
      paidCount: 2,
      dueOffsetDays: 1,
      preferredMethod: 'virtual_account',
    },

    // === 2 MENUNGGAK (OVERDUE: today - 4, today - 11) ===
    {
      id: 'cust-003',
      contractCode: `AR-${year}-003`,
      name: 'Hendra Wijaya',
      company: 'Bengkel Maju Jaya Motor',
      phone: '0811-7723-6150',
      address: 'Jl. Ahmad Yani Km. 6, Surabaya',
      creditDescription: 'Paket Peralatan Hidrolik & Kompresor Bengkel',
      totalCreditAmount: 42_000_000,
      installmentCount: 12,
      paidCount: 4,
      dueOffsetDays: -4,
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-004',
      contractCode: `AR-${year}-004`,
      name: 'Dewi Lestari Putri',
      company: 'Butik & Konveksi Griya Cantik',
      phone: '0857-2189-3340',
      address: 'Jl. Malioboro Selatan No. 27, Yogyakarta',
      creditDescription: '6 Unit Mesin Jahit Industri High-Speed',
      totalCreditAmount: 24_000_000,
      installmentCount: 12,
      paidCount: 5,
      dueOffsetDays: -11,
      preferredMethod: 'qris',
    },

    // === 3 LANCAR (CURRENT: today + 7, + 15, + 23) ===
    {
      id: 'cust-005',
      contractCode: `AR-${year}-005`,
      name: 'Agus Setiawan',
      company: 'PT Sinar Logistik Mandiri',
      phone: '0812-3390-8812',
      address: 'Kawasan Industri Jababeka Blok C4, Bekasi',
      creditDescription: 'Armada Operasional Motor Niaga (2 Unit)',
      totalCreditAmount: 54_000_000,
      installmentCount: 18,
      paidCount: 6,
      dueOffsetDays: 7,
      preferredMethod: 'virtual_account',
    },
    {
      id: 'cust-006',
      contractCode: `AR-${year}-006`,
      name: 'Rina Kusuma Wardhani',
      company: 'Klinik Gigi Senyum Prima',
      phone: '0818-0944-5521',
      address: 'Jl. Teuku Umar No. 89, Denpasar',
      creditDescription: 'Dental Chair & Unit Sterilisasi Medis',
      totalCreditAmount: 60_000_000,
      installmentCount: 12,
      paidCount: 7,
      dueOffsetDays: 15,
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-007',
      contractCode: `AR-${year}-007`,
      name: 'Fajar Nugroho',
      company: 'UD Sumber Rejeki Elektronik',
      phone: '0821-6510-7749',
      address: 'Jl. Pandanaran No. 33, Semarang',
      creditDescription: 'Stok Pendingin Ruangan & Display Showcase',
      totalCreditAmount: 15_000_000,
      installmentCount: 6,
      paidCount: 1,
      dueOffsetDays: 23,
      preferredMethod: 'cash',
    },

    // === 1 LUNAS (PAID OFF) ===
    {
      id: 'cust-008',
      contractCode: `AR-${year}-008`,
      name: 'Darmawan Pratama',
      company: 'Resto Dapur Nusantara',
      phone: '0812-9910-2204',
      address: 'Jl. Sudirman No. 105, Medan',
      creditDescription: 'Perlengkapan Dapur Stainless & Chiller',
      totalCreditAmount: 21_000_000,
      installmentCount: 6,
      paidCount: 6,
      dueOffsetDays: null,
      preferredMethod: 'bank_transfer',
    },
  ];

  return blueprints.map((bp) => buildSeedCustomer(bp, receiptCounter, today));
}
