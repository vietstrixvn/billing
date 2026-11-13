import '@/assets/styles/global.css';
import type { Metadata } from 'next';

import { Toaster } from 'sonner';
import Script from 'next/script';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { LoadingProvider } from '@/contexts/loading.context';
import { MobileProvider } from '@/contexts/mobile.context';
import ReactQueryProvider from '@/contexts/react-query.context';
import { PermissionLoadingScreen } from '@/components/layout/PermissionLoadingScreen';
import { PermissionProvider } from '@/contexts/PermissionContext';

export const metadata: Metadata = {
  title: 'KENG x VIETSTRIX',
  description: 'Billing - Vietstrix',
  icons: {
    icon: '/icons/logo-cricle.svg',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="mdl-js">
      <body className="bg-white">
        <LoadingProvider>
          <MobileProvider>
            <ReactQueryProvider>
              <AuthInitializer />
              <PermissionProvider fallback={<PermissionLoadingScreen />}>
                {children}
              </PermissionProvider>
              <Toaster position="top-right" richColors />
            </ReactQueryProvider>
          </MobileProvider>
        </LoadingProvider>
      </body>

      <Script id="add-mdl-class" strategy="afterInteractive">
        {`document.documentElement.classList.add('mdl-js');`}
      </Script>
    </html>
  );
}
