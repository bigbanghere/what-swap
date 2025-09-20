//use server is required
'use server';

import { cookies } from 'next/headers';

import { defaultLocale } from './config';
import type { Locale } from './types';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

const getLocale = async () => {
  console.log('🔍 getLocale called (server-side) - THIS SHOULD APPEAR ON EVERY PAGE LOAD');
  
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;
    console.log('🔍 Server-side cookie value:', locale);
    console.log('🔍 Cookie name:', COOKIE_NAME);
    
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
    
    console.log('🔍 Server-side context:', {
      userAgent: userAgent.substring(0, 100) + '...',
      referer,
      acceptLanguage: acceptLanguage.substring(0, 50) + '...',
      isTelegramRequest
    });
    
    // If we have a cookie from client-side detection, use it (prioritize this)
    if (locale) {
      console.log('🔍 Using cookie locale from client-side detection:', locale);
      return locale;
    }
    
    // If it's not a Telegram request, detect system language from Accept-Language header
    if (!isTelegramRequest && acceptLanguage) {
      console.log('🌐 Web browser detected, checking Accept-Language header');
      // Parse Accept-Language header to detect Russian
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
      const hasRussian = languages.some(lang => lang.startsWith('ru'));
      
      if (hasRussian) {
        console.log('🇷🇺 Russian detected in Accept-Language, setting Russian locale');
        cookieStore.set(COOKIE_NAME, 'ru');
        return 'ru';
      } else {
        console.log('🇺🇸 No Russian in Accept-Language, using English');
        cookieStore.set(COOKIE_NAME, defaultLocale);
        return defaultLocale;
      }
    }
    
    
    console.log('🔍 No cookie found, setting default locale:', defaultLocale);
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
