"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import Image from 'next/image';
export function CustomKeyboard() {
  const t = useTranslations('translations');
  const { colors, isDark } = useTheme();
  const { setInputFocused, shouldBeCompact } = useKeyboardDetection();
  
  // State for continuous deletion
  const [isBackspaceHeld, setIsBackspaceHeld] = useState(false);
  const backspaceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backspaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for key press visual feedback
  const [pressedKeyIndex, setPressedKeyIndex] = useState<number | null>(null);
  const [isInputNotAllowed, setIsInputNotAllowed] = useState<boolean>(false);
  const keyPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to trigger a backspace event
  const triggerBackspace = useCallback(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }, []);

  // Handle key press visual feedback
  const handleKeyPressFeedback = useCallback((keyIndex: number, key: string) => {
    // Check if we can add more characters by looking for focused input
    let canAdd = true;
    
    // Find the currently focused input element - try multiple approaches
    let focusedInput = document.querySelector('[data-custom-input="true"]:focus');
    
    // If :focus doesn't work, try finding the active element
    if (!focusedInput && document.activeElement) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement.getAttribute('data-custom-input') === 'true') {
        focusedInput = activeElement;
      }
    }
    
    // If still not found, try finding any input with the data attribute
    if (!focusedInput) {
      const allInputs = document.querySelectorAll('[data-custom-input="true"]');
      for (const input of allInputs) {
        const element = input as HTMLElement;
        if (element.style.cursor === 'text' || element.getAttribute('tabindex') !== null) {
          focusedInput = element;
          break;
        }
      }
    }
    
    if (focusedInput) {
      // Get the current value and cursor position
      const currentValue = (focusedInput as HTMLElement).textContent || '';
      const containerWidth = focusedInput.getBoundingClientRect().width;
      
      if (key === 'backspace' || key === '⌫') {
        // For backspace: red if nothing to erase, blue if something to erase
        canAdd = currentValue.length > 0;
        console.log('🔍 Backspace validation:', { 
          key, 
          currentValue, 
          canAdd
        });
      } else {
        // For number keys: check if we can add more characters
        const testValue = currentValue + key;
        
        // Calculate optimal font size for the test value using the same method as CustomInput
        const tempElement = document.createElement('div');
        tempElement.style.fontSize = '33px';
        tempElement.style.lineHeight = '1';
        tempElement.style.visibility = 'hidden';
        tempElement.style.position = 'absolute';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.fontFamily = 'inherit';
        tempElement.style.fontWeight = 'inherit';
        tempElement.style.fontStyle = 'inherit';
        document.body.appendChild(tempElement);
        
        tempElement.textContent = testValue;
        const textWidth = tempElement.getBoundingClientRect().width;
        document.body.removeChild(tempElement);
        
        // Mode-aware available width calculation (same as CustomInput):
        // - Compact mode: containerWidth - 20px (for currency selector and gap)
        // - Full mode: containerWidth - 40px (20px for currency selector + 20px for form padding)
        const availableWidth = containerWidth - (shouldBeCompact ? 20 : 40);
        
        let optimalSize;
        if (textWidth <= availableWidth) {
          optimalSize = 33; // maxFontSize
        } else {
          const scaleFactor = availableWidth / textWidth;
          const calculatedFontSize = Math.floor(33 * scaleFactor);
          optimalSize = Math.max(calculatedFontSize, 14); // minFontSize
        }
        
        // Check if adding this character would make font size drop below 14px
        canAdd = optimalSize > 14;
        
        console.log('🔍 Number key validation:', { 
          key, 
          currentValue, 
          testValue, 
          containerWidth, 
          availableWidth, 
          textWidth, 
          optimalSize, 
          canAdd 
        });
      }
    } else {
      console.log('🔍 No focused input found, allowing input');
    }
    
    console.log('🔍 Key pressed:', key, 'Can add more characters:', canAdd);
    
    // Set the input not allowed state for color determination
    setIsInputNotAllowed(!canAdd);
    
    // Clear any existing timeout
    if (keyPressTimeoutRef.current) {
      clearTimeout(keyPressTimeoutRef.current);
    }
    
    // Set the pressed key index
    setPressedKeyIndex(keyIndex);
    
    // Clear the visual feedback after 22ms
    keyPressTimeoutRef.current = setTimeout(() => {
      setPressedKeyIndex(null);
      setIsInputNotAllowed(false);
    }, 22);
  }, []);

  // Start continuous deletion
  const startContinuousDeletion = useCallback(() => {
    if (isBackspaceHeld) return;
    
    setIsBackspaceHeld(true);
    
    // Keep visual feedback active during hold
    const backspaceKeyIndex = 11; // Index of backspace key in the flat array
    setPressedKeyIndex(backspaceKeyIndex);
    setIsInputNotAllowed(false); // Backspace is always allowed, so use blue color
    
    // Initial delay before starting continuous deletion
    backspaceTimeoutRef.current = setTimeout(() => {
      // Start continuous deletion with interval
      backspaceIntervalRef.current = setInterval(() => {
        triggerBackspace();
      }, 100); // Delete every 100ms
    }, 500); // Wait 500ms before starting continuous deletion
  }, [isBackspaceHeld, triggerBackspace]);

  // Handle single tap for backspace
  const handleBackspaceTap = useCallback(() => {
    // If we're not already in continuous deletion mode, trigger a single backspace
    if (!isBackspaceHeld) {
      triggerBackspace();
      // Show brief visual feedback for single tap
      const backspaceKeyIndex = 11; // Index of backspace key in the flat array
      handleKeyPressFeedback(backspaceKeyIndex, '⌫');
    }
  }, [isBackspaceHeld, triggerBackspace, handleKeyPressFeedback]);

  // Stop continuous deletion
  const stopContinuousDeletion = useCallback(() => {
    setIsBackspaceHeld(false);
    
    // Clear visual feedback when hold ends
    setPressedKeyIndex(null);
    
    if (backspaceTimeoutRef.current) {
      clearTimeout(backspaceTimeoutRef.current);
      backspaceTimeoutRef.current = null;
    }
    
    if (backspaceIntervalRef.current) {
      clearInterval(backspaceIntervalRef.current);
      backspaceIntervalRef.current = null;
    }
  }, []);

  const handleKeyPress = (key: string) => {
    // Map special keys to their actual key values
    let actualKey = key;
    if (key === '⌫') {
      actualKey = 'Backspace';
    }
    
    // Create a synthetic keyboard event
    const event = new KeyboardEvent('keydown', {
      key: actualKey,
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch the event to the document so the custom input can catch it
    document.dispatchEvent(event);
  };

  const handleClose = () => {
    setInputFocused(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousDeletion();
      if (keyPressTimeoutRef.current) {
        clearTimeout(keyPressTimeoutRef.current);
      }
    };
  }, [stopContinuousDeletion]);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  return (
    <div className='flex flex-1 justify-center'
      style={{ 
        backgroundColor: 'rgba(26, 188, 255, 0.22)',
        borderTop: `1px solid #1ABCFF`,
      }}
    >
      <div 
        data-custom-keyboard
        className='flex flex-1 p-[15px] relative'
        style={{ 
          maxWidth: "460px",
          maxHeight: "460px",
        }}
      >
        {/* <Image
            src={isDark ? '/decor_dark.svg' : '/decor_light.svg'}
            alt="Decorative pattern"
            width={1012}
            height={952}
            className="absolute pointer-events-none left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
            style={{ 
              minWidth: '1012px',
              minHeight: '952px',
              width: '100%',
              height: '100%'
            }}
        /> */}
        <div className='flex-1 grid grid-cols-3 gap-[15px] relative z-10'>
            {keys.flat().map((key, index) => (
              <button
                key={index}
                onClick={() => {
                  // Trigger visual feedback
                  handleKeyPressFeedback(index, key);
                  
                  if (key === '⌫') {
                    handleBackspaceTap();
                  } else {
                    handleKeyPress(key);
                  }
                }}
                onMouseDown={(e) => {
                  if (key === '⌫') {
                    // Don't prevent default - let the click event work normally
                    startContinuousDeletion();
                  }
                  // Prevent focus to avoid visual changes
                  e.currentTarget.blur();
                }}
                onMouseUp={() => {
                  if (key === '⌫') {
                    stopContinuousDeletion();
                  }
                }}
                onMouseLeave={() => {
                  if (key === '⌫') {
                    stopContinuousDeletion();
                  }
                }}
                onTouchStart={(e) => {
                  if (key === '⌫') {
                    // Don't prevent default - let the touch work normally
                    startContinuousDeletion();
                  }
                  // Prevent focus to avoid visual changes
                  e.currentTarget.blur();
                }}
                onTouchEnd={(e) => {
                  if (key === '⌫') {
                    // Don't prevent default - let the touch work normally
                    stopContinuousDeletion();
                  }
                }}
                onTouchCancel={() => {
                  if (key === '⌫') {
                    stopContinuousDeletion();
                  }
                }}
                className='flex items-center justify-center text-[22px] rounded-[15px] border z-10 focus:outline-none active:bg-transparent hover:bg-transparent relative'
                style={{
                  backgroundColor: colors.background,
                  borderColor: "#1ABCFF",
                  color: "#1ABCFF",
                  outline: 'none',
                  boxShadow: 'none',
                }}
              >
                {key}
                {/* 11% background overlay for visual feedback */}
                {pressedKeyIndex === index && (
                  <div 
                    className="absolute inset-0 rounded-[15px] pointer-events-none"
                    style={{
                      backgroundColor: isInputNotAllowed 
                        ? 'rgba(255, 17, 17, 0.22)' // Red (#FF1111) with 11% opacity when input not allowed
                        : 'rgba(26, 188, 255, 0.11)', // Blue (#1ABCFF) with 11% opacity when input allowed
                      transition: 'opacity 0.011s ease-in-out'
                    }}
                  />
                )}
              </button>
            ))}
          </div>
      </div>
    </div>
  );
}
