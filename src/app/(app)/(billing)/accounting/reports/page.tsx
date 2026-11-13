'use client';

import { Heading } from '@/components';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { BookOpen, Scale, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

const reports = [
  {
    title: 'General Ledger',
    description:
      'View all transactions for a specific account with running balance',
    icon: BookOpen,
    href: '/billing/accounting/reports/general-ledger',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Trial Balance',
    description: 'Verify total debits equal total credits across all accounts',
    icon: Scale,
    href: '/billing/accounting/reports/trial-balance',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Revenue Report',
    description: 'Gross revenue, deductions, VAT collected by period',
    icon: TrendingUp,
    href: '/billing/accounting/reports/revenue',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Receivable Aging',
    description: 'Outstanding receivables grouped by overdue period',
    icon: Clock,
    href: '/billing/accounting/reports/receivable-aging',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function Page() {
  return (
    <section className="space-y-6 pt-4">
      <Heading
        name="Financial Reports"
        desc="Accounting reports and financial analytics"
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}
                >
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
