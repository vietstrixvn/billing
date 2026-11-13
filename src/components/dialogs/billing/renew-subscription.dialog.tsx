'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Loader2, RefreshCw } from 'lucide-react';
import { useRenewSubscription } from '@/hooks/billing';
import { RenewSubscriptionSchema, type RenewSubscriptionDTO } from '@/types';
import type { ProvisionResult } from '@/types/billing/responses';

interface RenewSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  planCode?: string;
  onSuccess?: (result: ProvisionResult) => void;
}

export function RenewSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionId,
  planCode,
  onSuccess,
}: RenewSubscriptionDialogProps) {
  const renewMutation = useRenewSubscription(subscriptionId);

  const form = useForm<RenewSubscriptionDTO>({
    resolver: zodResolver(RenewSubscriptionSchema),
    defaultValues: { notes: '' },
  });

  const handleSubmit = (data: RenewSubscriptionDTO) => {
    renewMutation.mutate(data, {
      onSuccess: (response) => {
        form.reset();
        onOpenChange(false);
        const result = response?.data ?? response;
        if (result?.subscription) {
          onSuccess?.(result as ProvisionResult);
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Renew subscription
          </DialogTitle>
          <DialogDescription>
            Extends expiry and creates a new billing record + invoice for the
            recurring amount
            {planCode ? ` (${planCode})` : ''}. Same subscription ID is kept.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="e.g. Renewal month 2"
                      {...field}
                      disabled={renewMutation.isPending}
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
                disabled={renewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={renewMutation.isPending}
                className="bg-main"
              >
                {renewMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Renewing...
                  </>
                ) : (
                  'Renew & create invoice'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
