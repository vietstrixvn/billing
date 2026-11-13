'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { TwoFactorSetupData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { logError } from '@/utils';

/**
 * Two-Factor Authentication Setup Dialog
 *
 * This component handles the 2FA setup flow:
 * 1. User clicks "Enable 2FA"
 * 2. Display QR code and secret
 * 3. User scans QR code with authenticator app
 * 4. User enters verification code
 * 5. 2FA is enabled
 */
export function TwoFactorSetupDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const { setupTwoFactor, verifyAndEnableTwoFactor } = useAuthStore();

  const handleSetup = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      setLocalLoading(true);
      const data = await setupTwoFactor();

      if (data) {
        // Set data first, then open dialog after a small delay to ensure state is updated
        setSetupData(data);

        // Use setTimeout to ensure setupData is set before opening
        setTimeout(() => {
          setIsOpen(true);
        }, 100);
      } else {
        logError('[TwoFactorSetupDialog] No data returned from setupTwoFactor');
      }
    } catch (error) {
      logError('[TwoFactorSetupDialog] Error in handleSetup:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) return;

    try {
      setLocalLoading(true);
      const success = await verifyAndEnableTwoFactor(verificationCode);

      if (success) {
        setIsOpen(false);
        setSetupData(null);
        setVerificationCode('');
      }
    } catch (error) {
      logError('Error in handleVerify:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSetupData(null);
    setVerificationCode('');
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent auto-closing - only allow manual close via Cancel button
    // Don't respond to onOpenChange(false) - user must explicitly click Cancel
    if (open) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSetup}
        disabled={localLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {localLoading ? 'Loading...' : 'Enable 2FA'}
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking outside
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing with Escape key
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
          </DialogHeader>

          {setupData ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app
                </p>
                {setupData.qr_code ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qr_code}
                      alt="2FA QR Code"
                      className="w-[200px] h-[200px] border-2 border-gray-300 rounded p-2 bg-white"
                      onError={(e) => {
                        logError(
                          'QR Code failed to load:',
                          setupData.qr_code?.substring(0, 50)
                        );
                        e.currentTarget.style.display = 'none';
                        const errorMsg = document.getElementById('qr-error');
                        if (errorMsg) errorMsg.style.display = 'block';
                      }}
                    />
                    <p id="qr-error" className="text-red-500 text-sm hidden">
                      Failed to load QR code. Please use the manual secret
                      below.
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500">QR code not available</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  Or enter this secret manually:
                </p>
                <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                  {setupData.secret}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter verification code from your app:
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={localLoading}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={
                    localLoading ||
                    !verificationCode ||
                    verificationCode.length !== 6
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {localLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading setup data...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
