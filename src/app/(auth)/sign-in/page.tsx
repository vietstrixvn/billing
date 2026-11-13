'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import LoginForm from '@/components/forms/login.form';
import { CustomImage } from '@/components/media/image.component';
import { Loader } from '@/components/loading/loader';

function LoginPageContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = searchParams.get('from') || '/';
      console.log('[LoginPage] Redirecting authenticated user to:', from);
      router.replace(from);
    }
  }, [isAuthenticated, loading, router, searchParams]);

  // Show loader if authenticated OR loading
  if (isAuthenticated || loading) {
    return (
      <div className="min-h-screen  bg-main flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex bg-white flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl flex items-center justify-center p-4">
          <LoginForm />
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center p-8 text-black"></div>
      </div>

      <div className="relative bg-main hidden lg:flex flex-col h-screen">
        <div className=" relative w-full overflow-hidden">
          <CustomImage
            src="/imgs/thumbnail.png"
            alt="Team collaborating in modern office"
            width={1920}
            height={1080}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="flex-3 bg-main flex flex-col items-center justify-center p-6">
          <div className="flex items-center mb-16">
            <CustomImage
              src="/icons/logo.svg"
              alt="Decorative bird illustration"
              width={60}
              height={60}
            />
            <span className="text-white font-bold text-7xl">IETSTRIX</span>
          </div>
          <h2 className="text-white text-xl lg:text-3xl">
            Dare to think big, dare to act, endure hardship first, then enjoy
            happiness.
          </h2>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-main flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
