import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, locales } from './config';
import { getLocale } from './locale';
import type { Locale } from './types';

const i18nRequestConfig = getRequestConfig(async () => {
  console.log('🔍 i18nRequestConfig called (server-side) - THIS SHOULD APPEAR ON EVERY PAGE LOAD');
  
  try {
    const locale = (await getLocale()) as Locale;
    console.log('🔍 Server-side detected locale:', locale);
    console.log('🔍 Default locale:', defaultLocale);
    console.log('🔍 Available locales:', locales);
    
    if (!locale || typeof locale !== 'string') {
      console.log('⚠️ Invalid locale, using default:', locale);
      return {
        locale: defaultLocale,
        messages: (await import(`@public/locales/${defaultLocale}.json`)).default,
      };
    }

    const finalLocale = locale === defaultLocale || !locales.includes(locale) ? defaultLocale : locale;
    console.log('🔍 Final server-side locale:', finalLocale);
    console.log('🔍 Locale comparison:', {
      locale,
      defaultLocale,
      isDefault: locale === defaultLocale,
      isInLocales: locales.includes(locale),
      finalLocale
    });
    
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
