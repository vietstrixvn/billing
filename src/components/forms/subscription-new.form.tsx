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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateSubscriptionSchema, type CreateSubscriptionDTO } from '@/types';
import { SlideToggle } from '@/components/ui/toggle';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui';
import { PlanSelect } from '@/components/selects/plan.select';

interface SubscriptionNewFormProps {
  onSubmit: (data: CreateSubscriptionDTO) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateSubscriptionDTO>;
}

const BILLING_CYCLE_INFO: Record<
  'monthly' | 'quarterly' | 'semi_annually' | 'annual',
  { label: string; duration: string; discount: string }
> = {
  monthly: { label: 'Monthly', duration: '30 days', discount: 'No discount' },
  quarterly: {
    label: 'Quarterly',
    duration: '90 days',
    discount: '10% discount',
  },
  semi_annually: {
    label: 'Semi-Annually',
    duration: '180 days',
    discount: '15% discount',
  },
  annual: { label: 'Annual', duration: '365 days', discount: '17% discount' },
};

export function SubscriptionNewForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: SubscriptionNewFormProps) {
  const form = useForm<CreateSubscriptionDTO>({
    resolver: zodResolver(CreateSubscriptionSchema) as any,
    defaultValues: {
      property_id: defaultValues?.property_id || '',
      plan_code: defaultValues?.plan_code || '',
      billing_cycle: defaultValues?.billing_cycle || 'monthly',
      auto_renew: defaultValues?.auto_renew ?? true,
      discount_code: defaultValues?.discount_code || '',
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Create a subscription with automatic expiry calculation based on
            billing cycle. The system will calculate the expiry date
            automatically.
          </AlertDescription>
        </Alert>

        {/* Row 1: Property + Plan */}
        <div className="grid grid-cols-2 gap-4">
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
                    placeholder="Select a property"
                  />
                </FormControl>
                <FormDescription>
                  Select the property to subscribe
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="plan_code"
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
                    placeholder="Select a plan"
                    useCode={true}
                  />
                </FormControl>
                <FormDescription>Select the subscription plan</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Billing Cycle + Discount Code */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billing_cycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Billing Cycle <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BILLING_CYCLE_INFO).map(([value, info]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{info.label}</span>
                          <span className="text-xs text-gray-500">
                            {info.duration} • {info.discount}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how often the subscription renews
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Code (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter discount code"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Apply a discount code to this subscription
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Auto Renew */}
        <FormField
          control={form.control}
          name="auto_renew"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
              <div className="space-y-1 leading-none">
                <FormLabel>Auto-Renewal</FormLabel>
                <FormDescription>
                  Automatically renew the subscription when it expires
                </FormDescription>
              </div>
              <FormControl>
                <SlideToggle
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  variant="success"
                  labelOn="ON"
                  labelOff="OFF"
                  showInnerLabel
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Add any additional notes..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Optional notes about this subscription
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-main text-white hover:bg-primary-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Subscription'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
