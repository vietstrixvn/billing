'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  AddAddonToSubscriptionSchema,
  type AddAddonToSubscriptionDTO,
} from '@/types';
import { useAddAddonToSubscription } from '@/hooks/billing';
import { AddonList, AddonPriceList } from '@/libs/responses';

interface AddSubscriptionAddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  onSuccess?: () => void;
}

export function AddSubscriptionAddonDialog({
  open,
  onOpenChange,
  subscriptionId,
  onSuccess,
}: AddSubscriptionAddonDialogProps) {
  const addMutation = useAddAddonToSubscription(subscriptionId);
  const [selectedAddonId, setSelectedAddonId] = useState('');
  const { addons, isLoading: addonsLoading } = AddonList(
    1,
    { page_size: 100 },
    open ? 1 : 0
  );
  const { prices, isLoading: pricesLoading } = AddonPriceList(
    selectedAddonId,
    open ? 1 : 0
  );

  const form = useForm<AddAddonToSubscriptionDTO>({
    resolver: zodResolver(AddAddonToSubscriptionSchema),
    defaultValues: {
      addon_id: '',
      price_id: '',
      quantity: 1,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedAddonId('');
    }
  }, [open, form]);

  const onAddonChange = (addonId: string) => {
    setSelectedAddonId(addonId);
    form.setValue('addon_id', addonId);
    form.setValue('price_id', '');
  };

  const handleSubmit = (data: AddAddonToSubscriptionDTO) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        setSelectedAddonId('');
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add addon to subscription</DialogTitle>
          <DialogDescription>
            Price is snapshotted for renewals. Choose an active addon and its
            price tier.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="addon_id"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Addon <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={selectedAddonId}
                    onValueChange={onAddonChange}
                    disabled={addonsLoading || addMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select addon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {addons.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.slug})
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
              name="price_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Price <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      !selectedAddonId ||
                      pricesLoading ||
                      addMutation.isPending
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedAddonId
                              ? 'Select price'
                              : 'Select addon first'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {prices.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.billing_cycle} ·{' '}
                          {p.unit_amount.toLocaleString()} {p.currency}
                          {p.is_active ? '' : ' (inactive)'}
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantity <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                      disabled={addMutation.isPending}
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
                disabled={addMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-main"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add addon'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
