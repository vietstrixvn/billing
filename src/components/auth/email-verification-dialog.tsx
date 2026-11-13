'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { useAuthStore } from '@/store';
import { Mail, ShieldCheck } from 'lucide-react';

export const EmailVerificationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { sendEmailOtp, verifyEmailOtp, loading } = useAuthStore();

  const handleSendOtp = async () => {
    const success = await sendEmailOtp();
    if (success) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      return;
    }

    const success = await verifyEmailOtp(otpCode);
    if (success) {
      setIsOpen(false);
      setOtpCode('');
      setOtpSent(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setOtpCode('');
    setOtpSent(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Verify Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Email Verification
          </DialogTitle>
          <DialogDescription>
            {!otpSent
              ? 'Verify your email address to secure your account'
              : 'Enter the verification code sent to your email'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!otpSent ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click the button below to receive a verification code via email.
              </p>
              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || !otpCode.trim()}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  onClick={handleSendOtp}
                  variant="outline"
                  disabled={loading}
                >
                  Resend
                </Button>
              </div>

              <Button
                onClick={handleClose}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
