'use client';

import { useState } from 'react';
import { Heading, RefreshButton } from '@/components';
import { RevenueReport } from '@/libs/responses';

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

const TYPE_COLORS: Record<string, string> = {
  invoice_issued: 'bg-blue-100 text-blue-700',
  payment_received: 'bg-green-100 text-green-700',
  revenue_recognize: 'bg-teal-100 text-teal-700',
  refund: 'bg-red-100 text-red-700',
};

export default function Page() {
  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [query, setQuery] = useState({ from: defaults.from, to: defaults.to });

  const { report, isLoading, isError } = RevenueReport(query.from, query.to);

  const handleSearch = () => setQuery({ from, to });

  return (
    <section className="space-y-6 p-6">
      <Heading
        name="Revenue Report"
        desc="Gross revenue, deductions, and VAT collected"
      />

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
        <RefreshButton onClick={handleSearch} />
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-red-500">
          Failed to load revenue report
        </div>
      )}

      {report && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-5">
              <p className="text-xs text-gray-500 mb-1">Gross Revenue</p>
              <p className="text-2xl font-bold font-mono text-gray-800">
                {formatVND(report.gross_revenue)}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-5">
              <p className="text-xs text-gray-500 mb-1">Deductions</p>
              <p className="text-2xl font-bold font-mono text-red-600">
                -{formatVND(report.deductions)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-5 text-white">
              <p className="text-xs text-green-100 mb-1">Net Revenue</p>
              <p className="text-2xl font-bold font-mono">
                {formatVND(report.net_revenue)}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-5">
              <p className="text-xs text-gray-500 mb-1">VAT Collected</p>
              <p className="text-2xl font-bold font-mono text-purple-600">
                {formatVND(report.vat_collected)}
              </p>
            </div>
          </div>

          {/* By Type */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-medium text-gray-700">Breakdown by Type</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Count
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.by_type.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">
                      No data
                    </td>
                  </tr>
                )}
                {report.by_type.map((item) => (
                  <tr key={item.type} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {item.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800">
                      {formatVND(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
