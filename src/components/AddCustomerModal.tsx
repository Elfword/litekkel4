import React, { useState } from 'react';
import { Calculator, Plus, X } from 'lucide-react';
import { NewCustomerInput } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { addDays, formatIDR, getTodayDate } from '../utils/formatters';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomer: (input: NewCustomerInput) => void;
  t: TranslationDictionary;
}

const TENOR_OPTIONS = [3, 6, 9, 12, 18, 24];

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onCreateCustomer,
  t,
}) => {
  const defaultFirstDue = addDays(getTodayDate(), 30);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('12000000');
  const [installmentCount, setInstallmentCount] = useState(6);
  const [firstDueDate, setFirstDueDate] = useState(defaultFirstDue);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedTotal = Number(totalAmount.replace(/[^\d]/g, '')) || 0;
  const estimatedMonthly =
    installmentCount > 0 ? Math.round(parsedTotal / installmentCount) : 0;

  const resetForm = () => {
    setName('');
    setCompany('');
    setPhone('');
    setAddress('');
    setCreditDescription('');
    setTotalAmount('12000000');
    setInstallmentCount(6);
    setFirstDueDate(addDays(getTodayDate(), 30));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !phone.trim() ||
      !creditDescription.trim() ||
      parsedTotal <= 0 ||
      installmentCount <= 0 ||
      !firstDueDate
    ) {
      setError(t.addCustomerModal.requiredError);
      return;
    }

    onCreateCustomer({
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim(),
      address: address.trim() || 'Indonesia',
      creditDescription: creditDescription.trim(),
      totalCreditAmount: parsedTotal,
      installmentCount,
      firstDueDate,
    });
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
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {t.addCustomerModal.title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.addCustomerModal.subtitle}
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

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.nameLabel} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.addCustomerModal.namePlaceholder}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.descriptionLabel} *
              </label>
              <input
                type="text"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder={t.addCustomerModal.descriptionPlaceholder}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.totalAmountLabel} *
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {TENOR_OPTIONS.map((months) => (
                  <option key={months} value={months}>
                    {t.addCustomerModal.tenorOption(months)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                {t.addCustomerModal.firstDueDateLabel} *
              </label>
              <input
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Auto Calculation Summary Box */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span>{t.addCustomerModal.autoCalcTitle}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
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

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.addCustomerModal.cancelBtn}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addCustomerModal.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
