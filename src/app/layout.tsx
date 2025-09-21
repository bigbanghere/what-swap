import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';
import { ThemeProvider } from '@/core/theme/provider';
import { ValidationProvider } from '@/contexts/validation-context';
import { QueryProvider } from '@/providers/query-provider';
import { TokenCacheInitializer } from '@/components/TokenCacheInitializer';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';
import './tailwind.css';

export const metadata: Metadata = {
  title: 'Your Application Title Goes Here',
  description: 'Your application description goes here',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>
              <ValidationProvider>
                <TokenCacheInitializer />
                <Root>{children}<Analytics /></Root>
              </ValidationProvider>
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
