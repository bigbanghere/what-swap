"use client";

import { useTranslations } from 'next-intl';
import React from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { SwapButton } from '@/components/SwapButton';

export function Footer({ error }: { error?: string | null }) {
  const t = useTranslations('translations');
  const { colors } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();

  return (
    <footer 
      className={`z-20 flex-shrink-0 transition-all duration-300 flex justify-center ${
        !shouldBeCompact ? 'p-[20px] mb-[1px] border-b-[1px] border-[#007AFF]' : 'p-[15px]'
      }`}
      style={{ 
        backgroundColor: colors.background,
        color: colors.background,
        borderTop: `1px solid #007AFF`,
      }}
    >
      <div 
        className="w-full max-w-[420px]"
        style={{
        }}
      >
        <SwapButton
          error={error}
          shouldBeCompact={shouldBeCompact}
        >
          {error && error.includes('No liquidity pools') ? 'No pools' : t('swap')}
        </SwapButton>
      </div>
    </footer>
  );
}
