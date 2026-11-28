export type Language = 'id' | 'en';

export type ARStatus = 'overdue' | 'due_tomorrow' | 'current' | 'paid_off';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'virtual_account' | 'qris';

export type UserRole = 'admin' | 'super_admin';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  title: string;
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  installmentNumber: number;
  date: string; // YYYY-MM-DD (local date)
  amount: number;
  remainingBalanceAfter: number;
  method: PaymentMethod;
  notes?: string;
  transferProofDataUrl?: string;
  transferProofName?: string;
}

export interface CustomerAR {
  id: string;
  customerId: string; // Shared identity across multiple invoices of the same customer (e.g., CUST-001)
  contractCode: string; // Invoice / contract number (e.g., AR-2026-001)
  assignedAdminUsername: string; // Admin PIC managing this account (e.g., admin1)
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  creditLimit: number;
  totalCreditAmount: number;
  installmentCount: number; // e.g., 6, 12, 18
  monthlyInstallment: number;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string | null; // YYYY-MM-DD, null when paid off
  payments: PaymentRecord[];
}

export interface NewCustomerInput {
  existingCustomerId?: string;
  assignedAdminUsername?: string;
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  creditLimit: number;
  totalCreditAmount: number;
  installmentCount: number;
  firstDueDate: string; // YYYY-MM-DD
}

export interface NewAdminInput {
  name: string;
  username: string;
  password: string;
  title: string;
}

export interface EditCustomerInput {
  name: string;
  company?: string;
  phone: string;
  address: string;
  creditDescription: string;
  creditLimit: number;
  nextDueDate: string | null;
}

export interface RecordPaymentInput {
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  notes?: string;
  transferProofDataUrl?: string;
  transferProofName?: string;
}

export interface ActiveReceipt {
  customer: CustomerAR;
  payment: PaymentRecord;
}

export type AuditAction =
  | 'create_customer'
  | 'edit_customer'
  | 'delete_customer'
  | 'record_payment'
  | 'update_credit_limit'
  | 'create_admin'
  | 'export_excel'
  | 'reset_demo'
  | 'login'
  | 'logout';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  actorName: string;
  actorUsername: string;
  actorRole: UserRole;
  action: AuditAction;
  target: string;
  details: string;
}

export type ActiveView = 'dashboard' | 'simulator' | 'audit' | 'self_check' | 'faq';

export interface SimulatorPrefill {
  totalCreditAmount: number;
  installmentCount: number;
  creditDescription?: string;
}
