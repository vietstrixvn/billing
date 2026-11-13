'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { checkWebAuthnSupport } from '@/store/auth/passkeyActions';
import { logError } from '@/utils';

/**
 * Passkey Login Button
 *
 * Allows users to login using their registered passkey
 */
export function PasskeyLoginButton({ username }: { username?: string }) {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState(false);

  const { beginPasskeyLogin, finishPasskeyLogin, loading } = useAuthStore();

  useEffect(() => {
    checkWebAuthnSupport().then((support) => {
      setIsSupported(support.isSupported);
    });
  }, []);

  const handlePasskeyLogin = async () => {
    try {
      // Begin passkey login
      const options = await beginPasskeyLogin(username);

      if (!options) {
        return;
      }

      // Finish passkey login (browser will prompt for biometric/PIN)
      const success = await finishPasskeyLogin(null);

      if (success) {
        router.replace('/');
      }
    } catch (error) {
      logError('Passkey login error:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handlePasskeyLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      <svg
        className="h-5 w-5 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
        />
      </svg>
      <span className="font-medium text-gray-700">
        {loading ? 'Signing in...' : 'Sign in with Passkey'}
      </span>
    </button>
  );
}
