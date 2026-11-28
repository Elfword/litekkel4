import { AuditLogEntry, CustomerAR, PaymentMethod, PaymentRecord } from '../types';
import { addDays, addMonthsSafe, generateReceiptNo, getTodayDate } from '../utils/formatters';

interface SeedBlueprint {
  id: string;
  customerId: string;
  contractCode: string;
  assignedAdminUsername: string;
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  creditLimit: number;
  totalCreditAmount: number;
  installmentCount: number;
  paidCount: number;
  /** Days offset from today for nextDueDate (null if paid off) */
  dueOffsetDays: number | null;
  preferredMethod: PaymentMethod;
}

function buildSeedCustomer(bp: SeedBlueprint, receiptCounter: { val: number }, today: Date): CustomerAR {
  const monthlyInstallment = Math.round(bp.totalCreditAmount / bp.installmentCount);
  const nextDueDate = bp.dueOffsetDays === null ? null : addDays(today, bp.dueOffsetDays);

  const anchorDate = nextDueDate ?? addDays(today, -6);
  const startDate = addMonthsSafe(anchorDate, -(bp.paidCount + 1));

  const payments: PaymentRecord[] = [];
  let runningBalance = bp.totalCreditAmount;

  for (let i = 1; i <= bp.paidCount; i++) {
    const isFinal = i === bp.installmentCount && bp.dueOffsetDays === null;
    const amount = isFinal ? runningBalance : Math.min(monthlyInstallment, runningBalance);
    runningBalance = Math.max(0, runningBalance - amount);

    const scheduledDate = addMonthsSafe(startDate, i);
    const paymentDate = addDays(scheduledDate, -(i % 2));

    receiptCounter.val += 1;
    const receiptNo = generateReceiptNo(paymentDate, receiptCounter.val);
    payments.push({
      id: `${bp.id}-pay-${i}`,
      receiptNo,
      installmentNumber: i,
      date: paymentDate,
      amount,
      remainingBalanceAfter: runningBalance,
      method: bp.preferredMethod,
      notes: isFinal ? 'Pelunasan akhir / Final settlement' : undefined,
      transferProofName:
        bp.preferredMethod !== 'cash' ? `bukti-tf-${receiptNo.toLowerCase()}.jpg` : undefined,
    });
  }

  return {
    id: bp.id,
    customerId: bp.customerId,
    contractCode: bp.contractCode,
    assignedAdminUsername: bp.assignedAdminUsername,
    name: bp.name,
    company: bp.company,
    phone: bp.phone,
    address: bp.address,
    creditDescription: bp.creditDescription,
    creditLimit: bp.creditLimit,
    totalCreditAmount: bp.totalCreditAmount,
    installmentCount: bp.installmentCount,
    monthlyInstallment,
    startDate,
    nextDueDate,
    payments,
  };
}

/**
 * Diverse admin portfolio scenarios across team members:
 * - julie:   Paid Half (50%) + Multi-Invoice customer (Budi Santoso: 2 invoices, both 50% paid)
 * - atika:   Paid All (100% Lunas — 2 customers fully settled)
 * - cosmas:  No Customers (0 customers)
 * - evelina: All Not Paid (0% paid — 2 customers, 0 payments yet)
 * - jelice:  Paid Half (50% paid — 2 customers, 3/6 & 6/12)
 * - kezia:   Mixed Active & Overdue
 * - melissa: Paid All (100% Lunas — 1 customer fully settled)
 * - olyvia:  All Not Paid (0% paid — 2 customers, 0 payments yet)
 * - sutina:  No Customers (0 customers)
 * - alvin:   Paid Half (50% paid — 1 customer, 3/6)
 */
export function generateDemoCustomers(): CustomerAR[] {
  const today = getTodayDate();
  const year = today.getFullYear();
  const receiptCounter = { val: 100 };

  const blueprints: SeedBlueprint[] = [
    // === JULIE CHOO: Paid Half (50%) + Multi-Invoice Customer (Budi Santoso) ===
    {
      id: 'cust-001',
      customerId: 'CUST-001',
      contractCode: `AR-${year}-001`,
      assignedAdminUsername: 'julie',
      name: 'Budi Santoso',
      company: 'Kopi Nusantara Roastery',
      phone: '0812-8451-9023',
      address: 'Jl. Kemang Raya No. 48, Jakarta Selatan',
      creditDescription: 'Mesin Espresso Komersial 2 Group',
      creditLimit: 50_000_000,
      totalCreditAmount: 36_000_000,
      installmentCount: 12,
      paidCount: 6, // 50% paid
      dueOffsetDays: 1, // H-1
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-001-inv2',
      customerId: 'CUST-001',
      contractCode: `AR-${year}-009`,
      assignedAdminUsername: 'julie',
      name: 'Budi Santoso',
      company: 'Kopi Nusantara Roastery',
      phone: '0812-8451-9023',
      address: 'Jl. Kemang Raya No. 48, Jakarta Selatan',
      creditDescription: 'Grinder Kopi Komersial & Water Filtration System',
      creditLimit: 50_000_000,
      totalCreditAmount: 12_000_000,
      installmentCount: 6,
      paidCount: 3, // 50% paid
      dueOffsetDays: 12, // Lancar
      preferredMethod: 'bank_transfer',
    },

    // === ATIKA RAHMAH: All Paid Off (100% Lunas) ===
    {
      id: 'cust-002',
      customerId: 'CUST-002',
      contractCode: `AR-${year}-002`,
      assignedAdminUsername: 'atika',
      name: 'Darmawan Pratama',
      company: 'Resto Dapur Nusantara',
      phone: '0812-9910-2204',
      address: 'Jl. Sudirman No. 105, Medan',
      creditDescription: 'Perlengkapan Dapur Stainless & Chiller',
      creditLimit: 35_000_000,
      totalCreditAmount: 21_000_000,
      installmentCount: 6,
      paidCount: 6, // 100% Lunas
      dueOffsetDays: null,
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-010',
      customerId: 'CUST-010',
      contractCode: `AR-${year}-010`,
      assignedAdminUsername: 'atika',
      name: 'Teguh Santosa',
      company: 'Apotek Sehat Sentosa',
      phone: '0813-4421-8890',
      address: 'Jl. Raya Darmo No. 72, Surabaya',
      creditDescription: 'Sistem Komputer Kasir & Chiller Obat',
      creditLimit: 30_000_000,
      totalCreditAmount: 18_000_000,
      installmentCount: 6,
      paidCount: 6, // 100% Lunas
      dueOffsetDays: null,
      preferredMethod: 'virtual_account',
    },

    // === EVELINA MAGDALENE: All Not Paid Yet (0% Paid) ===
    {
      id: 'cust-003',
      customerId: 'CUST-003',
      contractCode: `AR-${year}-003`,
      assignedAdminUsername: 'evelina',
      name: 'Hendra Wijaya',
      company: 'Bengkel Maju Jaya Motor',
      phone: '0811-7723-6150',
      address: 'Jl. Ahmad Yani Km. 6, Surabaya',
      creditDescription: 'Paket Peralatan Hidrolik & Kompresor Bengkel',
      creditLimit: 35_000_000,
      totalCreditAmount: 42_000_000,
      installmentCount: 12,
      paidCount: 0, // 0% paid (Over Limit & Overdue)
      dueOffsetDays: -4,
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-011',
      customerId: 'CUST-011',
      contractCode: `AR-${year}-011`,
      assignedAdminUsername: 'evelina',
      name: 'Kartika Sari',
      company: 'Studio Foto Cahaya Abadi',
      phone: '0817-5520-3144',
      address: 'Jl. Braga No. 64, Bandung',
      creditDescription: 'Paket Kamera Mirrorless & Lighting Studio',
      creditLimit: 25_000_000,
      totalCreditAmount: 18_000_000,
      installmentCount: 6,
      paidCount: 0, // 0% paid, due tomorrow H-1
      dueOffsetDays: 1,
      preferredMethod: 'virtual_account',
    },

    // === JELICE DENNY CIA: Paid Half (50% Paid) ===
    {
      id: 'cust-004',
      customerId: 'CUST-004',
      contractCode: `AR-${year}-004`,
      assignedAdminUsername: 'jelice',
      name: 'Siti Rahmawati',
      company: 'CV Berkah Makmur Sejahtera',
      phone: '0813-9022-4418',
      address: 'Jl. Diponegoro No. 112, Bandung',
      creditDescription: 'Pengadaan 4 Unit Printer Laser & Scanner',
      creditLimit: 25_000_000,
      totalCreditAmount: 18_000_000,
      installmentCount: 6,
      paidCount: 3, // 50% paid
      dueOffsetDays: 1, // H-1
      preferredMethod: 'virtual_account',
    },
    {
      id: 'cust-005',
      customerId: 'CUST-005',
      contractCode: `AR-${year}-005`,
      assignedAdminUsername: 'jelice',
      name: 'Agus Setiawan',
      company: 'PT Sinar Logistik Mandiri',
      phone: '0812-3390-8812',
      address: 'Kawasan Industri Jababeka Blok C4, Bekasi',
      creditDescription: 'Armada Operasional Motor Niaga (2 Unit)',
      creditLimit: 60_000_000,
      totalCreditAmount: 48_000_000,
      installmentCount: 12,
      paidCount: 6, // 50% paid
      dueOffsetDays: 7, // Lancar
      preferredMethod: 'virtual_account',
    },

    // === KEZIA WILIANTI: Mixed Overdue & Current ===
    {
      id: 'cust-006',
      customerId: 'CUST-006',
      contractCode: `AR-${year}-006`,
      assignedAdminUsername: 'kezia',
      name: 'Dewi Lestari Putri',
      company: 'Butik & Konveksi Griya Cantik',
      phone: '0857-2189-3340',
      address: 'Jl. Malioboro Selatan No. 27, Yogyakarta',
      creditDescription: '6 Unit Mesin Jahit Industri High-Speed',
      creditLimit: 25_000_000,
      totalCreditAmount: 24_000_000,
      installmentCount: 12,
      paidCount: 5,
      dueOffsetDays: -11, // Menunggak
      preferredMethod: 'qris',
    },
    {
      id: 'cust-007',
      customerId: 'CUST-007',
      contractCode: `AR-${year}-007`,
      assignedAdminUsername: 'kezia',
      name: 'Rina Kusuma Wardhani',
      company: 'Klinik Gigi Senyum Prima',
      phone: '0818-0944-5521',
      address: 'Jl. Teuku Umar No. 89, Denpasar',
      creditDescription: 'Dental Chair & Unit Sterilisasi Medis',
      creditLimit: 75_000_000,
      totalCreditAmount: 60_000_000,
      installmentCount: 12,
      paidCount: 7,
      dueOffsetDays: 15, // Lancar
      preferredMethod: 'bank_transfer',
    },

    // === MELISSA OCTAVIANI: All Paid Off (100% Lunas) ===
    {
      id: 'cust-012',
      customerId: 'CUST-012',
      contractCode: `AR-${year}-012`,
      assignedAdminUsername: 'melissa',
      name: 'Yanto Wibowo',
      company: 'Toko Bangunan Karya Utama',
      phone: '0812-6670-4312',
      address: 'Jl. Slamet Riyadi No. 210, Solo',
      creditDescription: '2 Unit Mesin Potong Keramik & Genset',
      creditLimit: 20_000_000,
      totalCreditAmount: 15_000_000,
      installmentCount: 6,
      paidCount: 6, // 100% Lunas
      dueOffsetDays: null,
      preferredMethod: 'cash',
    },

    // === OLYVIA CHRYSTINA: All Not Paid Yet (0% Paid) ===
    {
      id: 'cust-008',
      customerId: 'CUST-008',
      contractCode: `AR-${year}-008`,
      assignedAdminUsername: 'olyvia',
      name: 'Fajar Nugroho',
      company: 'UD Sumber Rejeki Elektronik',
      phone: '0821-6510-7749',
      address: 'Jl. Pandanaran No. 33, Semarang',
      creditDescription: 'Stok Pendingin Ruangan & Display Showcase',
      creditLimit: 20_000_000,
      totalCreditAmount: 15_000_000,
      installmentCount: 6,
      paidCount: 0, // 0% paid
      dueOffsetDays: 23, // Lancar
      preferredMethod: 'cash',
    },
    {
      id: 'cust-013',
      customerId: 'CUST-013',
      contractCode: `AR-${year}-013`,
      assignedAdminUsername: 'olyvia',
      name: 'Putra Mahendra',
      company: 'Percetakan Digital Cepat Jaya',
      phone: '0852-9104-7721',
      address: 'Jl. Gajah Mada No. 88, Semarang',
      creditDescription: 'Mesin Cutting Sticker & Laminating Roll',
      creditLimit: 30_000_000,
      totalCreditAmount: 24_000_000,
      installmentCount: 12,
      paidCount: 0, // 0% paid, overdue
      dueOffsetDays: -6,
      preferredMethod: 'bank_transfer',
    },

    // === ALVIN: Paid Half (50% Paid) ===
    {
      id: 'cust-014',
      customerId: 'CUST-014',
      contractCode: `AR-${year}-014`,
      assignedAdminUsername: 'alvin',
      name: 'Ratna Dewi',
      company: 'Bakery & Pastry Aroma Manis',
      phone: '0819-3301-8854',
      address: 'Jl. Boulevard Raya Blok QA, Jakarta Utara',
      creditDescription: 'Deck Oven 2 Tingkat & Planetary Mixer',
      creditLimit: 40_000_000,
      totalCreditAmount: 30_000_000,
      installmentCount: 6,
      paidCount: 3, // 50% paid
      dueOffsetDays: 18, // Lancar
      preferredMethod: 'bank_transfer',
    },

    // === SUTINA: Multi-Invoice Customer (1 Paid Off + 1 Half Paid) ===
    {
      id: 'cust-015',
      customerId: 'CUST-015',
      contractCode: `AR-${year}-015`,
      assignedAdminUsername: 'sutina',
      name: 'Wijaya Kusuma',
      company: 'Katering Rasa Nusantara',
      phone: '0813-7745-2219',
      address: 'Jl. Kelapa Gading Boulevard No. 19, Jakarta Utara',
      creditDescription: 'Kompor Industri 6 Tungku & Exhaust Hood',
      creditLimit: 45_000_000,
      totalCreditAmount: 18_000_000,
      installmentCount: 6,
      paidCount: 6, // 100% Lunas
      dueOffsetDays: null,
      preferredMethod: 'bank_transfer',
    },
    {
      id: 'cust-015-inv2',
      customerId: 'CUST-015',
      contractCode: `AR-${year}-016`,
      assignedAdminUsername: 'sutina',
      name: 'Wijaya Kusuma',
      company: 'Katering Rasa Nusantara',
      phone: '0813-7745-2219',
      address: 'Jl. Kelapa Gading Boulevard No. 19, Jakarta Utara',
      creditDescription: '2 Unit Freezer Box 600L & Troli Stainless',
      creditLimit: 45_000_000,
      totalCreditAmount: 24_000_000,
      installmentCount: 6,
      paidCount: 3, // 50% Paid Half
      dueOffsetDays: 10, // Lancar
      preferredMethod: 'virtual_account',
    },

    // Note: COSMAS NAFRISIUS (cosmas) intentionally has 0 customers to demonstrate empty admin state!
  ];

  return blueprints.map((bp) => buildSeedCustomer(bp, receiptCounter, today));
}

export function generateDemoAuditLogs(): AuditLogEntry[] {
  const now = Date.now();
  const year = getTodayDate().getFullYear();
  return [
    {
      id: 'audit-seed-1',
      timestamp: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
      actorName: 'Fernando',
      actorUsername: 'fernando',
      actorRole: 'super_admin',
      action: 'update_credit_limit',
      target: `Rina Kusuma Wardhani (AR-${year}-007)`,
      details: 'Menyetujui kenaikan limit kredit menjadi Rp 75.000.000',
    },
    {
      id: 'audit-seed-2',
      timestamp: new Date(now - 1000 * 60 * 60 * 22).toISOString(),
      actorName: 'Julie Choo',
      actorUsername: 'julie',
      actorRole: 'admin',
      action: 'create_customer',
      target: `Budi Santoso (AR-${year}-009)`,
      details: 'Menambahkan invoice ke-2 untuk pelanggan Budi Santoso sebesar Rp 12.000.000 (Tenor 6x)',
    },
    {
      id: 'audit-seed-3',
      timestamp: new Date(now - 1000 * 60 * 60 * 16).toISOString(),
      actorName: 'Atika Rahmah',
      actorUsername: 'atika',
      actorRole: 'admin',
      action: 'record_payment',
      target: `Darmawan Pratama (AR-${year}-002)`,
      details: 'Mencatat pelunasan Angsuran ke-6 sebesar Rp 3.500.000 via Transfer Bank (Status: LUNAS)',
    },
    {
      id: 'audit-seed-4',
      timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      actorName: 'Kezia Wilianti',
      actorUsername: 'kezia',
      actorRole: 'admin',
      action: 'record_payment',
      target: `Rina Kusuma Wardhani (AR-${year}-007)`,
      details: 'Mencatat Angsuran ke-7 sebesar Rp 5.000.000 via Transfer Bank (Bukti transfer terlampir)',
    },
    {
      id: 'audit-seed-5',
      timestamp: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      actorName: 'Evelina Magdalene',
      actorUsername: 'evelina',
      actorRole: 'admin',
      action: 'create_customer',
      target: `Kartika Sari (AR-${year}-011)`,
      details: 'Menambahkan kredit baru Rp 18.000.000 (Tenor 6x, belum ada pembayaran)',
    },
    {
      id: 'audit-seed-6',
      timestamp: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      actorName: 'Melissa Octaviani',
      actorUsername: 'melissa',
      actorRole: 'admin',
      action: 'record_payment',
      target: `Yanto Wibowo (AR-${year}-012)`,
      details: 'Mencatat pelunasan Angsuran ke-6 sebesar Rp 2.500.000 via Tunai (Status: LUNAS)',
    },
    {
      id: 'audit-seed-7',
      timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      actorName: 'Jelice Denny Cia',
      actorUsername: 'jelice',
      actorRole: 'admin',
      action: 'record_payment',
      target: `Agus Setiawan (AR-${year}-005)`,
      details: 'Mencatat Angsuran ke-6 sebesar Rp 4.000.000 via Virtual Account (50% terbayar)',
    },
    {
      id: 'audit-seed-8',
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      actorName: 'Alvin',
      actorUsername: 'alvin',
      actorRole: 'admin',
      action: 'record_payment',
      target: `Ratna Dewi (AR-${year}-014)`,
      details: 'Mencatat Angsuran ke-3 sebesar Rp 5.000.000 via Transfer Bank (50% terbayar)',
    },
    {
      id: 'audit-seed-9',
      timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
      actorName: 'Olyvia Chrystina',
      actorUsername: 'olyvia',
      actorRole: 'admin',
      action: 'create_customer',
      target: `Putra Mahendra (AR-${year}-013)`,
      details: 'Menambahkan kredit baru Rp 24.000.000 (Tenor 12x, belum ada pembayaran)',
    },
  ];
}
