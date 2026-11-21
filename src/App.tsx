import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  ActiveReceipt,
  ARStatus,
  CustomerAR,
  Language,
  NewCustomerInput,
  PaymentRecord,
  RecordPaymentInput,
} from './types';
import { translations } from './i18n/translations';
import { generateDemoCustomers } from './data/demoData';
import { computeCustomerStatus, recordCustomerPayment } from './utils/arCalculations';
import { getTodayDate, toISODate } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { DueTomorrowPanel } from './components/DueTomorrowPanel';
import { KpiCards } from './components/KpiCards';
import { CustomerTable } from './components/CustomerTable';
import { DigitalARCardModal } from './components/DigitalARCardModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { ReceiptModal } from './components/ReceiptModal';

const STORAGE_KEY_CUSTOMERS = 'litekai_ar_customers_v1';
const STORAGE_KEY_LANG = 'litekai_ar_lang_v1';

function loadInitialCustomers(): CustomerAR[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CustomerAR[];
      }
    }
  } catch {
    // Fall back to freshly generated demo records
  }
  const fresh = generateDemoCustomers();
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(fresh));
  } catch {
    // Ignore storage quota errors
  }
  return fresh;
}

function loadInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'id';
}

export function App() {
  const [lang, setLang] = useState<Language>(loadInitialLanguage);
  const [customers, setCustomers] = useState<CustomerAR[]>(loadInitialCustomers);
  const [statusFilter, setStatusFilter] = useState<ARStatus | 'all'>('all');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [autoOpenPaymentForm, setAutoOpenPaymentForm] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ActiveReceipt | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  // Persist customers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    } catch {
      // Ignore storage quota errors
    }
  }, [customers]);

  // Persist language preference and update document lang/title
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {
      // Ignore storage errors
    }
    document.documentElement.lang = lang;
    document.title =
      lang === 'id'
        ? 'LiteKai AR — Sistem Manajemen Kredit & Piutang'
        : 'LiteKai AR — Credit & Accounts Receivable Management';
  }, [lang]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const dueTomorrowCustomers = useMemo(
    () => customers.filter((c) => computeCustomerStatus(c) === 'due_tomorrow'),
    [customers]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const totalReceiptCount = useMemo(
    () => customers.reduce((sum, c) => sum + c.payments.length, 0),
    [customers]
  );

  const handleSelectCustomer = (customer: CustomerAR, autoOpenPayment = false) => {
    setSelectedCustomerId(customer.id);
    setAutoOpenPaymentForm(autoOpenPayment);
  };

  const handleRecordPayment = (customerId: string, input: RecordPaymentInput) => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    const { updatedCustomer, newPayment } = recordCustomerPayment(
      target,
      input,
      totalReceiptCount + 100
    );

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? updatedCustomer : c))
    );

    setAutoOpenPaymentForm(false);
    setActiveReceipt({ customer: updatedCustomer, payment: newPayment });
    setToastMessage(t.toast.paymentRecorded(newPayment.receiptNo));
  };

  const handleCreateCustomer = (input: NewCustomerInput) => {
    const today = getTodayDate();
    const year = today.getFullYear();
    const nextNumber = customers.length + 1;
    const contractCode = `AR-${year}-${String(nextNumber).padStart(3, '0')}`;
    const monthlyInstallment = Math.round(input.totalCreditAmount / input.installmentCount);

    const newCustomer: CustomerAR = {
      id: `cust-${Date.now()}`,
      contractCode,
      name: input.name,
      company: input.company,
      phone: input.phone,
      address: input.address,
      creditDescription: input.creditDescription,
      totalCreditAmount: input.totalCreditAmount,
      installmentCount: input.installmentCount,
      monthlyInstallment,
      startDate: toISODate(today),
      nextDueDate: input.firstDueDate,
      payments: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setToastMessage(t.toast.customerAdded(newCustomer.name));
  };

  const handleResetDemoData = () => {
    const fresh = generateDemoCustomers();
    setCustomers(fresh);
    setStatusFilter('all');
    setSelectedCustomerId(null);
    setActiveReceipt(null);
    setToastMessage(t.toast.demoReset);
  };

  const handlePrintReceipt = (customer: CustomerAR, payment: PaymentRecord) => {
    setActiveReceipt({ customer, payment });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:min-h-0 print:bg-white">
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onOpenAddCustomer={() => setAddModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        onBrandClick={() => {
          setSelectedCustomerId(null);
          setAutoOpenPaymentForm(false);
        }}
        t={t}
      />

      {/* Full-Width Main Container (hidden during @media print) */}
      <main className="no-print w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {selectedCustomer ? (
          /* Full-Page Digital AR Card View (no cramped scrollable drawer) */
          <DigitalARCardModal
            customer={selectedCustomer}
            initialShowPaymentForm={autoOpenPaymentForm}
            lang={lang}
            t={t}
            onClose={() => {
              setSelectedCustomerId(null);
              setAutoOpenPaymentForm(false);
            }}
            onRecordPayment={handleRecordPayment}
            onPrintReceipt={handlePrintReceipt}
          />
        ) : (
          <>
            {/* 1. Automatic H-1 Due Date Reminders Alert Panel */}
            <DueTomorrowPanel
              dueTomorrowCustomers={dueTomorrowCustomers}
              lang={lang}
              t={t}
              onSelectCustomer={handleSelectCustomer}
            />

            {/* 2. Summary KPI Cards */}
            <KpiCards
              customers={customers}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
              t={t}
            />

            {/* 3. Searchable, Filterable Customer AR Table */}
            <CustomerTable
              customers={customers}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onSelectCustomer={handleSelectCustomer}
              lang={lang}
              t={t}
            />
          </>
        )}
      </main>

      {/* Add New Customer / Credit Modal */}
      <AddCustomerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreateCustomer={handleCreateCustomer}
        t={t}
      />

      {/* Instant Printable Kwitansi / Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        lang={lang}
        t={t}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
