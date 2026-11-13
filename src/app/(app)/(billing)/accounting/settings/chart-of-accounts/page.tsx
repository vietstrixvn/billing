'use client';

import { useState } from 'react';
import { Heading, RefreshButton } from '@/components';
import { ChartOfAccountsList } from '@/libs/responses';
import type { ChartOfAccount } from '@/types';
import { CoaTypeSelect } from '@/components/selects/coa_type.select';
import { Icons } from '@/assets';
import { Input } from '@/components/ui';

const TYPE_COLORS: Record<string, string> = {
  asset: 'bg-blue-100 text-blue-700',
  liability: 'bg-red-100 text-red-700',
  equity: 'bg-purple-100 text-purple-700',
  revenue: 'bg-green-100 text-green-700',
  expense: 'bg-orange-100 text-orange-700',
};

const BALANCE_COLORS: Record<string, string> = {
  debit: 'text-blue-600',
  credit: 'text-green-600',
};

export default function Page() {
  const [filterType, setFilterType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actualSearchQuery, setActualSearchQuery] = useState('');

  const filters = {
    search: actualSearchQuery || undefined,
    ...(filterType && filterType !== 'all' && { type: filterType }),
  };

  const { accounts, isLoading, isError } = ChartOfAccountsList(
    filters,
    refreshKey
  );

  // Group by type for summary
  const typeCounts = accounts.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setActualSearchQuery(searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActualSearchQuery('');
  };

  const handleCoaTypeChange = (value: string) => {
    setFilterType(value);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section className="flex flex-col h-full space-y-6 pt-4">
      <Heading
        name="Chart of Accounts"
        desc="Vietnamese Accounting Standards (VAS) — 22 accounts"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? 'all' : type)}
            className={`bg-white border p-4 text-left hover:shadow-md transition-shadow ${filterType === type ? 'ring-2 ring-main' : ''}`}
          >
            <p className="text-xs text-gray-500 mb-1 capitalize">{type}</p>
            <p className="text-2xl font-bold text-gray-800">{count}</p>
            <span
              className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {type}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white border p-4">
        <div className="relative w-full md:w-64">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search name (Press Enter)"
            className="pl-10 text-xs pr-8 h-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <RefreshButton onClick={handleRefresh} />

        <CoaTypeSelect
          handleCoaTypeChange={handleCoaTypeChange}
          coaType={filterType}
        />
        <span className="ml-auto text-sm text-gray-500">
          {accounts.length} accounts
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Code
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name (VI)
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name (EN)
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Type
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Normal Balance
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Parent
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
                  Failed to load chart of accounts
                </td>
              </tr>
            )}
            {!isLoading && !isError && accounts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No accounts found
                </td>
              </tr>
            )}
            {accounts.map((acc: ChartOfAccount, idx: number) => (
              <tr
                key={`${acc.code}-${idx}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-blue-600 text-sm">
                    {acc.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800">
                  <div className={acc.parent_code ? 'pl-5 flex items-center gap-1.5' : ''}>
                    {acc.parent_code && (
                      <span className="text-gray-300 shrink-0">└</span>
                    )}
                    <span className={acc.parent_code ? 'text-sm text-gray-600' : 'font-medium text-sm'}>
                      {acc.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {acc.name_en ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[acc.type] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {acc.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-medium text-xs ${BALANCE_COLORS[acc.normal_balance] ?? 'text-gray-600'}`}
                  >
                    {acc.normal_balance}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                  {acc.parent_code ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
