'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui';
import { InvoiceHeader } from '@/components/invoice/InvoiceHeader';
import { InvoiceItemTable } from '@/components/tables/billing/invoice-item.table';
import {
  InvoiceDetail,
  JournalEntriesBySource,
} from '@/libs/responses';
import { ErrorCustom } from '@/components/loading/error_custom';
import { formatSmartDate, bpsToPercent } from '@/utils';
import { Container } from '@/components';
import { useDeleteInvoice } from '@/hooks/billing';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import type { JournalEntry } from '@/types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { can } = usePermissionContext();

  const { invoice, isLoading, isError } = InvoiceDetail(invoiceId, 0);
  const { journalEntries: relatedJEs, isLoading: jeLoading } =
    JournalEntriesBySource('invoice', invoiceId);

  const { mutate: deleteInvoice } = useDeleteInvoice();

  const handlePrint = () => {
    if (!printRef.current) return;

    // Clone node ra body để thoát khỏi admin layout constraints
    const clone = printRef.current.cloneNode(true) as HTMLElement;
    clone.id = '__invoice_print_clone__';
    clone.style.cssText =
      'position:fixed;top:0;left:0;width:100%;z-index:99999;background:#fff;';
    document.body.appendChild(clone);

    const style = document.createElement('style');
    style.id = '__invoice_print_style__';
    style.textContent = `
      @media print {
        body > *:not(#__invoice_print_clone__) { display: none !important; }
        #__invoice_print_clone__ {
          display: block !important;
          position: static !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);

    const cleanup = () => {
      document.getElementById('__invoice_print_style__')?.remove();
      document.getElementById('__invoice_print_clone__')?.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
  };

  const handleDownload = async () => {
    if (invoice?.file_url) {
      try {
        const res = await fetch(invoice.file_url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Fallback nếu CORS block fetch
        window.open(invoice.file_url, '_blank');
      }
    } else {
      handlePrint();
    }
  };

  const handleSendEmail = () => {
    // TODO: Implement email functionality
  };

  const handleEdit = () => {
    router.push(`/billing/invoices/${invoiceId}/edit`);
  };

  const handleManageItems = () => {
    router.push(`/billing/invoices/${invoiceId}/items`);
  };

  const handleViewPdf = () => {
    router.push(`/billing/invoices/${invoiceId}/file`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteInvoice(invoiceId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push('/billing/invoices');
      },
    });
  };

  if (isError) {
    return (
      <div className="p-6">
        <ErrorCustom />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="bg-white rounded-md shadow-lg p-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Invoice not found</div>
      </div>
    );
  }

  const isPaid = !!invoice.paid_at;

  return (
    <Container
      className="min-h-screen bg-gray-50 print:p-0 print:bg-white"
      width="max-w-7xl"
    >
      {/* Header Actions - Hidden on print */}
      <div className="print:hidden">
        <InvoiceHeader
          onBack={() => router.back()}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onSendEmail={handleSendEmail}
          onViewPdf={handleViewPdf}
          onManageItems={
            can('billing', 'update') ? handleManageItems : undefined
          }
          onEdit={can('billing', 'update') ? handleEdit : undefined}
          onDelete={can('billing', 'delete') ? handleDeleteClick : undefined}
        />
      </div>

      <section className="max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
        {/* Standard Invoice Document */}
        <div
          ref={printRef}
          className="bg-white shadow-lg overflow-hidden print:shadow-none print:overflow-visible"
        >
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-primary-800  to-primary-900 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-blue-100 text-sm">
                  Invoice Number: {invoice.invoice_number}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-4 py-2 rounded-md text-sm font-semibold ${isPaid
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-400 text-gray-900'
                    }`}
                >
                  {isPaid ? 'PAID' : 'UNPAID'}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-8">
            {/* Company & Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* From */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  From
                </h3>
                <div className="text-gray-900">
                  <p className="font-bold text-lg mb-1">Vietstrix Team</p>
                  <p className="text-sm text-gray-600">Ho Chi Minh City</p>
                  <p className="text-sm text-gray-600">
                    Email: vietstrix@gmail.com
                  </p>
                  <p className="text-sm text-gray-600">Phone: (037) 778-3437</p>
                </div>
              </div>

              {/* To */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Bill To
                </h3>
                <div className="text-gray-900">
                  <p className="font-bold text-lg mb-1">
                    Property ID: {invoice.property_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Billing Record: {invoice.billing_record_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 rounded-md">
              <div>
                <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                <p className="font-semibold text-gray-900">
                  {formatSmartDate(invoice.issued_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="font-semibold text-gray-900">
                  {invoice.due_at ? formatSmartDate(invoice.due_at) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                <p className="font-semibold text-gray-900">
                  {invoice.paid_at ? formatSmartDate(invoice.paid_at) : '—'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Invoice Items
              </h3>
              <InvoiceItemTable invoiceId={invoiceId} />
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      {Number(invoice.sub_total || 0).toLocaleString()}{' '}
                      {invoice.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Tax ({bpsToPercent(invoice.tax_rate_bps)}%):
                    </span>
                    <span className="font-medium text-gray-900">
                      {Number(invoice.tax_amount || 0).toLocaleString()}{' '}
                      {invoice.currency}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {Number(invoice.invoice_amount || 0).toLocaleString()}{' '}
                        {invoice.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Notes:
                </h4>
                <p className="text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Thank you for your business!
              </p>
              {invoice.file_url && (
                <div className="text-center mt-4">
                  <a
                    href={invoice.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Original PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Journal Entries — outside invoice document, not printed */}
      <div className="mt-6 print:hidden">
        <h3 className="text-base font-semibold text-gray-700 mb-3">
          Related Journal Entries
        </h3>
        {jeLoading ? (
          <div className="text-sm text-gray-400 py-4">Loading...</div>
        ) : relatedJEs.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 bg-white border rounded-lg px-4">
            No journal entries found for this invoice.
          </div>
        ) : (
          <div className="bg-white border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">
                    Entry #
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">
                    Debit
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {relatedJEs.map((je: JournalEntry) => (
                  <tr
                    key={je.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/accounting/journal/${je.id}`)
                    }
                  >
                    <td className="px-4 py-2 font-mono text-blue-600 font-medium">
                      {je.entry_number}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatSmartDate(je.entry_date)}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {je.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${je.status === 'posted'
                          ? 'bg-green-100 text-green-700'
                          : je.status === 'reversed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {je.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-800">
                      {Number(je.total_debit).toLocaleString()} {je.currency}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-800">
                      {Number(je.total_credit).toLocaleString()} {je.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Invoice?"
        description="Are you sure you want to delete this invoice? This action cannot be undone and will also delete all associated invoice items."
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );
}
