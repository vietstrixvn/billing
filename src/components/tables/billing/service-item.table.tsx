'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
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
import type { ServiceItem } from '@/types';
import { useDeleteServiceItem } from '@/hooks/billing';
import { ErrorCustom } from '@/components/loading/error_custom';
import { NotiPostNull } from '@/components/loading/null_custom';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { ServiceItemPriceCell } from './ServiceItemPriceCell';
import { ServiceItemDetailDialog } from '@/components/dialogs/service-item-detail.dialog';

const ServiceItemColumns = [
  { key: 'index', label: '#', className: 'text-xs text-gray-800 w-8' },
  { key: 'name', label: 'Name', className: 'text-xs text-gray-800' },
  { key: 'code', label: 'Code', className: 'text-xs text-gray-800' },
  { key: 'category', label: 'Category', className: 'text-xs text-gray-800' },
  { key: 'unit', label: 'Unit', className: 'text-xs text-gray-800 w-20' },
  { key: 'price', label: 'Prices', className: 'text-xs text-gray-800' },
  {
    key: 'is_metered',
    label: 'Metered',
    className: 'text-xs text-gray-800 w-24',
  },
  {
    key: 'is_active',
    label: 'Status',
    className: 'text-xs text-gray-800 w-24',
  },
  { key: 'action', label: 'Actions', className: 'text-xs text-gray-800 w-32' },
];

interface ServiceItemTableProps {
  items: ServiceItem[];
  isLoading: boolean;
  isError: boolean;
}

export const ServiceItemTable: React.FC<ServiceItemTableProps> = ({
  items,
  isLoading,
  isError,
}) => {
  const { mutate: deleteItem } = useDeleteServiceItem();
  const router = useRouter();
  const { can } = usePermissionContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);

  const handleViewClick = (itemId: string) => {
    setViewingItemId(itemId);
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!itemToDelete) return;

    setDeleteDialogOpen(false);
    deleteItem(itemToDelete);
    setItemToDelete(null);
  }, [itemToDelete, deleteItem]);

  return (
    <>
      <div className="border border-gray-300 bg-white">
        <Table className=" border-gray-300">
          <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
            <TableRow>
              {ServiceItemColumns.map((col) => (
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
                  colSpan={ServiceItemColumns.length}
                  className="text-center border-gray-300"
                >
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {ServiceItemColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items && items.length > 0 ? (
              items.map((item, index) => {
                const isPending = (item as any).isPending;
                const isUpdating = (item as any).isUpdating;

                return (
                  <TableRow
                    key={item.id}
                    className={`border-gray-300 transition-all duration-500 ${isPending
                        ? 'opacity-60 bg-blue-50 pointer-events-none'
                        : isUpdating
                          ? 'opacity-70 bg-yellow-50 pointer-events-none'
                          : 'opacity-100'
                      }`}
                  >
                    {ServiceItemColumns.map((col) => {
                      let cellContent: React.ReactNode = '';

                      if (col.key === 'index') {
                        cellContent = index + 1;
                      } else if (col.key === 'name') {
                        cellContent = (
                          <div className="flex flex-col">
                            <span
                              className="font-bold text-primary-600 cursor-pointer hover:text-main hover:underline"
                              onClick={() => handleViewClick(item.id)}
                            >
                              {item.name}
                            </span>
                            {item.description && (
                              <span className="text-xs text-gray-500">
                                {item.description}
                              </span>
                            )}
                            {isPending && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 font-medium animate-pulse">
                                <Icons.Plus className="w-3 h-3" />
                                Creating...
                              </span>
                            )}
                            {isUpdating && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs text-yellow-600 font-medium animate-pulse">
                                <Icons.PencilIcon className="w-3 h-3" />
                                Updating...
                              </span>
                            )}
                          </div>
                        );
                      } else if (col.key === 'code') {
                        cellContent = (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1">
                            {item.code}
                          </span>
                        );
                      } else if (col.key === 'category') {
                        cellContent = item.category ? (
                          <span className="text-sm">{item.category.name}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        );
                      } else if (col.key === 'unit') {
                        const unit = item.unit ?? item.unit_label;
                        cellContent = unit ? (
                          <span className="text-sm font-mono text-gray-600">
                            {unit}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        );
                      } else if (col.key === 'price') {
                        cellContent = (
                          <ServiceItemPriceCell item_prices={item.item_prices} />
                        );
                      } else if (col.key === 'is_metered') {
                        cellContent = item.is_metered ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                            No
                          </span>
                        );
                      } else if (col.key === 'is_active') {
                        cellContent = item.is_active ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        );
                      } else if (col.key === 'action') {
                        cellContent = (
                          <div className="flex items-center justify-center gap-1">
                            {can('billing', 'read') && (
                              <button
                                type="button"
                                onClick={() => handleViewClick(item.id)}
                                disabled={isPending || isUpdating}
                                title="View Details & Pricing"
                                className="p-1.5 text-slate-500 hover:text-main hover:bg-blue-50 border border-slate-200 transition-colors disabled:opacity-40"
                              >
                                <Icons.Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {can('billing', 'update') && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/packages/item/${item.id}/update`
                                  )
                                }
                                disabled={isPending || isUpdating}
                                title="Edit Item"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors disabled:opacity-40"
                              >
                                <Icons.PencilIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {can('billing', 'delete') && (
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(item.id)}
                                disabled={isPending || isUpdating}
                                title="Delete Item"
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors disabled:opacity-40"
                              >
                                <Icons.Trash className="w-3.5 h-3.5" />
                              </button>
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
                <TableCell colSpan={ServiceItemColumns.length}>
                  <NotiPostNull message="No service items found." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Service Item?"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />

      {/* Full-width Detail Dialog (replaces side drawer) */}
      <ServiceItemDetailDialog
        itemId={viewingItemId}
        isOpen={!!viewingItemId}
        onClose={() => setViewingItemId(null)}
      />
    </>
  );
};
