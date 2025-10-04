'use client';

import { NextIntlClientProvider } from 'next-intl';

import { timeZone } from './config';

const I18nProvider = ({
  children,
}: {
  children: any;
}) => {
  // This provider is no longer used - the app now uses NextIntlClientProvider in layout.tsx
  const messages = {};

  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
};

export { I18nProvider };
