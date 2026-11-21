import { ARStatus, Language, PaymentMethod } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  companyLegalName: string;
  companyAddress: string;
  companyContact: string;
  nav: {
    addCustomer: string;
    resetDemo: string;
    resetConfirmTitle: string;
    resetConfirmDesc: string;
    cancel: string;
    confirmReset: string;
    todayLabel: string;
  };
  h1Alert: {
    badge: string;
    title: string;
    subtitle: string;
    allClearTitle: string;
    allClearDesc: string;
    sendWhatsApp: string;
    payNow: string;
    installmentOf: (current: number, total: number) => string;
    dueTomorrowDate: (date: string) => string;
    totalDueTomorrow: string;
  };
  kpi: {
    activeReceivables: string;
    activeCustomersCount: (count: number) => string;
    dueTomorrow: string;
    dueTomorrowSub: (count: number) => string;
    overdue: string;
    overdueSub: (count: number) => string;
    paidOff: string;
    paidOffSub: (count: number) => string;
    clickToFilter: string;
  };
  statuses: Record<ARStatus, string>;
  paymentMethods: Record<PaymentMethod, string>;
  table: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    sortLabel: string;
    sortPriority: string;
    sortDueDate: string;
    sortBalanceDesc: string;
    sortNameAsc: string;
    colCustomer: string;
    colItem: string;
    colProgress: string;
    colRemaining: string;
    colNextDue: string;
    colStatus: string;
    colActions: string;
    installmentProgress: (paid: number, total: number) => string;
    viewCard: string;
    recordPay: string;
    whatsappReminder: string;
    emptyTitle: string;
    emptyDesc: string;
    clearFilters: string;
    daysOverdue: (days: number) => string;
    dueTomorrowTag: string;
    dueTodayTag: string;
    inDaysTag: (days: number) => string;
    settledTag: string;
  };
  arCard: {
    title: string;
    backToDashboard: string;
    contractNo: string;
    totalCredit: string;
    totalPaid: string;
    remainingBalance: string;
    installmentPlan: string;
    perMonth: string;
    nextDueDate: string;
    repaymentProgress: string;
    recordPaymentBtn: string;
    sendWhatsAppBtn: string;
    accountPaidOffBanner: string;
    paymentHistoryTitle: string;
    paymentHistoryCount: (count: number) => string;
    noPaymentsYet: string;
    colInstallment: string;
    colDate: string;
    colReceiptNo: string;
    colMethod: string;
    colAmount: string;
    colBalanceAfter: string;
    colReceipt: string;
    installmentLabel: (num: number) => string;
    printReceiptBtn: string;
    close: string;
  };
  paymentForm: {
    title: string;
    autoDetectedBadge: (next: number, total: number) => string;
    amountLabel: string;
    standardHint: (amount: string) => string;
    useStandardBtn: string;
    payFullBtn: string;
    dateLabel: string;
    methodLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    previewAfterTitle: string;
    newRemainingLabel: string;
    nextDueAfterLabel: string;
    willBePaidOff: string;
    partialPaymentNotice: string;
    submitBtn: string;
    cancelBtn: string;
    errorInvalidAmount: string;
    errorExceedsBalance: string;
  };
  addCustomerModal: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    totalAmountLabel: string;
    tenorLabel: string;
    tenorOption: (months: number) => string;
    firstDueDateLabel: string;
    autoCalcTitle: string;
    estimatedMonthlyLabel: string;
    submitBtn: string;
    cancelBtn: string;
    requiredError: string;
  };
  receipt: {
    documentTitle: string;
    documentSubtitle: string;
    paidStamp: string;
    settledStamp: string;
    receiptNo: string;
    paymentDate: string;
    contractNo: string;
    receivedFrom: string;
    paymentFor: string;
    installmentDetail: (num: number, total: number) => string;
    paymentMethod: string;
    notes: string;
    amountPaid: string;
    amountInWords: string;
    remainingBalance: string;
    paidOffNote: string;
    receivedBy: string;
    paidBy: string;
    financeAdmin: string;
    customerRole: string;
    footerNote: string;
    printBtn: string;
    closeBtn: string;
  };
  toast: {
    paymentRecorded: (receiptNo: string) => string;
    customerAdded: (name: string) => string;
    demoReset: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    appName: 'LiteKai AR',
    appSubtitle: 'Manajemen Kredit & Piutang Usaha',
    companyLegalName: 'PT LITEKAI FINANSIAL NUSANTARA',
    companyAddress: 'Menara Sudirman Lt. 12, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan 12190',
    companyContact: 'Telp: (021) 5088-4200 • Email: finance@litekai.co.id',
    nav: {
      addCustomer: 'Tambah Kredit',
      resetDemo: 'Reset Data Demo',
      resetConfirmTitle: 'Reset Data Demo?',
      resetConfirmDesc:
        'Semua perubahan pelanggan dan pembayaran yang Anda buat akan dikembalikan ke 8 data demo awal dengan tanggal jatuh tempo terbaru relatif terhadap hari ini.',
      cancel: 'Batal',
      confirmReset: 'Ya, Reset Data',
      todayLabel: 'Hari ini',
    },
    h1Alert: {
      badge: 'Pengingat Otomatis H-1',
      title: 'Jatuh Tempo Besok (H-1)',
      subtitle: 'Kirim pengingat WhatsApp satu klik agar pembayaran masuk tepat waktu.',
      allClearTitle: 'Semua Pengingat H-1 Sudah Tertangani',
      allClearDesc: 'Tidak ada tagihan yang jatuh tempo besok. Pantauan piutang Anda dalam kondisi aman.',
      sendWhatsApp: 'Kirim Pengingat WhatsApp',
      payNow: 'Catat Bayar',
      installmentOf: (current, total) => `Angsuran ke-${current} dari ${total}`,
      dueTomorrowDate: (date) => `Jatuh tempo: ${date}`,
      totalDueTomorrow: 'Total tagihan besok',
    },
    kpi: {
      activeReceivables: 'Total Piutang Aktif',
      activeCustomersCount: (count) => `${count} akun kredit aktif`,
      dueTomorrow: 'Jatuh Tempo H-1',
      dueTomorrowSub: (count) => `${count} pelanggan jatuh tempo besok`,
      overdue: 'Menunggak',
      overdueSub: (count) => `${count} pelanggan lewat jatuh tempo`,
      paidOff: 'Lunas',
      paidOffSub: (count) => `${count} akun telah lunas penuh`,
      clickToFilter: 'Klik untuk filter',
    },
    statuses: {
      current: 'Lancar',
      due_tomorrow: 'Jatuh Tempo H-1',
      overdue: 'Menunggak',
      paid_off: 'Lunas',
    },
    paymentMethods: {
      bank_transfer: 'Transfer Bank',
      virtual_account: 'Virtual Account',
      cash: 'Tunai',
      qris: 'QRIS',
    },
    table: {
      title: 'Pantauan Status Piutang Pelanggan',
      subtitle: 'Klik baris pelanggan untuk membuka Kartu AR Digital, mencatat angsuran, atau mencetak kwitansi.',
      searchPlaceholder: 'Cari nama pelanggan, kode kontrak, usaha, atau no. HP...',
      filterAll: 'Semua',
      sortLabel: 'Urutkan',
      sortPriority: 'Prioritas Status',
      sortDueDate: 'Jatuh Tempo Terdekat',
      sortBalanceDesc: 'Sisa Piutang Tertinggi',
      sortNameAsc: 'Nama (A–Z)',
      colCustomer: 'Pelanggan',
      colItem: 'Fasilitas / Item Kredit',
      colProgress: 'Progres Angsuran',
      colRemaining: 'Sisa Piutang',
      colNextDue: 'Jatuh Tempo Berikutnya',
      colStatus: 'Status',
      colActions: 'Aksi',
      installmentProgress: (paid, total) => `${paid} / ${total} angsuran`,
      viewCard: 'Kartu AR',
      recordPay: 'Bayar',
      whatsappReminder: 'Pengingat WA',
      emptyTitle: 'Tidak ada data pelanggan yang cocok',
      emptyDesc: 'Coba ubah kata kunci pencarian atau pilih filter status lainnya.',
      clearFilters: 'Tampilkan Semua',
      daysOverdue: (days) => `Terlambat ${days} hari`,
      dueTomorrowTag: 'Besok (H-1)',
      dueTodayTag: 'Hari ini',
      inDaysTag: (days) => `${days} hari lagi`,
      settledTag: 'Sudah Lunas',
    },
    arCard: {
      title: 'Kartu AR Digital',
      backToDashboard: 'Kembali ke Pantauan Piutang',
      contractNo: 'No. Kontrak',
      totalCredit: 'Total Kredit',
      totalPaid: 'Total Terbayar',
      remainingBalance: 'Sisa Piutang',
      installmentPlan: 'Rencana Angsuran',
      perMonth: '/ bln',
      nextDueDate: 'Jatuh Tempo Berikutnya',
      repaymentProgress: 'Progres Pelunasan',
      recordPaymentBtn: 'Catat Pembayaran',
      sendWhatsAppBtn: 'Hubungi WhatsApp',
      accountPaidOffBanner: 'Seluruh kewajiban kredit pada akun ini telah LUNAS.',
      paymentHistoryTitle: 'Riwayat Pembayaran Angsuran',
      paymentHistoryCount: (count) => `${count} transaksi tercatat`,
      noPaymentsYet: 'Belum ada pembayaran yang tercatat untuk pelanggan ini.',
      colInstallment: 'Angsuran',
      colDate: 'Tanggal',
      colReceiptNo: 'No. Kwitansi',
      colMethod: 'Metode',
      colAmount: 'Nominal Bayar',
      colBalanceAfter: 'Sisa Saldo',
      colReceipt: 'Kwitansi',
      installmentLabel: (num) => `Angsuran ke-${num}`,
      printReceiptBtn: 'Cetak Kwitansi',
      close: 'Tutup',
    },
    paymentForm: {
      title: 'Catat Pembayaran Angsuran',
      autoDetectedBadge: (next, total) => `Terdeteksi Otomatis: Angsuran ke-${next} dari ${total}`,
      amountLabel: 'Nominal Pembayaran (Rp)',
      standardHint: (amount) => `Angsuran standar: ${amount} (dapat diubah untuk bayar sebagian / pelunasan)`,
      useStandardBtn: 'Angsuran Standar',
      payFullBtn: 'Lunasi Semua',
      dateLabel: 'Tanggal Pembayaran',
      methodLabel: 'Metode Pembayaran',
      notesLabel: 'Catatan (Opsional)',
      notesPlaceholder: 'Contoh: Transfer BCA a.n. Budi, ref #8821',
      previewAfterTitle: 'Simulasi Saldo Setelah Pembayaran',
      newRemainingLabel: 'Sisa Piutang Baru',
      nextDueAfterLabel: 'Jatuh Tempo Berikutnya (+1 bln)',
      willBePaidOff: 'LUNAS (Status berubah otomatis menjadi Lunas)',
      partialPaymentNotice: 'Pembayaran sebagian — sisa saldo disesuaikan otomatis.',
      submitBtn: 'Simpan & Cetak Kwitansi',
      cancelBtn: 'Batal',
      errorInvalidAmount: 'Masukkan nominal pembayaran yang valid (lebih dari Rp 0).',
      errorExceedsBalance: 'Nominal tidak boleh melebihi sisa piutang saat ini.',
    },
    addCustomerModal: {
      title: 'Tambah Pelanggan & Kredit Baru',
      subtitle: 'Buat catatan Kartu AR Digital baru dengan perhitungan cicilan otomatis.',
      nameLabel: 'Nama Lengkap Pelanggan',
      namePlaceholder: 'Contoh: Andi Wijaya',
      companyLabel: 'Nama Usaha / Perusahaan (Opsional)',
      companyPlaceholder: 'Contoh: CV Maju Bersama',
      phoneLabel: 'Nomor WhatsApp',
      phonePlaceholder: 'Contoh: 0812-3456-7890',
      addressLabel: 'Alamat',
      addressPlaceholder: 'Jl. Merdeka No. 10, Jakarta',
      descriptionLabel: 'Keterangan Kredit / Barang',
      descriptionPlaceholder: 'Contoh: Pengadaan 2 Unit Komputer Kasir POS',
      totalAmountLabel: 'Total Nilai Kredit (Rp)',
      tenorLabel: 'Tenor / Jumlah Angsuran',
      tenorOption: (months) => `${months}x Angsuran (${months} Bulan)`,
      firstDueDateLabel: 'Tanggal Jatuh Tempo Pertama',
      autoCalcTitle: 'Kalkulasi Angsuran Otomatis',
      estimatedMonthlyLabel: 'Estimasi Angsuran per Bulan',
      submitBtn: 'Simpan Kartu AR',
      cancelBtn: 'Batal',
      requiredError: 'Mohon lengkapi semua kolom wajib dengan nilai yang valid.',
    },
    receipt: {
      documentTitle: 'KWITANSI PEMBAYARAN',
      documentSubtitle: 'Bukti Penerimaan Angsuran Piutang Resmi',
      paidStamp: 'DITERIMA',
      settledStamp: 'LUNAS',
      receiptNo: 'No. Kwitansi',
      paymentDate: 'Tanggal Pembayaran',
      contractNo: 'No. Kontrak AR',
      receivedFrom: 'Telah Diterima Dari',
      paymentFor: 'Untuk Pembayaran',
      installmentDetail: (num, total) => `Angsuran ke-${num} dari ${total}`,
      paymentMethod: 'Metode Pembayaran',
      notes: 'Catatan',
      amountPaid: 'Jumlah Dibayar',
      amountInWords: 'Terbilang',
      remainingBalance: 'Sisa Piutang',
      paidOffNote: 'Rp 0 — LUNAS',
      receivedBy: 'Penerima / Bagian Keuangan',
      paidBy: 'Penyetor / Pelanggan',
      financeAdmin: 'Admin Keuangan LiteKai',
      customerRole: 'Pelanggan',
      footerNote: 'Kwitansi ini diterbitkan secara elektronik oleh Sistem Manajemen Piutang LiteKai AR dan merupakan bukti pembayaran yang sah.',
      printBtn: 'Cetak Kwitansi',
      closeBtn: 'Tutup',
    },
    toast: {
      paymentRecorded: (receiptNo) => `Pembayaran berhasil dicatat (${receiptNo}).`,
      customerAdded: (name) => `Kartu AR untuk ${name} berhasil dibuat.`,
      demoReset: 'Data demo berhasil diatur ulang ke kondisi awal.',
    },
  },
  en: {
    appName: 'LiteKai AR',
    appSubtitle: 'Credit & Accounts Receivable Management',
    companyLegalName: 'PT LITEKAI FINANSIAL NUSANTARA',
    companyAddress: 'Menara Sudirman 12th Fl., Jl. Jend. Sudirman Kav. 60, South Jakarta 12190',
    companyContact: 'Phone: (021) 5088-4200 • Email: finance@litekai.co.id',
    nav: {
      addCustomer: 'Add New Credit',
      resetDemo: 'Reset Demo Data',
      resetConfirmTitle: 'Reset Demo Data?',
      resetConfirmDesc:
        'All custom customer records and payments will be restored to the 8 initial demo accounts with due dates dynamically anchored to today.',
      cancel: 'Cancel',
      confirmReset: 'Yes, Reset Data',
      todayLabel: 'Today',
    },
    h1Alert: {
      badge: 'Auto H-1 Reminders',
      title: 'Due Tomorrow (H-1)',
      subtitle: 'Send a one-click polite WhatsApp reminder to keep collections on schedule.',
      allClearTitle: 'All H-1 Reminders Handled',
      allClearDesc: 'No installments are due tomorrow. Your receivables schedule is looking great.',
      sendWhatsApp: 'Send WhatsApp Reminder',
      payNow: 'Record Pay',
      installmentOf: (current, total) => `Installment ${current} of ${total}`,
      dueTomorrowDate: (date) => `Due date: ${date}`,
      totalDueTomorrow: 'Total due tomorrow',
    },
    kpi: {
      activeReceivables: 'Total Active Receivables',
      activeCustomersCount: (count) => `${count} active credit accounts`,
      dueTomorrow: 'Due Tomorrow (H-1)',
      dueTomorrowSub: (count) => `${count} customers due tomorrow`,
      overdue: 'Overdue',
      overdueSub: (count) => `${count} past-due accounts`,
      paidOff: 'Paid Off',
      paidOffSub: (count) => `${count} fully settled accounts`,
      clickToFilter: 'Click to filter',
    },
    statuses: {
      current: 'Current',
      due_tomorrow: 'Due Tomorrow',
      overdue: 'Overdue',
      paid_off: 'Paid Off',
    },
    paymentMethods: {
      bank_transfer: 'Bank Transfer',
      virtual_account: 'Virtual Account',
      cash: 'Cash',
      qris: 'QRIS',
    },
    table: {
      title: 'Accounts Receivable Ledger',
      subtitle: 'Click any customer row to open their Digital AR Card, record a payment, or print receipts.',
      searchPlaceholder: 'Search customer name, contract ID, business, or phone...',
      filterAll: 'All',
      sortLabel: 'Sort by',
      sortPriority: 'Status Priority',
      sortDueDate: 'Nearest Due Date',
      sortBalanceDesc: 'Highest Balance',
      sortNameAsc: 'Name (A–Z)',
      colCustomer: 'Customer',
      colItem: 'Credit Facility / Item',
      colProgress: 'Installment Progress',
      colRemaining: 'Remaining Balance',
      colNextDue: 'Next Due Date',
      colStatus: 'Status',
      colActions: 'Actions',
      installmentProgress: (paid, total) => `${paid} / ${total} installments`,
      viewCard: 'AR Card',
      recordPay: 'Pay',
      whatsappReminder: 'WA Reminder',
      emptyTitle: 'No matching customer records found',
      emptyDesc: 'Try adjusting your search query or switching the status filter.',
      clearFilters: 'Show All',
      daysOverdue: (days) => `${days}d overdue`,
      dueTomorrowTag: 'Tomorrow (H-1)',
      dueTodayTag: 'Due today',
      inDaysTag: (days) => `In ${days} days`,
      settledTag: 'Settled',
    },
    arCard: {
      title: 'Digital AR Card',
      backToDashboard: 'Back to Receivables Dashboard',
      contractNo: 'Contract No.',
      totalCredit: 'Total Credit',
      totalPaid: 'Total Paid',
      remainingBalance: 'Remaining Balance',
      installmentPlan: 'Installment Plan',
      perMonth: '/ mo',
      nextDueDate: 'Next Due Date',
      repaymentProgress: 'Repayment Progress',
      recordPaymentBtn: 'Record Payment',
      sendWhatsAppBtn: 'Message on WhatsApp',
      accountPaidOffBanner: 'This credit account has been fully PAID OFF.',
      paymentHistoryTitle: 'Payment History',
      paymentHistoryCount: (count) => `${count} recorded transactions`,
      noPaymentsYet: 'No payments have been recorded for this customer yet.',
      colInstallment: 'Installment',
      colDate: 'Date',
      colReceiptNo: 'Receipt No.',
      colMethod: 'Method',
      colAmount: 'Amount Paid',
      colBalanceAfter: 'Balance After',
      colReceipt: 'Receipt',
      installmentLabel: (num) => `Installment #${num}`,
      printReceiptBtn: 'Print Receipt',
      close: 'Close',
    },
    paymentForm: {
      title: 'Record Installment Payment',
      autoDetectedBadge: (next, total) => `Auto-Detected: Installment #${next} of ${total}`,
      amountLabel: 'Payment Amount (Rp)',
      standardHint: (amount) => `Standard installment: ${amount} (editable for partial or full payoff)`,
      useStandardBtn: 'Standard Amount',
      payFullBtn: 'Pay Full Balance',
      dateLabel: 'Payment Date',
      methodLabel: 'Payment Method',
      notesLabel: 'Notes (Optional)',
      notesPlaceholder: 'e.g., BCA transfer ref #8821',
      previewAfterTitle: 'Projected Balance After Payment',
      newRemainingLabel: 'New Remaining Balance',
      nextDueAfterLabel: 'Next Due Date (+1 mo)',
      willBePaidOff: 'PAID OFF (Status updates automatically to Paid Off)',
      partialPaymentNotice: 'Partial payment — remaining balance adjusts automatically.',
      submitBtn: 'Record & Print Receipt',
      cancelBtn: 'Cancel',
      errorInvalidAmount: 'Please enter a valid payment amount greater than Rp 0.',
      errorExceedsBalance: 'Payment amount cannot exceed the current remaining balance.',
    },
    addCustomerModal: {
      title: 'Add New Customer & Credit',
      subtitle: 'Create a new Digital AR Card with automatic monthly installment calculation.',
      nameLabel: 'Customer Full Name',
      namePlaceholder: 'e.g., Andi Wijaya',
      companyLabel: 'Business / Company (Optional)',
      companyPlaceholder: 'e.g., CV Maju Bersama',
      phoneLabel: 'WhatsApp Number',
      phonePlaceholder: 'e.g., 0812-3456-7890',
      addressLabel: 'Address',
      addressPlaceholder: 'Jl. Merdeka No. 10, Jakarta',
      descriptionLabel: 'Credit Description / Item',
      descriptionPlaceholder: 'e.g., 2 Units POS Cashier Terminal',
      totalAmountLabel: 'Total Credit Amount (Rp)',
      tenorLabel: 'Installment Plan (Tenor)',
      tenorOption: (months) => `${months}x Installments (${months} Months)`,
      firstDueDateLabel: 'First Due Date',
      autoCalcTitle: 'Auto-Installment Calculation',
      estimatedMonthlyLabel: 'Estimated Monthly Installment',
      submitBtn: 'Create AR Card',
      cancelBtn: 'Cancel',
      requiredError: 'Please fill out all required fields with valid values.',
    },
    receipt: {
      documentTitle: 'PAYMENT RECEIPT',
      documentSubtitle: 'Official Installment Collection Receipt',
      paidStamp: 'PAID',
      settledStamp: 'PAID OFF',
      receiptNo: 'Receipt No.',
      paymentDate: 'Payment Date',
      contractNo: 'AR Contract No.',
      receivedFrom: 'Received From',
      paymentFor: 'Payment For',
      installmentDetail: (num, total) => `Installment #${num} of ${total}`,
      paymentMethod: 'Payment Method',
      notes: 'Notes',
      amountPaid: 'Amount Paid',
      amountInWords: 'Amount in Words',
      remainingBalance: 'Remaining Balance',
      paidOffNote: 'Rp 0 — PAID OFF',
      receivedBy: 'Received By / Cashier',
      paidBy: 'Paid By / Customer',
      financeAdmin: 'LiteKai Finance Admin',
      customerRole: 'Customer',
      footerNote: 'This receipt is electronically generated by LiteKai AR Management System and serves as an official proof of payment.',
      printBtn: 'Print Receipt',
      closeBtn: 'Close',
    },
    toast: {
      paymentRecorded: (receiptNo) => `Payment recorded successfully (${receiptNo}).`,
      customerAdded: (name) => `Digital AR Card created for ${name}.`,
      demoReset: 'Demo data has been reset to defaults.',
    },
  },
};
