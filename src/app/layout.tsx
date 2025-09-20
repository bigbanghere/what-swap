import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from '@/core/i18n/locale';
import { Analytics } from "@vercel/analytics/next"

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';
import { ThemeProvider } from '@/core/theme/provider';
import { ValidationProvider } from '@/contexts/validation-context';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';
import './tailwind.css';

export const metadata: Metadata = {
  title: 'Your Application Title Goes Here',
  description: 'Your application description goes here',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
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
            <ValidationProvider>
              <Root>{children}<Analytics /></Root>
            </ValidationProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
