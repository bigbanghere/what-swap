'use client';

import React from 'react';
import { Header } from './main/components/header';
import { Swap } from './main/components/swap';
import { Footer } from './main/components/footer';
import { useTheme } from '@/core/theme';
import { CustomKeyboard } from './main/components/custom-keyboard';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { BackgroundLoadingIndicator } from '@/components/BackgroundLoadingIndicator';
import { Page } from '@/components/Page';

export default function Home() {
  const { colors } = useTheme();
  const { shouldBeCompact, isInputFocused } = useKeyboardDetection();

  return (
    <Page back={false}>
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
        <BackgroundLoadingIndicator />
      </div>
    </Page>
  );
}
