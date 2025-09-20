'use client';

import { type PropsWithChildren, useEffect } from 'react';
import {
  initData,
  miniApp,
  useSignal,
} from '@telegram-apps/sdk-react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useDidMount } from '@/hooks/useDidMount';
import { useSafeLaunchParams } from '@/hooks/use-safe-launch-params';
import { useTheme } from '@/core/theme';
import { useTelegramReady } from '@/hooks/use-telegram-ready';
import { useLocaleReady } from '@/hooks/use-locale-ready';

import './styles.css';
import '@/core/theme/styles.css';

function RootInner({ children }: PropsWithChildren) {
  const { launchParams: lp } = useSafeLaunchParams();
  const { isDark } = useTheme();
  const { isReady, isInTelegram, initDataUser, error, debugInfo } = useTelegramReady();
  const { isLocaleReady, detectedLocale } = useLocaleReady();
  

  // Log locale detection for debugging
  useEffect(() => {
    if (isLocaleReady && detectedLocale) {
      console.log('🔍 Locale detection complete:', {
        detectedLocale,
        isInTelegram,
        currentCookies: document.cookie
      });
    }
  }, [isLocaleReady, detectedLocale, isInTelegram]);

  return (
    <TonConnectUIProvider manifestUrl="https://whatever-zeta-two.vercel.app/tonconnect-manifest.json">
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={
          ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
        }
      >
        {children}
      </AppRoot>
    </TonConnectUIProvider>
  );
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <div className="root__loading">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Loading Telegram Mini App...
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Initializing connection to Telegram
        </p>
      </div>
    </div>
  );
}
