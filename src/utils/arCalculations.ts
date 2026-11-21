import { ARStatus, CustomerAR, PaymentRecord, RecordPaymentInput } from '../types';
import { addMonthsSafe, diffInCalendarDays, generateReceiptNo, getTodayDate } from './formatters';

export function getTotalPaid(customer: CustomerAR): number {
  return customer.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function getRemainingBalance(customer: CustomerAR): number {
  return Math.max(0, customer.totalCreditAmount - getTotalPaid(customer));
}

export function getPaymentProgressPercent(customer: CustomerAR): number {
  if (customer.totalCreditAmount <= 0) return 100;
  return Math.min(100, Math.round((getTotalPaid(customer) / customer.totalCreditAmount) * 100));
}

export function getNextInstallmentNumber(customer: CustomerAR): number {
  const maxRecorded = customer.payments.reduce((max, p) => Math.max(max, p.installmentNumber), 0);
  return maxRecorded + 1;
}

export function getSuggestedInstallmentAmount(customer: CustomerAR): number {
  const remaining = getRemainingBalance(customer);
  if (remaining <= 0) return 0;
  return Math.min(customer.monthlyInstallment, remaining);
}

/**
 * Dynamically compute AR status relative to today's local date:
 * - remainingBalance === 0 -> 'paid_off' (Lunas)
 * - nextDueDate < today -> 'overdue' (Menunggak)
 * - nextDueDate === today + 1 day -> 'due_tomorrow' (Jatuh Tempo H-1)
 * - otherwise -> 'current' (Lancar)
 */
export function computeCustomerStatus(customer: CustomerAR, today: Date = getTodayDate()): ARStatus {
  const remaining = getRemainingBalance(customer);
  if (remaining <= 0 || !customer.nextDueDate) {
    return 'paid_off';
  }
  const diff = diffInCalendarDays(customer.nextDueDate, today);
  if (diff < 0) {
    return 'overdue';
  }
  if (diff === 1) {
    return 'due_tomorrow';
  }
  return 'current';
}

/**
 * Status priority for default sorting: Overdue -> Due Tomorrow -> Current -> Paid Off
 */
export function getStatusSortWeight(status: ARStatus): number {
  switch (status) {
    case 'overdue':
      return 0;
    case 'due_tomorrow':
      return 1;
    case 'current':
      return 2;
    case 'paid_off':
      return 3;
  }
}

/**
 * Record a new payment with automatic installment detection, remaining balance calculation,
 * next due date advancement (+1 month), and automatic paid-off transition when balance reaches 0.
 */
export function recordCustomerPayment(
  customer: CustomerAR,
  input: RecordPaymentInput,
  existingReceiptCount: number
): { updatedCustomer: CustomerAR; newPayment: PaymentRecord } {
  const currentRemaining = getRemainingBalance(customer);
  const clampedAmount = Math.max(0, Math.min(Math.round(input.amount), currentRemaining));
  const nextInstallmentNo = getNextInstallmentNumber(customer);
  const remainingAfter = Math.max(0, currentRemaining - clampedAmount);

  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    receiptNo: generateReceiptNo(input.date, existingReceiptCount + 1),
    installmentNumber: nextInstallmentNo,
    date: input.date,
    amount: clampedAmount,
    remainingBalanceAfter: remainingAfter,
    method: input.method,
    notes: input.notes?.trim() || undefined,
  };

  let nextDueDate: string | null = null;
  if (remainingAfter > 0) {
    const baseDue = customer.nextDueDate || input.date;
    nextDueDate = addMonthsSafe(baseDue, 1);
  }

  const updatedCustomer: CustomerAR = {
    ...customer,
    nextDueDate,
    payments: [...customer.payments, newPayment],
  };

  return { updatedCustomer, newPayment };
}
