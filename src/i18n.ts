import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './core/i18n/config';

const i18nRequestConfig = getRequestConfig(async () => {
  // Use default locale and load messages
  const messages = await import(`./messages/${defaultLocale}.json`);
  
  return {
    locale: defaultLocale,
    messages: messages.default,
    // Disable URL-based locale routing
    localePrefix: 'never'
  };
});

export default i18nRequestConfig;
