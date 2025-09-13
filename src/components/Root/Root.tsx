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
import { setLocale, detectLocale } from '@/core/i18n/locale';
import { useTheme } from '@/core/theme';

import './styles.css';
import '@/core/theme/styles.css';

function RootInner({ children }: PropsWithChildren) {
  const { launchParams: lp } = useSafeLaunchParams();
  const { isDark } = useTheme();
  const initDataUser = useSignal(initData.user);

  // Set the user locale based on Telegram user language or system language
  useEffect(() => {
    if (initDataUser?.language_code) {
      // Check if user has already set a locale preference
      const hasUserLocale = 
        document.cookie.includes('CUSTOM_LOCALE=') ||
        document.cookie.includes('NEXT_LOCALE=') ||
        document.cookie.includes('locale=') ||
        localStorage.getItem('CUSTOM_LOCALE');
      
      if (!hasUserLocale) {
        console.log('🔍 Setting initial locale from Telegram:', initDataUser.language_code);
        const detectedLocale = detectLocale(initDataUser.language_code);
        setLocale(detectedLocale).catch(console.error);
      } else {
        console.log('🔍 User has already set locale preference, keeping it');
      }
    }
  }, [initDataUser]);

  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
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
    <div className="root__loading">Loading</div>
  );
}
