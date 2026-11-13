'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  PushButton,
  RefreshButton,
} from '@/components';
import { QuoteTable } from '@/components/tables/billing';
import { QuoteList } from '@/libs/responses';
import { QuoteStatusSelect } from '@/components/selects/quote-status.select';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>();

  const filters = {
    page_size: pageSize,
    ...(selectedStatus &&
      selectedStatus !== 'all' && { status: selectedStatus }),
  };

  const { quotes, isLoading, isError, pagination } = QuoteList(
    currentPage,
    filters,
    refreshKey
  );

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (pagination?.total_pages || 0)) {
      setCurrentPage(page);
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <Heading name="Quotes" desc="Manage price quotes and proposals" />
        <PushButton href="/billing/quotes/create" label="Create Quote" />
      </div>

      <div className="md:flex col flex-col-2 bg-white md:flex-row rounded-md justify-between items-center mb-2 p-2 border-b-2 border-main">
        <div className="flex items-center gap-4">
          <RefreshButton onClick={handleRefresh} />

          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Show:</span>
            <PageSizeSelect
              handlePageSizeChange={handlePageSizeChange}
              pageSize={pageSize}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Status:</span>
            <QuoteStatusSelect
              status={selectedStatus ?? 'all'}
              handleStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      <QuoteTable quotes={quotes} isLoading={isLoading} isError={isError} />

      {!isLoading &&
        !isError &&
        quotes.length > 0 &&
        pagination &&
        pagination.total_pages > 0 && (
          <div className="mt-6">
            <CustomPagination
              currentPage={currentPage}
              totalPage={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
    </section>
  );
}
