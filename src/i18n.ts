import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales } from './core/i18n/config';

const i18nRequestConfig = getRequestConfig(async ({ request }) => {
  // Get the Accept-Language header from the request
  const acceptLanguage = request?.headers?.get('accept-language');
  
  // Function to detect locale from Accept-Language header
  const detectLocale = (acceptLanguage: string | null): string => {
    if (!acceptLanguage) return defaultLocale;
    
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, qValue] = lang.trim().split(';q=');
        return {
          locale: locale.split('-')[0], // Get language part (e.g., 'ru' from 'ru-RU')
          quality: qValue ? parseFloat(qValue) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality);
    
    // Check if Russian is preferred
    const russianLang = languages.find(lang => lang.locale === 'ru');
    if (russianLang) return 'ru';
    
    // Default to English for all other languages
    return 'en';
  };
  
  const locale = detectLocale(acceptLanguage);
  
  // Load messages for the detected locale
  const messages = await import(`./messages/${locale}.json`);
  
  return {
    locale,
    messages: messages.default,
    // Disable URL-based locale routing
    localePrefix: 'never'
  };
});

export default i18nRequestConfig;
