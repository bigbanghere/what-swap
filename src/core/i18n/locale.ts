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
    return locale || defaultLocale;
  } catch (error) {
    console.log('⚠️ Error getting locale from cookies, using default:', error);
    return defaultLocale;
  }
};

const setLocale = async (locale?: string) => {
  (await cookies()).set(COOKIE_NAME, (locale as Locale) || defaultLocale);
};

// Function to detect locale from Telegram user language or system
const detectLocale = (userLanguage?: string): Locale => {
  console.log('🌍 Detecting locale:', { userLanguage });
  
  if (userLanguage) {
    // Check if it's Russian
    if (userLanguage.startsWith('ru')) {
      console.log('🇷🇺 Detected Russian locale');
      return 'ru';
    }
    // For all other languages, use English
    console.log('🇺🇸 Using English locale for:', userLanguage);
    return 'en';
  }
  
  // Fallback to system language detection
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

export { getLocale, setLocale, detectLocale };
