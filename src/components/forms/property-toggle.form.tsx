'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlideToggle } from '@/components/ui/toggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Property } from '@/types';
import { logError } from '@/utils';

interface PropertyToggleFormProps {
  property: Property;
  onToggle: (isActive: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function PropertyToggleForm({
  property,
  onToggle,
  isLoading = false,
}: PropertyToggleFormProps) {
  const [isActive, setIsActive] = useState(property.is_active);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleToggleClick = (newValue: boolean) => {
    if (newValue === isActive) return;

    // Show confirmation dialog for deactivation
    if (!newValue) {
      setShowConfirmDialog(true);
    } else {
      // Activate immediately
      handleConfirm(newValue);
    }
  };

  const handleConfirm = async (value: boolean) => {
    try {
      await onToggle(value);
      setIsActive(value);
      setShowConfirmDialog(false);
    } catch (error) {
      // Error handling is done in parent component
      logError('Toggle failed:', error);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Property Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isActive
              ? 'Property is currently active and accessible'
              : 'Property is currently inactive and blocked'}
          </p>

          {property.current_subscription && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Subscription:</span>{' '}
              {property.current_subscription.status === 'active' ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">
                  {property.current_subscription.status}
                </span>
              )}
              {' • '}
              <span className="font-medium">Plan:</span>{' '}
              {property.current_subscription.plan_code}
            </div>
          )}
        </div>

        <div className="ml-4">
          <SlideToggle
            checked={isActive}
            onChange={handleToggleClick}
            disabled={isLoading}
            label={isActive ? 'Active' : 'Inactive'}
            variant={isActive ? 'success' : 'danger'}
            size="lg"
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Deactivate Property?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this property?
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deactivating this property will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Block all API requests to this property</li>
                <li>Make the property inaccessible to users</li>
                <li>Prevent any operations until reactivated</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This is separate from subscription expiry.
              You can reactivate the property anytime via this toggle.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirm(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate Property'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
