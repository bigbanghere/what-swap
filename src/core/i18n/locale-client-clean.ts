'use client';

import { detectLocale } from './locale';
import type { Locale } from './types';

// Client-side locale detection for mobile
export const detectLocaleClient = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  // Detect if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isInTelegram = window.location.search.includes('tgWebAppPlatform') || 
                      window.location.hash.includes('tgWebAppPlatform') ||
                      !!(window as any).Telegram?.WebApp;
  
  // Mobile-specific language detection
  if (isMobile && isInTelegram) {
    const webApp = (window as any).Telegram?.WebApp;
    
    // For mobile, be more conservative and assume English unless we have clear evidence
    // Mobile Telegram apps often don't provide reliable language info
    
    // Method 1: Check tgWebAppAppData parameter (most reliable for mobile Telegram)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Check both search and hash for tgWebAppAppData (note: it might be tgWebAppData)
    const appDataParam = urlParams.get('tgWebAppAppData') || 
                        urlParams.get('tgWebAppData') ||
                        hashParams.get('tgWebAppAppData') || 
                        hashParams.get('tgWebAppData');
    
    if (appDataParam) {
      try {
        const decodedAppData = decodeURIComponent(appDataParam);
        
        // Parse the app data to extract user language
        const appDataParams = new URLSearchParams(decodedAppData);
        const userParam = appDataParams.get('user');
        if (userParam) {
          const userData = JSON.parse(userParam);
          if (userData.language_code) {
            return detectLocale(userData.language_code);
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }
    
    // Method 2: Check URL parameters (lang, language, locale)
    const urlLang = urlParams.get('lang') || urlParams.get('language') || urlParams.get('locale');
    if (urlLang) {
      return detectLocale(urlLang);
    }
    
    // Method 3: Check hash parameters
    const hashLang = hashParams.get('lang') || hashParams.get('language') || hashParams.get('locale');
    if (hashLang) {
      return detectLocale(hashLang);
    }
    
    // Method 4: Check if Telegram interface language is available (less reliable on mobile)
    if (webApp && webApp.initData) {
      try {
        const params = new URLSearchParams(webApp.initData);
        const user = params.get('user');
        if (user) {
          const userData = JSON.parse(user);
          if (userData.language_code) {
            return detectLocale(userData.language_code);
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }
    
    // Method 5: Check WebApp language property
    if (webApp && webApp.language) {
      return detectLocale(webApp.language);
    }
    
    // Method 6: Default to English for mobile (most mobile Telegram interfaces are in English)
    return 'en';
  }
  
  // Desktop or non-Telegram detection
  const webApp = (window as any).Telegram?.WebApp;
  if (webApp && webApp.initData) {
    try {
      const params = new URLSearchParams(webApp.initData);
      const user = params.get('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.language_code) {
          return detectLocale(userData.language_code);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }
  
  // Fallback to navigator language
  return detectLocale(navigator.language);
};






