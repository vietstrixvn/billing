'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  GripVertical,
  Copy,
  Loader2,
} from 'lucide-react';
import { formatSmartDate } from '@/utils';
import type { PlanIncludedItem } from '@/types';
import { QuestionDialog } from '@/components/panels/question.panel';
import { ServiceItemPriceCell } from './ServiceItemPriceCell';
import { useUpdatePlanIncludedItem } from '@/hooks/billing/usePlanIncludedItem';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanIncludedItemTableProps {
  items: PlanIncludedItem[];
  isLoading: boolean;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={copied ? true : undefined}>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors group cursor-pointer"
          >
            <span className="font-mono text-xs text-gray-700">{code}</span>
            <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {copied ? 'Copied!' : 'Copy code'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function EditPlanItemDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: PlanIncludedItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [isUnlimited, setIsUnlimited] = useState(item?.is_unlimited || false);
  const updateMutation = useUpdatePlanIncludedItem(
    item?.id || '',
    item?.plan_id || ''
  );

  // Sync state when dialog opens with selected item
  useState(() => {
    if (item) {
      setQuantity(item.quantity || 1);
      setIsUnlimited(item.is_unlimited || false);
    }
  });

  const handleSave = () => {
    if (!item) return;
    updateMutation.mutate(
      {
        quantity: isUnlimited ? 0 : Math.max(1, quantity),
        is_unlimited: isUnlimited,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-main">
            Edit Item Quantity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500 font-medium">Service Item</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {item?.service_item?.name || 'Item'}
            </p>
            <span className="text-xs font-mono text-gray-500">
              Code: {item?.service_item?.code || 'N/A'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Quantity included in plan
            </label>
            <Input
              type="number"
              min={1}
              value={quantity}
              disabled={isUnlimited || updateMutation.isPending}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="edit-unlimited"
              checked={isUnlimited}
              disabled={updateMutation.isPending}
              onCheckedChange={(checked) => setIsUnlimited(!!checked)}
            />
            <label
              htmlFor="edit-unlimited"
              className="text-xs text-gray-700 font-medium select-none cursor-pointer"
            >
              Unlimited quantity
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-main hover:bg-primary-800 text-white"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="gap-2 text-sm cursor-pointer"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit quantity
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QuestionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        question="Remove item from plan"
        description="Are you sure you want to remove this item from the plan? This action cannot be undone."
        onConfirm={() => {
          onDelete();
          setShowDeleteDialog(false);
        }}
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlanIncludedItemTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  onRefresh,
}: PlanIncludedItemTableProps) {
  const [editingItem, setEditingItem] = useState<PlanIncludedItem | null>(null);

  const handleStartEdit = (item: PlanIncludedItem) => {
    setEditingItem(item);
    if (onEdit) onEdit(item.id);
  };

  return (
    <>
      <div className="border border-gray-300 bg-white overflow-hidden rounded-sm shadow-2xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-table-header text-gray-700 font-bold border-b border-gray-300">
              <TableRow className="hover:bg-table-header">
                <TableHead className="w-12 text-center text-xs font-bold text-gray-700 uppercase">
                  #
                </TableHead>
                <TableHead className="text-xs font-bold text-gray-700 uppercase min-w-[180px]">
                  Service Item
                </TableHead>
                <TableHead className="text-xs font-bold text-gray-700 uppercase min-w-[100px]">
                  Code
                </TableHead>
                <TableHead className="text-xs font-bold text-gray-700 uppercase min-w-[110px] text-center">
                  Quantity
                </TableHead>
                <TableHead className="text-xs font-bold text-gray-700 uppercase min-w-[140px]">
                  Prices
                </TableHead>
                <TableHead className="text-xs font-bold text-gray-700 uppercase min-w-[110px]">
                  Updated
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody className="bg-row">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-gray-200">
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-gray-400"
                  >
                    No included items found for this plan.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="group border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* Index */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                        <span className="text-xs font-medium text-gray-500 tabular-nums w-4">
                          {index + 1}
                        </span>
                      </div>
                    </TableCell>

                    {/* Service item name & description */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-main">
                          {item.service_item?.name || 'Unknown Item'}
                        </span>
                        {item.service_item?.description && (
                          <span className="text-xs text-gray-400 line-clamp-1">
                            {item.service_item.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Code */}
                    <TableCell>
                      <CodeChip code={item.service_item?.code || 'N/A'} />
                    </TableCell>

                    {/* Quantity Column */}
                    <TableCell className="text-center">
                      {item.is_unlimited ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold"
                        >
                          Unlimited
                        </Badge>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <span className="text-sm font-bold text-gray-900 tabular-nums">
                            {item.quantity}
                          </span>
                          {item.service_item?.unit && (
                            <span className="text-xs text-gray-500 font-normal">
                              {item.service_item.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Prices */}
                    <TableCell>
                      <ServiceItemPriceCell
                        item_prices={item.service_item?.item_prices}
                        itemId={item.service_item_id || item.service_item?.id}
                      />
                    </TableCell>

                    {/* Updated at */}
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {formatSmartDate(item.updated_at)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <ActionMenu
                        onEdit={() => handleStartEdit(item)}
                        onDelete={() => onDelete(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Quantity Modal */}
      {editingItem && (
        <EditPlanItemDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null);
          }}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
