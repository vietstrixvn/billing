'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

/**
 * Two-Factor Authentication Login Form
 *
 * This component is shown after initial login when 2FA is required.
 * It prompts the user to enter their 2FA code to complete login.
 */
export function TwoFactorLoginForm() {
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();

  const {
    verifyTwoFactorLogin,
    clearTwoFactorState,
    loading,
    requiresTwoFactor,
  } = useAuthStore();

  // Only show if 2FA is required
  if (!requiresTwoFactor) {
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) return;

    const success = await verifyTwoFactorLogin(verificationCode);
    if (success) {
      router.push('/');
    }
  };

  const handleCancel = () => {
    clearTwoFactorState();
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-md shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-6">
          Enter the verification code from your authenticator app
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="w-full px-4 py-3 border rounded-md text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !verificationCode}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-3 border rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p>Can&apos;t access your authenticator app?</p>
          <button className="text-blue-600 hover:underline">
            Contact support
          </button>
        </div>
      </div>
    </div>
  );
}
