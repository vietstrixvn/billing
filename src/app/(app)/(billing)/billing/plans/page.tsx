'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  PushButton,
  RefreshButton,
} from '@/components';
import { PlanTable } from '@/components/tables/billing';
import { PlanList } from '@/libs/responses';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showInactive, setShowInactive] = useState(false);

  const filters = {
    page_size: pageSize,
  };

  // Only add is_active filter if not showing inactive
  if (!showInactive) {
    Object.assign(filters, { is_active: 'true' });
  }

  const { plans, isLoading, isError, pagination } = PlanList(
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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <Heading name="Plans" desc="Manage subscription plans and pricing" />

        <PushButton href="/billing/plans/create" label="Create Plan" />
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showInactive"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showInactive"
              className="text-xs text-gray-700 cursor-pointer"
            >
              Show inactive plans
            </label>
          </div>
        </div>
      </div>

      <PlanTable plans={plans} isLoading={isLoading} isError={isError} />

      {!isLoading &&
        !isError &&
        plans.length > 0 &&
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
