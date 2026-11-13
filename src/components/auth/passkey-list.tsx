'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { PasskeyItem } from '@/types';

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

export function PasskeyList() {
  const { registeredPasskeys, listPasskeys, deletePasskey, loading } =
    useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLoadPasskeys = async () => {
    await listPasskeys();
    setIsLoaded(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove passkey "${name}"?`)) return;
    setDeletingId(id);
    await deletePasskey(id);
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /* Not yet loaded */
  if (!isLoaded && registeredPasskeys.length === 0) {
    return (
      <button
        type="button"
        onClick={handleLoadPasskeys}
        disabled={loading}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 transition"
      >
        {loading ? 'Loading…' : 'View registered passkeys'}
      </button>
    );
  }

  /* Loading spinner */
  if (loading && registeredPasskeys.length === 0) {
    return (
      <div className="flex items-center gap-2 py-1">
        <svg
          className="h-3.5 w-3.5 animate-spin text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-xs text-gray-400">Loading passkeys…</span>
      </div>
    );
  }

  /* Empty state (after load) */
  if (registeredPasskeys.length === 0 && isLoaded) {
    return <p className="text-xs text-gray-400">No passkeys registered yet.</p>;
  }

  /* List */
  return (
    <div className="mt-1 divide-y divide-gray-100 rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
      {registeredPasskeys.map((passkey: PasskeyItem) => (
        <div
          key={passkey.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white">
              <KeyIcon className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {passkey.name}
              </p>
              <p className="text-xs text-gray-400">
                Added {formatDate(passkey.created_at)}
                {passkey.last_used_at
                  ? ` · Last used ${formatDate(passkey.last_used_at)}`
                  : ''}
              </p>
              {passkey.transports && passkey.transports.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {passkey.transports.map((transport) => (
                    <span
                      key={transport}
                      className="inline-block rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-500"
                    >
                      {transport}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(passkey.id, passkey.name)}
            disabled={loading || deletingId === passkey.id}
            className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition"
          >
            {deletingId === passkey.id ? 'Removing…' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  );
}
