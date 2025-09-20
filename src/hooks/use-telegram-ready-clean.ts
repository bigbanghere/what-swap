import { useState, useEffect } from 'react';
import { useSignal, initData, miniApp } from '@telegram-apps/sdk-react';

export function useTelegramReady() {
  const [isReady, setIsReady] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [initDataUser, setInitDataUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get initData from Telegram SDK
  const telegramUser = useSignal(initData.user);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we're in Telegram
    const checkInTelegram = () => {
      const inTelegram = 
        window.location.search.includes('tgWebAppPlatform') || 
        window.location.hash.includes('tgWebAppPlatform') ||
        !!(window as any).Telegram?.WebApp;
      
      setIsInTelegram(inTelegram);
      return inTelegram;
    };

    const initializeTelegram = async () => {
      try {
        const inTelegram = checkInTelegram();
        
        if (!inTelegram) {
          setIsReady(true);
          return;
        }

        // Wait for Telegram WebApp to be ready
        const webApp = (window as any).Telegram?.WebApp;
        if (webApp) {
          // Wait for WebApp to be ready
          if (webApp.ready) {
            webApp.ready();
          }

          // Wait a bit for initialization
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check if we have initData
          if (initData || webApp.initData) {
            setInitDataUser(telegramUser);
            setIsReady(true);
          } else {
            // Wait longer for initData
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (initData || webApp.initData) {
              setInitDataUser(telegramUser);
              setIsReady(true);
            } else {
              setIsReady(true);
            }
          }
        } else {
          setIsReady(true);
        }
      } catch (err) {
        console.error('Error initializing Telegram:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsReady(true); // Proceed anyway
      }
    };

    initializeTelegram();
  }, [telegramUser]);

  return {
    isReady,
    isInTelegram,
    initDataUser,
    error,
    // Additional info for debugging
    debugInfo: {
      initData,
      telegramUser,
      webApp: typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
    }
  };
}





