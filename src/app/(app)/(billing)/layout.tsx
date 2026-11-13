'use client';

import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuthStore } from '@/store';
import TopNavAdmin from '@/components/layout/nav-header';
import { logWarn } from '@/utils';
import { Loader } from '@/components/loading/loader';
import { MainSidebar } from '@/components/layout/side/sid';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Container } from '@/components';

export default function AuthProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, isInitializing } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the store has finished initializing (token check, refresh, etc.)
    // before deciding to redirect. This prevents premature redirects while the
    // app is still setting up — no need to rush here.
    if (!isInitializing && !accessToken) {
      logWarn('[AdminLayout] No access token, redirecting to login');
      router.replace(`/sign-in?from=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, isInitializing, router, pathname]);

  // Keep showing the loader until initialization is fully done.
  // This is the root of the admin app so a slightly longer load is fine —
  // better than flashing content or redirecting too early.
  if (isInitializing || !accessToken) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SidebarProvider>
        <MainSidebar />
        <SidebarInset>
          <header className="h-16 bg-white shrink-0 border-b">
            <TopNavAdmin />
          </header>
          <main className="flex-1 bg-gray-50">
            <Container width='max-w-8xl'>{children}</Container>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
