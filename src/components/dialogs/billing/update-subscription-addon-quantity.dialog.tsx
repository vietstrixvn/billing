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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  UpdateSubscriptionAddonQuantitySchema,
  type UpdateSubscriptionAddonQuantityDTO,
} from '@/types';
import { useUpdateSubscriptionAddonQuantity } from '@/hooks/billing';

interface UpdateSubscriptionAddonQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  addonRecordId: string;
  currentQuantity: number;
  onSuccess?: () => void;
}

export function UpdateSubscriptionAddonQuantityDialog({
  open,
  onOpenChange,
  subscriptionId,
  addonRecordId,
  currentQuantity,
  onSuccess,
}: UpdateSubscriptionAddonQuantityDialogProps) {
  const updateMutation = useUpdateSubscriptionAddonQuantity(
    addonRecordId,
    subscriptionId
  );

  const form = useForm<UpdateSubscriptionAddonQuantityDTO>({
    resolver: zodResolver(UpdateSubscriptionAddonQuantitySchema),
    defaultValues: { quantity: currentQuantity },
  });

  const handleSubmit = (data: UpdateSubscriptionAddonQuantityDTO) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset({ quantity: currentQuantity });
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update quantity</DialogTitle>
          <DialogDescription>
            Current quantity: {currentQuantity}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                      disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-main"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
