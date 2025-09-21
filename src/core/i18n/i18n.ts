import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, locales } from './config';
import { getLocale } from './locale';
import type { Locale } from './types';

const i18nRequestConfig = getRequestConfig(async () => {
  // Simplified i18n config to avoid import issues
  return {
    locale: defaultLocale,
    messages: {
      translations: {
        swap_tokens: "Swap tokens",
        get: "Get",
        connect: "Connect",
        disconnect: "Disconnect",
        copy_address: "Copy address",
        send: "Send",
        max: "MAX"
      }
    },
  };
});

export default i18nRequestConfig;
