'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASE = '/billing/accounting';

const tabs = [
  { id: 'journal', label: 'Journal Entries' },
  { id: 'invoice-period', label: 'Invoice Period' },
  { id: 'chart-of-accounts', label: 'Chart of Accounts' },
  { id: 'exchange-rates', label: 'Exchange Rates' },
  { id: 'reports', label: 'Reports' },
];

export default function AccountingHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-main rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">v</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            Vietstrix Accounting
          </h1>
        </div>

        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const href = tab.id ? `${BASE}/${tab.id}` : BASE;
            const isActive =
              tab.id === ''
                ? pathname === BASE
                : pathname.startsWith(`${BASE}/${tab.id}`);

            return (
              <Link
                key={tab.id}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-main text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
