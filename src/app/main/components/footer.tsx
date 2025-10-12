"use client";

import { useTranslations } from 'next-intl';
import React from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { SwapButton } from '@/components/SwapButton';

export function Footer({ error, toAmount, toTokenSymbol }: { error?: string | null; toAmount?: string; toTokenSymbol?: string }) {
  const t = useTranslations('translations');
  const { colors } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();

  return (
    <footer 
      className={`z-20 flex-shrink-0 transition-all duration-300 flex justify-center ${
        !shouldBeCompact ? 'pt-[15px] pb-[15px]' : 'p-[15px]'
      }`}
      style={{
        backgroundColor: colors.background,
        color: colors.background,
        borderTop: `1px solid rgba(0, 122, 255, 0.22)`,
      }}
    >
      <div 
        className="w-full max-w-[420px] flex flex-row items-center justify-center gap-[15px]"
        style={{
        }}
      >
        <a 
          href="https://t.me/bigbangbusiness" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img src="/1.svg" alt="Big Bang Business" className="w-[66px] h-[30px]" />
        </a>
        <div className='w-[1px] h-[30px]'
          style={{
              backgroundColor: 'rgba(0, 122, 255, 0.11)'
          }}
        ></div>
        <a 
          href="https://github.com/bigbanghere" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img src="/2.svg" alt="1" className="w-[20px] h-[20px]" />
        </a>
        <a 
          href="https://t.me/WhatSwapChat"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img src="/3.svg" alt="2" className="w-[20px] h-[20px]" />
        </a>
      </div>
    </footer>
  );
}
