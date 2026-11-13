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
import type { Quote } from '@/types';
import { useDeleteQuote } from '@/hooks/billing';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate } from '@/utils';
import { NotiPostNull } from '@/components/loading/null_custom';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { UpdateQuoteStatusDialog } from '../../dialogs/billing/update-quote-status.dialog';

const QuoteColumns = [
  { key: 'index', label: '#', className: 'text-xs text-gray-800 w-8' },
  {
    key: 'quote_number',
    label: 'Quote Number',
    className: 'text-xs text-gray-800',
  },
  {
    key: 'property_id',
    label: 'Property',
    className: 'text-xs text-gray-800',
  },
  {
    key: 'total_amount',
    label: 'Total Amount',
    className: 'text-xs text-gray-800',
  },
  { key: 'status', label: 'Status', className: 'text-xs text-gray-800 w-24' },
  {
    key: 'valid_until',
    label: 'Valid Until',
    className: 'text-xs text-gray-800',
  },
  { key: 'action', label: 'Actions', className: 'text-xs text-gray-800 w-40' },
];

interface QuoteTableProps {
  quotes: Quote[];
  isLoading: boolean;
  isError: boolean;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  isLoading,
  isError,
}) => {
  const { mutate: deleteQuote } = useDeleteQuote();
  const router = useRouter();
  const { can } = usePermissionContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [quoteForStatus, setQuoteForStatus] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Approved',
      },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      expired: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        label: 'Expired',
      },
    };

    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span
        className={`px-2 py-1 text-xs rounded-md font-medium ${statusInfo.bg} ${statusInfo.text}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const handleDeleteClick = (quoteId: string) => {
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  };

  const handleStatusClick = (quoteId: string) => {
    setQuoteForStatus(quoteId);
    setStatusDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!quoteToDelete) return;

    setDeleteDialogOpen(false);
    deleteQuote(quoteToDelete);
    setQuoteToDelete(null);
  }, [quoteToDelete, deleteQuote]);

  return (
    <>
      <div className="border border-gray-300">
        <Table className="rounded-md border-gray-300">
          <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
            <TableRow>
              {QuoteColumns.map((col) => (
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
                  colSpan={QuoteColumns.length}
                  className="text-center border-gray-300"
                >
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {QuoteColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : quotes && quotes.length > 0 ? (
              quotes.map((quote, index) => {
                const isPending = (quote as any).isPending;
                const isUpdating = (quote as any).isUpdating;

                return (
                  <TableRow
                    key={quote.id}
                    className={`border-gray-300 transition-all duration-500 ${
                      isPending
                        ? 'opacity-60 bg-blue-50 pointer-events-none'
                        : isUpdating
                          ? 'opacity-70 bg-yellow-50 pointer-events-none'
                          : 'opacity-100'
                    }`}
                  >
                    {QuoteColumns.map((col) => {
                      let cellContent: React.ReactNode = '';

                      if (col.key === 'index') {
                        cellContent = index + 1;
                      } else if (col.key === 'quote_number') {
                        cellContent = (
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-primary-600">
                              {quote.quote_number}
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
                          <span className="font-mono text-xs">
                            {quote.property_id}
                          </span>
                        );
                      } else if (col.key === 'total_amount') {
                        cellContent = (
                          <span className="font-semibold">
                            {formatCurrency(quote.total_amount, quote.currency)}
                          </span>
                        );
                      } else if (col.key === 'status') {
                        cellContent = getStatusBadge(quote.status);
                      } else if (col.key === 'valid_until') {
                        cellContent = formatSmartDate(quote.valid_until);
                      } else if (col.key === 'action') {
                        cellContent = (
                          <div className="flex items-center justify-center gap-2">
                            {can('billing', 'read') && (
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
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/billing/quotes/${quote.id}`
                                      )
                                    }
                                    disabled={isPending || isUpdating}
                                  >
                                    <Icons.Eye className="w-4 h-4" />
                                    View Details
                                  </DropdownMenuItem>

                                  {can('billing', 'update') && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusClick(quote.id)
                                      }
                                      disabled={isPending || isUpdating}
                                    >
                                      <Icons.Settings className="w-4 h-4" />
                                      Update Status
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            {can('billing', 'update') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() =>
                                  router.push(
                                    `/billing/quotes/${quote.id}/edit`
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
                                onClick={() => handleDeleteClick(quote.id)}
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
                <TableCell colSpan={QuoteColumns.length}>
                  <NotiPostNull message="No quotes found." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Quote?"
        description="Are you sure you want to delete this quote? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />

      {quoteForStatus && (
        <UpdateQuoteStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          quoteId={quoteForStatus}
          onClose={() => setQuoteForStatus(null)}
        />
      )}
    </>
  );
};
