'use client';

import { useState } from 'react';
import { Heading, RefreshButton } from '@/components';
import { GeneralLedgerReport } from '@/libs/responses';
import { ChartOfAccountsList } from '@/libs/responses';
import { formatSmartDate as formatDate } from '@/utils';

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
  const [accountCode, setAccountCode] = useState('131');
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [query, setQuery] = useState({
    accountCode: '131',
    from: defaults.from,
    to: defaults.to,
  });

  const filters = {};

  const { report, lines, summary, isLoading, isError } = GeneralLedgerReport(
    query.accountCode,
    query.from,
    query.to
  );
  const { accounts } = ChartOfAccountsList(filters, 0);

  // Deduplicate by code to avoid React key warnings
  const uniqueAccounts = accounts.filter(
    (acc, idx, arr) => arr.findIndex((a) => a.code === acc.code) === idx
  );

  const handleSearch = () => setQuery({ accountCode, from, to });

  return (
    <section className="space-y-6 p-6">
      <Heading
        name="General Ledger"
        desc="Transaction history with running balance for a specific account"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Account</label>
          <select
            value={accountCode}
            onChange={(e) => setAccountCode(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
          >
            {uniqueAccounts.map((acc, idx) => (
              <option key={`${acc.code}-${idx}`} value={acc.code}>
                {acc.code} — {acc.name}
              </option>
            ))}
          </select>
        </div>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Debit</p>
            <p className="text-xl font-bold font-mono text-blue-600">
              {formatVND(summary.total_debit)}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Credit</p>
            <p className="text-xl font-bold font-mono text-green-600">
              {formatVND(summary.total_credit)}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Net Change</p>
            <p
              className={`text-xl font-bold font-mono ${summary.net_change >= 0 ? 'text-blue-600' : 'text-red-600'}`}
            >
              {formatVND(summary.net_change)}
            </p>
          </div>
        </div>
      )}

      {/* Account Info */}
      {report && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          <span className="font-mono font-semibold">{report.account_code}</span>
          {' — '}
          {report.account_name}
          <span className="text-blue-500 ml-2">
            ({report.from_date} → {report.to_date})
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Entry #
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Description
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Debit
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Credit
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-red-500">
                  Failed to load general ledger
                </td>
              </tr>
            )}
            {!isLoading && !isError && lines.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No transactions found
                </td>
              </tr>
            )}
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(line.date)}
                </td>
                <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                  {line.entry_number}
                </td>
                <td className="px-4 py-3 text-gray-700">{line.description}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {line.debit > 0 ? formatVND(line.debit) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-800">
                  {line.credit > 0 ? formatVND(line.credit) : '—'}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono font-semibold ${line.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                >
                  {formatVND(line.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
