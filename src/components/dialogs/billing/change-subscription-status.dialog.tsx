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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { useUpdateSubscriptionStatus } from '@/hooks/billing/useSubscription';
import type { SubscriptionStatus } from '@/types/billing/responses';

interface ChangeSubscriptionStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentStatus: SubscriptionStatus;
  onSuccess?: () => void;
}

const ChangeStatusSchema = z.object({
  status: z.enum(['trial', 'active', 'expired', 'suspended', 'cancelled']),
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
});

type ChangeStatusFormData = z.infer<typeof ChangeStatusSchema>;

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; description: string; dot: string; badge: string }
> = {
  trial: {
    label: 'Trial',
    description: 'In trial period',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
  },
  active: {
    label: 'Active',
    description: 'Active and running',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  },
  expired: {
    label: 'Expired',
    description: 'Subscription has expired',
    dot: 'bg-red-400',
    badge: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  },
  suspended: {
    label: 'Suspended',
    description: 'Temporarily suspended',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Subscription cancelled',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
  },
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function ChangeSubscriptionStatusDialog({
  open,
  onOpenChange,
  subscriptionId,
  currentStatus,
  onSuccess,
}: ChangeSubscriptionStatusDialogProps) {
  const updateMutation = useUpdateSubscriptionStatus(subscriptionId);

  const form = useForm<ChangeStatusFormData>({
    resolver: zodResolver(ChangeStatusSchema),
    defaultValues: {
      status: currentStatus,
      reason: '',
    },
  });

  const handleSubmit = (data: ChangeStatusFormData) => {
    updateMutation.mutate(
      { status: data.status, reason: data.reason },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const selectedStatus = form.watch('status');
  const hasChanged = selectedStatus !== currentStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white p-0 gap-0 overflow-hidden rounded-none border border-slate-200 shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Change Subscription Status
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-0.5">
            This change will be logged with a timestamp and your account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-5">
              {/* Current → New */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Current
                  </span>
                  <StatusBadge status={currentStatus} />
                </div>
                {hasChanged && (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 mt-4 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        New
                      </span>
                      <StatusBadge
                        status={selectedStatus as SubscriptionStatus}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Select */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-600">
                      New Status <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={updateMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm rounded-none border-slate-200 bg-white focus:ring-1 focus:ring-slate-400">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none border-slate-200">
                        {Object.entries(statusConfig).map(([value, cfg]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            disabled={value === currentStatus}
                            className="text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${value === currentStatus ? 'opacity-40' : ''}`}
                              />
                              <span
                                className={
                                  value === currentStatus
                                    ? 'text-slate-400'
                                    : 'text-slate-700'
                                }
                              >
                                {cfg.label}
                              </span>
                              {value === currentStatus && (
                                <span className="text-xs text-slate-400">
                                  (current)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-600">
                      Reason{' '}
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Customer requested suspension pending payment review"
                        className="resize-none text-sm rounded-none border-slate-200 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-400"
                        rows={3}
                        {...field}
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none border-slate-200 text-slate-600 hover:bg-slate-100 text-sm h-8 px-3"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending || !hasChanged}
                className="rounded-none bg-main text-white hover:bg-slate-800 disabled:opacity-40 text-sm h-8 px-4"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Updating…
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
