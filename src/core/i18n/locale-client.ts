'use client';

import { detectLocale } from './locale';
import type { Locale } from './types';

// Client-side locale detection for mobile
export const detectLocaleClient = (): Locale => {
  console.log('🔍 detectLocaleClient called');
  
  if (typeof window === 'undefined') {
    console.log('🌐 Server side, returning English');
    return 'en';
  }

  // Detect if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isInTelegram = window.location.search.includes('tgWebAppPlatform') || 
                      window.location.hash.includes('tgWebAppPlatform') ||
                      !!(window as any).Telegram?.WebApp;
  
  console.log('🔍 Detection context:', {
    isMobile,
    isInTelegram,
    userAgent: navigator.userAgent,
    locationSearch: window.location.search,
    locationHash: window.location.hash,
    hasTelegramWebApp: !!(window as any).Telegram?.WebApp
  });
  
  // Mobile-specific language detection
  if (isMobile && isInTelegram) {
    const webApp = (window as any).Telegram?.WebApp;
    
    console.log('📱 Mobile Telegram detected, checking for language sources');
    
    // Method 1: Check WebApp language property (most reliable)
    if (webApp && webApp.language) {
      console.log('📱 Found Telegram WebApp language:', webApp.language);
      return detectLocale(webApp.language);
    }
    
    // Method 2: Check URL parameters (lang, language, locale)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') || urlParams.get('language') || urlParams.get('locale');
    if (urlLang) {
      console.log('📱 Found URL language parameter:', urlLang);
      return detectLocale(urlLang);
    }
    
    // Method 3: Check hash parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashLang = hashParams.get('lang') || hashParams.get('language') || hashParams.get('locale');
    if (hashLang) {
      console.log('📱 Found hash language parameter:', hashLang);
      return detectLocale(hashLang);
    }
    
    // Method 4: Fall back to navigator.language for mobile
    console.log('📱 No Telegram language found, using navigator.language fallback');
    const systemLang = navigator.language;
    console.log('📱 Mobile navigator.language:', systemLang);
    
    if (systemLang.startsWith('ru')) {
      console.log('🇷🇺 Mobile system language is Russian');
      return 'ru';
    } else {
      console.log('🇺🇸 Mobile system language is not Russian, using English');
      return 'en';
    }
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
  
  // Check for manual override via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const manualLang = urlParams.get('lang') || urlParams.get('language') || urlParams.get('locale');
  if (manualLang) {
    console.log('🔧 Manual language override detected:', manualLang);
    if (manualLang.startsWith('ru')) {
      console.log('🇷🇺 Manual override: Russian');
      return 'ru';
    } else {
      console.log('🇺🇸 Manual override: English');
      return 'en';
    }
  }
  
  // For web browsers, use navigator.language
  console.log('🌐 Web browser detected, using navigator.language');
  const systemLang = navigator.language;
  console.log('🖥️ navigator.language:', systemLang);
  
  // Simple detection based on navigator.language
  let detectedLocale: Locale = 'en';
  
  if (systemLang.startsWith('ru')) {
    console.log('🇷🇺 navigator.language is Russian, setting Russian locale');
    detectedLocale = 'ru';
  } else {
    console.log('🇺🇸 navigator.language is not Russian, using English');
    detectedLocale = 'en';
  }
  
  console.log('🔍 detectLocaleClient final result:', detectedLocale);
  return detectedLocale;
};
