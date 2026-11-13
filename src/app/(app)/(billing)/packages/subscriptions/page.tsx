'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plus } from 'lucide-react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  RefreshButton,
} from '@/components';
import { Button } from '@/components/ui';
import { SubscriptionTable } from '@/components/tables/billing';
import { SubscriptionList } from '@/libs/responses';
import { BillingStatusSelect } from '@/components/selects/billing-status.select';
import { Icons } from '@/assets';
import { PlanSelect } from '@/components/selects/plan.select';
import { PropertySelect } from '@/components/selects/property.select';
import { ClearFiltersButton } from '@/components/buttons/clear.button';

export default function Page() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const filters = {
    ...(selectedStatus &&
      selectedStatus !== 'all' && { status: selectedStatus }),
    ...(selectedPropertyId && { property_id: selectedPropertyId }),
    ...(selectedPlanId && { plan_id: selectedPlanId }),

    page_size: pageSize,
  };

  const { subscriptions, isLoading, isError, pagination } = SubscriptionList(
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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const hasActiveFilters =
    (selectedStatus !== undefined &&
      selectedStatus !== 'all' &&
      selectedStatus !== '') ||
    selectedPropertyId !== '' ||
    selectedPlanId !== '';

  const handleClearAllFilters = () => {
    setSelectedStatus('all');
    setSelectedPropertyId('');
    setSelectedPlanId('');
    setCurrentPage(1);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <Heading
          name="Subscriptions"
          desc="Manage property subscriptions and plans"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push('/packages/subscriptions/provision')
            }
          >
            <Package className="mr-2 h-4 w-4" />
            Sell package
          </Button>
          <Button
            className="bg-main text-white hover:bg-primary-800"
            onClick={() => router.push('/packages/subscriptions/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Shell subscription
          </Button>
        </div>
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
            <BillingStatusSelect
              status={selectedStatus ?? 'all'}
              handleStatusChange={handleStatusChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Property:</span>
            <div className="flex items-center gap-1">
              <PropertySelect
                value={selectedPropertyId}
                onValueChange={(val) => {
                  setSelectedPropertyId(val === 'all' ? '' : val);
                  setCurrentPage(1);
                }}
                placeholder="All properties"
              />
              {selectedPropertyId && (
                <button
                  onClick={() => {
                    setSelectedPropertyId('');
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Clear filter"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Plan:</span>
            <div className="flex items-center gap-1">
              <PlanSelect
                value={selectedPlanId}
                onValueChange={(val) => {
                  setSelectedPlanId(val === 'all' ? '' : val);
                  setCurrentPage(1);
                }}
                placeholder="All plan"
              />
              {selectedPlanId && (
                <button
                  onClick={() => {
                    setSelectedPlanId('');
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Clear filter"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <ClearFiltersButton
          onClear={handleClearAllFilters}
          isVisible={hasActiveFilters}
        />
      </div>

      <SubscriptionTable
        subscriptions={subscriptions}
        isLoading={isLoading}
        isError={isError}
      />

      {!isLoading &&
        !isError &&
        subscriptions.length > 0 &&
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
