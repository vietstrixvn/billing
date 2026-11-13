'use client';

import { useState } from 'react';
import { Heading, RefreshButton } from '@/components';
import { InvoicePeriodList } from '@/libs/responses';
import { formatSmartDate as formatDate } from '@/utils';
import type { InvoicePeriod } from '@/types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function getDefaultDates() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

export default function Page() {
  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [queryFrom, setQueryFrom] = useState(defaults.from);
  const [queryTo, setQueryTo] = useState(defaults.to);
  const [refreshKey, setRefreshKey] = useState(0);

  const { invoices, isLoading, isError } = InvoicePeriodList({
    from: queryFrom,
    to: queryTo,
    _refresh: refreshKey,
  });

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.invoice_amount ?? 0),
    0
  );

  const handleSearch = () => {
    setQueryFrom(from);
    setQueryTo(to);
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <Heading
          name="Invoice Period"
          desc="Revenue report — actual amount customers must pay (invoice.amount)"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 bg-main text-white text-sm rounded hover:bg-primary-800 transition-colors"
        >
          Search
        </button>
        <RefreshButton onClick={() => setRefreshKey((k) => k + 1)} />
        <span className="ml-auto text-sm text-gray-500">
          {invoices.length} invoices
        </span>
      </div>

      {/* Summary */}
      {!isLoading && !isError && invoices.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-green-700">
            Total Revenue ({queryFrom} → {queryTo})
          </span>
          <span className="text-lg font-bold text-green-800 font-mono">
            {formatVND(totalRevenue)}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Invoice #
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Property ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Issued At
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Due At
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Paid At
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Sub Total
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Tax ({`%`})
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-red-500">
                  Failed to load invoices
                </td>
              </tr>
            )}
            {!isLoading && !isError && invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  No invoices found for this period
                </td>
              </tr>
            )}
            {invoices.map((inv: InvoicePeriod) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 font-medium">
                  {inv.invoice_number}
                </td>
                <td className="px-4 py-3 text-gray-600">{inv.property_id}</td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(inv.issued_at)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {inv.due_at ? formatDate(inv.due_at) : '—'}
                </td>
                <td className="px-4 py-3">
                  {inv.paid_at ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {formatDate(inv.paid_at)}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Unpaid
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {formatVND(inv.sub_total)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {(inv.tax_rate_bps / 100).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                  {formatVND(inv.invoice_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
