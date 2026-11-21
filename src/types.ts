export type Language = 'id' | 'en';

export type ARStatus = 'overdue' | 'due_tomorrow' | 'current' | 'paid_off';

export type PaymentMethod = 'bank_transfer' | 'virtual_account' | 'cash' | 'qris';

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  installmentNumber: number;
  date: string; // YYYY-MM-DD (local date)
  amount: number;
  remainingBalanceAfter: number;
  method: PaymentMethod;
  notes?: string;
}

export interface CustomerAR {
  id: string;
  contractCode: string; // e.g., AR-2026-001
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  totalCreditAmount: number;
  installmentCount: number; // e.g., 6, 12, 18
  monthlyInstallment: number;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string | null; // YYYY-MM-DD, null when paid off
  payments: PaymentRecord[];
}

export interface NewCustomerInput {
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  totalCreditAmount: number;
  installmentCount: number;
  firstDueDate: string; // YYYY-MM-DD
}

export interface RecordPaymentInput {
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  notes?: string;
}

export interface ActiveReceipt {
  customer: CustomerAR;
  payment: PaymentRecord;
}
