'use client';

import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '../../store';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { loginFormSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { cn, logError } from '@/utils';
import { checkWebAuthnSupport } from '@/store/auth/passkeyActions';
import { CustomImage } from '../media/image.component';
import { Icons } from '@/assets';

export default function LoginForm({
  onReportClick,
}: {
  onReportClick?: () => void;
}) {
  const {
    login,
    requiresTwoFactor,
    clearTwoFactorState,
    verifyTwoFactorLogin,
    beginPasskeyLogin,
    finishPasskeyLogin,
    loading,
  } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Check passkey support on mount
  useEffect(() => {
    checkWebAuthnSupport().then((support) => {
      setIsPasskeySupported(support.isSupported);
    });
  }, []);

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    const { username, password } = values;

    if (password.length < 8) {
      setError('password', {
        type: 'manual',
        message: 'Password must be at least 8 characters.',
      });
      return;
    }

    try {
      const result = await login(username, password);

      // If 2FA is required, the form will show OTP input
      if (useAuthStore.getState().requiresTwoFactor) {
        return;
      }

      if (result) {
        // Wait for loading to complete (store will handle this)
        // The loading state will be maintained until user info is fetched
        router.replace('/');
      } else {
        if (!useAuthStore.getState().requiresTwoFactor) {
          setError('root', {
            type: 'manual',
            message: 'Invalid username or password',
          });
        }
      }
    } catch (err) {
      logError('  Login error:', err);
      setError('root', {
        type: 'manual',
        message: 'Login failed. Please try again.',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && !loading) {
      e.preventDefault();

      if (requiresTwoFactor) {
        handleOtpSubmit();
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit code');
      return;
    }

    setOtpError('');

    try {
      const success = await verifyTwoFactorLogin(otpCode);

      if (success) {
        // Wait for loading to complete (store will handle this)
        router.replace('/');
      } else {
        setOtpError('Invalid verification code. Please try again.');
        setOtpCode('');
      }
    } catch (err) {
      logError('2FA verification error:', err);
      setOtpError('Verification failed. Please try again.');
      setOtpCode('');
    }
  };

  const handleCancelOtp = () => {
    clearTwoFactorState();
    setOtpCode('');
    setOtpError('');
  };

  const handlePasskeyLogin = async () => {
    try {
      // Begin passkey login
      const options = await beginPasskeyLogin();

      if (!options) {
        return;
      }

      // Finish passkey login (browser will prompt for biometric/PIN)
      const success = await finishPasskeyLogin(null);

      if (success) {
        // Wait for loading to complete (store will handle this)
        router.replace('/');
      }
    } catch (error) {
      logError('Passkey login error:', error);
      setError('root', {
        type: 'manual',
        message: 'Passkey login failed. Please try again.',
      });
    }
  };

  // 2FA Verification Form
  if (requiresTwoFactor) {
    return (
      <div
        className={cn('w-full max-w-2xl flex flex-col gap-8 p-12')}
        onKeyDown={handleKeyDown}
      >
        <div className="text-center">
          <h2 className="text-4xl mt-4 font-bold text-main">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500" htmlFor="otpCode">
              Verification Code
            </label>
            <Input
              id="otpCode"
              type="text"
              placeholder="000000"
              value={otpCode}
              onChange={(e: any) => {
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setOtpError('');
              }}
              maxLength={6}
              className="w-full p-2 border bg-white h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-none"
              disabled={loading}
              autoFocus
            />
            {otpError && (
              <p className="text-sm text-red-500 text-center">{otpError}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleOtpSubmit}
              className={`flex-1 font-bold h-[60px] rounded-none text-xl bg-main hover:bg-main-700 text-white ${loading || otpCode.length !== 6
                ? 'opacity-70 cursor-not-allowed'
                : ''
                }`}
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify'
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCancelOtp}
              className="px-6 font-bold h-[60px] rounded-none text-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>{"Can't access your authenticator app?"}</p>{' '}
            <button
              type="button"
              className="text-main underline hover:text-main-700"
              onClick={onReportClick}
            >
              Contact support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal Login Form
  return (
    <>
      <div
        className={cn('w-full max-w-4xl flex flex-col gap-8 p-12')}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col space-y-4 items-center gap-3 ">
          <div className="w-16 h-16 border border-gray-50 rounded-md p-2">
            <CustomImage
              src="/icons/logo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain w-full h-full"
            />
          </div>
          <h2 className="text-4xl font-bold text-main">Login to Vietstrix</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className={`text-sm text-gray-700 ${isSubmitting || loading ? 'opacity-50' : ''
                }`}
              htmlFor="email"
            >
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter email or username"
              className={`w-full rounded-none p-2 border bg-white/20 h-14 ${isSubmitting || loading
                ? 'opacity-50 cursor-not-allowed animate-pulse'
                : ''
                }`}
              disabled={isSubmitting || loading}
              {...register('username')}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`text-sm text-gray-500 ${isSubmitting || loading ? 'opacity-50' : ''
                }`}
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className={`w-full rounded-none p-2 pr-12 bg-white/20 border  h-14 ${isSubmitting || loading
                  ? 'opacity-50 cursor-not-allowed animate-pulse'
                  : ''
                  }`}
                disabled={isSubmitting || loading}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || loading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isSubmitting || loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {showPassword ? (
                  <Icons.EyeClosed className="w-5 h-5" />
                ) : (
                  <Icons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            {/* <div className="flex justify-end">
              <Link
                href="/sign-up"
                onClick={onReportClick}
                className="text-main underline text-sm bg-transparent"
              >
                Forgot password
              </Link>
            </div> */}
          </div>

          <Button
            type="button"
            onClick={(e: any) => {
              handleSubmit(onSubmit)(e);
            }}
            className={`w-full font-bold h-[60px] rounded-none  text-xl bg-main hover:bg-main-700 text-white ${isSubmitting || loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <span className="flex items-center  justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </Button>

          {/* Passkey Login Option */}
          {isPasskeySupported && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-700" />
                <span className="text-sm text-gray-800">Or</span>
                <div className="flex-1 border-t border-gray-700" />
              </div>
              <Button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 h-[60px] rounded-none border-2 border-gray-300 bg-white/50 hover:bg-gray-50 text-gray-800 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                <svg
                  className="h-5 w-5"
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
                <span className="font-medium">
                  {loading ? 'Signing in...' : 'Sign in with Passkey'}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
