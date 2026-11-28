import React from 'react';
import {
  Activity,
  Crown,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { AccountCredential } from '../data/accounts';
import { AuditLogEntry, CustomerAR, Language } from '../types';
import { computeCustomerStatus, getRemainingBalance } from '../utils/arCalculations';
import { formatIDR } from '../utils/formatters';

interface SuperAdminSidebarProps {
  accounts: AccountCredential[];
  customers: CustomerAR[];
  auditLogs: AuditLogEntry[];
  selectedAdminUsername: string | null; // null = All Admins
  lang: Language;
  onSelectAdmin: (username: string | null) => void;
  onOpenAddAdmin: () => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  accounts,
  customers,
  auditLogs,
  selectedAdminUsername,
  lang,
  onSelectAdmin,
  onOpenAddAdmin,
}) => {
  const isId = lang === 'id';
  const adminAccounts = accounts.filter((a) => a.role === 'admin');

  const totalActiveAll = customers.reduce((sum, c) => sum + getRemainingBalance(c), 0);

  return (
    <aside className="no-print w-full shrink-0 border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
      <div className="p-4">
        {/* Super Admin Oversight Header */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-indigo-950">
                {isId ? 'Pantauan Tim Admin' : 'Admin Oversight'}
              </div>
              <div className="text-[10px] font-semibold text-indigo-700">
                {adminAccounts.length} {isId ? 'Admin Aktif' : 'Active Admins'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAddAdmin}
            title={isId ? 'Tambah Admin Baru' : 'Add New Admin'}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{isId ? 'Admin' : 'Add'}</span>
          </button>
        </div>

        {/* All Admins Overview Item */}
        <div className="mt-4 space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectAdmin(null)}
            className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
              selectedAdminUsername === null
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 shrink-0" />
              <div>
                <div className="text-xs font-bold">
                  {isId ? 'Semua Admin (Perusahaan)' : 'All Admins (Company)'}
                </div>
                <div
                  className={`tabular-nums text-[10px] ${
                    selectedAdminUsername === null ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {customers.length} invoice • {formatIDR(totalActiveAll)}
                </div>
              </div>
            </div>
          </button>

          <div className="px-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isId ? 'Daftar Admin' : 'Admin List'}
          </div>

          {/* Individual Admin Items */}
          {adminAccounts.map((admin) => {
            const adminCustomers = customers.filter(
              (c) => c.assignedAdminUsername === admin.username
            );
            const activeBalance = adminCustomers.reduce(
              (sum, c) => sum + getRemainingBalance(c),
              0
            );
            const totalCredit = adminCustomers.reduce((sum, c) => sum + c.totalCreditAmount, 0);
            const totalPaid = totalCredit - activeBalance;
            const paidPct = totalCredit > 0 ? Math.round((totalPaid / totalCredit) * 100) : 0;

            const urgentCount = adminCustomers.filter((c) => {
              const s = computeCustomerStatus(c);
              return s === 'overdue' || s === 'due_tomorrow';
            }).length;
            const activityCount = auditLogs.filter(
              (log) => log.actorUsername === admin.username
            ).length;
            const isSelected = selectedAdminUsername === admin.username;

            const statusTag =
              adminCustomers.length === 0
                ? {
                    label: isId ? '0 Pelanggan' : 'No Customers',
                    cls: 'bg-slate-100 text-slate-500',
                  }
                : activeBalance === 0
                  ? {
                      label: isId ? '100% Lunas' : 'All Paid',
                      cls: 'bg-sky-100 text-sky-700',
                    }
                  : totalPaid === 0
                    ? {
                        label: isId ? '0% Bayar' : 'Unpaid',
                        cls: 'bg-rose-100 text-rose-700',
                      }
                    : urgentCount > 0
                      ? {
                          label: `${paidPct}% • ${urgentCount} ${isId ? 'urgen' : 'urgent'}`,
                          cls: 'bg-amber-100 text-amber-800',
                        }
                      : {
                          label: `${paidPct}% ${isId ? 'terbayar' : 'paid'}`,
                          cls: 'bg-emerald-100 text-emerald-700',
                        };

            return (
              <button
                key={admin.id}
                type="button"
                onClick={() => onSelectAdmin(admin.username)}
                className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 ring-1 ring-blue-500/30 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-900">
                        {admin.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        @{admin.username}
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusTag.cls}`}>
                    {statusTag.label}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px]">
                  <span className="font-semibold text-slate-600">
                    {adminCustomers.length} {isId ? 'invoice' : 'inv'} •{' '}
                    <span className="inline-flex items-center gap-0.5 text-slate-500">
                      <Activity className="h-2.5 w-2.5 text-blue-500" />
                      {activityCount}
                    </span>
                  </span>
                  <span className="tabular-nums font-bold text-slate-800">
                    {formatIDR(activeBalance)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Add New Admin Button */}
        <button
          type="button"
          onClick={onOpenAddAdmin}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 px-3 py-2.5 text-xs font-bold text-indigo-700 transition-colors hover:border-indigo-500 hover:bg-indigo-50"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isId ? '+ Tambah Admin Baru' : '+ Add New Admin'}</span>
        </button>
      </div>
    </aside>
  );
};
