'use client';

import { useState } from 'react';
import { Heading, RefreshButton } from '@/components';
import { TrialBalanceReport } from '@/libs/responses';
import { Icons } from '@/assets';
import { Button } from '@/components/ui';
import TrialBalance from './_components/trialbalance';
import type { TrialBalanceData as TBComponentData } from './_components/trialbalance';

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
  const [query, setQuery] = useState({ from: defaults.from, to: defaults.to });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { report, accounts, summary, isLoading, isError } = TrialBalanceReport(
    query.from,
    query.to
  );

  const handleSearch = () => setQuery({ from, to });

  // Map API data → TrialBalance component shape
  const tbComponentData: TBComponentData | null =
    report && summary
      ? {
        companyName: 'VietStrix',
        reportTitle: 'Trial Balance',
        entity: 'All Accounts',
        period: `${report.from_date} → ${report.to_date}`,
        accounts: accounts.map((acc) => ({
          code: acc.code,
          name: acc.name,
          debit: acc.total_debit,
          credit: acc.total_credit,
          balDebit: acc.balance > 0 ? acc.balance : null,
          balCredit: acc.balance < 0 ? Math.abs(acc.balance) : null,
        })),
        subtotal: {
          debit: summary.total_debit,
          credit: summary.total_credit,
          balDebit: summary.total_debit,
          balCredit: summary.total_credit,
        },
      }
      : null;

  const isBalanced = summary && summary.total_debit === summary.total_credit;

  return (
    <section className="space-y-6 p-6">
      <Heading
        name="Trial Balance"
        desc="Verify that total debits equal total credits"
      />

      {/* Filters */}
      <div className="justify-between flex bg-white rounded-md border     p-4">
        <div className="flex items-center gap-4">
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
        <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
          <Icons.FileText className="w-3.5 h-3.5 mr-1.5" />
          View PDF
        </Button>
      </div>

      {/* Balance Status */}
      {summary && (
        <div
          className={`rounded-md p-4 flex items-center justify-between ${isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
        >
          <div>
            <p
              className={`font-semibold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}
            >
              {isBalanced ? '✓ Balanced' : '✗ Out of Balance'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {report?.from_date} → {report?.to_date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Debit / Credit</p>
            <p className="font-mono font-bold text-gray-800">
              {formatVND(summary.total_debit)} /{' '}
              {formatVND(summary.total_credit)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Code
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Account Name
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Total Debit
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Total Credit
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-red-500">
                  Failed to load trial balance
                </td>
              </tr>
            )}
            {!isLoading && !isError && accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No data for this period
                </td>
              </tr>
            )}
            {accounts.map((acc) => (
              <tr key={acc.code} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                  {acc.code}
                </td>
                <td className="px-4 py-3 text-gray-800">{acc.name}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {acc.total_debit > 0 ? formatVND(acc.total_debit) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {acc.total_credit > 0 ? formatVND(acc.total_credit) : '—'}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono font-semibold ${acc.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                >
                  {formatVND(acc.balance)}
                </td>
              </tr>
            ))}
          </tbody>
          {summary && (
            <tfoot className="bg-gray-50 border-t font-semibold">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-gray-600">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatVND(summary.total_debit)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatVND(summary.total_credit)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* PDF Preview Drawer */}
      <>
        {/* Backdrop */}
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-1/2 bg-gray-100 z-50 shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b shrink-0">
            <span className="font-semibold text-sm text-gray-700">
              Trial Balance — PDF Preview
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer body */}
          <div className="flex-1 overflow-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Loading...
              </div>
            )}
            {!isLoading && !tbComponentData && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No data available for this period.
              </div>
            )}
            {!isLoading && tbComponentData && (
              <TrialBalance data={tbComponentData} compact />
            )}
          </div>
        </div>
      </>
    </section>
  );
}
