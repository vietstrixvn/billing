'use client';

import type React from 'react';
import { useState } from 'react';
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
import type { SubscriptionAddon } from '@/types/billing/responses';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { usePermissionContext } from '@/contexts/PermissionContext';
import {
  useActivateSubscriptionAddon,
  useDeactivateSubscriptionAddon,
  useRemoveAddonFromSubscription,
} from '@/hooks/billing';
import { QuestionDialog } from '@/components/panels/question.panel';
import { UpdateSubscriptionAddonQuantityDialog } from '@/components/dialogs/billing/update-subscription-addon-quantity.dialog';

interface SubscriptionAddonTableProps {
  subscriptionId: string;
  addons: SubscriptionAddon[];
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
}

export const SubscriptionAddonTable: React.FC<SubscriptionAddonTableProps> = ({
  subscriptionId,
  addons,
  isLoading,
  isError,
  onRefresh,
}) => {
  const { can } = usePermissionContext();
  const removeAddon = useRemoveAddonFromSubscription(subscriptionId);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [editAddon, setEditAddon] = useState<SubscriptionAddon | null>(null);

  const handleRemove = () => {
    if (!removeId) return;
    removeAddon.mutate(removeId, {
      onSuccess: () => {
        setRemoveId(null);
        onRefresh?.();
      },
    });
  };

  const lineTotal = (row: SubscriptionAddon) =>
    row.unit_price_snapshot * row.quantity;

  return (
    <>
      <div className="border border-gray-300">
        <Table>
          <TableHeader className="bg-table-header">
            <TableRow>
              <TableHead>Addon</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Line total</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <NotiPostNull message="No addons on this subscription" />
                </TableCell>
              </TableRow>
            ) : (
              addons.map((row) => (
                <AddonRow
                  key={row.id}
                  row={row}
                  subscriptionId={subscriptionId}
                  canUpdate={can('billing', 'update')}
                  canDelete={can('billing', 'delete')}
                  lineTotal={lineTotal(row)}
                  onEditQuantity={() => setEditAddon(row)}
                  onRemove={() => setRemoveId(row.id)}
                  onRefresh={onRefresh}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={!!removeId}
        onOpenChange={(open) => !open && setRemoveId(null)}
        question="Remove addon"
        description="This removes the addon from the subscription. Renewal will no longer include this addon."
        onConfirm={handleRemove}
      />

      {editAddon && (
        <UpdateSubscriptionAddonQuantityDialog
          open={!!editAddon}
          onOpenChange={(open) => !open && setEditAddon(null)}
          subscriptionId={subscriptionId}
          addonRecordId={editAddon.id}
          currentQuantity={editAddon.quantity}
          onSuccess={() => {
            setEditAddon(null);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};

function AddonRow({
  row,
  subscriptionId,
  canUpdate,
  canDelete,
  lineTotal,
  onEditQuantity,
  onRemove,
  onRefresh,
}: {
  row: SubscriptionAddon;
  subscriptionId: string;
  canUpdate: boolean;
  canDelete: boolean;
  lineTotal: number;
  onEditQuantity: () => void;
  onRemove: () => void;
  onRefresh?: () => void;
}) {
  const activate = useActivateSubscriptionAddon(row.id, subscriptionId);
  const deactivate = useDeactivateSubscriptionAddon(row.id, subscriptionId);
  const isActive = row.is_active !== false;

  const toggleActive = () => {
    const mutation = isActive ? deactivate : activate;
    mutation.mutate(undefined, { onSuccess: () => onRefresh?.() });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{row.addon?.name ?? row.addon_id}</div>
        {row.addon?.slug && (
          <p className="text-xs text-gray-500">{row.addon.slug}</p>
        )}
      </TableCell>
      <TableCell>{row.quantity}</TableCell>
      <TableCell>
        {row.unit_price_snapshot.toLocaleString()} {row.currency_snapshot}
      </TableCell>
      <TableCell className="font-medium text-main">
        {lineTotal.toLocaleString()} {row.currency_snapshot}
      </TableCell>
      <TableCell className="capitalize">
        {row.billing_cycle_snapshot?.replace('_', ' ')}
      </TableCell>
      <TableCell>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {formatSmartDate(String(row.started_at))}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onEditQuantity}
                title="Edit quantity"
              >
                <Icons.Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleActive}
                disabled={activate.isPending || deactivate.isPending}
                title={isActive ? 'Deactivate' : 'Activate'}
              >
                {isActive ? (
                  <Icons.X className="h-4 w-4 text-orange-600" />
                ) : (
                  <Icons.Check className="h-4 w-4 text-green-600" />
                )}
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              title="Remove"
            >
              <Icons.Trash className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
