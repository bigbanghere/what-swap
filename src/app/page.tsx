'use client';

import React from 'react';
import { Header } from './main/components/header';
import { Swap } from './main/components/swap';
import { Footer } from './main/components/footer';
import { useAppReady } from '@/hooks/use-app-ready';
import { useTheme } from '@/core/theme';
import { CustomKeyboard } from './main/components/custom-keyboard';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { useTelegramReady } from '@/hooks/use-telegram-ready';

export default function Home() {
  const { colors } = useTheme();
  const { isAppReady, loadingReason, isLoading } = useAppReady();
  const { shouldBeCompact, isInputFocused } = useKeyboardDetection();
  const { isReady: isTelegramReady, isInTelegram, error: telegramError, debugInfo } = useTelegramReady();

  // Show loading if app is not ready or Telegram is not ready
  if (isLoading || !isTelegramReady) {
    return (
      <div 
        className={`min-h-screen flex flex-col items-center justify-center`}
        style={{ 
          backgroundColor: colors.background, 
          color: colors.text 
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
          <h1 className="text-2xl font-bold mb-4">
            Loading Telegram Mini App...
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {loadingReason || "Initializing..."}
          </p>
          {!isTelegramReady && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Waiting for Telegram initialization...
            </p>
          )}
          {telegramError && (
            <p className="text-sm text-red-500 dark:text-red-400">
              Telegram Error: {telegramError}
            </p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-xs text-gray-400">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="mt-2 text-left bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col 
        ${!isInputFocused && shouldBeCompact ? '' : 'min-h-screen'}
      `}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <Header />
      <Swap />
      <Footer />
      {isInputFocused ? <CustomKeyboard /> : null}
      
    </div>
  );
}
