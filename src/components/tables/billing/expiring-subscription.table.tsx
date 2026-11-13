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
import type { ExpiringSubscription } from '@/types/billing/analytics';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { RefreshCw } from 'lucide-react';

interface ExpiringSubscriptionTableProps {
  subscriptions: ExpiringSubscription[];
  isLoading: boolean;
  isError: boolean;
}

export const ExpiringSubscriptionTable: React.FC<
  ExpiringSubscriptionTableProps
> = ({ subscriptions, isLoading, isError }) => {
  const router = useRouter();

  const subId = (row: ExpiringSubscription) =>
    String(row.subscription_id);

  const urgencyClass = (days: number) => {
    if (days <= 3) return 'text-red-600 font-semibold';
    if (days <= 7) return 'text-orange-600 font-medium';
    if (days <= 14) return 'text-amber-600';
    return 'text-gray-700';
  };

  return (
    <div className="border border-gray-300">
      <Table>
        <TableHeader className="bg-table-header">
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Days left</TableHead>
            <TableHead>Revenue at risk</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={6}>
                <ErrorCustom />
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <NotiPostNull message="No subscriptions expiring in this window." />
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((row) => (
              <TableRow key={subId(row)}>
                <TableCell>
                  <div className="font-medium">{row.property_name}</div>
                  <div className="text-xs text-gray-500">
                    ID: {row.property_id}
                  </div>
                </TableCell>
                <TableCell>{row.plan_name}</TableCell>
                <TableCell className="text-sm">
                  {formatSmartDate(row.expires_at)}
                </TableCell>
                <TableCell className={urgencyClass(row.days_until_expiry)}>
                  {row.days_until_expiry} days
                </TableCell>
                <TableCell className="font-medium">
                  {row.revenue_at_risk.toLocaleString()} VND
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/packages/subscriptions/${subId(row)}`
                        )
                      }
                    >
                      View
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-main text-white"
                      onClick={() =>
                        router.push(
                          `/packages/subscriptions/${subId(row)}?action=renew`
                        )
                      }
                    >
                      <RefreshCw className="mr-1 h-3.5 w-3.5" />
                      Renew
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
