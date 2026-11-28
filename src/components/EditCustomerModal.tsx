import React, { useEffect, useState } from 'react';
import { Save, ShieldAlert, X } from 'lucide-react';
import { CustomerAR, EditCustomerInput, Language, UserRole } from '../types';
import { getRemainingBalance } from '../utils/arCalculations';
import { formatIDR } from '../utils/formatters';

interface EditCustomerModalProps {
  customer: CustomerAR | null;
  lang: Language;
  userRole: UserRole;
  onClose: () => void;
  onSave: (customerId: string, input: EditCustomerInput) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  lang,
  userRole,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    setName(customer.name);
    setCompany(customer.company || '');
    setPhone(customer.phone);
    setAddress(customer.address);
    setCreditDescription(customer.creditDescription);
    setCreditLimit(String(customer.creditLimit || customer.totalCreditAmount));
    setNextDueDate(customer.nextDueDate || '');
    setError(null);
  }, [customer]);

  if (!customer) return null;

  const isId = lang === 'id';
  const remaining = getRemainingBalance(customer);
  const parsedLimit = Number(creditLimit.replace(/[^\d]/g, '')) || 0;
  const utilization = parsedLimit > 0 ? Math.round((remaining / parsedLimit) * 100) : 0;
  const isOverLimit = parsedLimit > 0 && remaining > parsedLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !creditDescription.trim() || parsedLimit <= 0) {
      setError(
        isId
          ? 'Mohon lengkapi nama, no. HP, deskripsi kredit, dan limit kredit yang valid.'
          : 'Please complete name, phone, credit description, and a valid credit limit.'
      );
      return;
    }

    onSave(customer.id, {
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim(),
      address: address.trim() || 'Indonesia',
      creditDescription: creditDescription.trim(),
      creditLimit: parsedLimit,
      nextDueDate: remaining > 0 ? nextDueDate || customer.nextDueDate : null,
    });
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
              {isId ? 'Edit Data Pelanggan & Limit Kredit' : 'Edit Customer Data & Credit Limit'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {customer.contractCode} •{' '}
              {isId
                ? 'Setiap perubahan akan tercatat otomatis di Audit Trail.'
                : 'Every change is automatically logged in the Audit Trail.'}
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
                {isId ? 'Nama Lengkap Pelanggan' : 'Customer Full Name'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Nama Usaha / Perusahaan' : 'Business / Company'}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Nomor WhatsApp' : 'WhatsApp Number'} *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Alamat' : 'Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Keterangan Kredit / Barang' : 'Credit Description / Item'} *
              </label>
              <input
                type="text"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Limit Kredit (Rp)' : 'Credit Limit (Rp)'} *
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {isId ? 'Terpakai saat ini:' : 'Current active balance:'}{' '}
                <strong className="tabular-nums">{formatIDR(remaining)}</strong> ({utilization}%)
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Jatuh Tempo Berikutnya' : 'Next Due Date'}
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                disabled={remaining === 0}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {isOverLimit && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>
                {isId
                  ? `Perhatian: Sisa piutang (${formatIDR(remaining)}) melebihi limit kredit (${formatIDR(parsedLimit)}). ${userRole === 'super_admin' ? 'Sebagai Super Admin, Anda dapat tetap menyimpan override ini.' : 'Pertimbangkan menaikkan limit atau minta persetujuan Manajer.'}`
                  : `Warning: Remaining balance (${formatIDR(remaining)}) exceeds credit limit (${formatIDR(parsedLimit)}).`}
              </span>
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isId ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>{isId ? 'Simpan Perubahan' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
