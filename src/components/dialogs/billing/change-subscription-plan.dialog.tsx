'use client';

import { useState } from 'react';
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
import { useChangeSubscriptionPlan } from '@/hooks/billing/useSubscription';
import { usePlans } from '@/hooks/billing/usePlan';

interface ChangeSubscriptionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentPlanId: string;
  currentPlanName?: string;
  onSuccess?: () => void;
}

const ChangePlanSchema = z.object({
  plan_id: z.string().min(1, 'Plan is required'),
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
});

type ChangePlanFormData = z.infer<typeof ChangePlanSchema>;

export function ChangeSubscriptionPlanDialog({
  open,
  onOpenChange,
  subscriptionId,
  currentPlanId,
  currentPlanName,
  onSuccess,
}: ChangeSubscriptionPlanDialogProps) {
  const [page] = useState(1);
  const changePlanMutation = useChangeSubscriptionPlan(subscriptionId);
  const { data: plansData, isLoading: plansLoading } = usePlans(page, {}, 0);

  const form = useForm<ChangePlanFormData>({
    resolver: zodResolver(ChangePlanSchema),
    defaultValues: {
      plan_id: currentPlanId,
      reason: '',
    },
  });

  const handleSubmit = (data: ChangePlanFormData) => {
    changePlanMutation.mutate(
      { plan_id: data.plan_id, reason: data.reason },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const selectedPlanId = form.watch('plan_id');
  const hasChanged = selectedPlanId !== currentPlanId;
  const selectedPlan = plansData?.data?.results?.find(
    (p) => p.id === selectedPlanId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white p-0 gap-0 overflow-hidden rounded-none border border-slate-200 shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Change Subscription Plan
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-0.5">
            This change will be logged with a timestamp and your account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-5">
              {/* Current → New plan row */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Current
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {currentPlanName || currentPlanId}
                  </span>
                </div>

                {hasChanged && selectedPlan && (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 mt-4 shrink-0" />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        New
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {selectedPlan.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate">
                        {selectedPlan.code}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Plan select */}
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-600">
                      New Plan <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={changePlanMutation.isPending || plansLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm rounded-none border-slate-200 bg-white focus:ring-1 focus:ring-slate-400">
                          <SelectValue placeholder="Select new plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none border-slate-200">
                        {plansLoading ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading plans…
                          </div>
                        ) : plansData?.data?.results?.length ? (
                          plansData.data.results.map((plan) => (
                            <SelectItem
                              key={plan.id}
                              value={plan.id}
                              disabled={plan.id === currentPlanId}
                              className="text-sm"
                            >
                              <div className="flex items-center justify-between gap-6 w-full">
                                <span
                                  className={
                                    plan.id === currentPlanId
                                      ? 'text-slate-400'
                                      : 'text-slate-700'
                                  }
                                >
                                  {plan.name}
                                  {plan.id === currentPlanId && (
                                    <span className="ml-1.5 text-xs text-slate-400">
                                      (current)
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {plan.code}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-slate-400">
                            No plans available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Plan code — chỉ hiện khi đã chọn plan mới */}
              {hasChanged && selectedPlan?.code && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Plan code</span>
                  <code className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono border border-slate-200">
                    {selectedPlan.code}
                  </code>
                  {selectedPlan.description && (
                    <>
                      <span className="text-slate-200">·</span>
                      <span className="text-slate-400 truncate">
                        {selectedPlan.description}
                      </span>
                    </>
                  )}
                </div>
              )}

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
                        placeholder="e.g. Customer requested upgrade to access advanced features"
                        className="resize-none text-sm rounded-none border-slate-200 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-400"
                        rows={3}
                        {...field}
                        disabled={changePlanMutation.isPending}
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
                disabled={changePlanMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  changePlanMutation.isPending || !hasChanged || plansLoading
                }
                className="rounded-none bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 text-sm h-8 px-4"
              >
                {changePlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Changing…
                  </>
                ) : (
                  'Change Plan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
