'use client';

import { Input, Label, Textarea } from '@/components/ui';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { UpdateInvoiceDTO, Invoice } from '@/types';
import { useUpdateInvoice } from '@/hooks/billing';
import { percentToBps, bpsToPercent, formatBpsDescription } from '@/utils';

interface EditInvoiceFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
}

export const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({
  invoice,
  onSuccess,
}) => {
  const [subTotal, setSubTotal] = useState(Number(invoice.sub_total || 0));
  const [taxRate, setTaxRate] = useState(Number(invoice.tax_rate_bps || 0));
  const [taxAmount, setTaxAmount] = useState(Number(invoice.tax_amount || 0));
  const [invoiceAmount, setInvoiceAmount] = useState(
    Number(invoice.invoice_amount || 0)
  );
  const [dueDate, setDueDate] = useState(
    invoice.due_at ? new Date(invoice.due_at).toISOString().split('T')[0] : ''
  );
  const [paidDate, setPaidDate] = useState(
    invoice.paid_at ? new Date(invoice.paid_at).toISOString().split('T')[0] : ''
  );

  const updateMutation = useUpdateInvoice(String(invoice.id));

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
  } = useForm<UpdateInvoiceDTO>({
    defaultValues: {
      tax_rate_bps: Number(invoice.tax_rate_bps || 0),
      due_at: invoice.due_at || '',
      paid_at: invoice.paid_at || null,
      notes: invoice.notes || '',
    },
  });

  useEffect(() => {
    const tax = (subTotal * taxRate) / 10000; // tax_rate is in basis points
    const total = subTotal + tax;
    setTaxAmount(tax);
    setInvoiceAmount(total);
    setValue('tax_rate_bps', taxRate);
  }, [subTotal, taxRate, setValue]);

  const onSubmit = async (data: UpdateInvoiceDTO) => {
    try {
      await updateMutation.mutateAsync({
        tax_rate_bps: taxRate,
        due_at: dueDate ? new Date(dueDate).toISOString() : undefined,
        paid_at: paidDate ? new Date(paidDate).toISOString() : null,
        notes: data.notes,
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error updating invoice');
    }
  };

  return (
    <div className="w-full border border-gray-200">
      <form onSubmit={handleFormSubmit(onSubmit)}>
        {/* ── Section: Read-only identity ── */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              Invoice Identity
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
            {/* Invoice number */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Invoice Number
              </Label>
              <div className="h-9 flex items-center px-3 border border-gray-200 bg-gray-50 font-mono text-sm text-gray-500 select-all">
                {invoice.invoice_number}
              </div>
            </div>

            {/* Issued date */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Issued Date
              </Label>
              <div className="h-9 flex items-center px-3 border border-gray-200 bg-gray-50 text-sm text-gray-500 font-mono">
                {invoice.issued_at
                  ? new Date(invoice.issued_at).toISOString().split('T')[0]
                  : '—'}
              </div>
            </div>

            {/* Property ID */}
            <div className="px-6 py-5 border-t border-gray-200">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Property ID
              </Label>
              <div className="h-9 flex items-center px-3 border border-gray-200 bg-gray-50 font-mono text-xs text-gray-400 truncate select-all">
                {invoice.property_id}
              </div>
            </div>

            {/* Billing Record ID */}
            <div className="px-6 py-5 border-t border-gray-200">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Billing Record ID
              </Label>
              <div className="h-9 flex items-center px-3 border border-gray-200 bg-gray-50 font-mono text-xs text-gray-400 truncate select-all">
                {invoice.billing_record_id}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: Pricing ── */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              Pricing & Tax
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-white">
            {/* Sub Total - Read only */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Sub Total
                <span className="ml-2 text-[10px] font-normal normal-case text-gray-400 tracking-normal">
                  read-only, calculated from items
                </span>
              </Label>
              <div className="flex items-center">
                <div className="h-9 flex items-center px-3 border border-gray-200 bg-gray-50 font-mono text-sm text-gray-500 flex-1">
                  {subTotal.toLocaleString()}
                </div>
                <div className="h-9 px-2.5 flex items-center border border-l-0 border-gray-300 bg-gray-50 text-[11px] text-gray-400 font-mono">
                  VND
                </div>
              </div>
            </div>

            {/* Tax Rate (%) */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                VAT Rate (%)
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate === 0 ? '' : bpsToPercent(taxRate)}
                  onChange={(e) => {
                    const pct = parseFloat(e.target.value) || 0;
                    setTaxRate(percentToBps(pct));
                  }}
                  className="rounded-none border-gray-300 h-9 text-sm focus:ring-0 focus:border-gray-900 font-mono flex-1"
                />
                <div className="h-9 px-2.5 flex items-center border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-400 font-mono">
                  %
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {formatBpsDescription(taxRate, 'VAT', false)}
              </p>
            </div>

            {/* Live summary */}
            <div className="px-6 py-5 bg-gray-50">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-3">
                Summary
              </Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-400">Sub total</span>
                  <span className="text-[12px] text-gray-600 font-mono">
                    {subTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-400">
                    Tax ({(taxRate / 100).toFixed(2)}%)
                  </span>
                  <span className="text-[12px] text-gray-600 font-mono">
                    {taxAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
                    Total
                  </span>
                  <span className="text-sm font-bold text-gray-900 font-mono">
                    {invoiceAmount.toLocaleString()} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: Dates ── */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              Dates
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
            {/* Due date */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Due Date
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-none border-gray-300 h-9 text-sm focus:ring-0 focus:border-gray-900"
              />
            </div>

            {/* Paid date */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Paid Date
                <span className="ml-2 text-[10px] font-normal normal-case text-gray-400 tracking-normal">
                  optional — leave blank if unpaid
                </span>
              </Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="rounded-none border-gray-300 h-9 text-sm focus:ring-0 focus:border-gray-900"
              />
            </div>
          </div>
        </div>

        {/* ── Section: Attachments & Notes ── */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              Notes
            </span>
          </div>
          <div className="bg-white">
            {/* Notes */}
            <div className="px-6 py-5">
              <Label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                Notes
              </Label>
              <Textarea
                placeholder="Optional notes or payment instructions…"
                {...register('notes')}
                className="rounded-none border-gray-300 text-sm focus:ring-0 focus:border-gray-900 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={updateMutation.isPending}
            className="h-9 px-4 border border-gray-300 text-sm text-gray-600 hover:bg-white transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-9 px-6 bg-main text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Updating…' : 'Update Invoice →'}
          </button>
        </div>
      </form>
    </div>
  );
};
