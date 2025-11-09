import { useState, useEffect } from 'react';
import { useTelegramReady } from './use-telegram-ready';
import { detectLocale } from '@/core/i18n/locale';
import { detectLocaleClient } from '@/core/i18n/locale-client';

interface LocaleReadyState {
  isLocaleReady: boolean;
  detectedLocale: string | null;
  loadingReason: string;
}

export function useLocaleReady(): LocaleReadyState {
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const [detectedLocale, setDetectedLocale] = useState<string | null>(null);
  const [loadingReason, setLoadingReason] = useState('Detecting language...');
  
  const { isReady: isTelegramReady, initDataUser, isInTelegram } = useTelegramReady();

  useEffect(() => {
    console.log('🔍 useLocaleReady useEffect triggered', {
      isTelegramReady,
      initDataUser: initDataUser?.language_code,
      isInTelegram,
      currentCookies: document.cookie,
      navigatorLanguage: navigator.language
    });
    
    // Debug Telegram detection
    if (typeof window !== 'undefined') {
      const telegramCheck = {
        hasTgWebAppPlatform: window.location.search.includes('tgWebAppPlatform') || window.location.hash.includes('tgWebAppPlatform'),
        hasTelegramWebApp: !!(window as any).Telegram?.WebApp,
        isInTelegram,
        userAgent: navigator.userAgent
      };
      console.log('🔍 Telegram detection debug:', telegramCheck);
    }

    if (typeof window === 'undefined') {
      console.log('🌐 Server side, setting locale ready');
      setIsLocaleReady(true);
      return;
    }

    // Clear any invalid cookies immediately
    if (document.cookie.includes('NEXT_LOCALE=%5Bobject%20Promise%5D') || 
        document.cookie.includes('NEXT_LOCALE=[object Promise]')) {
      console.log('🧹 Clearing invalid locale cookie');
      document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }

    // If we don't have Telegram ready yet, wait for it
    if (!isTelegramReady) {
      console.log('⏳ Waiting for Telegram initialization...');
      setLoadingReason('Waiting for Telegram initialization...');
      return;
    }

    // Detect locale based on available data
    let detectedLocale = 'en'; // Default to English
    
    console.log('🔍 Starting locale detection...');
    
    if (initDataUser && initDataUser.language_code) {
      // Use Telegram user language if available
      console.log('📱 Using Telegram user language:', initDataUser.language_code);
      detectedLocale = detectLocale(initDataUser.language_code);
    } else if (isInTelegram) {
      // In Telegram but no user data, try to get language from Telegram WebApp
      console.log('📱 In Telegram but no user data, trying Telegram WebApp language');
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp && webApp.language) {
        console.log('📱 Using Telegram WebApp language:', webApp.language);
        detectedLocale = detectLocale(webApp.language);
      } else {
        console.log('📱 No Telegram language available, using navigator.language fallback');
        detectedLocale = detectLocaleClient();
      }
    } else {
      // For web browsers, use navigator.language
      console.log('🌐 Web browser detected, using navigator.language');
      detectedLocale = detectLocaleClient();
    }
    
    console.log('🔍 Initial detected locale:', detectedLocale);
    
    // Set cookie for server-side detection and reload if needed (but not in Telegram)
    if (typeof window !== 'undefined') {
      try {
        const currentCookie = document.cookie.includes(`NEXT_LOCALE=${detectedLocale}`);
        if (!currentCookie) {
          document.cookie = `NEXT_LOCALE=${detectedLocale}; path=/; max-age=31536000; SameSite=Lax`;
          console.log('🍪 Set locale cookie:', detectedLocale);
          
          // Only reload in web browsers, not in Telegram Mini App
          if (!isInTelegram) {
            console.log('🔄 Reloading to apply server-side locale (web browser only)');
            // Small delay to ensure cookie is set before reload
            setTimeout(() => {
              window.location.reload();
            }, 100);
            return; // Don't set locale ready yet, let reload handle it
          } else {
            console.log('📱 In Telegram Mini App, skipping reload');
          }
        } else {
          console.log('🍪 Cookie already set correctly:', detectedLocale);
        }
      } catch (error) {
        console.error('❌ Failed to set locale cookie:', error);
      }
    }
    
    console.log('✅ Final detected locale:', detectedLocale);
    console.log('🍪 Current cookies after detection:', document.cookie);
    
    setDetectedLocale(detectedLocale);
    setIsLocaleReady(true);
    setLoadingReason('');
  }, [isTelegramReady, initDataUser, isInTelegram]);

  return {
    isLocaleReady,
    detectedLocale,
    loadingReason
  };
}
