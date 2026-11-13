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
import type { CreateQuoteDTO, Client } from '@/types';
import { useCreateQuote } from '@/hooks/billing';
import { ClientSelect } from '@/components/selects/client.select';
import { Building2, Calendar, FileText, Percent, RefreshCw, UserCheck } from 'lucide-react';
import { percentToBps, bpsToPercent, formatBpsDescription } from '@/utils';

interface QuoteFormProps {
  onSuccess?: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [validUntil, setValidUntil] = useState('');

  const createMutation = useCreateQuote();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
  } = useForm<CreateQuoteDTO>({
    defaultValues: {
      client_id: '',
      client_name: '',
      client_tax_code: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      discount_bps: 0,
      tax_rate_bps: 0,
      currency: 'VND',
      valid_until: '',
      notes: '',
    },
  });

  const discountBps = watch('discount_bps') || 0;
  const taxRateBps = watch('tax_rate_bps') || 0;

  useEffect(() => {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const dateInput = in30Days.toISOString().split('T')[0];
    setValidUntil(dateInput);
    setValue('valid_until', in30Days.toISOString());
  }, [setValue]);

  const handleSelectClient = (client: Client | null) => {
    if (client) {
      setSelectedClientId(client.id);
      setValue('client_id', client.id);
      setValue('client_name', client.business_name || '');
      setValue('client_tax_code', client.tax_code || '');
      setValue('client_email', client.email || '');
      setValue('client_phone', client.phone_number || '');
      setValue('client_address', client.billing_address || client.address || '');
    } else {
      setSelectedClientId('');
      setValue('client_id', '');
    }
  };

  const onSubmit = async (data: CreateQuoteDTO) => {
    try {
      const submitData: CreateQuoteDTO = {
        client_id: data.client_id || undefined,
        client_name: data.client_name || undefined,
        client_tax_code: data.client_tax_code || undefined,
        client_email: data.client_email || undefined,
        client_phone: data.client_phone || undefined,
        client_address: data.client_address || undefined,
        currency: data.currency || 'VND',
        valid_until: validUntil
          ? new Date(validUntil + 'T23:59:59').toISOString()
          : undefined,
        discount_bps: Number(data.discount_bps) || 0,
        tax_rate_bps: Number(data.tax_rate_bps) || 0,
        notes: data.notes || undefined,
      };

      const response = await createMutation.mutateAsync(submitData);

      const rawQuote = response?.data?.data || response?.data || response;
      const quoteId = Array.isArray(rawQuote) ? rawQuote[0]?.id : rawQuote?.id;

      if (quoteId) {
        router.push(`/billing/quotes/${quoteId}/items`);
      } else {
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating quote');
    }
  };

  return (
    <div className="w-full">
      {/* Stepper Header */}
      <div className="flex items-stretch border border-slate-200 bg-slate-50 divide-x divide-slate-200 mb-0">
        {[
          { step: '01', label: 'Client Information', active: true },
          { step: '02', label: 'Quote Parameters', active: true },
          { step: '03', label: 'Line Items (Next)', active: false },
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
          {/* SECTION 1: CLIENT SELECTION & CONTACT DETAILS */}
          <div>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" /> Client Details
              </span>
              <span className="text-[11px] text-slate-500">
                Select an existing client or enter details manually
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
                  placeholder="Search & choose a saved client (Optional)…"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Business / Client Name
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
                    Email
                  </Label>
                  <Input
                    type="email"
                    {...register('client_email')}
                    placeholder="client@company.com"
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Phone Number
                  </Label>
                  <Input
                    {...register('client_phone')}
                    placeholder="e.g. 0901234567"
                    className="rounded-none border-slate-300 h-9 text-xs font-mono focus:ring-0 focus:border-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600 block mb-1">
                    Address
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

          {/* SECTION 2: QUOTE PARAMETERS */}
          <div>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Quote Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Valid Until */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Expiration Date
                </Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValidUntil(v);
                    if (v) {
                      setValue(
                        'valid_until',
                        new Date(v + 'T23:59:59').toISOString()
                      );
                    }
                  }}
                  className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-[11px] text-slate-400">
                  Quote validity period (default: 30 days)
                </p>
              </div>

              {/* Discount (%) */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-slate-500" /> Global Discount (%)
                </Label>
                <div className="flex items-center gap-0">
                  <Input
                    type="number"
                    value={discountBps === 0 ? '' : bpsToPercent(discountBps)}
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value) || 0;
                      setValue('discount_bps', percentToBps(pct));
                    }}
                    placeholder="0"
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
                  {formatBpsDescription(discountBps, 'discount', false)}
                </p>
              </div>

              {/* Tax Rate (%) */}
              <div className="p-6 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-slate-500" /> Tax Rate (%)
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
                  {formatBpsDescription(taxRateBps, 'tax', false)}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTES */}
          <div className="p-6 space-y-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Quote Notes & Scope Summary
            </Label>
            <Textarea
              {...register('notes')}
              placeholder="Enter proposal terms, payment terms, or project scope overview visible to client…"
              className="rounded-none border-slate-300 text-xs min-h-[90px] focus:ring-0 focus:border-slate-900"
            />
          </div>

          {/* INFO BANNER */}
          <div className="bg-blue-50/70 p-4 flex items-start gap-3 text-xs text-blue-900 border-t border-slate-200">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Next Step: Line Items & Services</p>
              <p className="text-blue-700 text-[11px] mt-0.5">
                After saving the quote header, you will be taken to add individual line items (standalone items, packages, custom work) to calculate subtotal and final amount.
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
            className="rounded-none bg-main text-white text-xs h-9 px-6 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Creating Quote…
              </>
            ) : (
              'Create Quote & Add Items →'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
