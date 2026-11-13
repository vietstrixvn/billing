'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { logError } from '@/utils';

function VerificationDialog({
  onClose,
  onVerify,
  loading,
}: {
  onClose: () => void;
  onVerify: (code: string) => void;
  loading: boolean;
}) {
  const [verificationCode, setVerificationCode] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-md border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-medium text-gray-900">
            Enter verification code
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            Open your authenticator app and enter the 6-digit code.
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="000 000"
            maxLength={6}
            autoFocus
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onVerify(verificationCode)}
            disabled={loading || verificationCode.length !== 6}
            className="rounded-md bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition"
          >
            {loading ? 'Verifying…' : 'Verify & enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TwoFactorSetupDialogSimple() {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [qrWindow, setQrWindow] = useState<Window | null>(null);

  const setupTwoFactor = useAuthStore((state) => state.setupTwoFactor);
  const verifyAndEnableTwoFactor = useAuthStore(
    (state) => state.verifyAndEnableTwoFactor
  );

  const handleSetup = useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      try {
        setLocalLoading(true);
        const data = await setupTwoFactor();

        if (data) {
          const newWindow = window.open(
            '',
            '2FA Setup',
            'width=480,height=640'
          );

          if (newWindow) {
            setQrWindow(newWindow);

            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Set up two-factor authentication</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #fafafa;
                    color: #111;
                    padding: 32px 24px;
                    max-width: 440px;
                    margin: 0 auto;
                  }
                  .step {
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #9ca3af;
                    margin-bottom: 6px;
                  }
                  h1 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111;
                    margin-bottom: 4px;
                  }
                  .subtitle {
                    font-size: 13px;
                    color: #6b7280;
                    margin-bottom: 24px;
                    line-height: 1.5;
                  }
                  .qr-wrap {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                  }
                  .qr-wrap img {
                    width: 192px;
                    height: 192px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 8px;
                    background: #fff;
                  }
                  .secret-block {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 14px 16px;
                    margin-bottom: 24px;
                  }
                  .secret-label {
                    font-size: 11px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #9ca3af;
                    margin-bottom: 6px;
                  }
                  .secret-code {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-size: 13px;
                    word-break: break-all;
                    color: #374151;
                    line-height: 1.6;
                  }
                  .divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    color: #d1d5db;
                    font-size: 12px;
                  }
                  .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e5e7eb;
                  }
                  button {
                    display: block;
                    width: 100%;
                    background: #111;
                    color: #fff;
                    border: none;
                    padding: 11px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s;
                  }
                  button:hover { background: #333; }
                </style>
              </head>
              <body>
                <p class="step">Step 1 of 2</p>
                <h1>Scan QR code</h1>
                <p class="subtitle">Open Google Authenticator, Authy, or any TOTP app and scan the code below.</p>

                <div class="qr-wrap">
                  <img src="${data.qr_code}" alt="2FA QR Code" />
                </div>

                <p class="divider">or enter manually</p>

                <div class="secret-block">
                  <div class="secret-label">Secret key</div>
                  <div class="secret-code">${data.secret}</div>
                </div>

                <button onclick="window.opener.postMessage('qr-scanned', '*'); window.close();">
                  I've added the account →
                </button>
              </body>
              </html>
            `);
            newWindow.document.close();
          } else {
            alert('Please allow popups for this site to set up 2FA.');
          }
        }
      } catch (error) {
        logError('[2FA] Setup error:', error);
      } finally {
        setLocalLoading(false);
      }
    },
    [setupTwoFactor]
  );

  const handleVerify = useCallback(
    async (code: string) => {
      if (!code || code.length !== 6) return;

      try {
        setLocalLoading(true);
        const success = await verifyAndEnableTwoFactor(code);

        if (success) {
          setShowVerificationDialog(false);
          if (qrWindow && !qrWindow.closed) qrWindow.close();
        }
      } catch (error) {
        logError('[2FA] Verify error:', error);
      } finally {
        setLocalLoading(false);
      }
    },
    [verifyAndEnableTwoFactor, qrWindow]
  );

  const handleClose = useCallback(() => {
    setShowVerificationDialog(false);
    if (qrWindow && !qrWindow.closed) qrWindow.close();
  }, [qrWindow]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'qr-scanned') {
        setShowVerificationDialog(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleSetup}
        disabled={localLoading}
        className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
      >
        {localLoading ? 'Loading…' : 'Enable'}
      </button>

      {showVerificationDialog && (
        <VerificationDialog
          onClose={handleClose}
          onVerify={handleVerify}
          loading={localLoading}
        />
      )}
    </>
  );
}
