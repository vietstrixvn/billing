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
import { Textarea } from '@/components/ui/textarea';
import {
  CreateSubscriptionLegacySchema,
  type CreateSubscriptionLegacyDTO,
} from '@/types';
import { Loader2 } from 'lucide-react';
import { PlanSelect } from '@/components/selects/plan.select';

interface SubscriptionFormProps {
  onSubmit: (data: CreateSubscriptionLegacyDTO) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateSubscriptionLegacyDTO>;
}

export function SubscriptionForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: SubscriptionFormProps) {
  const form = useForm<CreateSubscriptionLegacyDTO>({
    resolver: zodResolver(CreateSubscriptionLegacySchema),
    defaultValues: {
      property_id: defaultValues?.property_id || 0,
      plan_id: defaultValues?.plan_id || '',
      status: defaultValues?.status || 'active',
      started_at:
        defaultValues?.started_at || new Date().toISOString().split('T')[0],
      expires_at: defaultValues?.expires_at || '',
      trial_ends_at: defaultValues?.trial_ends_at || '',
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isLoading}
                    placeholder="Select a property"
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
                    placeholder="Select a plan"
                    useCode={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Status + Started At */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="started_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Started At <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                    value={field.value?.split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      field.onChange(date ? `${date}T00:00:00Z` : '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Expires At + Trial Ends At */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expires_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Expires At <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                    value={field.value?.split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      field.onChange(date ? `${date}T23:59:59Z` : '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trial_ends_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trial Ends At (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                    value={field.value?.split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      field.onChange(date ? `${date}T23:59:59Z` : '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this subscription..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
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
