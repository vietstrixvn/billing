'use client';

import type React from 'react';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Arrows, Icons } from '@/assets/icons';
import { SubscriptionLog } from '@/types';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { SubscriptionLogColumns } from '@/types/billing/colum';

interface SubscriptionLogTableProps {
  logs: SubscriptionLog[];
  isLoading: boolean;
  isError: boolean;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  trial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
  suspended: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    label: 'Suspended',
  },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
};

const changedByTypeConfig: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  system: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: <Icons.Monitor className="w-3 h-3" />,
  },
  admin: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: <Icons.BrickWallShield className="w-3 h-3" />,
  },
  user: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: <Icons.UserPlus className="w-3 h-3" />,
  },
};

export const SubscriptionLogTable: React.FC<SubscriptionLogTableProps> = ({
  logs,
  isLoading,
  isError,
}) => {
  const getStatusStyle = (status: string) =>
    statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    };

  const getChangedByStyle = (type: string) =>
    changedByTypeConfig[type] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: <Icons.UserPlus className="w-3 h-3" />,
    };

  return (
    <div className="border border-gray-300">
      <Table className="rounded-md border-gray-300">
        <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
          <TableRow>
            {SubscriptionLogColumns.map((col) => (
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
                colSpan={SubscriptionLogColumns.length}
                className="text-center border-gray-300"
              >
                <ErrorCustom />
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {SubscriptionLogColumns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : logs && logs.length > 0 ? (
            logs.map((log, index) => {
              const oldStatusStyle = getStatusStyle(log.old_status);
              const newStatusStyle = getStatusStyle(log.new_status);
              const changedByStyle = getChangedByStyle(log.changed_by_type);

              return (
                <TableRow key={log.id} className="border-gray-300">
                  {SubscriptionLogColumns.map((col) => {
                    let cellContent: React.ReactNode = '';

                    if (col.key === 'index') {
                      cellContent = index + 1;
                    } else if (col.key === 'subscription_id') {
                      cellContent = (
                        <span className="font-mono text-xs">
                          {log.subscription_id}
                        </span>
                      );
                    } else if (col.key === 'property_id') {
                      cellContent = (
                        <span className="font-mono text-xs">
                          {log.property_id}
                        </span>
                      );
                    } else if (col.key === 'status_change') {
                      cellContent = (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-md font-medium ${oldStatusStyle.bg} ${oldStatusStyle.text}`}
                          >
                            {oldStatusStyle.label}
                          </span>
                          <Arrows.ArrowRight className="w-4 h-4 text-gray-400" />
                          <span
                            className={`px-2 py-1 text-xs rounded-md font-medium ${newStatusStyle.bg} ${newStatusStyle.text}`}
                          >
                            {newStatusStyle.label}
                          </span>
                        </div>
                      );
                    } else if (col.key === 'plan_code') {
                      cellContent = (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.plan_code}
                        </span>
                      );
                    } else if (col.key === 'changed_by') {
                      cellContent = (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md font-medium ${changedByStyle.bg} ${changedByStyle.text}`}
                          >
                            {changedByStyle.icon}
                            {log.changed_by_type}
                          </span>
                          <span className="font-mono text-xs text-gray-500">
                            ID: {log.changed_by}
                          </span>
                        </div>
                      );
                    } else if (col.key === 'reason') {
                      cellContent = log.reason ? (
                        <span className="text-xs">{log.reason}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      );
                    } else if (col.key === 'changed_at') {
                      cellContent = formatSmartDate(log.changed_at);
                    } else if (col.key === 'expires_change') {
                      const oldDate = log.old_expires_at
                        ? formatSmartDate(log.old_expires_at)
                        : 'N/A';
                      const newDate = log.new_expires_at
                        ? formatSmartDate(log.new_expires_at)
                        : 'N/A';

                      cellContent =
                        oldDate !== newDate ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {oldDate}
                            </span>
                            <Arrows.ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-semibold text-primary-600">
                              {newDate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No change
                          </span>
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
              <TableCell colSpan={SubscriptionLogColumns.length}>
                <NotiPostNull message="No subscription logs found." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
