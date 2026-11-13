'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlideToggle } from '@/components/ui/toggle';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui';
import { PlanSelect } from '@/components/selects/plan.select';
import {
  CreateProvisionSubscriptionSchema,
  type CreateProvisionSubscriptionDTO,
} from '@/types';
import { percentToBps, bpsToPercent, formatBpsDescription } from '@/utils';

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly', hint: 'Billed every month' },
  { value: 'quarterly', label: 'Quarterly', hint: 'Billed every 3 months' },
  { value: 'semi-annually', label: 'Semi-annual', hint: 'Billed every 6 months' },
  { value: 'annual', label: 'Annual', hint: 'Billed every year' },
  { value: 'biennial', label: 'Every 2 years', hint: '24-month billing cycle' },
  { value: 'triennial', label: 'Every 3 years', hint: '36-month billing cycle' },
  { value: 'quinquennial', label: 'Every 5 years', hint: '60-month billing cycle' },
  { value: 'one_time', label: 'One-time', hint: 'Single charge only' },
] as const;

interface ProvisionSubscriptionFormProps {
  onSubmit: (data: CreateProvisionSubscriptionDTO) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateProvisionSubscriptionDTO>;
}

export function ProvisionSubscriptionForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: ProvisionSubscriptionFormProps) {
  const form = useForm<CreateProvisionSubscriptionDTO>({
    resolver: zodResolver(CreateProvisionSubscriptionSchema) as any,
    defaultValues: {
      property_id: defaultValues?.property_id ?? '',
      plan_id: defaultValues?.plan_id ?? '',
      billing_cycle: defaultValues?.billing_cycle ?? 'monthly',
      auto_renew: defaultValues?.auto_renew ?? true,
      currency: defaultValues?.currency ?? 'VND',
      tax_rate_bps: defaultValues?.tax_rate_bps ?? 1000,
      discount_code: defaultValues?.discount_code ?? '',
      notes: defaultValues?.notes ?? '',
      addons: defaultValues?.addons ?? [],
    },
  });

  const taxPercent = bpsToPercent(form.watch('tax_rate_bps'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Provision creates subscription, billing record (pending), invoice and
            line items in one transaction. Then mark the record as paid.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* <FormField
            control={form.control}
            name="property_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Property <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PropertySelect
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Plan <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PlanSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                    useCode={false}
                  />
                </FormControl>
                <FormDescription>Plan ID sent to provision API</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="billing_cycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Billing cycle <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BILLING_CYCLES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="font-medium">{c.label}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {c.hint}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Tax rate (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxPercent}
                disabled={isLoading}
                onChange={(e) => {
                  const pct = parseFloat(e.target.value) || 0;
                  form.setValue('tax_rate_bps', percentToBps(pct));
                }}
              />
            </FormControl>
            <FormDescription>
              {formatBpsDescription(form.watch('tax_rate_bps'), 'VAT', false)}
            </FormDescription>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="discount_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional coupon code"
                  {...field}
                  value={field.value ?? ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="auto_renew"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-4">
              <div>
                <FormLabel>Auto-renewal</FormLabel>
                <FormDescription>
                  Enables renewal invoices each billing cycle
                </FormDescription>
              </div>
              <FormControl>
                <SlideToggle
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="e.g. First subscription for new property"
                  {...field}
                  value={field.value ?? ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="submit" disabled={isLoading} className="bg-main">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Provisioning...
              </>
            ) : (
              'Provision & create invoice'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
