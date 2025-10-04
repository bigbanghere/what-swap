'use client';

import { useEffect, useState } from 'react';

export function useLocaleDetection() {
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    // Detect locale from browser language
    const detectBrowserLocale = () => {
      // Check if we're in Telegram Mini App
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        // In TMA, use the system language from Telegram
        const systemLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
        if (systemLang) {
          return systemLang.startsWith('ru') ? 'ru' : 'en';
        }
      }
      
      // Fallback to browser language
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      return browserLang.startsWith('ru') ? 'ru' : 'en';
    };

    const detectedLocale = detectBrowserLocale();
    setLocale(detectedLocale);
  }, []);

  return locale;
}
