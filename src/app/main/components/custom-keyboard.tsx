"use client";

import { useTranslations } from 'next-intl';
import React from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import Image from 'next/image';
export function CustomKeyboard() {
  const t = useTranslations('translations');
  const { colors, isDark } = useTheme();
  const { setInputFocused } = useKeyboardDetection();

  console.log('🔍 ===== CustomKeyboard RENDER =====');
  console.log('🔍 CustomKeyboard component rendered');
  console.log('🔍 ===== END CustomKeyboard RENDER =====');

  const handleKeyPress = (key: string) => {
    console.log('🔍 CustomKeyboard key pressed:', key);
    
    // Create a synthetic keyboard event
    const event = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch the event to the document so the custom input can catch it
    document.dispatchEvent(event);
  };

  const handleClose = () => {
    console.log('🔍 ===== CustomKeyboard CLOSE =====');
    console.log('🔍 CustomKeyboard close button pressed');
    console.log('🔍 CustomKeyboard calling setInputFocused(false)');
    setInputFocused(false);
    console.log('🔍 CustomKeyboard setInputFocused(false) completed');
    console.log('🔍 ===== END CustomKeyboard CLOSE =====');
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  return (
    <div 
      className='flex flex-1 p-[15px] relative'
      style={{ 
        backgroundColor: 'rgba(26, 188, 255, 0.22)',
        borderTop: `1px solid #1ABCFF`,
      }}
    >
      <Image
          src={isDark ? '/decor_dark.svg' : '/decor_light.svg'}
          alt="Decorative pattern"
          width={1012}
          height={952}
          className="absolute pointer-events-none left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
      />
        <div className='flex-1 grid grid-cols-3 gap-[5px]'>
          {keys.flat().map((key, index) => (
            <button
              key={index}
              onClick={() => handleKeyPress(key)}
              className='flex items-center justify-center text-lg font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 z-10'
              style={{
                backgroundColor: colors.background,
                borderColor: "#1ABCFF",
                color: "#1ABCFF",
              }}
            >
              {key}
            </button>
          ))}
        </div>
    </div>
  );
}
