'use client';

import { useState } from 'react';
import {
  CustomPagination,
  Heading,
  PageSizeSelect,
  PushButton,
  RefreshButton,
} from '@/components';
import { BillingRecordTable } from '@/components/tables/billing';
import { BillingRecordList } from '@/libs/responses';
import { RecordStatusSelect } from '@/components/selects/record.select';
import { RecordTypeSelect } from '@/components/selects/record-type.select';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>();

  const filters = {
    ...(selectedStatus &&
      selectedStatus !== 'all' && { status: selectedStatus }),
    ...(selectedType && selectedType !== 'all' && { type: selectedType }),
    page_size: pageSize,
  };

  const { records, isLoading, isError, pagination } = BillingRecordList(
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

  const handleTypeChange = (value: string) => {
    setSelectedType(value === 'all' ? '' : value);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section className="" >
      <div className="flex items-center justify-between mb-6">
        <Heading
          name="Billing Records"
          desc="Manage billing records and payments"
        />
        <PushButton
          href="/billing/records/create"
          label="Create Record"
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
            <RecordStatusSelect
              status={selectedStatus ?? 'all'}
              handleStatusChange={handleStatusChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-main font-semibold">Type:</span>
            <RecordTypeSelect
              type={selectedType ?? 'all'}
              handleTypeChange={handleTypeChange}
            />
          </div>
        </div>
      </div>

      <BillingRecordTable
        records={records}
        isLoading={isLoading}
        isError={isError}
      />

      {!isLoading &&
        !isError &&
        records.length > 0 &&
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
