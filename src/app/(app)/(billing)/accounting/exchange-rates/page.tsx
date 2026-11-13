'use client';

import { useState } from 'react';
import { Heading, RefreshButton as _RefreshButton } from '@/components';
import { Button } from '@/components/ui';
import {
  CurrentExchangeRate,
  ExchangeRateList,
} from '@/libs/responses';
import { useCreateExchangeRate } from '@/hooks/billing';
import { formatSmartDate as formatDate } from '@/utils';
import { Plus } from 'lucide-react';
import { ExchangeTypeSelect } from '@/components/selects/exchang_currency.select';

const CURRENCIES = ['USD', 'EUR', 'JPY', 'CNY', 'SGD', 'GBP'];

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function Page() {
  const now = new Date();
  const [currency, setCurrency] = useState('USD');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    from_currency: 'USD',
    rate: '',
    date: getToday(),
    source: 'manual',
    notes: '',
  });

  const { exchangeRate: currentRate } = CurrentExchangeRate(
    currency !== 'all' ? currency : (null as unknown as string)
  );

  const { exchangeRates, isLoading, isError } = ExchangeRateList(
    currency !== 'all' ? currency : null,
    year,
    month
  );

  const createRate = useCreateExchangeRate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rate.trim()) return;
    createRate.mutate(
      {
        from_currency: form.from_currency,
        rate: form.rate.trim(),
        date: form.date,
        source: form.source || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({
            from_currency: 'USD',
            rate: '',
            date: getToday(),
            source: 'manual',
            notes: '',
          });
        },
      }
    );
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <Heading
          name="Exchange Rates"
          desc="Manage currency exchange rates against VND"
        />
        <Button
          className="bg-main text-white hover:bg-primary-800"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rate
        </Button>
      </div>

      {/* Current Rate Card */}
      {currentRate && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-md p-6 text-white">
          <p className="text-purple-200 text-sm mb-1">Current Rate</p>
          <p className="text-4xl font-bold font-mono">
            1 {currentRate.from_currency} = {formatVND(currentRate.rate)} VND
          </p>
          <p className="text-purple-200 text-sm mt-2">
            Source: {currentRate.source} · {formatDate(currentRate.date)}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Currency</label>
          <ExchangeTypeSelect
            handleExchangeTypeChange={(value) => setCurrency(value)}
            exchangeType={currency}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-main"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {exchangeRates.length} records
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Currency
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Rate (VND)
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-red-500">
                  Failed to load exchange rates
                </td>
              </tr>
            )}
            {!isLoading && !isError && exchangeRates.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No rates found
                </td>
              </tr>
            )}
            {exchangeRates.map((rate, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{rate.date}</td>
                <td className="px-4 py-3 font-semibold text-purple-600">
                  {currency}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800">
                  {formatVND(rate.rate)}
                </td>
                <td className="px-4 py-3 text-gray-500">{rate.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Rate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Exchange Rate</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={form.from_currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, from_currency: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate (VND)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={form.rate}
                  onChange={(e) => {
                    // Chỉ cho phép digits và dấu chấm thập phân
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setForm((f) => ({ ...f, rate: val }));
                  }}
                  placeholder="e.g. 25350.75"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, source: e.target.value }))
                  }
                  placeholder="e.g. vietcombank"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-main text-white hover:bg-primary-800"
                  disabled={createRate.isPending || !form.rate.trim()}
                >
                  {createRate.isPending ? 'Saving...' : 'Save Rate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
