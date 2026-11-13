'use client';

import { useState } from 'react';
import { Heading, RefreshButton } from '@/components';
import { ReceivableAgingReport } from '@/libs/responses';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function Page() {
  const [asOfDate, setAsOfDate] = useState(getToday());
  const [queryDate, setQueryDate] = useState(getToday());

  const { report, byProperty, isLoading, isError } =
    ReceivableAgingReport(queryDate);

  const handleSearch = () => setQueryDate(asOfDate);

  return (
    <section className="space-y-6 p-6">
      <Heading
        name="Receivable Aging"
        desc="Outstanding receivables grouped by overdue period"
      />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">
            As of Date
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
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
          Failed to load receivable aging
        </div>
      )}

      {report && (
        <>
          {/* Total Due */}
          <div
            className={`rounded-lg p-5 ${report.total_due === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <p
              className={`text-sm font-medium ${report.total_due === 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              Total Outstanding as of {report.as_of_date}
            </p>
            <p
              className={`text-3xl font-bold font-mono mt-1 ${report.total_due === 0 ? 'text-green-700' : 'text-red-700'}`}
            >
              {formatVND(report.total_due)}
            </p>
            {report.total_due === 0 && (
              <p className="text-green-600 text-sm mt-1">
                ✓ All receivables have been collected
              </p>
            )}
          </div>

          {/* By Property Table */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-medium text-gray-700">By Property</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Property
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Current
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    1–30 days
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    31–60 days
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    61–90 days
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    &gt;90 days
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byProperty.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No outstanding receivables
                    </td>
                  </tr>
                )}
                {byProperty.map((item: any) => (
                  <tr key={item.property_id || item.customer_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {item.property_name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">
                      {item.current > 0 ? formatVND(item.current) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-600">
                      {item.overdue_30 > 0 ? formatVND(item.overdue_30) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-orange-600">
                      {item.overdue_60 > 0 ? formatVND(item.overdue_60) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-500">
                      {item.overdue_90 > 0 ? formatVND(item.overdue_90) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-700 font-semibold">
                      {item.overdue_90_plus > 0
                        ? formatVND(item.overdue_90_plus)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-800">
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
