"use client";

import { useTranslations } from 'next-intl';
import React from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

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
      className='w-full bg-white border-t border-gray-200 p-4'
      style={{ 
        backgroundColor: colors.background,
        borderTop: `1px solid ${colors.divider}`
      }}
    >
      <div className='max-w-sm mx-auto'>
        {/* Close button */}
        <div className='flex justify-end mb-4'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800'
            style={{ color: colors.text }}
          >
            Done
          </button>
        </div>
        
        {/* Keyboard grid */}
        <div className='grid grid-cols-3 gap-3'>
          {keys.flat().map((key, index) => (
            <button
              key={index}
              onClick={() => handleKeyPress(key)}
              className='h-12 flex items-center justify-center text-lg font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100'
              style={{
                backgroundColor: key === '⌫' ? colors.secondaryBackground : colors.background,
                borderColor: colors.divider,
                color: colors.text
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
