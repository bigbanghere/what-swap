'use client';

import React, { type PropsWithChildren, useEffect } from 'react';
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
import { ThemeProvider } from '@/core/theme';

import './styles.css';
import '@/core/theme/styles.css';

function RootInner({ children }: PropsWithChildren) {
  const { launchParams: lp, isLoaded } = useSafeLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const initDataUser = useSignal(initData.user);

  // Set the user locale based on Telegram user language or system language
  useEffect(() => {
    console.log('🚀 App launching - detecting language...');
    console.log('👤 Telegram user data:', initDataUser);
    console.log('📱 Launch params:', lp);
    
    let languageCode: string | undefined;
    
    // Try to get language from multiple sources
    if (initDataUser?.language_code) {
      languageCode = initDataUser.language_code;
      console.log('📱 Using Telegram user language_code:', languageCode);
    } else if (lp.tgWebAppData?.user?.language_code) {
      languageCode = lp.tgWebAppData.user.language_code;
      console.log('📱 Using launch params language_code:', languageCode);
    } else {
      console.log('🖥️ No Telegram language found, using system language');
    }
    
    const detectedLocale = detectLocale(languageCode);
    console.log('✅ Final detected locale:', detectedLocale);
    setLocale(detectedLocale).catch(console.error);
  }, [initDataUser, lp]);

  // Also set locale immediately on mount for faster loading
  useEffect(() => {
    // Check if we already have a locale set
    const hasExistingLocale = document.cookie.includes('NEXT_LOCALE=');
    
    if (!hasExistingLocale) {
      console.log('⚡ Setting initial locale on mount...');
      const detectedLocale = detectLocale();
      console.log('⚡ Initial locale:', detectedLocale);
      setLocale(detectedLocale).catch(console.error);
    }
  }, []);

  // Add global functions for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setLanguage = (lang: string) => {
        console.log('🔄 Manually setting language to:', lang);
        const detectedLocale = detectLocale(lang);
        setLocale(detectedLocale).catch(console.error);
        console.log('✅ Language set to:', detectedLocale);
      };
      (window as any).getCurrentLanguage = () => {
        console.log('📱 Current user data:', initDataUser);
        console.log('📱 Current launch params:', lp);
        return {
          userLanguage: initDataUser?.language_code,
          launchParamsLanguage: lp.tgWebAppData?.user?.language_code,
          systemLanguage: navigator.language
        };
      };
    }
  }, [initDataUser, lp]);

  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <ThemeProvider>
        <AppRoot
          appearance={isDark ? 'dark' : 'light'}
          platform={
            ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
          }
        >
          {children}
        </AppRoot>
      </ThemeProvider>
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
