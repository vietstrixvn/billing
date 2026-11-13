'use client';

import type React from 'react';
import { useRouter } from 'next/navigation';

import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Icons } from '@/assets/icons';
import { BillingRecord } from '@/types';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { BillingRecordColumns } from '@/types/billing/colum';

interface BillingRecordTableProps {
  records: BillingRecord[];
  isLoading: boolean;
  isError: boolean;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  refunded: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Refunded' },
};

const typeConfig: Record<string, { bg: string; text: string; label: string }> =
  {
    invoice: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Invoice' },
    credit: { bg: 'bg-green-100', text: 'text-green-700', label: 'Credit' },
    adjustment: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Adjustment',
    },
  };

export const BillingRecordTable: React.FC<BillingRecordTableProps> = ({
  records,
  isLoading,
  isError,
}) => {
  const router = useRouter();
  const { can } = usePermissionContext();

  const getStatusStyle = (status: string) =>
    statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    };

  const getTypeStyle = (type: string) =>
    typeConfig[type] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: type,
    };

  const formatCurrency = (amount: string | number, currency: string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return `0 ${currency}`;
    return `${num.toLocaleString()} ${currency}`;
  };

  return (
    <div className="border border-gray-300">
      <Table className="rounded-md border-gray-300">
        <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
          <TableRow>
            {BillingRecordColumns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="bg-row rounded-md">
          {isError ? (
            <TableRow>
              <TableCell
                colSpan={BillingRecordColumns.length}
                className="text-center border-gray-300"
              >
                <ErrorCustom />
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {BillingRecordColumns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : records && records.length > 0 ? (
            records.map((record, index) => {
              const isPending = (record as any).isPending;

              return (
                <TableRow
                  key={record.id}
                  className={`border-gray-300 transition-all duration-500 ${
                    isPending
                      ? 'opacity-60 bg-blue-50 pointer-events-none'
                      : 'opacity-100'
                  }`}
                >
                  {BillingRecordColumns.map((col) => {
                    let cellContent: React.ReactNode = '';

                    if (col.key === 'index') {
                      cellContent = index + 1;
                    } else if (col.key === 'property_id') {
                      cellContent = (
                        <p className="font-mono text-xs">
                          <span className="font-bold text-base">
                            {' '}
                            {record.property?.name}
                          </span>
                          <br />
                          {record.property_id}
                        </p>
                      );
                    } else if (col.key === 'subscription_id') {
                      cellContent = (
                        <p className="font-mono text-xs">
                          {record.subscription_id}
                        </p>
                      );
                    } else if (col.key === 'type') {
                      const typeStyle = getTypeStyle(record.type);
                      cellContent = (
                        <span
                          className={`px-2 py-1 text-xs rounded-md font-medium ${typeStyle.bg} ${typeStyle.text}`}
                        >
                          {typeStyle.label}
                        </span>
                      );
                    } else if (col.key === 'amount') {
                      cellContent = (
                        <span className="font-semibold">
                          {formatCurrency(record.amount, record.currency)}
                        </span>
                      );
                    } else if (col.key === 'status') {
                      const statusStyle = getStatusStyle(record.status);
                      cellContent = (
                        <span
                          className={`px-2 py-1 text-xs rounded-md font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      );
                    } else if (col.key === 'payment_method') {
                      cellContent = record.payment_method || '—';
                    } else if (col.key === 'reference_code') {
                      cellContent = (
                        <span className="font-mono text-xs">
                          {record.reference_code || '—'}
                        </span>
                      );
                    } else if (col.key === 'billing_date') {
                      cellContent = formatSmartDate(record.billing_date);
                    } else if (col.key === 'action') {
                      cellContent = (
                        <div className="flex items-center justify-center gap-2">
                          {can('billing', 'read') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={() =>
                                router.push(
                                  `/billing/records/${record.id}`
                                )
                              }
                              disabled={isPending}
                            >
                              <Icons.Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <TableCell key={col.key} className={col.className}>
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={BillingRecordColumns.length}>
                <NotiPostNull message="No billing records found." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
