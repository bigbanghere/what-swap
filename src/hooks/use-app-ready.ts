import { useEffect, useState } from 'react';
import { useSignal, miniApp, viewport } from '@telegram-apps/sdk-react';
import { useKeyboardDetection } from './use-keyboard-detection';
import { useLocaleReady } from './use-locale-ready';

interface AppReadyState {
  isAppReady: boolean;
  loadingReason: string;
  isLoading: boolean;
}

export function useAppReady(): AppReadyState {
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadingReason, setLoadingReason] = useState('Initializing...');
  
  // Get theme state
  const telegramIsDark = useSignal(miniApp.isDark);
  
  // Get viewport state
  const telegramIsExpanded = useSignal(viewport.isExpanded);
  
  // Get keyboard detection
  const { isKeyboardOpen, isViewportExpanded, isInBrowser } = useKeyboardDetection();
  
  // Get locale detection
  const { isLocaleReady, loadingReason: localeLoadingReason } = useLocaleReady();

  useEffect(() => {
    // Check if we're in a browser (not Telegram)
    const isInTelegram = typeof window !== 'undefined' && 
      (window.location.search.includes('tgWebAppPlatform') || 
       window.location.hash.includes('tgWebAppPlatform') ||
       (window as any).Telegram?.WebApp);

    // If in browser, we're ready immediately
    if (!isInTelegram) {
      setIsAppReady(true);
      setLoadingReason('');
      return;
    }

    // If in Telegram, wait for theme, viewport, and locale to be ready
    setLoadingReason('Loading Telegram Mini App...');
    
    // Check if theme is ready (not undefined/null)
    const themeReady = typeof telegramIsDark === 'boolean';
    
    // Check if viewport is ready (not undefined/null)
    const viewportReady = typeof telegramIsExpanded === 'boolean';
    
    // Check if keyboard detection is stable
    const keyboardStable = !isKeyboardOpen; // Don't wait for keyboard to close
    
    // Check if locale is ready
    const localeReady = isLocaleReady;
    
    if (themeReady && viewportReady && keyboardStable && localeReady) {
      // Add a small delay to ensure everything is properly applied
      setTimeout(() => {
        setIsAppReady(true);
        setLoadingReason('');
      }, 100);
    } else {
      // Update loading reason based on what's not ready
      if (!localeReady) {
        setLoadingReason(localeLoadingReason || 'Detecting language...');
      } else if (!themeReady) {
        setLoadingReason('Detecting theme...');
      } else if (!viewportReady) {
        setLoadingReason('Detecting viewport...');
      } else if (!keyboardStable) {
        setLoadingReason('Detecting keyboard state...');
      }
    }
  }, [telegramIsDark, telegramIsExpanded, isKeyboardOpen, isViewportExpanded, isInBrowser, isLocaleReady, localeLoadingReason]);

  // Fallback timeout - if we're still loading after 3 seconds, show the app anyway
  useEffect(() => {
    if (!isAppReady) {
      const timeout = setTimeout(() => {
        setIsAppReady(true);
        setLoadingReason('');
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isAppReady]);

  return {
    isAppReady,
    loadingReason,
    isLoading: !isAppReady
  };
}
