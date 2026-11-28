import React, { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Calendar, PlusCircle, RotateCcw } from 'lucide-react';
import { Language, SimulatorPrefill } from '../types';
import { addMonthsSafe, formatDisplayDate, formatIDR, getTodayDate, toISODate } from '../utils/formatters';

interface InstallmentSimulatorProps {
  lang: Language;
  onApplyToNewCredit: (prefill: SimulatorPrefill) => void;
}

const TENOR_PRESETS = [3, 6, 9, 12, 18, 24, 36];
const DP_PERCENT_PRESETS = [0, 10, 20, 30, 50];

export const InstallmentSimulator: React.FC<InstallmentSimulatorProps> = ({
  lang,
  onApplyToNewCredit,
}) => {
  const isId = lang === 'id';

  const [itemName, setItemName] = useState('');
  const [itemPriceInput, setItemPriceInput] = useState('30000000');
  const [dpInput, setDpInput] = useState('6000000');
  const [tenorInput, setTenorInput] = useState('12');
  const [flatRateInput, setFlatRateInput] = useState('0');
  const [firstDueDate, setFirstDueDate] = useState(
    addMonthsSafe(toISODate(getTodayDate()), 1)
  );

  const itemPrice = Math.max(0, Number(itemPriceInput.replace(/[^\d]/g, '')) || 0);
  const rawDp = Math.max(0, Number(dpInput.replace(/[^\d]/g, '')) || 0);
  const dp = Math.min(rawDp, itemPrice);
  const tenor = Math.max(1, Math.min(60, Math.round(Number(tenorInput) || 1)));
  const monthlyFlatRate = Math.max(0, Math.min(20, Number(flatRateInput) || 0));

  const principal = Math.max(0, itemPrice - dp);
  const totalInterest = Math.round(principal * (monthlyFlatRate / 100) * tenor);
  const totalFinanced = principal + totalInterest;
  const monthlyInstallment = tenor > 0 ? Math.round(totalFinanced / tenor) : 0;
  const dpPercent = itemPrice > 0 ? Math.round((dp / itemPrice) * 100) : 0;

  const schedule = useMemo(() => {
    const rows: Array<{
      month: number;
      dueDate: string;
      amount: number;
      remaining: number;
    }> = [];
    let running = totalFinanced;
    for (let i = 1; i <= tenor; i++) {
      const amount = i === tenor ? running : Math.min(monthlyInstallment, running);
      running = Math.max(0, running - amount);
      rows.push({
        month: i,
        dueDate: addMonthsSafe(firstDueDate || toISODate(getTodayDate()), i - 1),
        amount,
        remaining: running,
      });
    }
    return rows;
  }, [totalFinanced, tenor, monthlyInstallment, firstDueDate]);

  const handleDpPreset = (pct: number) => {
    setDpInput(String(Math.round((itemPrice * pct) / 100)));
  };

  const handleReset = () => {
    setItemName('');
    setItemPriceInput('30000000');
    setDpInput('6000000');
    setTenorInput('12');
    setFlatRateInput('0');
    setFirstDueDate(addMonthsSafe(toISODate(getTodayDate()), 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isId ? 'Kalkulator Simulasi Cicilan Kredit' : 'Installment Simulation Calculator'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isId
                ? 'Hitung estimasi angsuran per bulan berdasarkan harga barang, uang muka (DP), dan tenor sebelum pelanggan mengajukan kredit.'
                : 'Calculate estimated monthly installments from item price, down payment (DP), and tenor before a customer takes credit.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{isId ? 'Reset Simulasi' : 'Reset'}</span>
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form */}
        <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
            {isId ? 'Parameter Simulasi' : 'Simulation Inputs'}
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700">
              {isId ? 'Nama Barang / Fasilitas (Opsional)' : 'Item / Credit Description (Optional)'}
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={isId ? 'Contoh: Mesin Kopi Komersial 2 Group' : 'e.g., Commercial Espresso Machine'}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">
              {isId ? 'Harga Barang (Rp)' : 'Item Price (Rp)'}
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={itemPriceInput}
                onChange={(e) => setItemPriceInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 font-mono text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Uang Muka / DP (Rp)' : 'Down Payment / DP (Rp)'}
              </label>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {dpPercent}% {isId ? 'dari harga' : 'of price'}
              </span>
            </div>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                min={0}
                max={itemPrice}
                step={1}
                value={dpInput}
                onChange={(e) => setDpInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 font-mono text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DP_PERCENT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDpPreset(pct)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    dpPercent === pct
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  DP {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">
              {isId ? 'Jumlah Cicilan / Tenor (Bulan)' : 'Number of Installments (Months)'}
            </label>
            <input
              type="number"
              min={1}
              max={60}
              step={1}
              value={tenorInput}
              onChange={(e) => setTenorInput(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TENOR_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTenorInput(String(m))}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    tenor === m
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Bunga Flat / Bln (%)' : 'Flat Interest / Mo (%)'}
              </label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={flatRateInput}
                onChange={(e) => setFlatRateInput(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                {isId ? 'Estimasi Jatuh Tempo ke-1' : 'Est. First Due Date'}
              </label>
              <input
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </section>

        {/* Results & Schedule */}
        <section className="space-y-5 lg:col-span-7">
          {/* Highlight Output Card */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-md">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                  {isId ? 'Estimasi Cicilan per Bulan' : 'Estimated Monthly Installment'}
                </div>
                <div className="mt-1.5 tabular-nums text-3xl font-black tracking-tight sm:text-4xl">
                  {formatIDR(monthlyInstallment)}
                  <span className="ml-1.5 text-sm font-semibold text-blue-200">
                    / {isId ? 'bln' : 'mo'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-blue-100">
                  {isId
                    ? `Tenor ${tenor} bulan • DP ${formatIDR(dp)} (${dpPercent}%)`
                    : `${tenor}-month tenor • DP ${formatIDR(dp)} (${dpPercent}%)`}
                </div>
              </div>

              <button
                type="button"
                disabled={totalFinanced <= 0}
                onClick={() =>
                  onApplyToNewCredit({
                    totalCreditAmount: totalFinanced,
                    installmentCount: tenor,
                    creditDescription: itemName.trim() || undefined,
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 disabled:opacity-50"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{isId ? 'Terapkan ke Kredit Baru' : 'Apply to New Credit'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 sm:grid-cols-4">
              <div>
                <div className="text-[11px] text-blue-200">{isId ? 'Harga Barang' : 'Item Price'}</div>
                <div className="tabular-nums text-sm font-bold">{formatIDR(itemPrice)}</div>
              </div>
              <div>
                <div className="text-[11px] text-blue-200">{isId ? 'Pokok Kredit' : 'Principal'}</div>
                <div className="tabular-nums text-sm font-bold">{formatIDR(principal)}</div>
              </div>
              <div>
                <div className="text-[11px] text-blue-200">{isId ? 'Total Bunga' : 'Total Interest'}</div>
                <div className="tabular-nums text-sm font-bold">{formatIDR(totalInterest)}</div>
              </div>
              <div>
                <div className="text-[11px] text-blue-200">{isId ? 'Total Piutang' : 'Total Receivable'}</div>
                <div className="tabular-nums text-sm font-bold">{formatIDR(totalFinanced)}</div>
              </div>
            </div>
          </div>

          {/* Installment Schedule Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isId ? 'Rincian Jadwal Simulasi Angsuran' : 'Simulated Installment Schedule'}
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {tenor}x {isId ? 'Angsuran' : 'Installments'}
              </span>
            </div>

            <table className="w-full table-auto border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 pr-3">{isId ? 'Angsuran' : 'Installment'}</th>
                  <th className="px-3 py-3">{isId ? 'Estimasi Jatuh Tempo' : 'Est. Due Date'}</th>
                  <th className="px-3 py-3 text-right">{isId ? 'Nominal Cicilan' : 'Installment Amount'}</th>
                  <th className="py-3 pl-3 pr-5 text-right">{isId ? 'Sisa Piutang' : 'Remaining Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50/80">
                    <td className="py-2.5 pl-5 pr-3 font-bold text-slate-900">
                      {isId ? `Angsuran ke-${row.month}` : `Installment #${row.month}`}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {formatDisplayDate(row.dueDate, lang, 'long')}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold text-blue-700">
                      {formatIDR(row.amount)}
                    </td>
                    <td className="py-2.5 pl-3 pr-5 text-right tabular-nums text-slate-700">
                      {formatIDR(row.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
