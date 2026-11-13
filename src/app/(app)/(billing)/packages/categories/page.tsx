'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  RefreshButton,
} from '@/components';
import { ServiceCategoryTable } from '@/components/tables/billing';
import { ServiceCategoryList } from '@/libs/responses';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { CreateServiceCategoryForm } from '@/components/forms/ser-cate.form';

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
    Object.assign(filters, { active_only: 'true' });
  }

  const { categories, isLoading, isError, pagination } = ServiceCategoryList(
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
        <Heading
          name="Service Categories"
          desc="Manage service category classifications"
        />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1  ">
          <PermissionGate
            resource="billing"
            action="create"
            fallback={<ForbiddenCard />}
          >
            <CreateServiceCategoryForm />
          </PermissionGate>
        </div>
        <div className="lg:col-span-2">
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
                  Show inactive categories
                </label>
              </div>
            </div>
          </div>

          <ServiceCategoryTable
            categories={categories}
            isLoading={isLoading}
            isError={isError}
          />

          {!isLoading &&
            !isError &&
            categories.length > 0 &&
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
        </div>
      </section>
    </section>
  );
}
