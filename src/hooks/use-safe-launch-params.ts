import { useState, useEffect } from 'react';

export function useSafeLaunchParams() {
  const [launchParams, setLaunchParams] = useState({
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.4',
    tgWebAppData: {
      user: { language_code: 'en' }
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // For now, just use fallback values and mark as loaded
    // In a real Telegram Mini App, the launch params would be available
    // but for browser development, we use fallback values
    setIsLoaded(true);
  }, []);

  return { launchParams, isLoaded };
}
