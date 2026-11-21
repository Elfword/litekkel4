import { Language } from '../types';

/**
 * Format an amount in Indonesian Rupiah (Rp 12.500.000)
 */
export function formatIDR(amount: number): string {
  const rounded = Math.round(amount);
  const absFormatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  return rounded < 0 ? `-Rp ${absFormatted}` : `Rp ${absFormatted}`;
}

/**
 * Return local calendar date string YYYY-MM-DD for a Date object
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get today's local date at midnight
 */
export function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Parse YYYY-MM-DD into a local Date at midnight (avoids UTC offset bugs)
 */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Add days to a Date or YYYY-MM-DD string and return YYYY-MM-DD
 */
export function addDays(base: Date | string, days: number): string {
  const date = typeof base === 'string' ? parseISODate(base) : new Date(base.getFullYear(), base.getMonth(), base.getDate());
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/**
 * Safely add months to a YYYY-MM-DD date (clamps day-of-month, e.g., Jan 31 + 1m -> Feb 28)
 */
export function addMonthsSafe(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const targetMonthIndex = (m - 1) + months;
  const targetYear = y + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const clampedDay = Math.min(d, daysInTargetMonth);
  return toISODate(new Date(targetYear, normalizedMonth, clampedDay));
}

/**
 * Calendar day difference: (target - base) in whole days
 */
export function diffInCalendarDays(targetISO: string, base: Date = getTodayDate()): number {
  const target = parseISODate(targetISO);
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcBase = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  return Math.round((utcTarget - utcBase) / (1000 * 60 * 60 * 24));
}

/**
 * Format YYYY-MM-DD into readable localized date
 */
export function formatDisplayDate(iso: string | null, lang: Language, style: 'medium' | 'long' = 'medium'): string {
  if (!iso) return '—';
  const date = parseISODate(iso);
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Normalize Indonesian phone number to international format without '+' for wa.me links
 */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

/**
 * Build pre-filled wa.me link for polite payment reminders
 */
export function buildWhatsAppReminderUrl(params: {
  phone: string;
  customerName: string;
  installmentNumber: number;
  totalInstallments: number;
  amountDue: number;
  dueDateISO: string;
  creditDescription: string;
  lang: Language;
  isOverdue?: boolean;
}): string {
  const waPhone = normalizeWhatsAppPhone(params.phone);
  const formattedAmount = formatIDR(params.amountDue);
  const formattedDate = formatDisplayDate(params.dueDateISO, params.lang, 'long');

  let message: string;
  if (params.lang === 'id') {
    if (params.isOverdue) {
      message = [
        `Halo Bapak/Ibu ${params.customerName},`,
        '',
        `Kami dari tim Keuangan PT LiteKai Finansial Nusantara ingin menginformasikan bahwa pembayaran kredit (${params.creditDescription}) Anda telah melewati tanggal jatuh tempo:`,
        '',
        `• Angsuran: Angsuran ke-${params.installmentNumber} dari ${params.totalInstallments}`,
        `• Nominal Tagihan: ${formattedAmount}`,
        `• Tanggal Jatuh Tempo: ${formattedDate}`,
        '',
        `Mohon kesediaannya untuk segera menyelesaikan pembayaran tersebut. Apabila Bapak/Ibu sudah melakukan pembayaran, mohon kirimkan bukti transfer agar dapat segera kami catat dan terbitkan kwitansinya.`,
        '',
        `Terima kasih atas kerja sama Anda.`,
      ].join('\n');
    } else {
      message = [
        `Halo Bapak/Ibu ${params.customerName},`,
        '',
        `Salam hangat dari PT LiteKai Finansial Nusantara. Melalui pesan ini kami mengingatkan dengan hormat mengenai jadwal jatuh tempo pembayaran kredit (${params.creditDescription}) Anda besok:`,
        '',
        `• Angsuran: Angsuran ke-${params.installmentNumber} dari ${params.totalInstallments}`,
        `• Nominal Tagihan: ${formattedAmount}`,
        `• Tanggal Jatuh Tempo: ${formattedDate}`,
        '',
        `Mohon dapat melakukan pembayaran tepat waktu. Jika pembayaran sudah dilakukan, silakan abaikan pesan ini atau kirimkan bukti transfer Anda.`,
        '',
        `Terima kasih atas kepercayaan dan kerja sama Anda.`,
      ].join('\n');
    }
  } else {
    if (params.isOverdue) {
      message = [
        `Dear ${params.customerName},`,
        '',
        `This is a polite notice from PT LiteKai Finansial Nusantara Finance Team regarding your overdue installment for (${params.creditDescription}):`,
        '',
        `• Installment: Installment #${params.installmentNumber} of ${params.totalInstallments}`,
        `• Amount Due: ${formattedAmount}`,
        `• Due Date: ${formattedDate}`,
        '',
        `Kindly arrange payment at your earliest convenience. If you have already made this payment, please share the transfer proof so we can update your account and issue your receipt.`,
        '',
        `Thank you for your prompt attention.`,
      ].join('\n');
    } else {
      message = [
        `Dear ${params.customerName},`,
        '',
        `Warm greetings from PT LiteKai Finansial Nusantara. This is a friendly reminder that your installment for (${params.creditDescription}) is due tomorrow:`,
        '',
        `• Installment: Installment #${params.installmentNumber} of ${params.totalInstallments}`,
        `• Amount Due: ${formattedAmount}`,
        `• Due Date: ${formattedDate}`,
        '',
        `Kindly complete your payment on time. If you have already paid, please disregard this message or reply with your payment confirmation.`,
        '',
        `Thank you for your continued partnership.`,
      ].join('\n');
    }
  }

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Convert integer Rupiah amount into Indonesian "Terbilang" words
 */
export function numberToIndonesianWords(n: number): string {
  const num = Math.round(Math.abs(n));
  if (num === 0) return 'Nol Rupiah';

  const units = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  const convert = (val: number): string => {
    if (val < 12) return units[val];
    if (val < 20) return `${convert(val - 10)} Belas`;
    if (val < 100) return `${convert(Math.floor(val / 10))} Puluh${val % 10 ? ` ${convert(val % 10)}` : ''}`;
    if (val < 200) return `Seratus${val - 100 ? ` ${convert(val - 100)}` : ''}`;
    if (val < 1000) return `${convert(Math.floor(val / 100))} Ratus${val % 100 ? ` ${convert(val % 100)}` : ''}`;
    if (val < 2000) return `Seribu${val - 1000 ? ` ${convert(val - 1000)}` : ''}`;
    if (val < 1_000_000) {
      return `${convert(Math.floor(val / 1000))} Ribu${val % 1000 ? ` ${convert(val % 1000)}` : ''}`;
    }
    if (val < 1_000_000_000) {
      return `${convert(Math.floor(val / 1_000_000))} Juta${val % 1_000_000 ? ` ${convert(val % 1_000_000)}` : ''}`;
    }
    return `${convert(Math.floor(val / 1_000_000_000))} Miliar${val % 1_000_000_000 ? ` ${convert(val % 1_000_000_000)}` : ''}`;
  };

  return `${convert(num).trim()} Rupiah`;
}

/**
 * Convert integer Rupiah amount into formal English words
 */
export function numberToEnglishWords(n: number): string {
  const num = Math.round(Math.abs(n));
  if (num === 0) return 'Zero Rupiah';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (val: number): string => {
    if (val < 20) return ones[val];
    if (val < 100) return `${tens[Math.floor(val / 10)]}${val % 10 ? `-${ones[val % 10]}` : ''}`;
    if (val < 1000) return `${ones[Math.floor(val / 100)]} Hundred${val % 100 ? ` ${convert(val % 100)}` : ''}`;
    if (val < 1_000_000) {
      return `${convert(Math.floor(val / 1000))} Thousand${val % 1000 ? ` ${convert(val % 1000)}` : ''}`;
    }
    if (val < 1_000_000_000) {
      return `${convert(Math.floor(val / 1_000_000))} Million${val % 1_000_000 ? ` ${convert(val % 1_000_000)}` : ''}`;
    }
    return `${convert(Math.floor(val / 1_000_000_000))} Billion${val % 1_000_000_000 ? ` ${convert(val % 1_000_000_000)}` : ''}`;
  };

  return `${convert(num).trim()} Rupiah`;
}

export function amountInWords(amount: number, lang: Language): string {
  return lang === 'id' ? numberToIndonesianWords(amount) : numberToEnglishWords(amount);
}

/**
 * Generate a clean formal receipt number like KWT-202611-0142
 */
export function generateReceiptNo(dateISO: string, sequenceHint?: number): string {
  const compactDate = dateISO.replace(/-/g, '').slice(0, 6);
  const suffix = sequenceHint
    ? String(sequenceHint).padStart(4, '0')
    : String(Math.floor(1000 + Math.random() * 9000));
  return `KWT-${compactDate}-${suffix}`;
}
