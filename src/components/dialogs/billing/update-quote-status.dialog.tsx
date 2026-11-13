'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@/components/ui';
import React, { useState } from 'react';
import { toast } from 'sonner';
import type { UpdateQuoteStatusDTO } from '@/types';
import { useUpdateQuoteStatus } from '@/hooks/billing';

interface UpdateQuoteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  onClose?: () => void;
}

export const UpdateQuoteStatusDialog: React.FC<
  UpdateQuoteStatusDialogProps
> = ({ open, onOpenChange, quoteId, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('sent');
  const updateMutation = useUpdateQuoteStatus(quoteId);

  const handleClose = () => {
    setSelectedStatus('sent');
    onClose?.();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      const updateData: UpdateQuoteStatusDTO = {
        status: selectedStatus as any,
      };
      await updateMutation.mutateAsync(updateData);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Error updating quote status');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle>Update Quote Status</DialogTitle>
          <DialogDescription>Change the status of this quote</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border-gray-300 px-3 py-2 border"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updateMutation.isPending}
            className="border-main text-main rounded-md bg-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-main text-white rounded-md hover:bg-main-700"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
