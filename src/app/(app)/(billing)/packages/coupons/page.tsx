'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  RefreshButton,
} from '@/components';
import { CouponTable } from '@/components/tables/billing';
import { CouponList } from '@/libs/responses';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ForbiddenCard } from '@/components/cards/404.card';
import { CreateCouponForm } from '@/components/forms/coupon.form';
import { Input } from '@/components/ui';
import { Icons } from '@/assets/icons';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('all');

  const filters: any = {
    page_size: pageSize,
  };

  if (!showInactive) {
    Object.assign(filters, { active_only: 'true' });
  }

  if (searchQuery.trim()) {
    Object.assign(filters, { search: searchQuery.trim() });
  }

  if (discountTypeFilter !== 'all') {
    Object.assign(filters, { discount_type: discountTypeFilter });
  }

  const { coupons, isLoading, isError, pagination } = CouponList(
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDiscountTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDiscountTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce(
    (sum, c) => sum + c.redemption_count,
    0
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <Heading
          name="Discount Coupon Management"
          desc="Discount Code and Promotion Management"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4  border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pagination?.total_records || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Icons.Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4  border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">
                Currently Operating
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Icons.CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4  border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Used</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {totalRedemptions}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Icons.Gift className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4  border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Current Page</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {currentPage} / {pagination?.total_pages || 1}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Icons.FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <PermissionGate
            resource="billing"
            action="create"
            fallback={<ForbiddenCard />}
          >
            <CreateCouponForm />
          </PermissionGate>
        </div>
        <div className="lg:col-span-2">
          {/* Filters and Controls */}
          <div className="bg-white  border border-gray-200 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by coupon name..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 rounded-md border-gray-300"
                  />
                </div>
              </div>

              {/* Discount Type Filter */}
              <div>
                <select
                  value={discountTypeFilter}
                  onChange={handleDiscountTypeChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 border text-sm"
                >
                  <option value="all">All types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed amount</option>
                  <option value="free_trial">Free trial</option>
                </select>
              </div>

              {/* Page Size */}
              <div>
                <PageSizeSelect
                  handlePageSizeChange={handlePageSizeChange}
                  pageSize={pageSize}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <RefreshButton onClick={handleRefresh} />

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
                    Coupon display is not working.
                  </label>
                </div>
              </div>

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Icons.X className="w-3 h-3" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <CouponTable
            coupons={coupons}
            isLoading={isLoading}
            isError={isError}
            refreshKey={refreshKey}
          />

          {!isLoading &&
            !isError &&
            coupons.length > 0 &&
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
