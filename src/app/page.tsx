'use client';

import React, { useState } from 'react';
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
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapData, setSwapData] = useState<{ toAmount: string; toTokenSymbol: string }>({ toAmount: '', toTokenSymbol: 'TON' });

  return (
    <Page back={false}>
      <div 
        className={`flex flex-col 
          ${!isInputFocused && shouldBeCompact ? '' : 'min-h-screen'}
        `}
        style={{ backgroundColor: colors.background, color: colors.text }}
      >
        <Header />
        <Swap onErrorChange={setSwapError} onSwapDataChange={setSwapData} />
        {isInputFocused ? null : <Footer error={swapError} toAmount={swapData.toAmount} toTokenSymbol={swapData.toTokenSymbol} />}
        {isInputFocused ? <CustomKeyboard /> : null}
        <BackgroundLoadingIndicator />
      </div>
    </Page>
  );
}
