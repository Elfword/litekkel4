import React, { useState } from 'react';
import {
  Crown,
  Eye,
  EyeOff,
  FileSearch,
  Globe,
  KeyRound,
  Landmark,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AuthUser, Language } from '../types';
import { AccountCredential, authenticateUser } from '../data/accounts';

interface LoginPageProps {
  accounts: AccountCredential[];
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenSelfCheck: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  accounts,
  lang,
  onLanguageChange,
  onLoginSuccess,
  onOpenSelfCheck,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isId = lang === 'id';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(username, password, accounts);
    if (!user) {
      setError(
        isId
          ? 'Username atau password salah. Silakan cek daftar akun demo di sebelah kanan.'
          : 'Invalid username or password. Please check the demo credentials on the right.'
      );
      return;
    }
    setError(null);
    onLoginSuccess(user);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 flex flex-col">
      {/* Top Bar */}
      <header className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm shadow-blue-600/20">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                LiteKai AR
              </span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-800">
                AR System
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isId
                ? 'Sistem Manajemen Kredit & Piutang Usaha'
                : 'Credit & Accounts Receivable Management'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSelfCheck}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
          >
            <FileSearch className="h-4 w-4" />
            <span>{isId ? 'Cek Tagihan Sendiri (Pelanggan)' : 'Check My Bill (Customer)'}</span>
          </button>

          <div
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm"
            role="group"
            aria-label="Language switcher"
          >
            <Globe className="ml-2 mr-1 h-3.5 w-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => onLanguageChange('id')}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                lang === 'id'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-8 sm:px-6">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Login Form Card */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-lg shadow-slate-200/50 lg:col-span-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Lock className="h-3.5 w-3.5" />
              <span>{isId ? 'Portal Login Internal' : 'Internal Staff Login'}</span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
              {isId ? 'Masuk ke LiteKai AR' : 'Sign in to LiteKai AR'}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {isId
                ? 'Masuk sebagai Admin atau Manajer / Pemilik Usaha (Super Admin) untuk mengelola piutang, limit kredit, pembayaran, dan laporan.'
                : 'Sign in as an Admin or Manager / Business Owner (Super Admin) to manage receivables, credit limits, payments, and reports.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Username</label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isId ? 'Masukkan username (contoh: fernando / julie)' : 'Enter username (e.g., fernando / julie)'}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isId ? 'Masukkan password' : 'Enter password'}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                {isId ? 'Masuk ke Dashboard' : 'Sign In to Dashboard'}
              </button>
            </form>

            {/* Customer Self-Check Link Box */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {isId ? 'Pelanggan Kredit?' : 'Credit Customer?'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isId
                      ? 'Cek sisa tagihan & unduh invoice tanpa login admin.'
                      : 'Check your remaining balance & download invoices without admin login.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenSelfCheck}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <FileSearch className="h-3.5 w-3.5" />
                  <span>{isId ? 'Cek Tagihan' : 'Check Bill'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Demo Accounts Reference Card (3 Admins + 1 Super Admin / Manajer) */}
          <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-7 shadow-lg shadow-slate-200/40 lg:col-span-6">
            <h2 className="text-base font-extrabold text-slate-900">
              {isId
                ? `Daftar Akun Tim (${accounts.filter((a) => a.role === 'admin').length} Admin & 1 Super Admin)`
                : `Team Accounts (${accounts.filter((a) => a.role === 'admin').length} Admins & 1 Super Admin)`}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isId
                ? 'Klik salah satu akun di bawah untuk mengisi username & password otomatis.'
                : 'Click any account below to auto-fill its username and password.'}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {accounts.map((acc) => {
                const isSuper = acc.role === 'super_admin';
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickFill(acc.username, acc.password)}
                    className={`group flex items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition-all ${
                      isSuper
                        ? 'sm:col-span-2 border-indigo-300 bg-indigo-50/70 hover:border-indigo-500 hover:bg-indigo-50'
                        : 'border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSuper
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-blue-600 ring-1 ring-slate-200'
                        }`}
                      >
                        {isSuper ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-xs font-bold text-slate-900">{acc.name}</span>
                          {isSuper && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[10px] text-slate-500">{acc.title}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right font-mono text-[10px] leading-tight">
                      <div className="font-bold text-slate-800">{acc.username}</div>
                      <div className="text-slate-400">{acc.password}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-[11px] leading-relaxed text-amber-900">
              <strong>{isId ? 'Hak Akses Peran:' : 'Role Permissions:'}</strong>{' '}
              {isId
                ? 'Admin dapat mengelola data pelanggan, mencatat pembayaran, simulasi cicilan, cetak kwitansi & invoice, serta export Excel. Super Admin (Manajer) memiliki akses penuh termasuk override limit kredit, hapus pelanggan, dan pantauan lengkap Audit Trail.'
                : 'Admins can manage customers, record payments, simulate installments, print receipts/invoices, and export Excel. Super Admin (Manager) has full access including credit limit overrides, deleting customers, and full Audit Trail oversight.'}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
