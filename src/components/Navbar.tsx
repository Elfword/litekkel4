import React, { useState } from 'react';
import {
  Calculator,
  CalendarDays,
  ClipboardList,
  Crown,
  FileSearch,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ActiveView, AuthUser, Language } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { formatDisplayDate, getTodayDate, toISODate } from '../utils/formatters';

interface NavbarProps {
  lang: Language;
  currentUser: AuthUser;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onLanguageChange: (lang: Language) => void;
  onOpenAddCustomer: () => void;
  onOpenExportExcel: () => void;
  onResetDemoData: () => void;
  onLogout: () => void;
  onBrandClick?: () => void;
  t: TranslationDictionary;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  currentUser,
  activeView,
  onChangeView,
  onLanguageChange,
  onOpenAddCustomer,
  onOpenExportExcel,
  onResetDemoData,
  onLogout,
  onBrandClick,
  t,
}) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const todayLabel = formatDisplayDate(toISODate(getTodayDate()), lang, 'long');
  const isId = lang === 'id';
  const isSuperAdmin = currentUser.role === 'super_admin';

  const navTabs: Array<{ id: ActiveView; label: string; icon: React.ReactNode }> = [
    {
      id: 'dashboard',
      label: isId ? 'Pantauan Piutang' : 'Receivables',
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
    },
    {
      id: 'simulator',
      label: isId ? 'Simulasi Cicilan' : 'Simulator',
      icon: <Calculator className="h-3.5 w-3.5" />,
    },
    {
      id: 'self_check',
      label: isId ? 'Cek Tagihan' : 'Bill Check',
      icon: <FileSearch className="h-3.5 w-3.5" />,
    },
    {
      id: 'audit',
      label: isId ? 'Audit Trail' : 'Audit Trail',
      icon: <ClipboardList className="h-3.5 w-3.5" />,
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm shadow-blue-600/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  {t.appName}
                </h1>
                <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 sm:inline-block">
                  AR System
                </span>
              </div>
              <p className="text-xs text-slate-500">{t.appSubtitle}</p>
            </div>
          </button>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Date Pill */}
            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 2xl:flex">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {t.nav.todayLabel}: <strong className="font-semibold text-slate-800">{todayLabel}</strong>
              </span>
            </div>

            {/* Export Excel Button (Melissa) */}
            <button
              type="button"
              onClick={onOpenExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-600 hover:text-white"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{isId ? 'Export Excel' : 'Export Excel'}</span>
            </button>

            {/* Add New Credit CTA */}
            <button
              type="button"
              onClick={onOpenAddCustomer}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t.nav.addCustomer}</span>
            </button>

            {/* Reset Demo Data */}
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              title={t.nav.resetDemo}
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden xl:inline">{t.nav.resetDemo}</span>
            </button>

            {/* Language Toggle (ID / EN) */}
            <div
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5"
              role="group"
              aria-label="Language switcher"
            >
              <Globe className="ml-1.5 mr-1 hidden h-3.5 w-3.5 text-slate-400 sm:block" />
              <button
                type="button"
                onClick={() => onLanguageChange('id')}
                className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                  lang === 'id'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`rounded-md px-2 py-1 text-xs font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            {/* Active User Badge & Logout (Jelice) */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                  isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isSuperAdmin ? <Crown className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-[11px] font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title={isId ? 'Keluar / Logout' : 'Sign Out'}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex w-full flex-wrap items-center gap-1 border-t border-slate-100 bg-slate-50/70 px-4 py-1.5 sm:px-6 lg:px-8">
          {navTabs.map((tab) => {
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeView(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Reset Demo Confirmation Modal */}
      {confirmResetOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.nav.resetConfirmTitle}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {t.nav.resetConfirmDesc}
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.nav.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmResetOpen(false);
                }}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
              >
                {t.nav.confirmReset}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
