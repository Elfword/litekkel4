import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  ActiveReceipt,
  ActiveView,
  ARStatus,
  AuditAction,
  AuditLogEntry,
  AuthUser,
  CustomerAR,
  EditCustomerInput,
  Language,
  NewAdminInput,
  NewCustomerInput,
  PaymentRecord,
  RecordPaymentInput,
  SimulatorPrefill,
} from './types';
import { translations } from './i18n/translations';
import { AccountCredential, DEMO_ACCOUNTS } from './data/accounts';
import { generateDemoAuditLogs, generateDemoCustomers } from './data/demoData';
import { computeCustomerStatus, recordCustomerPayment } from './utils/arCalculations';
import { formatIDR, getTodayDate, toISODate } from './utils/formatters';
import { exportARToExcel, ExportScope } from './utils/excelExport';
import { Navbar } from './components/Navbar';
import { SuperAdminSidebar } from './components/SuperAdminSidebar';
import { AdminMonitorHeader } from './components/AdminMonitorHeader';
import { DueTomorrowPanel } from './components/DueTomorrowPanel';
import { KpiCards } from './components/KpiCards';
import { CustomerTable } from './components/CustomerTable';
import { DigitalARCardModal } from './components/DigitalARCardModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { AddAdminModal } from './components/AddAdminModal';
import { EditCustomerModal } from './components/EditCustomerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { InvoiceModal } from './components/InvoiceModal';
import { LoginPage } from './components/LoginPage';
import { SelfCheckPortal } from './components/SelfCheckPortal';
import { InstallmentSimulator } from './components/InstallmentSimulator';
import { AuditTrailView } from './components/AuditTrailView';
import { ExcelExportModal } from './components/ExcelExportModal';
import Faq from './components/Faq';

const STORAGE_KEY_CUSTOMERS = 'litekai_ar_customers_v4';
const STORAGE_KEY_LANG = 'litekai_ar_lang_v1';
const STORAGE_KEY_USER = 'litekai_ar_user_v4';
const STORAGE_KEY_AUDIT = 'litekai_ar_audit_v4';
const STORAGE_KEY_ACCOUNTS = 'litekai_ar_accounts_v4';

const DEFAULT_ADMINS = [
  'julie',
  'atika',
  'cosmas',
  'evelina',
  'jelice',
  'kezia',
  'melissa',
  'olyvia',
  'sutina',
  'alvin',
];

function isCurrentTeamAccounts(list: AccountCredential[]): boolean {
  return list.some((a) => a.username === 'fernando' && a.role === 'super_admin');
}

function hasLegacyAdminCustomers(list: CustomerAR[]): boolean {
  return list.some((c) => /^admin\d+$/i.test(c.assignedAdminUsername || ''));
}

function normalizeLoadedCustomers(list: CustomerAR[]): CustomerAR[] {
  return list.map((c, idx) => ({
    ...c,
    customerId: c.customerId || `CUST-${String(idx + 1).padStart(3, '0')}`,
    assignedAdminUsername:
      c.assignedAdminUsername || DEFAULT_ADMINS[idx % DEFAULT_ADMINS.length],
    creditLimit:
      typeof c.creditLimit === 'number' && c.creditLimit > 0
        ? c.creditLimit
        : Math.max(c.totalCreditAmount, Math.round(c.totalCreditAmount * 1.2)),
  }));
}

function loadInitialCustomers(): CustomerAR[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        !hasLegacyAdminCustomers(parsed as CustomerAR[])
      ) {
        return normalizeLoadedCustomers(parsed as CustomerAR[]);
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

function loadInitialAccounts(): AccountCredential[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && isCurrentTeamAccounts(parsed as AccountCredential[])) {
        return parsed as AccountCredential[];
      }
    }
  } catch {
    // Fall back to default accounts
  }
  return DEMO_ACCOUNTS;
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

function loadInitialUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && parsed.role) return parsed as AuthUser;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function loadInitialAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as AuditLogEntry[];
    }
  } catch {
    // Ignore storage errors
  }
  const seed = generateDemoAuditLogs();
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(seed));
  } catch {
    // Ignore storage errors
  }
  return seed;
}

export function App() {
  const [lang, setLang] = useState<Language>(loadInitialLanguage);
  const [accounts, setAccounts] = useState<AccountCredential[]>(loadInitialAccounts);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadInitialUser);
  const [publicSelfCheckMode, setPublicSelfCheckMode] = useState(false);

  const [customers, setCustomers] = useState<CustomerAR[]>(loadInitialCustomers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(loadInitialAuditLogs);

  const [activeView, setActiveView] = useState<ActiveView>(
    window.location.pathname === '/faq' ? 'faq' : 'dashboard'
  );
  const [statusFilter, setStatusFilter] = useState<ARStatus | 'all'>('all');

  // Super Admin monitoring state
  const [selectedAdminUsername, setSelectedAdminUsername] = useState<string | null>(null);
  const [adminMonitorTab, setAdminMonitorTab] = useState<'customers' | 'activity'>('customers');
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [autoOpenPaymentForm, setAutoOpenPaymentForm] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addInvoiceForCustomerId, setAddInvoiceForCustomerId] = useState<string | null>(null);
  const [simulatorPrefill, setSimulatorPrefill] = useState<SimulatorPrefill | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAR | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const [activeReceipt, setActiveReceipt] = useState<ActiveReceipt | null>(null);
  const [activeInvoiceCustomer, setActiveInvoiceCustomer] = useState<CustomerAR | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  // Guard against stale Vite HMR in-memory state from previous demo accounts or admin1/2/3 invoices
  useEffect(() => {
    if (!isCurrentTeamAccounts(accounts) || hasLegacyAdminCustomers(customers)) {
      const freshCustomers = generateDemoCustomers();
      const freshLogs = generateDemoAuditLogs();
      setAccounts(DEMO_ACCOUNTS);
      setCustomers(freshCustomers);
      setAuditLogs(freshLogs);
      if (currentUser && /^admin\d+$/i.test(currentUser.username)) {
        setCurrentUser(null);
      }
      setSelectedAdminUsername(null);
      setSelectedCustomerId(null);
    }
  }, [accounts, customers, currentUser]);

  // Persist accounts (only when current team schema is loaded)
  useEffect(() => {
    if (!isCurrentTeamAccounts(accounts)) return;
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch {
      // Ignore storage quota errors
    }
  }, [accounts]);

  // Persist customers (only when no legacy admin1/2/3 records exist)
  useEffect(() => {
    if (hasLegacyAdminCustomers(customers)) return;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    } catch {
      // Ignore storage quota errors
    }
  }, [customers]);

  // Persist audit logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch {
      // Ignore storage quota errors
    }
  }, [auditLogs]);

  // Persist user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentUser]);

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

  const appendAuditLog = (
    action: AuditAction,
    target: string,
    details: string,
    actorOverride?: AuthUser
  ) => {
    const actor = actorOverride ?? currentUser;
    if (!actor) return;
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorName: actor.name,
      actorUsername: actor.username,
      actorRole: actor.role,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 300));
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const monitoredAdmin = useMemo(() => {
    if (!isSuperAdmin || !selectedAdminUsername) return null;
    return accounts.find((a) => a.username === selectedAdminUsername) ?? null;
  }, [isSuperAdmin, selectedAdminUsername, accounts]);

  // Filter dashboard scope when Super Admin selects an admin in the sidebar
  const scopedCustomers = useMemo(() => {
    if (monitoredAdmin) {
      return customers.filter((c) => c.assignedAdminUsername === monitoredAdmin.username);
    }
    return customers;
  }, [customers, monitoredAdmin]);

  const monitoredAdminLogs = useMemo(() => {
    if (!monitoredAdmin) return [];
    return auditLogs.filter((l) => l.actorUsername === monitoredAdmin.username);
  }, [auditLogs, monitoredAdmin]);

  const dueTomorrowCustomers = useMemo(
    () => scopedCustomers.filter((c) => computeCustomerStatus(c) === 'due_tomorrow'),
    [scopedCustomers]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const totalReceiptCount = useMemo(
    () => customers.reduce((sum, c) => sum + c.payments.length, 0),
    [customers]
  );

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setPublicSelfCheckMode(false);
    setSelectedAdminUsername(null);
    setAdminMonitorTab('customers');
    appendAuditLog(
      'login',
      'Sistem LiteKai AR',
      `Login berhasil sebagai ${user.role === 'super_admin' ? 'Super Admin / Manajer' : 'Admin'}`,
      user
    );
    setToastMessage(
      lang === 'id' ? `Selamat datang, ${user.name}!` : `Welcome back, ${user.name}!`
    );
  };

  const handleLogout = () => {
    if (currentUser) {
      appendAuditLog('logout', 'Sistem LiteKai AR', `Keluar dari sesi (${currentUser.username})`);
    }
    setCurrentUser(null);
    setSelectedCustomerId(null);
    setSelectedAdminUsername(null);
    setActiveView('dashboard');
  };

  const handleCreateAdmin = (input: NewAdminInput) => {
    const newAccount: AccountCredential = {
      id: `usr-admin-${Date.now()}`,
      username: input.username,
      password: input.password,
      name: input.name,
      role: 'admin',
      title: input.title,
    };
    setAccounts((prev) => {
      const superAdmins = prev.filter((a) => a.role === 'super_admin');
      const admins = prev.filter((a) => a.role === 'admin');
      return [...admins, newAccount, ...superAdmins];
    });
    appendAuditLog(
      'create_admin',
      `${newAccount.name} (@${newAccount.username})`,
      `Menambahkan akun Admin baru (${newAccount.title})`
    );
    setToastMessage(
      lang === 'id'
        ? `Akun Admin baru "${newAccount.name}" (@${newAccount.username}) berhasil ditambahkan.`
        : `New Admin "${newAccount.name}" (@${newAccount.username}) created.`
    );
  };

  const handleSelectCustomer = (customer: CustomerAR, autoOpenPayment = false) => {
    setActiveView('dashboard');
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

    appendAuditLog(
      'record_payment',
      `${target.name} (${target.contractCode})`,
      `Mencatat Angsuran ke-${newPayment.installmentNumber} sebesar ${formatIDR(newPayment.amount)} via ${t.paymentMethods[newPayment.method]} (Kwitansi ${newPayment.receiptNo}${newPayment.transferProofName ? `, Bukti: ${newPayment.transferProofName}` : ''})`
    );

    setAutoOpenPaymentForm(false);
    setActiveReceipt({ customer: updatedCustomer, payment: newPayment });
    setToastMessage(t.toast.paymentRecorded(newPayment.receiptNo));
  };

  const handleCreateCustomer = (input: NewCustomerInput) => {
    const today = getTodayDate();
    const year = today.getFullYear();

    // Compute unique sequential contract/invoice code
    const maxSeq = customers.reduce((max, c) => {
      const m = c.contractCode.match(/(\d+)$/);
      return m ? Math.max(max, Number(m[1])) : max;
    }, 0);
    const contractCode = `AR-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
    const monthlyInstallment = Math.round(input.totalCreditAmount / input.installmentCount);

    const uniqueGroupIds = new Set(customers.map((c) => c.customerId));
    const customerId =
      input.existingCustomerId ||
      `CUST-${String(uniqueGroupIds.size + 1).padStart(3, '0')}`;

    const assignedAdminUsername =
      input.assignedAdminUsername ||
      (currentUser?.role === 'admin' ? currentUser.username : 'julie');

    const newCustomer: CustomerAR = {
      id: `cust-${Date.now()}`,
      customerId,
      contractCode,
      assignedAdminUsername,
      name: input.name,
      company: input.company,
      phone: input.phone,
      address: input.address,
      creditDescription: input.creditDescription,
      creditLimit: input.creditLimit,
      totalCreditAmount: input.totalCreditAmount,
      installmentCount: input.installmentCount,
      monthlyInstallment,
      startDate: toISODate(today),
      nextDueDate: input.firstDueDate,
      payments: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setSimulatorPrefill(null);
    setAddInvoiceForCustomerId(null);

    if (input.existingCustomerId) {
      appendAuditLog(
        'create_customer',
        `${newCustomer.name} (${newCustomer.contractCode})`,
        `Menambahkan invoice baru untuk pelanggan lama ${newCustomer.name} sebesar ${formatIDR(newCustomer.totalCreditAmount)} (${newCustomer.installmentCount}x, PIC @${assignedAdminUsername}) — ${newCustomer.creditDescription}`
      );
      setSelectedCustomerId(newCustomer.id);
      setToastMessage(
        lang === 'id'
          ? `Invoice baru ${newCustomer.contractCode} berhasil ditambahkan untuk ${newCustomer.name}.`
          : `New invoice ${newCustomer.contractCode} added for ${newCustomer.name}.`
      );
    } else {
      appendAuditLog(
        'create_customer',
        `${newCustomer.name} (${newCustomer.contractCode})`,
        `Menambahkan kredit baru ${formatIDR(newCustomer.totalCreditAmount)} (${newCustomer.installmentCount}x, Limit ${formatIDR(newCustomer.creditLimit)}, PIC @${assignedAdminUsername}) — ${newCustomer.creditDescription}`
      );
      setToastMessage(t.toast.customerAdded(newCustomer.name));
    }
  };

  const handleEditCustomer = (customerId: string, input: EditCustomerInput) => {
    const existing = customers.find((c) => c.id === customerId);
    if (!existing) return;

    const changes: string[] = [];
    if (existing.name !== input.name) changes.push(`Nama: ${existing.name} → ${input.name}`);
    if ((existing.company || '') !== (input.company || '')) {
      changes.push(`Usaha: ${existing.company || '-'} → ${input.company || '-'}`);
    }
    if (existing.phone !== input.phone) changes.push(`HP: ${existing.phone} → ${input.phone}`);
    if (existing.creditDescription !== input.creditDescription) {
      changes.push(`Barang: ${input.creditDescription}`);
    }
    if (existing.creditLimit !== input.creditLimit) {
      changes.push(
        `Limit Kredit: ${formatIDR(existing.creditLimit)} → ${formatIDR(input.creditLimit)}`
      );
    }
    if (existing.nextDueDate !== input.nextDueDate) {
      changes.push(`Jatuh Tempo: ${existing.nextDueDate || '-'} → ${input.nextDueDate || '-'}`);
    }

    // Sync shared customer profile & credit limit across all sibling invoices of this customer
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            name: input.name,
            company: input.company,
            phone: input.phone,
            address: input.address,
            creditDescription: input.creditDescription,
            creditLimit: input.creditLimit,
            nextDueDate: input.nextDueDate,
          };
        }
        if (c.customerId === existing.customerId) {
          return {
            ...c,
            name: input.name,
            company: input.company,
            phone: input.phone,
            address: input.address,
            creditLimit: input.creditLimit,
          };
        }
        return c;
      })
    );

    const limitChangedOnly =
      existing.creditLimit !== input.creditLimit && changes.length === 1;

    appendAuditLog(
      limitChangedOnly ? 'update_credit_limit' : 'edit_customer',
      `${input.name} (${existing.contractCode})`,
      changes.length > 0 ? changes.join('; ') : 'Memperbarui data pelanggan'
    );

    setToastMessage(
      lang === 'id'
        ? `Data ${input.name} berhasil diperbarui.`
        : `Customer ${input.name} updated successfully.`
    );
  };

  const handleDeleteCustomer = (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setSelectedCustomerId(null);
    appendAuditLog(
      'delete_customer',
      `${target.name} (${target.contractCode})`,
      `Menghapus invoice / kontrak kredit (${formatIDR(target.totalCreditAmount)})`
    );
    setToastMessage(
      lang === 'id'
        ? `Invoice ${target.contractCode} (${target.name}) telah dihapus.`
        : `Invoice ${target.contractCode} (${target.name}) deleted.`
    );
  };

  const handleExportExcel = (scope: ExportScope) => {
    const fileName = exportARToExcel(scopedCustomers, scope);
    appendAuditLog(
      'export_excel',
      fileName,
      `Mengunduh laporan Excel (${scope}${monitoredAdmin ? `, filter @${monitoredAdmin.username}` : ''})`
    );
    setToastMessage(
      lang === 'id' ? `Berhasil export Excel: ${fileName}` : `Exported Excel: ${fileName}`
    );
  };

  const handleResetDemoData = () => {
    const fresh = generateDemoCustomers();
    setCustomers(fresh);
    setAccounts(DEMO_ACCOUNTS);
    setStatusFilter('all');
    setSelectedCustomerId(null);
    setSelectedAdminUsername(null);
    setActiveReceipt(null);
    setActiveInvoiceCustomer(null);
    appendAuditLog(
      'reset_demo',
      'Data Demo',
      'Mengatur ulang seluruh data pelanggan & daftar admin ke kondisi demo awal'
    );
    setToastMessage(t.toast.demoReset);
  };

  const handlePrintReceipt = (customer: CustomerAR, payment: PaymentRecord) => {
    setActiveReceipt({ customer, payment });
  };

  const handleApplySimulator = (prefill: SimulatorPrefill) => {
    setAddInvoiceForCustomerId(null);
    setSimulatorPrefill(prefill);
    setAddModalOpen(true);
  };

  // --- Direct /faq Route Support (Sutina's FAQ page) ---
  if (window.location.pathname === '/faq' && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <a
          href="/"
          className="mb-6 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          &larr; Kembali ke Beranda
        </a>
        <Faq />
      </div>
    );
  }

  // --- Unauthenticated State: Public Self-Check Portal OR Login Page ---
  if (!currentUser) {
    if (publicSelfCheckMode) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 print:min-h-0 print:bg-white">
          <div className="no-print">
            <SelfCheckPortal
              customers={customers}
              lang={lang}
              t={t}
              isPublicMode
              onBackToLogin={() => setPublicSelfCheckMode(false)}
              onDownloadInvoice={(c) => setActiveInvoiceCustomer(c)}
              onPrintReceipt={handlePrintReceipt}
            />
          </div>

          <ReceiptModal
            receipt={activeReceipt}
            lang={lang}
            t={t}
            onClose={() => setActiveReceipt(null)}
          />
          <InvoiceModal
            customer={activeInvoiceCustomer}
            lang={lang}
            t={t}
            onClose={() => setActiveInvoiceCustomer(null)}
          />
        </div>
      );
    }

    return (
      <LoginPage
        accounts={accounts}
        lang={lang}
        onLanguageChange={setLang}
        onLoginSuccess={handleLoginSuccess}
        onOpenSelfCheck={() => setPublicSelfCheckMode(true)}
      />
    );
  }

  // --- Authenticated Dashboard Shell ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:min-h-0 print:bg-white">
      <Navbar
        lang={lang}
        currentUser={currentUser}
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setSelectedCustomerId(null);
          setAutoOpenPaymentForm(false);
        }}
        onLanguageChange={setLang}
        onOpenAddCustomer={() => {
          setSimulatorPrefill(null);
          setAddInvoiceForCustomerId(null);
          setAddModalOpen(true);
        }}
        onOpenExportExcel={() => setExportModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        onLogout={handleLogout}
        onBrandClick={() => {
          setActiveView('dashboard');
          setSelectedCustomerId(null);
          setSelectedAdminUsername(null);
          setAutoOpenPaymentForm(false);
        }}
        t={t}
      />

      {/* Body Layout: Super Admin gets left Oversight Sidebar + Main Workspace */}
      <div className="no-print flex w-full flex-col lg:flex-row">
        {isSuperAdmin && (
          <SuperAdminSidebar
            accounts={accounts}
            customers={customers}
            auditLogs={auditLogs}
            selectedAdminUsername={selectedAdminUsername}
            lang={lang}
            onSelectAdmin={(username) => {
              setSelectedAdminUsername(username);
              setAdminMonitorTab('customers');
              setActiveView('dashboard');
              setSelectedCustomerId(null);
            }}
            onOpenAddAdmin={() => setAddAdminModalOpen(true)}
          />
        )}

        {/* Full-Width Main Container */}
        <main className="min-w-0 flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {activeView === 'faq' ? (
            <Faq />
          ) : activeView === 'simulator' ? (
            <InstallmentSimulator lang={lang} onApplyToNewCredit={handleApplySimulator} />
          ) : activeView === 'audit' ? (
            <AuditTrailView logs={auditLogs} lang={lang} />
          ) : activeView === 'self_check' ? (
            <SelfCheckPortal
              customers={customers}
              lang={lang}
              t={t}
              onDownloadInvoice={(c) => setActiveInvoiceCustomer(c)}
              onPrintReceipt={handlePrintReceipt}
            />
          ) : selectedCustomer ? (
            <DigitalARCardModal
              customer={selectedCustomer}
              allCustomers={customers}
              initialShowPaymentForm={autoOpenPaymentForm}
              lang={lang}
              userRole={currentUser.role}
              t={t}
              onClose={() => {
                setSelectedCustomerId(null);
                setAutoOpenPaymentForm(false);
              }}
              onSwitchInvoice={(inv) => {
                setSelectedCustomerId(inv.id);
                setAutoOpenPaymentForm(false);
              }}
              onAddInvoiceForCustomer={(cust) => {
                setSimulatorPrefill(null);
                setAddInvoiceForCustomerId(cust.customerId);
                setAddModalOpen(true);
              }}
              onRecordPayment={handleRecordPayment}
              onPrintReceipt={handlePrintReceipt}
              onDownloadInvoice={(c) => setActiveInvoiceCustomer(c)}
              onEditCustomer={(c) => setEditingCustomer(c)}
              onDeleteCustomer={handleDeleteCustomer}
            />
          ) : (
            <>
              {/* Super Admin Selected-Admin Monitoring Banner */}
              {monitoredAdmin && (
                <AdminMonitorHeader
                  admin={monitoredAdmin}
                  adminCustomers={scopedCustomers}
                  adminLogs={monitoredAdminLogs}
                  tab={adminMonitorTab}
                  lang={lang}
                  onChangeTab={setAdminMonitorTab}
                  onClearSelection={() => setSelectedAdminUsername(null)}
                />
              )}

              {monitoredAdmin && adminMonitorTab === 'activity' ? (
                <AuditTrailView logs={monitoredAdminLogs} lang={lang} />
              ) : (
                <>
                  <DueTomorrowPanel
                    dueTomorrowCustomers={dueTomorrowCustomers}
                    lang={lang}
                    t={t}
                    onSelectCustomer={handleSelectCustomer}
                  />

                  <KpiCards
                    customers={scopedCustomers}
                    activeFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                    t={t}
                  />

                  <CustomerTable
                    customers={scopedCustomers}
                    allCustomers={customers}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onSelectCustomer={handleSelectCustomer}
                    lang={lang}
                    t={t}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add New Customer / Add New Invoice Modal */}
      <AddCustomerModal
        isOpen={addModalOpen}
        lang={lang}
        userRole={currentUser.role}
        currentUsername={currentUser.username}
        accounts={accounts}
        existingCustomers={customers}
        initialExistingCustomerId={addInvoiceForCustomerId}
        prefill={simulatorPrefill}
        onClose={() => {
          setAddModalOpen(false);
          setAddInvoiceForCustomerId(null);
          setSimulatorPrefill(null);
        }}
        onCreateCustomer={handleCreateCustomer}
        t={t}
      />

      {/* Add New Admin Modal (Super Admin Only) */}
      <AddAdminModal
        isOpen={addAdminModalOpen}
        existingUsernames={accounts.map((a) => a.username)}
        lang={lang}
        onClose={() => setAddAdminModalOpen(false)}
        onCreateAdmin={handleCreateAdmin}
      />

      {/* Edit Customer & Credit Limit Modal */}
      <EditCustomerModal
        customer={editingCustomer}
        lang={lang}
        userRole={currentUser.role}
        onClose={() => setEditingCustomer(null)}
        onSave={handleEditCustomer}
      />

      {/* Export Excel Modal */}
      <ExcelExportModal
        isOpen={exportModalOpen}
        customers={scopedCustomers}
        lang={lang}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportExcel}
      />

      {/* Instant Printable Kwitansi / Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        lang={lang}
        t={t}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Downloadable / Printable Billing Invoice Modal */}
      <InvoiceModal
        customer={activeInvoiceCustomer}
        lang={lang}
        t={t}
        onClose={() => setActiveInvoiceCustomer(null)}
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
