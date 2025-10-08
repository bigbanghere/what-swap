import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"

import { Root } from '@/components/Root/Root';
import { getMessages, getLocale } from 'next-intl/server';
import { LocaleProvider } from '@/components/LocaleProvider';
import { ThemeProvider } from '@/core/theme/provider';
import { ValidationProvider } from '@/contexts/validation-context';
import { QueryProvider } from '@/providers/query-provider';
import { TokenCacheInitializer } from '@/components/TokenCacheInitializer';
import { DynamicFavicon } from '@/components/DynamicFavicon';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';
import './tailwind.css';

export const metadata: Metadata = {
  title: 'What Swap – Big Bang',
  description: 'Our whole multiverse is in a hot, dense state.',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Default favicon - will be overridden by DynamicFavicon component */}
        <link rel="icon" href="/favicon-dark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-dark.png" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set dark theme immediately to prevent white flash
              (function() {
                const root = document.documentElement;
                root.style.setProperty('--theme-background', '#000000');
                root.style.setProperty('--theme-text', '#ffffff');
                root.style.setProperty('--theme-primary', '#8AB4F8');
                document.body.style.backgroundColor = '#000000';
                document.body.style.color = '#ffffff';
              })();
            `,
          }}
        />
      </head>
      <body>
        <LocaleProvider serverMessages={messages} serverLocale={locale}>
          <ThemeProvider>
            <QueryProvider>
              <ValidationProvider>
                <TokenCacheInitializer />
                <DynamicFavicon />
                <Root>{children}<Analytics /></Root>
              </ValidationProvider>
            </QueryProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
