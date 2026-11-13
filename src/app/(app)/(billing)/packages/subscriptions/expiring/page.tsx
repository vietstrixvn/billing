'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  RefreshButton,
} from '@/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ExpiringSubscriptionTable } from '@/components/tables/billing/expiring-subscription.table';
import { ExpiringSubscriptionsList } from '@/libs/responses';

const DAYS_OPTIONS = [
  { value: '7', label: 'Next 7 days' },
  { value: '14', label: 'Next 14 days' },
  { value: '30', label: 'Next 30 days' },
  { value: '60', label: 'Next 60 days' },
  { value: '90', label: 'Next 90 days' },
];

export default function ExpiringSubscriptionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [days, setDays] = useState('30');

  const filters = {
    page_size: pageSize,
    days: parseInt(days, 10),
  };

  const {
    stats: subscriptions = [],
    isLoading = false,
    isError = false,
    pagination = null,
  } = {} as any; // was ExpiringStat(currentPage, filters, refreshKey);

  const { stats: summaryStats } = ExpiringSubscriptionsList(
    parseInt(days, 10),
    refreshKey
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (pagination?.total_pages || 1)) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handleDaysChange = (value: string) => {
    setDays(value);
    setCurrentPage(1);
    setRefreshKey((k) => k + 1);
  };

  const totalAtRisk = subscriptions.reduce(
    (sum: number, s: any) => sum + s.revenue_at_risk,
    0
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Heading
          name="Expiring subscriptions"
          desc="Subscriptions nearing expiry — renew or extend before churn"
        />
        <RefreshButton onClick={() => setRefreshKey((k) => k + 1)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total in window"
          value={String(summaryStats?.total ?? subscriptions.length)}
        />
        <SummaryCard
          label="≤ 7 days"
          value={String(summaryStats?.expiring_in_7_days ?? '—')}
          urgent
        />
        <SummaryCard
          label="≤ 14 days"
          value={String(summaryStats?.expiring_in_14_days ?? '—')}
        />
        <SummaryCard
          label="Revenue at risk"
          value={`${totalAtRisk.toLocaleString()} VND`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-main">Window:</span>
          <Select value={days} onValueChange={handleDaysChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-main">Show:</span>
          <PageSizeSelect
            pageSize={pageSize}
            handlePageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      <ExpiringSubscriptionTable
        subscriptions={subscriptions}
        isLoading={isLoading}
        isError={isError}
      />

      {!isLoading &&
        !isError &&
        subscriptions.length > 0 &&
        pagination &&
        pagination.total_pages > 1 && (
          <CustomPagination
            currentPage={currentPage}
            totalPage={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  urgent,
}: {
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <Card className={`rounded-none border-b-4 ${urgent ? 'border-b-red-500' : 'border-b-main'}`}>
      <CardContent className="pt-4">
        <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
        <p
          className={`mt-1 text-lg font-bold ${urgent ? 'text-red-600' : 'text-gray-900'}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
