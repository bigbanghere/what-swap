import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, locales } from './config';
import { getLocale } from './locale';
import type { Locale } from './types';

const i18nRequestConfig = getRequestConfig(async () => {
  try {
    const locale = (await getLocale()) as Locale;
    
    if (!locale || typeof locale !== 'string') {
      return {
        locale: defaultLocale,
        messages: (await import(`@public/locales/${defaultLocale}.json`)).default,
      };
    }

    const finalLocale = locale === defaultLocale || !locales.includes(locale) ? defaultLocale : locale;
    
    return {
      locale: finalLocale,
      messages:
        finalLocale === defaultLocale || !locales.includes(finalLocale)
          ? (await import(`@public/locales/${defaultLocale}.json`)).default
          : (await import(`@public/locales/${finalLocale}.json`)).default,
    };
  } catch (error) {
    console.log('⚠️ Error in i18n config, using default:', error);
    return {
      locale: defaultLocale,
      messages: (await import(`@public/locales/${defaultLocale}.json`)).default,
    };
  }
});

export default i18nRequestConfig;
