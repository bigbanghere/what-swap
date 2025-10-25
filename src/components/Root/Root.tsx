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
import { ToastProvider, ToastViewport } from '@/components/toast';

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
    <TonConnectUIProvider manifestUrl="https://what-swap.vercel.app/tonconnect-manifest.json">
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={
          ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
        }
      >
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </AppRoot>
    </TonConnectUIProvider>
  );
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
  const didMount = useDidMount();
  const { colors } = useTheme();

  // Apply theme colors immediately to prevent white flash
  useEffect(() => {
    if (typeof window !== 'undefined' && colors) {
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
    }
  }, [colors]);

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <div 
      className="root__loading"
      style={{
        backgroundColor: colors.background || '#000000',
        color: colors.text || '#ffffff',
      }}
    >
      <div 
        className="flex flex-col items-center justify-center min-h-screen min-w-screen"
        style={{ 
          backgroundColor: colors.background || '#000000',
        }}
      >
        <div 
          className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
          style={{
            borderColor: `${colors.primary || '#8AB4F8'} transparent transparent transparent`
          }}
        ></div>
      </div>
    </div>
  );
}
