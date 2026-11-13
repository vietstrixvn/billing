'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading, RefreshButton } from '@/components';
import { JournalEntriesByPeriod } from '@/libs/responses';
import { formatSmartDate as formatDate } from '@/utils';
import { Plus, Download } from 'lucide-react';
import type { JournalEntry } from '@/types';
import CreateJournalEntryModal from './_components/CreateJournalEntryModal';
import { exportJournalToXls } from '@/utils/exportJournalXls';

const TYPE_COLORS: Record<string, string> = {
  invoice_issued: 'bg-blue-100 text-blue-700',
  payment_received: 'bg-green-100 text-green-700',
  refund: 'bg-red-100 text-red-700',
  credit_note: 'bg-yellow-100 text-yellow-700',
  discount_applied: 'bg-orange-100 text-orange-700',
  deferred_revenue: 'bg-indigo-100 text-indigo-700',
  revenue_recognize: 'bg-teal-100 text-teal-700',
  reversal: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  posted: 'bg-green-100 text-green-700',
  reversed: 'bg-red-100 text-red-700',
  voided: 'bg-yellow-100 text-yellow-700',
};

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

// Default to current month
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
  const router = useRouter();
  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [queryFrom, setQueryFrom] = useState(defaults.from);
  const [queryTo, setQueryTo] = useState(defaults.to);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { journalEntries, isLoading, isError } = JournalEntriesByPeriod(
    queryFrom,
    queryTo,
    refreshKey
  );
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const handleSearch = () => {
    setQueryFrom(from);
    setQueryTo(to);
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <Heading
          name="Journal Entries"
          desc="View all accounting journal entries by period"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              exportJournalToXls(
                journalEntries,
                `journal-entries-${queryFrom}-${queryTo}.xlsx`
              )
            }
            disabled={journalEntries.length === 0}
            className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 whitespace-nowrap border bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Export XLS</span>
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 whitespace-nowrap  bg-main px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-800"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white border  p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 bg-main text-white text-sm hover:bg-primary-800 transition-colors"
        >
          Search
        </button>
        <RefreshButton onClick={handleRefresh} />
        <span className="ml-auto text-sm text-gray-500">
          {journalEntries.length} entries
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Entry #
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Type
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Source
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Debit
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Credit
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Notes
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
                  Failed to load journal entries
                </td>
              </tr>
            )}
            {!isLoading && !isError && journalEntries.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  No entries found for this period
                </td>
              </tr>
            )}
            {journalEntries.map((entry: JournalEntry) => (
              <tr
                key={entry.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  router.push(`/accounting/journal/${entry.id}`)
                }
              >
                <td className="px-4 py-3 font-mono text-blue-600 font-medium">
                  {entry.entry_number}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(entry.entry_date)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[entry.type] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {entry.type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {entry.source_type}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {formatVND(entry.total_debit)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {formatVND(entry.total_credit)}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                  {entry.notes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateJournalEntryModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            handleSearch();
          }}
        />
      )}
    </section>
  );
}
