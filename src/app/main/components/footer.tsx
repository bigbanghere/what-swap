"use client";

import { useTranslations } from 'next-intl';
import React from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

export function Footer() {
  const t = useTranslations('translations');
  const { colors } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();

  return (
    <footer 
      className={`flex-shrink-0 transition-all duration-300 flex justify-center ${
        shouldBeCompact ? 'p-[20px]' : 'p-[15px]'
      }`}
      style={{ 
        backgroundColor: colors.background,
        color: colors.text,
        borderTop: `1px solid #1ABCFF`
      }}
    >
      <button
        className={`w-full max-w-[420px] rounded-[15px] font-semibold transition-all duration-200 shadow-lg ${
            shouldBeCompact ? 'h-[50px]' : 'h-[40px]'
        }`}
        style={{ 
          backgroundColor: '#1ABCFF',
          color: colors.background,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1ABCFF';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.backgroundColor = '#1ABCFF';
        }}
      >
        {t('get')}
      </button>
    </footer>
  );
}
