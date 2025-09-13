'use client';

import React from 'react';
import { Header } from './main/components/header';
import { Swap } from './main/components/swap';
import { Footer } from './main/components/footer';
import { useAppReady } from '@/hooks/use-app-ready';
import { useTheme } from '@/core/theme';

export default function Home() {
  const { colors } = useTheme();
  const { isAppReady, loadingReason, isLoading } = useAppReady();

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center"
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
          <p className="text-gray-600 dark:text-gray-300">
            {loadingReason || "Initializing..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }} className="min-h-screen flex flex-col">
      <Header />
      <Swap />
      <Footer />
    </div>
  );
}
