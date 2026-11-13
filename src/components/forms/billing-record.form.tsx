'use client';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  CurrencyInput,
} from '@/components/ui';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CreateBillingRecordDTO } from '@/types';
import { useCreateBillingRecord } from '@/hooks/billing';
import { useSubscriptions } from '@/hooks/billing';
import { cn } from '@/utils';

interface BillingRecordFormProps {
  onSuccess?: () => void;
}

const FIELD_HINT = 'text-xs text-gray-400 mt-1';
const FIELD_WRAPPER = 'flex flex-col gap-1.5';

export const BillingRecordForm: React.FC<BillingRecordFormProps> = ({
  onSuccess,
}) => {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [selectedType, setSelectedType] = useState<
    'invoice' | 'payment' | 'refund' | 'credit_note'
  >('invoice');
  const [selectedStatus, setSelectedStatus] = useState<
    'pending' | 'paid' | 'failed' | 'cancelled'
  >('pending');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [billingDate, setBillingDate] = useState('');

  const createMutation = useCreateBillingRecord();

  const { data: subscriptionsData, isLoading: loadingSubscriptions } =
    useSubscriptions(
      1,
      {
        page_size: 100,
        ...(selectedProperty && { property_id: selectedProperty }),
      },
      0
    );

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateBillingRecordDTO>({
    defaultValues: {
      property_id: '',
      subscription_id: '',
      type: 'invoice',
      status: 'pending',
      amount: 0,
      currency: 'VND',
      payment_method: '',
      reference_code: '',
      billing_date: '',
      notes: '',
    },
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setBillingDate(today);
    setValue('billing_date', new Date().toISOString());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (billingDate) {
      setValue('billing_date', new Date(billingDate).toISOString());
    }
  }, [billingDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelectedSubscription('');
    setValue('subscription_id', '');
  }, [selectedProperty]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCustomInvoice = selectedType === 'invoice' && !selectedSubscription;

  const onSubmit = async (data: CreateBillingRecordDTO) => {
    try {
      if (!selectedProperty) {
        toast.error('Please select a property');
        return;
      }

      if (!isCustomInvoice && (!data.amount || data.amount <= 0)) {
        toast.error('Amount must be greater than 0');
        return;
      }

      const { subscription_id: _subscription_id, ...restData } = data;

      await createMutation.mutateAsync({
        ...restData,
        property_id: selectedProperty,
        subscription_id: selectedSubscription || null,
        type: selectedType,
        status: selectedStatus,
        payment_method: selectedPaymentMethod || undefined,
        currency: 'VND',
        amount: data.amount || 0,
      });

      reset();
      setSelectedProperty('');
      setSelectedSubscription('');
      setSelectedType('invoice');
      setSelectedStatus('pending');
      setSelectedPaymentMethod('');
      setBillingDate(new Date().toISOString().split('T')[0]);

      if (isCustomInvoice) {
        toast.success(
          'Billing record created. Add invoice items to finalize the total.'
        );
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error creating billing record');
    }
  };

  const selectedSubscriptionData = subscriptionsData?.data?.results.find(
    (s) => s.id === selectedSubscription
  );

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="w-full">
      {/* Section: Context */}
      <FormSection
        label="Context"
        hint="Link this record to a property and subscription."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div className={FIELD_WRAPPER}>
            <Label
              htmlFor="property_id"
              className="text-sm font-medium text-gray-700"
            >
              Property <Required />
            </Label>
            <PropertySelect
              value={selectedProperty}
              onValueChange={(value) => {
                setSelectedProperty(value);
                setValue('property_id', value);
              }}
            />
          </div> */}

          <div className={FIELD_WRAPPER}>
            <Label
              htmlFor="subscription_id"
              className="text-sm font-medium text-gray-700"
            >
              Subscription
              <span className="ml-1.5 text-xs text-gray-400 font-normal">
                optional
              </span>
            </Label>
            <Select
              value={selectedSubscription || 'none'}
              onValueChange={(value) => {
                const v = value === 'none' ? '' : value;
                setSelectedSubscription(v);
                setValue('subscription_id', v);
              }}
              disabled={loadingSubscriptions || !selectedProperty}
            >
              <SelectTrigger
                className={cn(
                  'border-gray-300 rounded-none h-9 text-sm',
                  !selectedProperty && 'opacity-50 cursor-not-allowed'
                )}
              >
                <SelectValue
                  placeholder={
                    !selectedProperty
                      ? 'Select property first'
                      : 'None (custom service)'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-gray-400 italic text-sm">
                    None — custom service
                  </span>
                </SelectItem>
                {subscriptionsData?.data?.results?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.plan_code} · {s.status} · {s.billing_cycle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={FIELD_HINT}>
              Leave empty for services not tied to a plan.
            </p>
          </div>
        </div>

        {/* Subscription detail strip */}
        {selectedSubscriptionData && (
          <div className="mt-3 border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-2">
              Linked subscription
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5">
              {[
                ['Plan', selectedSubscriptionData.plan_code],
                ['Status', selectedSubscriptionData.status],
                [
                  'Cycle',
                  selectedSubscriptionData.billing_cycle?.replace('_', ' '),
                ],
                [
                  'Amount',
                  `${selectedSubscriptionData.billing_amount?.toLocaleString()} ${selectedSubscriptionData.currency}`,
                ],
                [
                  'Started',
                  new Date(
                    selectedSubscriptionData.started_at
                  ).toLocaleDateString('vi-VN'),
                ],
                [
                  'Expires',
                  new Date(
                    selectedSubscriptionData.expires_at
                  ).toLocaleDateString('vi-VN'),
                ],
                ...(selectedSubscriptionData.auto_renew
                  ? [['Auto-renew', 'Yes']]
                  : []),
                ...(selectedSubscriptionData.discount_amount > 0
                  ? [
                    [
                      'Discount',
                      `-${selectedSubscriptionData.discount_amount.toLocaleString()} ${selectedSubscriptionData.currency}`,
                    ],
                  ]
                  : []),
              ].map(([k, v]) => (
                <div key={k} className="flex gap-1.5 text-xs">
                  <span className="text-gray-400 shrink-0">{k}:</span>
                  <span className="text-gray-700 font-medium capitalize">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormSection>

      <Divider />

      {/* Section: Record details */}
      <FormSection label="Record" hint="Type, status and reference.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={FIELD_WRAPPER}>
            <Label className="text-sm font-medium text-gray-700">
              Type <Required />
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value: any) => {
                setSelectedType(value);
                setValue('type', value);
              }}
            >
              <SelectTrigger className="border-gray-300 rounded-none h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="credit_note">Credit Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={FIELD_WRAPPER}>
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value: any) => {
                setSelectedStatus(value);
                setValue('status', value);
              }}
            >
              <SelectTrigger className="border-gray-300 rounded-none h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={FIELD_WRAPPER}>
            <Label
              htmlFor="reference_code"
              className="text-sm font-medium text-gray-700"
            >
              Reference Code
            </Label>
            <Input
              id="reference_code"
              type="text"
              placeholder="e.g. TXN123456"
              {...register('reference_code')}
              className="border-gray-300 rounded-none h-9 text-sm"
            />
          </div>
        </div>
      </FormSection>

      <Divider />

      {/* Section: Financials */}
      <FormSection
        label="Financials"
        hint="Amount, payment method and billing date."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={FIELD_WRAPPER}>
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-gray-700"
            >
              Amount (VND){' '}
              {isCustomInvoice ? (
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  optional
                </span>
              ) : (
                <Required />
              )}
            </Label>
            <CurrencyInput
              id="amount"
              value={undefined}
              onChange={(value: number) => setValue('amount', value)}
              locale="vi-VN"
              currency="VND"
              showSymbol={true}
              placeholder="0"
              className="border-gray-300 rounded-none h-9 text-sm"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount.message}</p>
            )}
            {isCustomInvoice && (
              <p className={cn(FIELD_HINT, 'text-blue-500')}>
                Can be 0 — auto-synced once invoice items are added.
              </p>
            )}
          </div>

          <div className={FIELD_WRAPPER}>
            <Label className="text-sm font-medium text-gray-700">
              Payment Method
            </Label>
            <Select
              value={selectedPaymentMethod || 'none'}
              onValueChange={(value: any) => {
                const v = value === 'none' ? '' : value;
                setSelectedPaymentMethod(v);
                setValue('payment_method', v);
              }}
            >
              <SelectTrigger className="border-gray-300 rounded-none h-9 text-sm">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-gray-400 italic text-sm">None</span>
                </SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="momo">MoMo</SelectItem>
                <SelectItem value="vnpay">VNPay</SelectItem>
                <SelectItem value="zalopay">ZaloPay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={FIELD_WRAPPER}>
            <Label
              htmlFor="billing_date"
              className="text-sm font-medium text-gray-700"
            >
              Billing Date <Required />
            </Label>
            <Input
              id="billing_date"
              type="date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              className="border-gray-300 rounded-none h-9 text-sm"
            />
          </div>
        </div>

        {/* Auto-sync callout — only for invoices, inline not in a big banner */}
        {selectedType === 'invoice' && (
          <div className="mt-3 flex items-start gap-2 border-l-2 border-blue-300 pl-3 py-1">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">
                Auto-sync enabled.
              </span>{' '}
              {isCustomInvoice
                ? 'The amount will be recalculated automatically when invoice items are added.'
                : 'The estimated amount will sync with the final invoice total once items are added.'}
            </p>
          </div>
        )}
      </FormSection>

      <Divider />

      {/* Section: Notes */}
      <FormSection label="Notes" hint="Internal comments about this record.">
        <Textarea
          id="notes"
          placeholder="Optional notes or internal comments..."
          {...register('notes')}
          className="border-gray-300 rounded-none resize-none text-sm"
          rows={3}
        />
      </FormSection>

      {/* Footer */}
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          <span className="text-red-400">*</span> Required fields
        </p>
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-main text-white rounded-none px-5 h-9 text-sm hover:bg-main-700"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Billing Record'}
        </Button>
      </div>
    </form>
  );
};

/* ─── Small helpers ──────────────────────────────────────────────────────── */

function Required() {
  return <span className="text-red-400 ml-0.5">*</span>;
}

function Divider() {
  return <div className="border-t border-gray-100 my-6" />;
}

function FormSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
      <div className="md:col-span-3">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{hint}</p>
        )}
      </div>
      <div className="md:col-span-9">{children}</div>
    </div>
  );
}
