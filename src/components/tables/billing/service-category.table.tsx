'use client';

import type React from 'react';
import { useCallback, useState } from 'react';

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
import type { ServiceCategory } from '@/types';
import { useDeleteServiceCategory } from '@/hooks/billing';
import { ErrorCustom } from '@/components/loading/error_custom';
import { NotiPostNull } from '@/components/loading/null_custom';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { EditServiceCategoryDialog } from '@/components/dialogs/billing/edit-service-category.dialog';

const ServiceCategoryColumns = [
  { key: 'index', label: '#', className: 'text-xs text-gray-800 w-8' },
  { key: 'name', label: 'Name', className: 'text-xs text-gray-800' },
  { key: 'code', label: 'Code', className: 'text-xs text-gray-800' },
  {
    key: 'parent_id',
    label: 'Parent',
    className: 'text-xs text-gray-800 w-32',
  },
  {
    key: 'sort_order',
    label: 'Order',
    className: 'text-xs text-gray-800 w-20',
  },
  {
    key: 'is_active',
    label: 'Status',
    className: 'text-xs text-gray-800 w-24',
  },
  { key: 'action', label: 'Actions', className: 'text-xs text-gray-800 w-32' },
];

interface ServiceCategoryTableProps {
  categories: ServiceCategory[];
  isLoading: boolean;
  isError: boolean;
}

export const ServiceCategoryTable: React.FC<ServiceCategoryTableProps> = ({
  categories,
  isLoading,
  isError,
}) => {
  const { mutate: deleteCategory } = useDeleteServiceCategory();
  const { can } = usePermissionContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);

  const handleEditClick = (categoryId: string) => {
    setCategoryToEdit(categoryId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!categoryToDelete) return;

    setDeleteDialogOpen(false);
    deleteCategory(categoryToDelete);
    setCategoryToDelete(null);
  }, [categoryToDelete, deleteCategory]);

  return (
    <>
      <div className="border border-gray-300">
        <Table className="rounded-md border-gray-300">
          <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
            <TableRow>
              {ServiceCategoryColumns.map((col) => (
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
                  colSpan={ServiceCategoryColumns.length}
                  className="text-center border-gray-300"
                >
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {ServiceCategoryColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories && categories.length > 0 ? (
              categories.map((category, index) => {
                const isPending = (category as any).isPending;
                const isUpdating = (category as any).isUpdating;

                return (
                  <TableRow
                    key={category.id}
                    className={`border-gray-300 transition-all duration-500 ${
                      isPending
                        ? 'opacity-60 bg-blue-50 pointer-events-none'
                        : isUpdating
                          ? 'opacity-70 bg-yellow-50 pointer-events-none'
                          : 'opacity-100'
                    } ${category.parent_id ? 'bg-gray-50/50' : ''}`}
                  >
                    {ServiceCategoryColumns.map((col) => {
                      let cellContent: React.ReactNode = '';

                      if (col.key === 'index') {
                        cellContent = index + 1;
                      } else if (col.key === 'name') {
                        cellContent = (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {category.parent_id && (
                                <span className="text-gray-300 mr-2">└</span>
                              )}
                              <span className="font-bold text-primary-600">
                                {category.name}
                              </span>
                            </div>
                            {category.description && (
                              <span className="text-xs text-gray-500 ml-4">
                                {category.description}
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
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {category.code}
                          </span>
                        );
                      } else if (col.key === 'parent_id') {
                        cellContent = category.parent_id ? (
                          <span className="font-mono text-xs text-gray-500">
                            {category.parent_id}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        );
                      } else if (col.key === 'sort_order') {
                        cellContent = (
                          <span className="font-mono">
                            {category.sort_order}
                          </span>
                        );
                      } else if (col.key === 'is_active') {
                        cellContent = category.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        );
                      } else if (col.key === 'action') {
                        cellContent = (
                          <div className="flex items-center justify-center gap-2">
                            {can('billing', 'update') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() => handleEditClick(category.id)}
                                disabled={isPending || isUpdating}
                              >
                                <Icons.PencilIcon className="w-4 h-4" />
                              </Button>
                            )}
                            {can('billing', 'delete') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => handleDeleteClick(category.id)}
                                disabled={isPending || isUpdating}
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
                <TableCell colSpan={ServiceCategoryColumns.length}>
                  <NotiPostNull message="No service categories found." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Service Category?"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />

      {categoryToEdit && (
        <EditServiceCategoryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          categoryId={categoryToEdit}
          onSuccess={() => {
            setCategoryToEdit(null);
          }}
        />
      )}
    </>
  );
};
