import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Crown,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AuditAction, AuditLogEntry, Language } from '../types';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
  lang: Language;
}

const ACTION_BADGE_STYLES: Record<AuditAction, string> = {
  create_customer: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  edit_customer: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  delete_customer: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  record_payment: 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20',
  update_credit_limit: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20',
  create_admin: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  export_excel: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
  reset_demo: 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20',
  login: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
  logout: 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20',
};

const ACTION_LABELS: Record<Language, Record<AuditAction, string>> = {
  id: {
    create_customer: 'Tambah Pelanggan',
    edit_customer: 'Ubah Pelanggan',
    delete_customer: 'Hapus Pelanggan',
    record_payment: 'Catat Pembayaran',
    update_credit_limit: 'Limit Kredit',
    create_admin: 'Tambah Admin',
    export_excel: 'Export Excel',
    reset_demo: 'Reset Demo',
    login: 'Login',
    logout: 'Logout',
  },
  en: {
    create_customer: 'Add Customer',
    edit_customer: 'Edit Customer',
    delete_customer: 'Delete Customer',
    record_payment: 'Record Payment',
    update_credit_limit: 'Credit Limit',
    create_admin: 'Add Admin',
    export_excel: 'Export Excel',
    reset_demo: 'Reset Demo',
    login: 'Login',
    logout: 'Logout',
  },
};

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs, lang }) => {
  const isId = lang === 'id';
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((entry) => {
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
      if (!q) return true;
      return (
        entry.actorName.toLowerCase().includes(q) ||
        entry.actorUsername.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery, actionFilter]);

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(isId ? 'id-ID' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  };

  const filterButtons: Array<AuditAction | 'all'> = [
    'all',
    'create_customer',
    'edit_customer',
    'delete_customer',
    'record_payment',
    'update_credit_limit',
    'export_excel',
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {isId ? 'Audit Trail & Riwayat Aktivitas' : 'Audit Trail & Activity Log'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isId
                  ? 'Mencatat secara otomatis siapa yang menambahkan, mengubah, menghapus data pelanggan, mencatat pembayaran, atau mengubah limit kredit beserta waktunya.'
                  : 'Automatically tracks who created, edited, or deleted customer records, recorded payments, or updated credit limits with timestamps.'}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isId
                  ? 'Cari nama admin, pelanggan, atau aktivitas...'
                  : 'Search actor, customer, or activity...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {filterButtons.map((key) => {
            const active = actionFilter === key;
            const label = key === 'all' ? (isId ? 'Semua Aktivitas' : 'All Activities') : ACTION_LABELS[lang][key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActionFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Audit Log Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <span className="text-sm font-bold text-slate-900">
            {isId ? 'Log Perubahan Sistem' : 'System Change Log'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600">
            {filteredLogs.length} {isId ? 'aktivitas' : 'entries'}
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            {isId ? 'Belum ada riwayat aktivitas yang cocok.' : 'No matching audit entries found.'}
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-3">{isId ? 'Waktu' : 'Timestamp'}</th>
                <th className="px-3 py-3.5">{isId ? 'Pengguna / Aktor' : 'User / Actor'}</th>
                <th className="px-3 py-3.5">{isId ? 'Jenis Aksi' : 'Action'}</th>
                <th className="px-3 py-3.5">{isId ? 'Objek / Pelanggan' : 'Target'}</th>
                <th className="py-3.5 pl-3 pr-6">{isId ? 'Detail Perubahan' : 'Change Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((entry) => {
                const isSuper = entry.actorRole === 'super_admin';
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 pl-6 pr-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                            isSuper
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isSuper ? (
                            <Crown className="h-3.5 w-3.5" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{entry.actorName}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            @{entry.actorUsername} • {isSuper ? 'Super Admin' : 'Admin'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          ACTION_BADGE_STYLES[entry.action]
                        }`}
                      >
                        {ACTION_LABELS[lang][entry.action]}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-xs font-semibold text-slate-800">
                      {entry.target}
                    </td>
                    <td className="py-3.5 pl-3 pr-6 text-xs text-slate-600">
                      {entry.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
