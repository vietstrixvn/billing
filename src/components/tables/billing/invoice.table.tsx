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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Icons } from '@/assets/icons';
import { Invoice } from '@/types';
import { useDeleteInvoice } from '@/hooks/billing';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { InvoiceColumns } from '@/types/billing/colum';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  isError: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  isError,
}) => {
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const router = useRouter();
  const { can } = usePermissionContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!invoiceToDelete) return;

    setDeleteDialogOpen(false);
    deleteInvoice(invoiceToDelete);
    setInvoiceToDelete(null);
  }, [invoiceToDelete, deleteInvoice]);

  return (
    <>
      <div className="border border-gray-300">
        <Table className="rounded-md border-gray-300">
          <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
            <TableRow>
              {InvoiceColumns.map((col) => (
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
                  colSpan={InvoiceColumns.length}
                  className="text-center border-gray-300"
                >
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {InvoiceColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices && invoices.length > 0 ? (
              invoices.map((invoice, index) => {
                const isPending = (invoice as any).isPending;
                const isUpdating = (invoice as any).isUpdating;
                const isPaid = !!invoice.paid_at;

                return (
                  <TableRow
                    key={invoice.id}
                    className={`border-gray-300 transition-all duration-500 ${
                      isPending
                        ? 'opacity-60 bg-blue-50 pointer-events-none'
                        : isUpdating
                          ? 'opacity-70 bg-yellow-50 pointer-events-none'
                          : 'opacity-100'
                    }`}
                  >
                    {InvoiceColumns.map((col) => {
                      let cellContent: React.ReactNode = '';

                      if (col.key === 'index') {
                        cellContent = index + 1;
                      } else if (col.key === 'invoice_number') {
                        cellContent = (
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-primary-600">
                              {invoice.invoice_number}
                            </span>
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
                      } else if (col.key === 'property_id') {
                        cellContent = (
                          <p className="font-mono text-xs">
                            <span className="font-bold text-base">
                              {' '}
                              {invoice.property?.name}
                            </span>
                            <br />
                            {invoice.property_id}
                          </p>
                        );
                      } else if (col.key === 'billing_record_id') {
                        cellContent = (
                          <span className="font-mono text-xs">
                            {invoice.billing_record_id}
                          </span>
                        );
                      } else if (col.key === 'invoice_amount') {
                        cellContent = (
                          <span className="font-semibold">
                            {formatCurrency(
                              invoice.invoice_amount,
                              invoice.currency
                            )}
                          </span>
                        );
                      } else if (col.key === 'paid_at') {
                        cellContent = isPaid ? (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-yellow-100 text-yellow-700">
                            Unpaid
                          </span>
                        );
                      } else if (col.key === 'issued_at') {
                        cellContent = formatSmartDate(invoice.issued_at);
                      } else if (col.key === 'due_at') {
                        cellContent = invoice.due_at ? (
                          formatSmartDate(invoice.due_at)
                        ) : (
                          <span className="text-gray-400">—</span>
                        );
                      } else if (col.key === 'file_url') {
                        cellContent = invoice.file_url ? (
                          <a
                            href={invoice.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <Icons.FileText className="w-4 h-4 mx-auto" />
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        );
                      } else if (col.key === 'action') {
                        cellContent = (
                          <div className="flex items-center justify-center gap-2">
                            {can('billing', 'read') && (
                              <div className="flex space-x-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="flex text-blue-500 items-center gap-1 text-sm hover:text-gray-400"
                                    >
                                      <Icons.EllipsisVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48 bg-white"
                                  >
                                    {can('billing', 'update') && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(
                                            `/billing/invoices/${invoice.id}`
                                          )
                                        }
                                        disabled={isPending || isUpdating}
                                      >
                                        <Icons.Eye className="w-4 h-4" />
                                        Detail
                                      </DropdownMenuItem>
                                    )}

                                    {can('billing', 'update') && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(
                                            `/billing/invoices/${invoice.id}/file`
                                          )
                                        }
                                        disabled={isPending || isUpdating}
                                      >
                                        <Icons.FileText className="w-4 h-4" />
                                        File
                                      </DropdownMenuItem>
                                    )}

                                    {can('billing', 'update') && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(
                                            `/billing/invoices/${invoice.id}/items`
                                          )
                                        }
                                        disabled={isPending || isUpdating}
                                      >
                                        <Icons.FileText className="w-4 h-4" />
                                        Item
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}

                            {can('billing', 'update') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() =>
                                  router.push(
                                    `/billing/invoices/${invoice.id}/edit`
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
                                onClick={() => handleDeleteClick(invoice.id)}
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
                <TableCell colSpan={InvoiceColumns.length}>
                  <NotiPostNull message="No invoices found." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Invoice?"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
