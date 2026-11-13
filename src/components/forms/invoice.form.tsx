'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import type { CreateInvoiceDTO, Client } from '@/types';
import { useCreateInvoice } from '@/hooks/billing';
import { ClientSelect } from '@/components/selects/client.select';
import { Building2, Calendar, FileText, Percent, RefreshCw, UserCheck } from 'lucide-react';
import { percentToBps, bpsToPercent, formatBpsDescription } from '@/utils';

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [issuedDate, setIssuedDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const createMutation = useCreateInvoice();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateInvoiceDTO>({
    defaultValues: {
      client_id: '',
      client_name: '',
      client_tax_code: '',
      client_email: '',
      client_address: '',
      invoice_number: '',
      sub_total: 0,
      tax_rate_bps: 1000, // Default 10% VAT
      tax_amount: 0,
      invoice_amount: 0,
      currency: 'VND',
      issued_at: '',
      due_at: '',
      notes: '',
    },
  });

  const taxRateBps = watch('tax_rate_bps') || 0;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setIssuedDate(today);
    const dueIn7Days = new Date();
    dueIn7Days.setDate(dueIn7Days.getDate() + 7);
    setDueDate(dueIn7Days.toISOString().split('T')[0]);
  }, []);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  useEffect(() => {
    setValue('invoice_number', generateInvoiceNumber());
  }, [setValue]);

  const handleSelectClient = (client: Client | null) => {
    if (client) {
      setSelectedClientId(client.id);
      setValue('client_id', client.id);
      setValue('client_name', client.business_name || '');
      setValue('client_tax_code', client.tax_code || '');
      setValue('client_email', client.email || '');
      setValue('client_address', client.billing_address || client.address || '');
    } else {
      setSelectedClientId('');
      setValue('client_id', '');
    }
  };

  const onSubmit = async (data: CreateInvoiceDTO) => {
    try {
      const submitData: CreateInvoiceDTO = {
        ...data,
        client_id: data.client_id || undefined,
        client_name: data.client_name || undefined,
        client_tax_code: data.client_tax_code || undefined,
        client_email: data.client_email || undefined,
        client_address: data.client_address || undefined,
        tax_rate_bps: Number(data.tax_rate_bps) || 0,
        invoice_amount: Number(data.invoice_amount) || 0,
        issued_at: issuedDate ? new Date(issuedDate).toISOString() : undefined,
        due_at: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      const response = await createMutation.mutateAsync(submitData);

      const rawInvoice = response?.data?.data || response?.data || response;
      const invoiceId = Array.isArray(rawInvoice) ? rawInvoice[0]?.id : rawInvoice?.id;

      if (invoiceId) {
        router.push(`/billing/invoices/${invoiceId}/items`);
      } else {
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating invoice');
    }
  };

  return (
    <div className="w-full">
      {/* Stepper Header */}
      <div className="flex items-stretch border border-slate-200 bg-slate-50 divide-x divide-slate-200 mb-0">
        {[
          { step: '01', label: 'Client Information', active: true },
          { step: '02', label: 'Invoice Details & Dates', active: true },
          { step: '03', label: 'Line Items (Next Step)', active: false },
        ].map(({ step, label, active }) => (
          <div
            key={step}
            className={`flex items-center gap-3 px-5 py-3 flex-1 ${
              active ? 'bg-white font-medium' : 'text-slate-400'
            }`}
          >
            <span className="text-xs font-bold tracking-widest font-mono text-slate-400">
              {step}
            </span>
            <span className="text-xs text-slate-700">{label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleFormSubmit(onSubmit)}>
        <div className="border border-slate-200 border-t-0 space-y-0 divide-y divide-slate-200 bg-white">
          {/* SECTION 1: CLIENT INFORMATION */}
          <div>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" /> Client / Buyer Details
              </span>
              <span className="text-[11px] text-slate-500">
                Select an existing client or enter invoice recipient details manually
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                  Select Saved Client
                </Label>
                <ClientSelect
                  value={selectedClientId}
                  onSelectClient={handleSelectClient}
                  placeholder="Search & select a saved client (Optional)…"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Buyer / Business Name
                  </Label>
                  <Input
                    {...register('client_name')}
                    placeholder="e.g. Công ty TNHH Keng Vietnam"
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Tax Code (MST)
                  </Label>
                  <Input
                    {...register('client_tax_code')}
                    placeholder="e.g. 0312345678"
                    className="rounded-none border-slate-300 h-9 text-xs font-mono focus:ring-0 focus:border-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Invoice Recipient Email
                  </Label>
                  <Input
                    type="email"
                    {...register('client_email')}
                    placeholder="billing@company.com"
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Billing Address
                  </Label>
                  <Input
                    {...register('client_address')}
                    placeholder="e.g. 123 Nguyen Hue, District 1, HCMC"
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: INVOICE IDENTITY & DATES */}
          <div>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Invoice Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Invoice Number */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Invoice Number
                </Label>
                <div className="flex items-center gap-0">
                  <Input
                    placeholder="INV-202605-0001"
                    {...register('invoice_number')}
                    className="rounded-none border-slate-300 h-9 font-mono text-xs focus:ring-0 focus:border-slate-900 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setValue('invoice_number', generateInvoiceNumber())
                    }
                    className="h-9 w-9 flex items-center justify-center border border-l-0 border-slate-300 hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Regenerate Invoice Number"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Issued Date */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Issue Date
                </Label>
                <Input
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                />
              </div>

              {/* Due Date */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Due Date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-t border-slate-200">
              {/* VAT Rate (%) */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-slate-500" /> VAT Rate (%)
                </Label>
                <div className="flex items-center gap-0">
                  <Input
                    type="number"
                    value={taxRateBps === 0 ? '' : bpsToPercent(taxRateBps)}
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value) || 0;
                      setValue('tax_rate_bps', percentToBps(pct));
                    }}
                    placeholder="10"
                    className="rounded-none border-slate-300 h-9 text-xs font-mono focus:ring-0 focus:border-slate-900"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div className="h-9 px-3 flex items-center border border-l-0 border-slate-300 bg-slate-100 text-xs font-mono text-slate-600">
                    %
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {formatBpsDescription(taxRateBps, 'VAT', false)}
                </p>
              </div>

              {/* Currency */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Currency
                </Label>
                <div className="flex items-center h-9 px-3 border border-slate-300 bg-slate-50 text-xs text-slate-700 font-mono select-none w-full">
                  VND — Vietnamese Dong
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTES */}
          <div className="p-6 space-y-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Payment Terms & Notes
            </Label>
            <Textarea
              {...register('notes')}
              placeholder="Bank account details, payment instructions, or terms visible on invoice…"
              className="rounded-none border-slate-300 text-xs min-h-[90px] focus:ring-0 focus:border-slate-900"
            />
          </div>

          {/* INFO BANNER */}
          <div className="bg-slate-50 p-4 flex items-start gap-3 text-xs text-slate-700 border-t border-slate-200">
            <UserCheck className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Next Step: Line Items Selection</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Once saved, you can add multiple line items (SEO packages, hosting, banner design, custom services) to assemble the final invoice total.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border border-slate-200 border-t-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-none border-slate-300 text-slate-700 text-xs h-9 px-4 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-none bg-slate-900 text-white text-xs h-9 px-6 font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Creating Invoice…
              </>
            ) : (
              'Create Invoice & Add Items →'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
