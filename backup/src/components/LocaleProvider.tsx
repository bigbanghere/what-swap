'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLocaleDetection } from '@/hooks/use-locale-detection';
import { useEffect, useState } from 'react';

interface LocaleProviderProps {
  children: React.ReactNode;
  serverMessages: any;
  serverLocale: string;
}

export function LocaleProvider({ children, serverMessages, serverLocale }: LocaleProviderProps) {
  const [messages, setMessages] = useState(serverMessages);
  const [locale, setLocale] = useState(serverLocale);
  const detectedLocale = useLocaleDetection();

  useEffect(() => {
    // If client-side detection differs from server-side, update messages
    if (detectedLocale !== serverLocale) {
      const loadMessages = async () => {
        try {
          const newMessages = await import(`../messages/${detectedLocale}.json`);
          setMessages(newMessages.default);
          setLocale(detectedLocale);
        } catch (error) {
          console.warn(`Failed to load messages for locale ${detectedLocale}:`, error);
        }
      };
      loadMessages();
    }
  }, [detectedLocale, serverLocale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
