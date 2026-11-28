import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, FilePlus2, Plus, ShieldAlert, UserPlus, X } from 'lucide-react';
import { AccountCredential } from '../data/accounts';
import { CustomerAR, Language, NewCustomerInput, SimulatorPrefill, UserRole } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { getRemainingBalance } from '../utils/arCalculations';
import { addDays, formatIDR, getTodayDate } from '../utils/formatters';

interface AddCustomerModalProps {
  isOpen: boolean;
  lang: Language;
  userRole: UserRole;
  currentUsername: string;
  accounts: AccountCredential[];
  existingCustomers: CustomerAR[];
  initialExistingCustomerId?: string | null;
  prefill?: SimulatorPrefill | null;
  onClose: () => void;
  onCreateCustomer: (input: NewCustomerInput) => void;
  t: TranslationDictionary;
}

const TENOR_OPTIONS = [3, 6, 9, 12, 18, 24, 36];

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  lang,
  userRole,
  currentUsername,
  accounts,
  existingCustomers,
  initialExistingCustomerId,
  prefill,
  onClose,
  onCreateCustomer,
  t,
}) => {
  const defaultFirstDue = addDays(getTodayDate(), 30);
  const isId = lang === 'id';

  const adminAccounts = useMemo(
    () => accounts.filter((a) => a.role === 'admin'),
    [accounts]
  );

  // Deduplicate existing customers by shared customerId
  const uniqueCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        customerId: string;
        name: string;
        company?: string;
        phone: string;
        address: string;
        creditLimit: number;
        assignedAdminUsername: string;
        invoiceCount: number;
        totalExposure: number;
      }
    >();
    for (const c of existingCustomers) {
      const prev = map.get(c.customerId);
      const rem = getRemainingBalance(c);
      if (prev) {
        prev.invoiceCount += 1;
        prev.totalExposure += rem;
        prev.creditLimit = Math.max(prev.creditLimit, c.creditLimit);
      } else {
        map.set(c.customerId, {
          customerId: c.customerId,
          name: c.name,
          company: c.company,
          phone: c.phone,
          address: c.address,
          creditLimit: c.creditLimit,
          assignedAdminUsername: c.assignedAdminUsername,
          invoiceCount: 1,
          totalExposure: rem,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [existingCustomers]);

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingCustomerId, setSelectedExistingCustomerId] = useState<string>('');
  const [assignedAdmin, setAssignedAdmin] = useState<string>(
    userRole === 'admin' ? currentUsername : adminAccounts[0]?.username || 'julie'
  );

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [creditLimit, setCreditLimit] = useState('25000000');
  const [totalAmount, setTotalAmount] = useState('12000000');
  const [installmentCount, setInstallmentCount] = useState(6);
  const [firstDueDate, setFirstDueDate] = useState(defaultFirstDue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialExistingCustomerId) {
      setMode('existing');
      setSelectedExistingCustomerId(initialExistingCustomerId);
      const found = uniqueCustomers.find((u) => u.customerId === initialExistingCustomerId);
      if (found) {
        setAssignedAdmin(found.assignedAdminUsername);
      }
    } else {
      setMode('new');
      setSelectedExistingCustomerId(uniqueCustomers[0]?.customerId || '');
      setAssignedAdmin(
        userRole === 'admin' ? currentUsername : adminAccounts[0]?.username || 'julie'
      );
    }

    if (prefill) {
      setTotalAmount(String(prefill.totalCreditAmount));
      setInstallmentCount(prefill.installmentCount);
      setCreditLimit(
        String(Math.max(prefill.totalCreditAmount, Math.round(prefill.totalCreditAmount * 1.2)))
      );
      if (prefill.creditDescription) {
        setCreditDescription(prefill.creditDescription);
      }
    }
    setError(null);
  }, [isOpen, initialExistingCustomerId, prefill, uniqueCustomers, userRole, currentUsername, adminAccounts]);

  if (!isOpen) return null;

  const selectedCustomerObj =
    mode === 'existing'
      ? uniqueCustomers.find((u) => u.customerId === selectedExistingCustomerId) || null
      : null;

  const parsedTotal = Number(totalAmount.replace(/[^\d]/g, '')) || 0;
  const effectiveLimit = selectedCustomerObj
    ? selectedCustomerObj.creditLimit
    : Number(creditLimit.replace(/[^\d]/g, '')) || 0;
  const existingExposure = selectedCustomerObj ? selectedCustomerObj.totalExposure : 0;
  const projectedExposure = existingExposure + parsedTotal;
  const exceedsLimit = effectiveLimit > 0 && projectedExposure > effectiveLimit;
  const estimatedMonthly =
    installmentCount > 0 ? Math.round(parsedTotal / installmentCount) : 0;

  const resetForm = () => {
    setName('');
    setCompany('');
    setPhone('');
    setAddress('');
    setCreditDescription('');
    setCreditLimit('25000000');
    setTotalAmount('12000000');
    setInstallmentCount(6);
    setFirstDueDate(addDays(getTodayDate(), 30));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'existing') {
      if (!selectedCustomerObj || !creditDescription.trim() || parsedTotal <= 0 || !firstDueDate) {
        setError(t.addCustomerModal.requiredError);
        return;
      }
    } else {
      if (
        !name.trim() ||
        !phone.trim() ||
        !creditDescription.trim() ||
        parsedTotal <= 0 ||
        effectiveLimit <= 0 ||
        installmentCount <= 0 ||
        !firstDueDate
      ) {
        setError(t.addCustomerModal.requiredError);
        return;
      }
    }

    if (exceedsLimit && userRole !== 'super_admin') {
      setError(
        isId
          ? `Total eksposur (${formatIDR(projectedExposure)}) melebihi Limit Kredit (${formatIDR(effectiveLimit)}). Naikkan limit terlebih dahulu atau gunakan akun Manajer (Super Admin) untuk override.`
          : `Projected exposure (${formatIDR(projectedExposure)}) exceeds Credit Limit (${formatIDR(effectiveLimit)}). Increase limit or use Super Admin override.`
      );
      return;
    }

    if (mode === 'existing' && selectedCustomerObj) {
      onCreateCustomer({
        existingCustomerId: selectedCustomerObj.customerId,
        assignedAdminUsername:
          userRole === 'super_admin' ? assignedAdmin : selectedCustomerObj.assignedAdminUsername,
        name: selectedCustomerObj.name,
        company: selectedCustomerObj.company,
        phone: selectedCustomerObj.phone,
        address: selectedCustomerObj.address,
        creditDescription: creditDescription.trim(),
        creditLimit: selectedCustomerObj.creditLimit,
        totalCreditAmount: parsedTotal,
        installmentCount,
        firstDueDate,
      });
    } else {
      onCreateCustomer({
        assignedAdminUsername: userRole === 'super_admin' ? assignedAdmin : currentUsername,
        name: name.trim(),
        company: company.trim() || undefined,
        phone: phone.trim(),
        address: address.trim() || 'Indonesia',
        creditDescription: creditDescription.trim(),
        creditLimit: effectiveLimit,
        totalCreditAmount: parsedTotal,
        installmentCount,
        firstDueDate,
      });
    }

    resetForm();
    onClose();
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {mode === 'existing'
                ? isId
                  ? 'Tambah Invoice Baru (Pelanggan Lama)'
                  : 'Add New Invoice (Existing Customer)'
                : t.addCustomerModal.title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isId
                ? 'Satu pelanggan diperbolehkan memiliki lebih dari satu invoice dengan limit kredit tergabung.'
                : 'A single customer can hold multiple active invoices under one shared credit limit.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switcher: New Customer vs Add Invoice to Existing Customer */}
        {uniqueCustomers.length > 0 && (
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('new');
                  setError(null);
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  mode === 'new'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{isId ? 'Pelanggan Baru' : 'New Customer'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('existing');
                  if (!selectedExistingCustomerId && uniqueCustomers[0]) {
                    setSelectedExistingCustomerId(uniqueCustomers[0].customerId);
                  }
                  setError(null);
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  mode === 'existing'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                <span>{isId ? 'Pelanggan Lama (+ Invoice)' : 'Existing Customer (+ Invoice)'}</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {mode === 'existing' ? (
              <div className="sm:col-span-2 space-y-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    {isId ? 'Pilih Pelanggan Terdaftar' : 'Select Existing Customer'} *
                  </label>
                  <select
                    value={selectedExistingCustomerId}
                    onChange={(e) => {
                      setSelectedExistingCustomerId(e.target.value);
                      const found = uniqueCustomers.find((u) => u.customerId === e.target.value);
                      if (found) setAssignedAdmin(found.assignedAdminUsername);
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {uniqueCustomers.map((u) => (
                      <option key={u.customerId} value={u.customerId}>
                        {u.name} {u.company ? `(${u.company})` : ''} — {u.invoiceCount}{' '}
                        {isId ? 'invoice' : 'inv'} • Limit {formatIDR(u.creditLimit)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomerObj && (
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px]">
                    <div>
                      <span className="text-slate-500">{isId ? 'Limit Kredit:' : 'Credit Limit:'}</span>
                      <div className="tabular-nums font-bold text-slate-900">
                        {formatIDR(selectedCustomerObj.creditLimit)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">
                        {isId
                          ? `Terpakai (${selectedCustomerObj.invoiceCount} inv):`
                          : `Used (${selectedCustomerObj.invoiceCount} inv):`}
                      </span>
                      <div className="tabular-nums font-bold text-slate-900">
                        {formatIDR(selectedCustomerObj.totalExposure)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">{isId ? 'Sisa Limit:' : 'Available:'}</span>
                      <div className="tabular-nums font-bold text-emerald-700">
                        {formatIDR(
                          Math.max(0, selectedCustomerObj.creditLimit - selectedCustomerObj.totalExposure)
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    {t.addCustomerModal.nameLabel} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.addCustomerModal.namePlaceholder}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    {t.addCustomerModal.companyLabel}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t.addCustomerModal.companyPlaceholder}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    {t.addCustomerModal.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.addCustomerModal.phonePlaceholder}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    {t.addCustomerModal.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.addCustomerModal.addressPlaceholder}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.descriptionLabel} *
              </label>
              <input
                type="text"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder={t.addCustomerModal.descriptionPlaceholder}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {mode === 'new' && (
              <div>
                <label className="text-xs font-bold text-slate-700">
                  {isId ? 'Limit Kredit Pelanggan (Rp)' : 'Customer Credit Limit (Rp)'} *
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
            )}

            <div className={mode === 'existing' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.totalAmountLabel} *
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.tenorLabel} *
              </label>
              <select
                value={installmentCount}
                onChange={(e) => setInstallmentCount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {TENOR_OPTIONS.map((months) => (
                  <option key={months} value={months}>
                    {t.addCustomerModal.tenorOption(months)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.firstDueDateLabel} *
              </label>
              <input
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {userRole === 'super_admin' && adminAccounts.length > 0 && (
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  {isId ? 'Tugaskan ke Admin (PIC)' : 'Assign to Admin (PIC)'}
                </label>
                <select
                  value={assignedAdmin}
                  onChange={(e) => setAssignedAdmin(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {adminAccounts.map((a) => (
                    <option key={a.id} value={a.username}>
                      {a.name} (@{a.username}) — {a.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {exceedsLimit && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>
                {isId
                  ? `Total eksposur (${formatIDR(projectedExposure)}) melebihi Limit Kredit (${formatIDR(effectiveLimit)}). ${userRole === 'super_admin' ? 'Akun Super Admin dapat tetap menyetujui (override).' : 'Admin harus menyesuaikan nominal atau menaikkan limit.'}`
                  : `Total exposure (${formatIDR(projectedExposure)}) exceeds Credit Limit (${formatIDR(effectiveLimit)}). ${userRole === 'super_admin' ? 'Super Admin can override.' : 'Adjust amount or limit first.'}`}
              </span>
            </div>
          )}

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span>{t.addCustomerModal.autoCalcTitle}</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xs text-blue-800/80">
                {t.addCustomerModal.estimatedMonthlyLabel}
              </span>
              <span className="tabular-nums text-lg font-extrabold text-blue-900">
                {formatIDR(estimatedMonthly)}
                <span className="text-xs font-semibold text-blue-700">
                  {' '}
                  {t.arCard.perMonth}
                </span>
              </span>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.addCustomerModal.cancelBtn}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>
                {mode === 'existing'
                  ? isId
                    ? 'Simpan Invoice Baru'
                    : 'Create New Invoice'
                  : t.addCustomerModal.submitBtn}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
