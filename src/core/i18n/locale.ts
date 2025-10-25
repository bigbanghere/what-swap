//use server is required
'use server';

import { cookies } from 'next/headers';

import { defaultLocale } from './config';
import type { Locale } from './types';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

const getLocale = async () => {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;
    
    // For web browsers, detect system language from Accept-Language header
    const headers = await import('next/headers');
    const headersList = await headers.headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    
    // Check if this is a Telegram request
    const isTelegramRequest = userAgent.includes('TelegramBot') || 
                             referer.includes('t.me') || 
                             referer.includes('telegram.org') ||
                             userAgent.includes('Telegram');
    
    // Reduced logging for performance
    
    // If we have a cookie from client-side detection, use it (prioritize this)
    if (locale) {
      return locale;
    }
    
    // If it's not a Telegram request, detect system language from Accept-Language header
    if (!isTelegramRequest && acceptLanguage) {
      // Parse Accept-Language header to detect Russian
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
      const hasRussian = languages.some(lang => lang.startsWith('ru'));
      
      if (hasRussian) {
        cookieStore.set(COOKIE_NAME, 'ru');
        return 'ru';
      } else {
        cookieStore.set(COOKIE_NAME, defaultLocale);
        return defaultLocale;
      }
    }
    
    cookieStore.set(COOKIE_NAME, defaultLocale);
    return defaultLocale;
  } catch (error) {
    console.log('⚠️ Error in getLocale, using default:', error);
    return defaultLocale;
  }
};

const setLocale = async (locale?: string) => {
  console.log('🔍 setLocale called with:', locale);
  const finalLocale = (locale as Locale) || defaultLocale;
  console.log('🔍 Final locale to set:', finalLocale);
  console.log('🍪 Cookies before setLocale:', document.cookie);
  
  try {
    (await cookies()).set(COOKIE_NAME, finalLocale);
    console.log('✅ Successfully set cookie:', COOKIE_NAME, '=', finalLocale);
    console.log('🍪 Cookies after setLocale:', document.cookie);
  } catch (error) {
    console.error('❌ Error setting locale cookie:', error);
    throw error;
  }
};

// Function to detect locale from Telegram user language or system
const detectLocale = (userLanguage?: string): Locale => {
  console.log('🔍 detectLocale called with:', userLanguage);
  
  if (userLanguage) {
    if (userLanguage.startsWith('ru')) {
      console.log('🇷🇺 User language is Russian');
      return 'ru';
    }
    console.log('🇺🇸 User language is not Russian, using English');
    return 'en';
  }
  
  if (typeof window !== 'undefined') {
    const systemLang = navigator.language;
    console.log('🖥️ System language:', systemLang);
    if (systemLang.startsWith('ru')) {
      console.log('🇷🇺 System language is Russian');
      return 'ru';
    }
  }
  
  console.log('🇺🇸 Defaulting to English');
  return 'en';
};


// Client-side locale detection for mobile - moved to separate file

export { getLocale, setLocale, detectLocale };
