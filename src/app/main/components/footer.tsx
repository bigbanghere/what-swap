"use client";

import { useTranslations } from 'next-intl';
import React from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

export function Footer({ error }: { error?: string | null }) {
  const t = useTranslations('translations');
  const { colors } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();

  return (
    <footer 
      className={`z-20 flex-shrink-0 transition-all duration-300 flex justify-center ${
        !shouldBeCompact ? 'p-[20px] mb-[1px] border-b-[1px] border-[#1ABCFF]' : 'p-[15px]'
      }`}
      style={{ 
        backgroundColor: colors.background,
        color: colors.background,
        borderTop: `1px solid #1ABCFF`,
      }}
    >
      <div 
        className="w-full max-w-[420px]"
        style={{
        }}
      >
        <button
          className={`w-full rounded-[15px] font-semibold transition-all duration-200 shadow-lg ${
              !shouldBeCompact ? 'h-[50px]' : 'h-[40px]'
          }`}
          style={{ 
            backgroundColor: '#1ABCFF',
            color: "#FFFFFF",
            opacity: error && error.includes('No liquidity pools') ? 0.66 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = error && error.includes('No liquidity pools') ? '0.66' : '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1ABCFF';
            e.currentTarget.style.opacity = error && error.includes('No liquidity pools') ? '0.66' : '1';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.opacity = error && error.includes('No liquidity pools') ? '0.66' : '0.8';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = '#1ABCFF';
            e.currentTarget.style.opacity = error && error.includes('No liquidity pools') ? '0.66' : '1';
          }}
        >
          {error && error.includes('No liquidity pools') ? 'No pools' : t('swap')}
        </button>
      </div>
    </footer>
  );
}
