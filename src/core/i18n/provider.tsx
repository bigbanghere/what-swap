'use client';

import { NextIntlClientProvider } from 'next-intl';

import { timeZone } from './config';

const I18nProvider = ({
  children,
}: {
  children: any;
}) => {
  // Use static messages for now to avoid server/client issues
  const messages = {
    translations: {
      swap_tokens: "Swap tokens",
      get: "Get",
      connect: "Connect",
      disconnect: "Disconnect",
      copy_address: "Copy address",
      send: "Send",
      max: "MAX"
    }
  };

  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
};

export { I18nProvider };
