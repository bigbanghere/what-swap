// This file is normally used for setting up analytics and other
// services that require one-time initialization on the client.

import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { init } from './core/init';
import { mockEnv } from './mockEnv';

mockEnv().then(() => {
  // Add a small delay to ensure mock is fully applied
  setTimeout(() => {
    try {
      const launchParams = retrieveLaunchParams();
      const { tgWebAppPlatform: platform } = launchParams;
      const debug =
        (launchParams.tgWebAppStartParam || '').includes('debug') ||
        process.env.NODE_ENV === 'development';

      // Configure all application dependencies.
      init({
        debug,
        eruda: debug && ['ios', 'android'].includes(platform),
        mockForMacOS: platform === 'macos',
      });
    } catch (e) {
      // Fallback initialization for browser environment
      init({
        debug: process.env.NODE_ENV === 'development',
        eruda: false,
        mockForMacOS: false,
      });
    }
  }, 100);
}).catch((error) => {
  // Fallback initialization if mockEnv fails
  init({
    debug: process.env.NODE_ENV === 'development',
    eruda: false,
    mockForMacOS: false,
  });
});
