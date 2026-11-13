'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { useExtendSubscription } from '@/hooks/billing/useSubscription';
import { format, addDays } from 'date-fns';

interface ExtendSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentExpiresAt: string;
  onSuccess?: () => void;
}

const ExtendSubscriptionSchema = z.object({
  days: z
    .number()
    .int('Days must be a whole number')
    .positive('Days must be greater than 0')
    .max(3650, 'Cannot extend more than 10 years (3650 days)'),
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
});

type ExtendSubscriptionFormData = z.infer<typeof ExtendSubscriptionSchema>;

const QUICK_EXTEND_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '180 days', days: 180 },
  { label: '365 days', days: 365 },
];

export function ExtendSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionId,
  currentExpiresAt,
  onSuccess,
}: ExtendSubscriptionDialogProps) {
  const extendMutation = useExtendSubscription(subscriptionId);

  const form = useForm<ExtendSubscriptionFormData>({
    resolver: zodResolver(ExtendSubscriptionSchema),
    defaultValues: {
      days: 30,
      reason: '',
    },
  });

  const handleSubmit = (data: ExtendSubscriptionFormData) => {
    extendMutation.mutate(
      {
        days: data.days,
        reason: data.reason,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const daysValue = form.watch('days');
  const currentExpiry = new Date(currentExpiresAt);
  const newExpiry = daysValue
    ? addDays(currentExpiry, daysValue)
    : currentExpiry;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Extend Subscription</DialogTitle>
          <DialogDescription>
            Add more days to this subscription. The new expiry date will be
            calculated from the current expiry date.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Current Expiry Info */}
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Current Expiry Date:</span>
              </div>
              <p className="text-base font-semibold text-gray-800">
                {format(currentExpiry, 'PPP')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {format(currentExpiry, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            {/* Quick Extend Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Quick Extend
              </label>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_EXTEND_OPTIONS.map((option) => (
                  <Button
                    key={option.days}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('days', option.days)}
                    disabled={extendMutation.isPending}
                    className={
                      daysValue === option.days
                        ? 'bg-main text-white hover:bg-primary-800 hover:text-white'
                        : ''
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Days Input */}
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of Days <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="3650"
                      placeholder="30"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                      disabled={extendMutation.isPending}
                      className="rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Expiry Preview */}
            {daysValue > 0 && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>New Expiry Date:</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {format(newExpiry, 'PPP')}
                </p>
                <p className="text-xs text-blue-600">
                  {format(newExpiry, 'EEEE, MMMM d, yyyy')}
                </p>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    Extension:{' '}
                    <span className="font-semibold">{daysValue}</span>{' '}
                    {daysValue === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a reason for this extension..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={extendMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={extendMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  extendMutation.isPending || !daysValue || daysValue <= 0
                }
                className="bg-main text-white hover:bg-primary-800"
              >
                {extendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extending...
                  </>
                ) : (
                  'Extend Subscription'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
