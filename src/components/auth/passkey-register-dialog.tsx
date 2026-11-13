'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { checkWebAuthnSupport } from '@/store/auth/passkeyActions';
import { logError } from '@/utils';

export function PasskeyRegisterDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isPlatformAvailable, setIsPlatformAvailable] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<
    'platform' | 'cross-device'
  >('platform');

  const { beginPasskeyRegistration, finishPasskeyRegistration, loading } =
    useAuthStore();

  useEffect(() => {
    checkWebAuthnSupport().then((support) => {
      setIsSupported(support.isSupported);
      setIsPlatformAvailable(support.isPlatformAuthenticatorAvailable);
    });
  }, []);

  const handleRegister = async () => {
    if (!deviceName.trim()) return;

    try {
      const options = await beginPasskeyRegistration(deviceName);
      if (!options) return;

      const success = await finishPasskeyRegistration(deviceName, null);
      if (success) {
        setIsOpen(false);
        setDeviceName('');
        setRegistrationMode('platform');
      }
    } catch (error) {
      logError('Passkey registration error:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setDeviceName('');
    setRegistrationMode('platform');
  };

  if (!isSupported) {
    return (
      <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3">
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
          Passkeys are not supported in this browser. Use Chrome, Safari, or
          Edge to register a passkey.
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
      >
        Add passkey
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-md border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-medium text-gray-900">Add a passkey</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Passkeys let you sign in without a password using your device&apos;s
            biometrics or PIN.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {/* Method selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRegistrationMode('platform')}
              className={`flex flex-col items-start gap-2 rounded-md border p-3 text-left transition ${
                registrationMode === 'platform'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md ${
                  registrationMode === 'platform'
                    ? 'bg-gray-900'
                    : 'bg-gray-100'
                }`}
              >
                <svg
                  className={`h-3.5 w-3.5 ${
                    registrationMode === 'platform'
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">This device</p>
                <p className="text-xs text-gray-500">
                  {isPlatformAvailable
                    ? 'Face ID / Touch ID'
                    : 'PIN or password'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistrationMode('cross-device')}
              className={`flex flex-col items-start gap-2 rounded-md border p-3 text-left transition ${
                registrationMode === 'cross-device'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md ${
                  registrationMode === 'cross-device'
                    ? 'bg-gray-900'
                    : 'bg-gray-100'
                }`}
              >
                <svg
                  className={`h-3.5 w-3.5 ${
                    registrationMode === 'cross-device'
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  Another device
                </p>
                <p className="text-xs text-gray-500">Scan QR with phone</p>
              </div>
            </button>
          </div>

          {registrationMode === 'cross-device' && (
            <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5">
              <svg
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              <p className="text-xs leading-relaxed text-blue-700">
                A QR code will appear after clicking Register. Scan it with your
                phone&apos;s camera.
              </p>
            </div>
          )}

          {/* Device name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Passkey name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder={
                registrationMode === 'platform'
                  ? 'e.g. MacBook Pro, Work PC'
                  : 'e.g. iPhone 15, Android'
              }
              disabled={loading}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5 disabled:opacity-60 transition"
            />
            <p className="mt-1 text-xs text-gray-400">
              A label to identify this passkey in your account.
            </p>
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
            onClick={handleRegister}
            disabled={loading || !deviceName.trim()}
            className="rounded-md bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition"
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
