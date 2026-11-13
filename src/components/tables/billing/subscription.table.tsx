'use client';

import type React from 'react';
import { useState } from 'react';
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
import { Subscription } from '@/types';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { SubscriptionColumns } from '@/types/billing/colum';
import { useDeleteSubscription } from '@/hooks/billing';
import { QuestionDialog } from '@/components/panels/question.panel';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
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

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  isLoading,
  isError,
}) => {
  const router = useRouter();
  const { can } = usePermissionContext();
  const deleteSubscription = useDeleteSubscription();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<
    string | null
  >(null);

  const handleDeleteClick = (subscriptionId: string) => {
    setSubscriptionToDelete(subscriptionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (subscriptionToDelete) {
      deleteSubscription.mutate(subscriptionToDelete);
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    }
  };

  const getStatusStyle = (status: string) =>
    statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    };

  return (
    <div className="border border-gray-300">
      <Table className="rounded-md border-gray-300">
        <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
          <TableRow>
            {SubscriptionColumns.map((col) => (
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
                colSpan={SubscriptionColumns.length}
                className="text-center border-gray-300"
              >
                <ErrorCustom />
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {SubscriptionColumns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((subscription, index) => {
              const isPending = (subscription as any).isPending;
              const statusStyle = getStatusStyle(subscription.status);

              return (
                <TableRow
                  key={subscription.id}
                  className={`border-gray-300 transition-all duration-500 ${isPending
                      ? 'opacity-60 bg-blue-50 pointer-events-none'
                      : 'opacity-100'
                    }`}
                >
                  {SubscriptionColumns.map((col) => {
                    let cellContent: React.ReactNode = '';

                    if (col.key === 'index') {
                      cellContent = index + 1;
                    } else if (col.key === 'property_id') {
                      cellContent = (
                        <p className="font-mono text-xs">
                          <span className="font-bold text-base">
                            {' '}
                            {subscription.property?.name}
                          </span>
                          <br />
                          {subscription.property_id}
                        </p>
                      );
                    } else if (col.key === 'plan_code') {
                      cellContent = (
                        <div className="flex flex-col">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {subscription.plan_code}
                          </span>
                          {isPending && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 font-medium animate-pulse">
                              <Icons.Plus className="w-3 h-3" />
                              Creating...
                            </span>
                          )}
                        </div>
                      );
                    } else if (col.key === 'status') {
                      cellContent = (
                        <span
                          className={`px-2 py-1 text-xs rounded-md font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      );
                    } else if (col.key === 'started_at') {
                      cellContent = formatSmartDate(subscription.started_at);
                    } else if (col.key === 'expires_at') {
                      const isExpired =
                        new Date(subscription.expires_at) < new Date();
                      cellContent = (
                        <span
                          className={
                            isExpired ? 'text-red-600 font-semibold' : ''
                          }
                        >
                          {formatSmartDate(subscription.expires_at)}
                        </span>
                      );
                    } else if (col.key === 'trial_ends_at') {
                      cellContent = subscription.trial_ends_at ? (
                        formatSmartDate(subscription.trial_ends_at)
                      ) : (
                        <span className="text-gray-400">—</span>
                      );
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
                                  `/packages/subscriptions/${subscription.id}`
                                )
                              }
                              disabled={isPending}
                              title="View details"
                            >
                              <Icons.Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {can('billing', 'delete') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => handleDeleteClick(subscription.id)}
                              disabled={
                                isPending || deleteSubscription.isPending
                              }
                              title="Delete subscription"
                            >
                              <Icons.Trash className="w-4 h-4" />
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
              <TableCell colSpan={SubscriptionColumns.length}>
                <NotiPostNull message="No subscriptions found." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        question="Delete Subscription"
        description="Are you sure you want to delete this subscription? This action cannot be undone."
      />
    </div>
  );
};
