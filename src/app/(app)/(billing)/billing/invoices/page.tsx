'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  PushButton,
  RefreshButton,
} from '@/components';
import { PlanStatusSelect } from '@/components/selects/plan-status.select';
import { PlanSortSelect } from '@/components/selects/plan-sort.select';
import { PlanOrderSelect } from '@/components/selects/plan-order.select';
import { InvoiceTable } from '@/components/tables/billing';
import { InvoiceList } from '@/libs/responses';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [selectedSort, setSelectedSort] = useState<string>();
  const [selectedOrder, setSelectedOrder] = useState<string>();

  const filters = {
    page_size: pageSize,
    ...(selectedStatus &&
      selectedStatus !== 'all' && { status: selectedStatus }),
    ...(selectedSort && selectedSort !== 'all' && { sort_by: selectedSort }),
    ...(selectedOrder && selectedOrder !== 'all' && { order: selectedOrder }),
  };

  const { invoices, isLoading, isError, pagination } = InvoiceList(
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
    setRefreshKey((prev) => prev + 1);
  };

  const handleOrderChange = (value: string) => {
    setSelectedOrder(value === 'all' ? '' : value);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value === 'all' ? '' : value);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <Heading name="Invoices" desc="Manage invoices and billing documents" />
        <PushButton
          href="/billing/invoices/create"
          label="Create Invoice"
        />
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
            <PlanStatusSelect
              status={selectedStatus ?? 'all'}
              handleStatusChange={handleStatusChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Sort By:</span>
            <PlanSortSelect
              sort_by={selectedSort ?? 'all'}
              handleSortChange={handleSortChange}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Order:</span>
            <PlanOrderSelect
              order={selectedOrder ?? 'all'}
              handleOrderChange={handleOrderChange}
            />
          </div>
        </div>
      </div>

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        isError={isError}
      />

      {!isLoading &&
        !isError &&
        invoices.length > 0 &&
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
