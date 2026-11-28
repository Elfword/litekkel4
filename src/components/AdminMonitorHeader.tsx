import React from 'react';
import { Activity, ShieldCheck, Users, X } from 'lucide-react';
import { AccountCredential } from '../data/accounts';
import { AuditLogEntry, CustomerAR, Language } from '../types';
import { getRemainingBalance } from '../utils/arCalculations';
import { formatIDR } from '../utils/formatters';

interface AdminMonitorHeaderProps {
  admin: AccountCredential;
  adminCustomers: CustomerAR[];
  adminLogs: AuditLogEntry[];
  tab: 'customers' | 'activity';
  lang: Language;
  onChangeTab: (tab: 'customers' | 'activity') => void;
  onClearSelection: () => void;
}

export const AdminMonitorHeader: React.FC<AdminMonitorHeaderProps> = ({
  admin,
  adminCustomers,
  adminLogs,
  tab,
  lang,
  onChangeTab,
  onClearSelection,
}) => {
  const isId = lang === 'id';
  const uniqueCustomerCount = new Set(adminCustomers.map((c) => c.customerId)).size;
  const totalExposure = adminCustomers.reduce((sum, c) => sum + getRemainingBalance(c), 0);

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-blue-50/60 to-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {isId ? 'Pantauan Super Admin' : 'Super Admin Monitor'}
              </span>
              <span className="font-mono text-xs font-bold text-slate-600">
                @{admin.username}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-900">
              {admin.name}{' '}
              <span className="text-xs font-medium text-slate-500">• {admin.title}</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              {isId
                ? `Mengelola ${uniqueCustomerCount} pelanggan (${adminCustomers.length} invoice) • Total Piutang Aktif: `
                : `Managing ${uniqueCustomerCount} customers (${adminCustomers.length} invoices) • Active Receivables: `}
              <strong className="tabular-nums text-slate-900">{formatIDR(totalExposure)}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onChangeTab('customers')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                tab === 'customers'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>
                {isId ? 'Progres Pelanggan' : 'Customer Progress'} ({adminCustomers.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('activity')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                tab === 'activity'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>
                {isId ? 'Perilaku & Aktivitas' : 'Behavior & Activity'} ({adminLogs.length})
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" />
            <span>{isId ? 'Semua Admin' : 'All Admins'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
