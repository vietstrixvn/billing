'use client';

import { useState } from 'react';
import {
  CustomPagination,
  PageSizeSelect,
  RefreshButton,
} from '@/components';
import { Input } from '@/components/ui';
import { Header } from '@/components/customs/header.design';
import { Container } from '@/components/wrappers/container';
import { ServiceItemTable } from '@/components/tables/billing';
import { ServiceItemList } from '@/libs/responses';
import { ServiceCategorySelect } from '@/components/selects/ser-cate.select';
import { BillingSortSelect } from '@/components/selects/bill-sort.select';
import { OrderSelect } from '@/components/selects/order.select';
import {
  Search,
  X,
  Plus,
  Filter,
  ArrowUpDown,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCate, setSelectedCate] = useState('all');
  const [selectedSort, setSelectedSort] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actualSearchQuery, setActualSearchQuery] = useState('');

  const filters = {
    page_size: pageSize,
    ...(selectedCate &&
      selectedCate !== 'all' && { category_id: selectedCate }),
    code: actualSearchQuery || undefined,
    include_prices: 'true',
    ...(selectedSort && selectedSort !== 'all' && { sort_by: selectedSort }),
    ...(selectedOrder && selectedOrder !== 'all' && { order: selectedOrder }),
  };

  // Only add is_active filter if not showing inactive
  if (!showInactive) {
    Object.assign(filters, { active_only: 'true' });
  }

  const { items, isLoading, isError, pagination } = ServiceItemList(
    currentPage,
    filters,
    refreshKey
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setActualSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActualSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleCateChange = (value: string) => {
    setSelectedCate(value);
    setCurrentPage(1);
  };
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    setCurrentPage(1);
  };
  const handleOrderChange = (value: string) => {
    setSelectedOrder(value);
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
    <Container className="mt-8 space-y-6">
      <Header title="Service Item Catalog" />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Manage billable service items, pricing models, and product catalog entries.
        </p>
        <Link
          href="/packages/item/create"
          className="inline-flex items-center gap-2 bg-main hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Service Item
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 shadow-sm">
        {/* Row 1: Search + Quick Controls */}
        <div className="flex flex-wrap items-center gap-3 p-3 border-b border-slate-100">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by code or name (Enter)"
              className="pl-9 pr-8 text-xs h-9 bg-white border border-slate-300 rounded-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <RefreshButton onClick={handleRefresh} />

          {/* Show inactive toggle */}
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setCurrentPage(1);
              }}
              className="h-3.5 w-3.5 text-main border-slate-300 rounded-none focus:ring-main"
            />
            <span className="flex items-center gap-1">
              {showInactive ? (
                <Eye className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              )}
              Include Inactive
            </span>
          </label>
        </div>

        {/* Row 2: Dropdowns */}
        <div className="flex flex-wrap items-center gap-4 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              Category:
            </span>
            <ServiceCategorySelect
              handleCategoryChange={handleCateChange}
              selectedCategory={selectedCate}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              Sort:
            </span>
            <BillingSortSelect
              handleSortChange={handleSortChange}
              sort={selectedSort}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Order:</span>
            <OrderSelect
              handleOrderChange={handleOrderChange}
              order={selectedOrder}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-600 font-semibold">Show:</span>
            <PageSizeSelect
              handlePageSizeChange={handlePageSizeChange}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <ServiceItemTable
        items={items}
        isLoading={isLoading}
        isError={isError}
      />

      {/* Pagination */}
      {!isLoading &&
        !isError &&
        items.length > 0 &&
        pagination &&
        pagination.total_pages > 0 && (
          <div className="mt-4 flex justify-end">
            <CustomPagination
              currentPage={currentPage}
              totalPage={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
    </Container>
  );
}
