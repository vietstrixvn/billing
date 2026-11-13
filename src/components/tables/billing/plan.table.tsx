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
import { Plan } from '@/types';
import { useDeletePlan } from '@/hooks/billing';
import { ErrorCustom } from '@/components/loading/error_custom';
import { NotiPostNull } from '@/components/loading/null_custom';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { PlanColumns } from '@/types/billing/colum';

interface PlanTableProps {
  plans: Plan[];
  isLoading: boolean;
  isError: boolean;
}

export const PlanTable: React.FC<PlanTableProps> = ({
  plans,
  isLoading,
  isError,
}) => {
  const { mutate: deletePlan } = useDeletePlan();
  const router = useRouter();
  const { can } = usePermissionContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const handleDeleteClick = (planId: string) => {
    setPlanToDelete(planId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!planToDelete) return;

    setDeleteDialogOpen(false);
    deletePlan(planToDelete);
    setPlanToDelete(null);
  }, [planToDelete, deletePlan]);

  return (
    <>
      <div className="border border-gray-300">
        <Table className="rounded-md border-gray-300">
          <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
            <TableRow>
              {PlanColumns.map((col) => (
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
                  colSpan={PlanColumns.length}
                  className="text-center border-gray-300"
                >
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {PlanColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : plans && plans.length > 0 ? (
              plans.map((plan, index) => {
                const isPending = (plan as any).isPending;
                const isUpdating = (plan as any).isUpdating;

                return (
                  <TableRow
                    key={plan.id}
                    className={`border-gray-300 transition-all duration-500 ${
                      isPending
                        ? 'opacity-60 bg-blue-50 pointer-events-none'
                        : isUpdating
                          ? 'opacity-70 bg-yellow-50 pointer-events-none'
                          : 'opacity-100'
                    }`}
                  >
                    {PlanColumns.map((col) => {
                      let cellContent: React.ReactNode = '';

                      if (col.key === 'index') {
                        cellContent = index + 1;
                      } else if (col.key === 'name') {
                        cellContent = (
                          <div className="flex flex-col">
                            <span className="font-bold text-primary-600">
                              {plan.name}
                            </span>
                            {plan.description && (
                              <span className="text-xs text-gray-500">
                                {plan.description}
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
                            {plan.code}
                          </span>
                        );
                      } else if (col.key === 'is_active') {
                        cellContent = plan.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        );
                      } else if (col.key === 'sort_order') {
                        cellContent = (
                          <span className="font-mono">{plan.sort_order}</span>
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
                                  router.push(`/billing/plans/${plan.id}`)
                                }
                                disabled={isPending || isUpdating}
                              >
                                <Icons.Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {can('billing', 'update') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() =>
                                  router.push(
                                    `/billing/plans/${plan.id}/edit`
                                  )
                                }
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
                                onClick={() => handleDeleteClick(plan.id)}
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
                <TableCell colSpan={PlanColumns.length}>
                  <NotiPostNull message="No plans found." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Plan?"
        description="Are you sure you want to delete this plan? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
