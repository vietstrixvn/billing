import '@/assets/styles/global.css';
import {
  metadata as siteMetadata,
  viewport as siteViewport,
} from '@/constants/appInfos';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { LoadingProvider } from '@/contexts/loading.context';
import { MobileProvider } from '@/contexts/mobile.context';
import ReactQueryProvider from '@/contexts/react-query.context';

export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="mdl-js">
      <body>
        <LoadingProvider>
          <MobileProvider>
            <ReactQueryProvider>
              <AuthInitializer />
              {children}
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
