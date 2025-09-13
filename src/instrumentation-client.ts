// This file is normally used for setting up analytics and other
// services that require one-time initialization on the client.

import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { init } from './core/init';
import { mockEnv } from './mockEnv';

mockEnv().then(() => {
  console.log('🎭 Mock environment ready, retrieving launch params...');
  // Add a small delay to ensure mock is fully applied
  setTimeout(() => {
    try {
      const launchParams = retrieveLaunchParams();
      console.log('📱 Retrieved launch params:', launchParams);
      const { tgWebAppPlatform: platform } = launchParams;
      const debug =
        (launchParams.tgWebAppStartParam || '').includes('debug') ||
        process.env.NODE_ENV === 'development';

      console.log('⚙️ Initializing app with:', { platform, debug });
      // Configure all application dependencies.
      init({
        debug,
        eruda: debug && ['ios', 'android'].includes(platform),
        mockForMacOS: platform === 'macos',
      });
    } catch (e) {
      console.log('❌ Error retrieving launch params:', e);
      // Fallback initialization for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using fallback initialization...');
        init({
          debug: true,
          eruda: false,
          mockForMacOS: false,
        });
      }
    }
  }, 100);
});
