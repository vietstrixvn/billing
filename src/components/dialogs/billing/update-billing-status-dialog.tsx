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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useUpdateBillingRecordStatus } from '@/hooks/billing';
import type { BillingRecordStatus } from '@/types/billing/responses';

interface UpdateBillingStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingRecordId: string;
  currentStatus: BillingRecordStatus;
  onSuccess?: () => void;
}

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']),
});

type UpdateStatusFormData = z.infer<typeof UpdateStatusSchema>;

const statusConfig: Record<
  BillingRecordStatus,
  { label: string; description: string; color: string }
> = {
  pending: {
    label: 'Pending',
    description: 'Payment is pending',
    color: 'text-yellow-600',
  },
  paid: {
    label: 'Paid',
    description: 'Payment has been received',
    color: 'text-green-600',
  },
  failed: {
    label: 'Failed',
    description: 'Payment has failed',
    color: 'text-red-600',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Billing record has been cancelled',
    color: 'text-gray-600',
  },
};

export function UpdateBillingStatusDialog({
  open,
  onOpenChange,
  billingRecordId,
  currentStatus,
  onSuccess,
}: UpdateBillingStatusDialogProps) {
  const updateMutation = useUpdateBillingRecordStatus(billingRecordId);

  const form = useForm<UpdateStatusFormData>({
    resolver: zodResolver(UpdateStatusSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const handleSubmit = (data: UpdateStatusFormData) => {
    updateMutation.mutate(
      {
        status: data.status,
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

  const selectedStatus = form.watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Billing Record Status</DialogTitle>
          <DialogDescription>
            Change the status of this billing record. This action will be
            logged.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Current Status Info */}
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">Current Status:</p>
              <p
                className={`text-base font-semibold ${statusConfig[currentStatus].color}`}
              >
                {statusConfig[currentStatus].label}
              </p>
            </div>

            {/* New Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Status <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={updateMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        ['pending', 'paid', 'failed', 'cancelled'] as const
                      ).map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          disabled={status === currentStatus}
                        >
                          <div className="flex flex-col">
                            <span
                              className={`font-medium ${statusConfig[status].color}`}
                            >
                              {statusConfig[status].label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {statusConfig[status].description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Preview */}
            {selectedStatus && selectedStatus !== currentStatus && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">
                  Status will change to:
                </p>
                <p
                  className={`text-base font-semibold ${statusConfig[selectedStatus].color}`}
                >
                  {statusConfig[selectedStatus].label}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {statusConfig[selectedStatus].description}
                </p>
              </div>
            )}

            {/* Warning if same status */}
            {selectedStatus === currentStatus && (
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  ⚠️ You have selected the same status. Please choose a
                  different status to proceed.
                </p>
              </div>
            )}

            {/* Status Change Notes */}
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Changing to{' '}
                <span className="font-medium">Paid</span> will automatically set
                the paid_at timestamp. Changing to{' '}
                <span className="font-medium">Failed</span> or{' '}
                <span className="font-medium">Cancelled</span> will mark the
                record accordingly.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending || selectedStatus === currentStatus
                }
                className="bg-main text-white hover:bg-primary-800"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
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
