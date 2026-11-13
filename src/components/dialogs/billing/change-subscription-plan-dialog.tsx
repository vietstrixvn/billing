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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useChangeSubscriptionPlan } from '@/hooks/billing/useSubscription';
import { PlanSelect } from '@/components/selects/plan.select';
import { usePlans } from '@/hooks/billing';

interface ChangeSubscriptionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentPlanId: string;
  currentPlanName: string;
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
  const changePlanMutation = useChangeSubscriptionPlan(subscriptionId);

  const { data: plansData } = usePlans(
    1,
    { is_active: 'true', page_size: 100 },
    0
  );
  const plans = plansData?.data?.results ?? [];

  const form = useForm<ChangePlanFormData>({
    resolver: zodResolver(ChangePlanSchema),
    defaultValues: {
      plan_id: currentPlanId,
      reason: '',
    },
  });

  const handleSubmit = (data: ChangePlanFormData) => {
    changePlanMutation.mutate(
      {
        plan_id: data.plan_id,
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

  const selectedPlanId = form.watch('plan_id');
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isPlanChanged = selectedPlanId !== currentPlanId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Change Subscription Plan</DialogTitle>
          <DialogDescription>
            Change the plan for this subscription. This action will be logged.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Current Plan Info */}
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">Current Plan:</p>
              <p className="text-base font-semibold text-gray-800">
                {currentPlanName}
              </p>
            </div>

            {/* New Plan Selection */}
            <FormField
              control={form.control}
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Plan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <PlanSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={changePlanMutation.isPending}
                      placeholder="Select a new plan"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Preview */}
            {selectedPlan && isPlanChanged && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200 space-y-2">
                <p className="text-sm text-blue-600 font-medium">
                  Plan will change to:
                </p>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-800">
                    {selectedPlan.name}
                  </p>
                  <p className="text-xs text-gray-600 font-mono">{selectedPlan.code}</p>
                  <p className="text-xs text-gray-500">
                    Billing amounts follow your catalog and selected billing cycle
                    after the change.
                  </p>
                  {selectedPlan.description && (
                    <p className="text-xs text-gray-600 mt-2">
                      {selectedPlan.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Warning if same plan */}
            {!isPlanChanged && (
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  ⚠️ You have selected the same plan. Please choose a different
                  plan to proceed.
                </p>
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
                      placeholder="Add a reason for this plan change..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={changePlanMutation.isPending}
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
                disabled={changePlanMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={changePlanMutation.isPending || !isPlanChanged}
                className="bg-main text-white hover:bg-primary-800"
              >
                {changePlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
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
