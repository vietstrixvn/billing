'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';

export function TwoFactorDisableDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const { disableTwoFactor, loading } = useAuthStore();

  const handleDisable = async () => {
    if (!password || !verificationCode) return;

    const success = await disableTwoFactor(password, verificationCode);
    if (success) {
      setIsOpen(false);
      setPassword('');
      setVerificationCode('');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPassword('');
    setVerificationCode('');
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 hover:border-red-200 transition"
      >
        Disable
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-md border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-medium text-gray-900">
            Disable two-factor authentication
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            Confirm your identity to remove 2FA from your account.
          </p>
        </div>

        {/* Warning banner */}
        <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-xs leading-relaxed text-amber-700">
            Disabling 2FA makes your account less secure. You can re-enable it
            at any time.
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your current password"
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Authenticator code
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
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-center font-mono text-sm tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDisable}
            disabled={loading || !password || verificationCode.length !== 6}
            className="rounded-md bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 transition"
          >
            {loading ? 'Disabling…' : 'Disable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
}
