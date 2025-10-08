"use client";

import React, { useState, useEffect, useRef, useCallback, memo, forwardRef, useImperativeHandle } from 'react';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  type?: 'text' | 'number';
  onFocusChange?: (isFocused: boolean) => void;
  shouldBeCompact?: boolean;
}

interface CustomInputRef {
  blur: () => void;
  focus: () => void;
  canAddMoreCharacters: (key: string) => boolean;
  setCursorToEnd: () => void;
  getCursorPosition: () => number;
  setCursorPosition: (position: number) => void;
}

const CustomInput = memo(forwardRef<CustomInputRef, CustomInputProps>(function CustomInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  style = {},
  maxLength,
  type = 'text',
  onFocusChange,
  shouldBeCompact = false
}, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  console.log('🎯 CustomInput: Component rendered', {
    value,
    valueLength: value.length,
    isFocused,
    cursorPosition
  });
  const [currentFontSize, setCurrentFontSize] = useState(33);
  const [showCursor, setShowCursor] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const justFocusedRef = useRef(false);
  const justFocusedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusClickTargetRef = useRef<Element | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const shouldBeFocusedRef = useRef(false);
  const cursorBlinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [cursorLeftPosition, setCursorLeftPosition] = useState(0);
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  const hasMovedDuringTouch = useRef<boolean>(false);
  const lastTouchEndTime = useRef<number>(0);
  
  // Calculate optimal font size based on text width
  const calculateOptimalFontSize = useCallback((text: string, containerWidth: number): number => {
    if (!text || text.length === 0) return 33;
    
    const minFontSize = 14;
    const maxFontSize = 33;
    
    // Create a temporary element to measure text width
    const tempElement = document.createElement('span');
    tempElement.style.fontSize = `${maxFontSize}px`;
    tempElement.style.lineHeight = '1';
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontFamily = 'inherit';
    tempElement.style.fontWeight = 'inherit';
    tempElement.style.fontStyle = 'inherit';
    document.body.appendChild(tempElement);
    
    tempElement.textContent = text;
    const textWidth = tempElement.getBoundingClientRect().width;
    document.body.removeChild(tempElement);
    
    // Mode-aware available width calculation:
    // - Compact mode: containerWidth - 20px (for currency selector and gap)
    // - Full mode: containerWidth - 40px (20px for currency selector + 20px for form padding)
    const availableWidth = containerWidth - (shouldBeCompact ? 20 : 40);
    
    // If text fits within the available width at max size, return max size
    if (textWidth <= availableWidth) {
      return maxFontSize;
    }
    
    // Calculate the scale factor needed to fit the text within the available width
    const scaleFactor = availableWidth / textWidth;
    const calculatedFontSize = Math.floor(maxFontSize * scaleFactor);
    
    // Ensure we don't go below minimum font size
    return Math.max(calculatedFontSize, minFontSize);
  }, [shouldBeCompact]);

  // Check if we can add more characters (font size would be at minimum)
  const canAddMoreCharacters = useCallback((text: string, containerWidth: number): boolean => {
    const optimalSize = calculateOptimalFontSize(text, containerWidth);
    const result = optimalSize > 14;
    console.log('🔍 CustomInput canAddMoreCharacters:', { text, containerWidth, optimalSize, result });
    return result;
  }, [calculateOptimalFontSize]);

  
  // Helper function to set focus with justFocused protection
  const setFocusWithProtection = useCallback((clickTarget?: Element) => {
    const wasUnfocused = !isFocused;
    console.log('🟢 setFocusWithProtection called - wasUnfocused:', wasUnfocused, 'current isFocused:', isFocused);
    
    shouldBeFocusedRef.current = true;
    setIsFocused(true);
    console.log('🟢 setFocusWithProtection - set isFocused to true');
    
    if (wasUnfocused) {
      if (justFocusedTimeoutRef.current) {
        clearTimeout(justFocusedTimeoutRef.current);
      }
      
      justFocusedRef.current = true;
      lastFocusClickTargetRef.current = clickTarget || null;
      
      justFocusedTimeoutRef.current = setTimeout(() => {
        justFocusedRef.current = false;
        lastFocusClickTargetRef.current = null;
        justFocusedTimeoutRef.current = null;
      }, 500);
    }
  }, [isFocused]);

  // Expose blur and focus methods through ref
  useImperativeHandle(ref, () => ({
    blur: () => {
      console.log('🔴 CustomInput blur() called - current isFocused:', isFocused);
      shouldBeFocusedRef.current = false;
      setIsFocused(false);
      console.log('🔴 CustomInput blur() - set isFocused to false');
    },
    focus: () => {
      console.log('🟢 CustomInput focus() called - current isFocused:', isFocused);
      setFocusWithProtection();
    },
    canAddMoreCharacters: (key: string) => {
      if (!inputRef.current) {
        console.log('🔍 CustomInput canAddMoreCharacters: no inputRef, returning true');
        return true;
      }
      const containerWidth = inputRef.current.getBoundingClientRect().width;
      const testValue = value.slice(0, cursorPosition) + key + value.slice(cursorPosition);
      console.log('🔍 CustomInput canAddMoreCharacters called:', { key, testValue, containerWidth, cursorPosition });
      const result = canAddMoreCharacters(testValue, containerWidth);
      console.log('🔍 CustomInput canAddMoreCharacters result:', result);
      return result;
    },
    setCursorToEnd: () => {
      console.log('🔍 CustomInput setCursorToEnd() called - setting cursor to end of value:', value);
      setCursorPosition(value.length);
    },
    getCursorPosition: () => {
      console.log('🔍 CustomInput getCursorPosition() called - current position:', cursorPosition);
      return cursorPosition;
    },
    setCursorPosition: (position: number) => {
      console.log('🔍 CustomInput setCursorPosition() called - setting position to:', position, 'for value:', value);
      setCursorPosition(Math.max(0, Math.min(position, value.length)));
    }
  }), [setFocusWithProtection, isFocused, value, cursorPosition, canAddMoreCharacters]);

  // Track when component has mounted
  useEffect(() => {
    setHasMounted(true);
    
    return () => {
      shouldBeFocusedRef.current = false;
    };
  }, []);

  // Restore focus if we should be focused but aren't (due to re-render)
  useEffect(() => {
    if (hasMounted && shouldBeFocusedRef.current && !isFocused) {
      const timeoutId = setTimeout(() => {
        setFocusWithProtection();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasMounted, isFocused, setFocusWithProtection]);

  // Also check on every render if we should be focused
  useEffect(() => {
    if (hasMounted && shouldBeFocusedRef.current && !isFocused) {
      setFocusWithProtection();
    }
  }, [hasMounted, isFocused, setFocusWithProtection]);

  // Handle click outside to unfocus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isFocused) {
        return;
      }
      
      if (justFocusedRef.current) {
        return;
      }
      
      if (lastFocusClickTargetRef.current && event.target === lastFocusClickTargetRef.current) {
        return;
      }
      
      const target = event.target as Element;
      
      const isInputClick = inputRef.current?.contains(target);
      const isKeyboardClick = target?.closest('[data-custom-keyboard]') !== null;
      const isButtonClick = target?.closest('button') !== null || 
                           target?.closest('[role="button"]') !== null ||
                           target?.closest('.cursor-pointer') !== null;
      
      // Allow blurring when clicking on the Swap button specifically
      const isSwapButton = target?.closest('button')?.textContent?.includes('Обменять') || 
                          target?.closest('[role="button"]')?.textContent?.includes('Обменять');
      
      console.log('🔍 CustomInput handleClickOutside:', {
        isFocused,
        target: target?.tagName,
        isInputClick,
        isKeyboardClick,
        isButtonClick,
        isSwapButton,
        shouldBlur: !isInputClick && !isKeyboardClick && (!isButtonClick || isSwapButton)
      });
      
      if (!isInputClick && !isKeyboardClick && (!isButtonClick || isSwapButton)) {
        console.log('🔍 CustomInput: Blurring input due to click outside');
        shouldBeFocusedRef.current = false;
        setIsFocused(false);
      }
    };

    if (isFocused) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, false);
        document.addEventListener('touchstart', handleClickOutside, false);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, false);
        document.removeEventListener('touchstart', handleClickOutside, false);
      };
    }
  }, [isFocused]);

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isFocused) return;

    // Handle text selection with Shift key
    const hasSelection = selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd;
    const isShiftPressed = e.shiftKey;

    switch (e.key) {
      case 'Backspace':
        if (hasSelection) {
          // Delete selected text
          const start = Math.min(selectionStart!, selectionEnd!);
          const end = Math.max(selectionStart!, selectionEnd!);
          const newValue = value.slice(0, start) + value.slice(end);
          onChange(newValue);
          setCursorPosition(start);
          setSelectionStart(null);
          setSelectionEnd(null);
        } else if (cursorPosition > 0) {
          const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
          onChange(newValue);
          setCursorPosition(Math.max(0, cursorPosition - 1));
        }
        break;
      case 'Delete':
        if (cursorPosition < value.length) {
          const newValue = value.slice(0, cursorPosition) + value.slice(cursorPosition + 1);
          onChange(newValue);
        }
        break;
      case 'ArrowLeft':
        if (isShiftPressed) {
          // Extend selection
          if (selectionStart === null) {
            setSelectionStart(cursorPosition);
          }
          const newPos = Math.max(0, cursorPosition - 1);
          setCursorPosition(newPos);
          setSelectionEnd(newPos);
        } else {
          // Clear selection and move cursor
          setSelectionStart(null);
          setSelectionEnd(null);
          setCursorPosition(Math.max(0, cursorPosition - 1));
        }
        break;
      case 'ArrowRight':
        if (isShiftPressed) {
          // Extend selection
          if (selectionStart === null) {
            setSelectionStart(cursorPosition);
          }
          const newPos = Math.min(value.length, cursorPosition + 1);
          setCursorPosition(newPos);
          setSelectionEnd(newPos);
        } else {
          // Clear selection and move cursor
          setSelectionStart(null);
          setSelectionEnd(null);
          setCursorPosition(Math.min(value.length, cursorPosition + 1));
        }
        break;
      case 'Home':
        if (isShiftPressed) {
          if (selectionStart === null) {
            setSelectionStart(cursorPosition);
          }
          setCursorPosition(0);
          setSelectionEnd(0);
        } else {
          setSelectionStart(null);
          setSelectionEnd(null);
          setCursorPosition(0);
        }
        break;
      case 'End':
        if (isShiftPressed) {
          if (selectionStart === null) {
            setSelectionStart(cursorPosition);
          }
          setCursorPosition(value.length);
          setSelectionEnd(value.length);
        } else {
          setSelectionStart(null);
          setSelectionEnd(null);
          setCursorPosition(value.length);
        }
        break;
      case 'Escape':
        shouldBeFocusedRef.current = false;
        setIsFocused(false);
        break;
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          // Select all
          e.preventDefault();
          setSelectionStart(0);
          setSelectionEnd(value.length);
          setCursorPosition(value.length);
        }
        break;
      default:
        if (e.key.length === 1) {
          if (maxLength && value.length >= maxLength && !hasSelection) return;
          
          if (type === 'number') {
            if (!/^[0-9.]$/.test(e.key)) return;
            if (e.key === '.' && value.includes('.')) return;
            
            if (e.key === '.' && value === '') {
              const newValue = '0.';
              onChange(newValue);
              setCursorPosition(2);
              setSelectionStart(null);
              setSelectionEnd(null);
              return;
            }
          }
          
          // Check if adding this character would make the font size too small
          if (inputRef.current) {
            const containerWidth = inputRef.current.getBoundingClientRect().width;
            let testValue;
            if (hasSelection) {
              const start = Math.min(selectionStart!, selectionEnd!);
              const end = Math.max(selectionStart!, selectionEnd!);
              testValue = value.slice(0, start) + e.key + value.slice(end);
            } else {
              testValue = value.slice(0, cursorPosition) + e.key + value.slice(cursorPosition);
            }
            if (!canAddMoreCharacters(testValue, containerWidth)) {
              return; // Don't add the character if it would make font size too small
            }
          }
          
          let newValue: string;
          let newCursorPosition: number;
          
          if (hasSelection) {
            // Replace selected text
            const start = Math.min(selectionStart!, selectionEnd!);
            const end = Math.max(selectionStart!, selectionEnd!);
            newValue = value.slice(0, start) + e.key + value.slice(end);
            newCursorPosition = start + 1;
          } else {
            // Insert at cursor position
            newValue = value.slice(0, cursorPosition) + e.key + value.slice(cursorPosition);
            newCursorPosition = cursorPosition + 1;
          }
          
          onChange(newValue);
          setCursorPosition(newCursorPosition);
          setSelectionStart(null);
          setSelectionEnd(null);
        }
        break;
    }
  }, [isFocused, cursorPosition, value, onChange, maxLength, type, canAddMoreCharacters, selectionStart, selectionEnd]);

  // Listen for synthetic keyboard events from CustomKeyboard
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFocused) {
        const reactEvent = {
          key: e.key,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation()
        } as React.KeyboardEvent;
        
        handleKeyDown(reactEvent);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused, handleKeyDown]);

  // Track previous focus state to avoid calling onFocusChange on initial mount
  const prevIsFocused = useRef(isFocused);

  // Notify parent component when focus state changes
  useEffect(() => {
    if (!hasMounted) {
      return;
    }
    
    if (prevIsFocused.current === isFocused) {
      return;
    }
    
    console.log('🟣 CustomInput focus state changed:', isFocused, 'calling onFocusChange');
    if (onFocusChange) {
      onFocusChange(Boolean(isFocused));
    }
    
    prevIsFocused.current = isFocused;
  }, [isFocused, onFocusChange, hasMounted]);

  // Update cursor position when value changes
  useEffect(() => {
    if (cursorPosition > value.length) {
      console.log('🎯 CustomInput: Cursor position adjusted due to value change', {
        oldCursorPosition: cursorPosition,
        newCursorPosition: value.length,
        value,
        valueLength: value.length
      });
      setCursorPosition(value.length);
    }
  }, [value, cursorPosition]);

  // Log cursor position changes
  useEffect(() => {
    console.log('🎯 CustomInput: Cursor position changed', {
      cursorPosition,
      value,
      valueLength: value.length,
      isFocused
    });
  }, [cursorPosition, value, isFocused]);

  // Handle cursor blinking
  useEffect(() => {
    if (isFocused) {
      setShowCursor(true);
      
      // Start blinking
      cursorBlinkIntervalRef.current = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 530); // Slightly slower than typical 500ms for better visibility
    } else {
      setShowCursor(false);
      if (cursorBlinkIntervalRef.current) {
        clearInterval(cursorBlinkIntervalRef.current);
        cursorBlinkIntervalRef.current = null;
      }
    }

    return () => {
      if (cursorBlinkIntervalRef.current) {
        clearInterval(cursorBlinkIntervalRef.current);
        cursorBlinkIntervalRef.current = null;
      }
    };
  }, [isFocused]);

  // Update font size when value changes
  useEffect(() => {
    if (!inputRef.current || !hasMounted) return;
    
    const containerWidth = inputRef.current.getBoundingClientRect().width;
    const optimalSize = calculateOptimalFontSize(value, containerWidth);
    setCurrentFontSize(optimalSize);
  }, [value, hasMounted, calculateOptimalFontSize]);

  // Recalculate font size when mode changes (compact <-> full)
  useEffect(() => {
    if (!inputRef.current || !hasMounted) return;
    
    const containerWidth = inputRef.current.getBoundingClientRect().width;
    const optimalSize = calculateOptimalFontSize(value, containerWidth);
    setCurrentFontSize(optimalSize);
  }, [shouldBeCompact, value, hasMounted, calculateOptimalFontSize]);

  // Calculate and update cursor left position
  useEffect(() => {
    if (!inputRef.current || !value || value.length === 0) {
      setCursorLeftPosition(0);
      return;
    }
    
    const textElement = inputRef.current.querySelector('span');
    if (!textElement) {
      setCursorLeftPosition(0);
      return;
    }
    
    const tempElement = document.createElement('span');
    tempElement.style.fontSize = `${currentFontSize}px`;
    tempElement.style.lineHeight = '1';
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempElement);
    
    const beforeText = value.slice(0, cursorPosition);
    tempElement.textContent = beforeText;
    const beforeWidth = tempElement.getBoundingClientRect().width;
    
    document.body.removeChild(tempElement);
    
    const containerWidth = inputRef.current.getBoundingClientRect().width;
    let finalPosition = Math.max(0, Math.min(beforeWidth, containerWidth - 2));
    
    if (beforeWidth === 0 && cursorPosition > 0) {
      const charWidth = containerWidth / value.length;
      finalPosition = Math.max(0, Math.min(cursorPosition * charWidth, containerWidth - 2));
    }
    
    setCursorLeftPosition(finalPosition);
  }, [cursorPosition, value, currentFontSize]);


  // Handle click to position cursor
  const handleTextClick = (e: React.MouseEvent) => {
    console.log('🎯 CustomInput: handleTextClick triggered', {
      target: e.target,
      targetTagName: (e.target as Element)?.tagName,
      targetTextContent: (e.target as Element)?.textContent,
      clientX: e.clientX,
      clientY: e.clientY,
      isFocused,
      currentValue: value,
      currentCursorPosition: cursorPosition
    });

    e.preventDefault();
    e.stopPropagation(); // Prevent outer div onClick from running
    
    if (!inputRef.current) {
      console.log('🎯 CustomInput: handleTextClick - inputRef.current is null');
      return;
    }
    
    const rect = inputRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    console.log('🎯 CustomInput: handleTextClick cursor calculation', {
      inputRect: {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height
      },
      clickX,
      clientX: e.clientX,
      relativeClickX: clickX,
      valueLength: value.length,
      currentValue: value
    });
    
    const bestPosition = calculateCursorPosition(clickX);
    
    console.log('🎯 CustomInput: handleTextClick cursor position calculated', {
      bestPosition,
      previousCursorPosition: cursorPosition,
      value: value,
      willSetCursorTo: bestPosition
    });
    
    setCursorPosition(bestPosition);
    
    if (!isFocused) {
      console.log('🎯 CustomInput: Setting focus from handleTextClick');
      setFocusWithProtection(e.target as Element);
    }
  };

  // Split value at cursor position for rendering
  const beforeCursor = value.slice(0, cursorPosition);
  const afterCursor = value.slice(cursorPosition);

  // Validate clipboard content for amount input
  const validateClipboardContent = (clipboardText: string): boolean => {
    if (type === 'number') {
      const cleanText = clipboardText.replace(/[^0-9.]/g, '');
      const isValidNumber = cleanText && !isNaN(parseFloat(cleanText)) && isFinite(parseFloat(cleanText));
      
      if (!isValidNumber) {
        return false;
      }
    } else {
      if (!clipboardText || clipboardText.trim() === '') {
        return false;
      }
    }
    
    return true;
  };

  // Calculate cursor position based on X coordinate
  const calculateCursorPosition = useCallback((clickX: number): number => {
    console.log('🎯 CustomInput: calculateCursorPosition called', {
      clickX,
      value,
      valueLength: value.length,
      currentFontSize,
      inputRefExists: !!inputRef.current
    });

    if (!inputRef.current) {
      console.log('🎯 CustomInput: calculateCursorPosition - inputRef.current is null, returning 0');
      return 0;
    }
    
    const rect = inputRef.current.getBoundingClientRect();
    const textElement = inputRef.current.querySelector('span');
    
    console.log('🎯 CustomInput: calculateCursorPosition - element details', {
      rect: {
        width: rect.width,
        left: rect.left,
        right: rect.right
      },
      textElementExists: !!textElement,
      textElementTagName: textElement?.tagName,
      textElementTextContent: textElement?.textContent
    });
    
    if (!textElement) {
      const charWidth = rect.width / Math.max(value.length || 1, 1);
      const approximatePosition = Math.round(clickX / charWidth);
      const result = Math.max(0, Math.min(value.length, approximatePosition));
      
      console.log('🎯 CustomInput: calculateCursorPosition - fallback calculation', {
        charWidth,
        approximatePosition,
        result,
        clickX,
        rectWidth: rect.width,
        valueLength: value.length
      });
      
      return result;
    }
    
    let bestPosition = 0;
    let minDistance = Infinity;
    
    console.log('🎯 CustomInput: calculateCursorPosition - starting precise calculation', {
      valueLength: value.length,
      currentFontSize
    });
    
    for (let i = 0; i <= value.length; i++) {
      const testText = value.slice(0, i);
      
      const tempElement = document.createElement('span');
      tempElement.style.fontSize = `${currentFontSize}px`;
      tempElement.style.lineHeight = '1';
      tempElement.style.visibility = 'hidden';
      tempElement.style.position = 'absolute';
      tempElement.style.whiteSpace = 'nowrap';
      tempElement.style.fontFamily = getComputedStyle(textElement).fontFamily;
      tempElement.style.fontWeight = getComputedStyle(textElement).fontWeight;
      tempElement.style.fontStyle = getComputedStyle(textElement).fontStyle;
      document.body.appendChild(tempElement);
      
      tempElement.textContent = testText;
      const textWidth = tempElement.getBoundingClientRect().width;
      document.body.removeChild(tempElement);
      
      const distance = Math.abs(clickX - textWidth);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = i;
      }
      
      if (i <= 3 || i >= value.length - 1) { // Log first few and last few iterations
        console.log('🎯 CustomInput: calculateCursorPosition - iteration', {
          i,
          testText,
          textWidth,
          distance,
          minDistance,
          bestPosition
        });
      }
    }
    
    console.log('🎯 CustomInput: calculateCursorPosition - final result', {
      bestPosition,
      minDistance,
      clickX,
      value
    });
    
    return bestPosition;
  }, [value, currentFontSize]);

  // Handle right-click for paste menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isFocused) {
      setFocusWithProtection(e.target as Element);
    }
  };

  // Handle touch events for cursor positioning and long press
  const handleTouchStart = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    const touch = e.touches[0];
    dragStartPosition.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();
    hasMovedDuringTouch.current = false;
    
    longPressTimer.current = setTimeout(async () => {
      if (hasMovedDuringTouch.current) {
        hasMovedDuringTouch.current = false;
      }
      
      if (hasMovedDuringTouch.current) {
        setIsDraggingCursor(true);
      }
    }, 500);
  };

  // Handle touch move for cursor dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartPosition.current && !hasMovedDuringTouch.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - dragStartPosition.current.x);
      const deltaY = Math.abs(touch.clientY - dragStartPosition.current.y);
      
      const timeSinceTouchStart = Date.now() - touchStartTime.current;
      const isDuringLongPress = timeSinceTouchStart > 300;
      
      const movementThreshold = isDuringLongPress ? 15 : 10;
      
      if (deltaX > movementThreshold || deltaY > movementThreshold) {
        hasMovedDuringTouch.current = true;
      }
    }
    
    if (isDraggingCursor && inputRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const rect = inputRef.current.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      
      const bestPosition = calculateCursorPosition(clickX);
      
      setCursorPosition(bestPosition);
    }
    else if (dragStartPosition.current && !isDraggingCursor && hasMovedDuringTouch.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - dragStartPosition.current.x);
      const deltaY = Math.abs(touch.clientY - dragStartPosition.current.y);
      
      if (deltaX > 10 || deltaY > 10) {
        setIsDraggingCursor(true);
        
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }
  };

  // Handle short tap for cursor positioning
  const handleTouchEnd = (e: React.TouchEvent) => {
    lastTouchEndTime.current = Date.now();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      
      if (!isDraggingCursor && inputRef.current) {
        const touch = e.changedTouches[0];
        const rect = inputRef.current.getBoundingClientRect();
        const clickX = touch.clientX - rect.left;
        
        const bestPosition = calculateCursorPosition(clickX);
        
        setCursorPosition(bestPosition);
        
        if (!isFocused) {
          setFocusWithProtection(e.target as Element);
        }
      }
    }
    
    setIsDraggingCursor(false);
    dragStartPosition.current = null;
    hasMovedDuringTouch.current = false;
  };

  // Global touch move listener for cursor dragging when finger goes outside input
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingCursor || !inputRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const rect = inputRef.current.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      
      const bestPosition = calculateCursorPosition(clickX);
      
      setCursorPosition(bestPosition);
    };

    const handleGlobalTouchEnd = () => {
      if (isDraggingCursor) {
        setIsDraggingCursor(false);
        dragStartPosition.current = null;
        hasMovedDuringTouch.current = false;
      }
    };

    if (isDraggingCursor) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
      
      return () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDraggingCursor, value, calculateCursorPosition]);

  return (
    <>
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <div
        ref={inputRef}
        data-custom-input
        className={`${className}`}
        style={{
          ...style,
          cursor: 'text',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          overflow: 'visible',
          outline: 'none',
          position: 'relative'
        }}
        onMouseDown={(e) => {
          console.log('🎯 CustomInput: onMouseDown triggered', {
            target: e.target,
            targetTagName: (e.target as Element)?.tagName,
            clientX: e.clientX,
            clientY: e.clientY,
            isFocused,
            currentValue: value
          });
          
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
          
          // Calculate cursor position based on click location
          if (inputRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const clickX = e.clientX - inputRect.left;
            
            console.log('🎯 CustomInput: onMouseDown cursor calculation', {
              inputRect: {
                left: inputRect.left,
                right: inputRect.right,
                width: inputRect.width,
                top: inputRect.top,
                bottom: inputRect.bottom,
                height: inputRect.height
              },
              clickX,
              clientX: e.clientX,
              relativeClickX: clickX,
              valueLength: value.length,
              currentValue: value
            });
            
            const bestPosition = calculateCursorPosition(clickX);
            
            console.log('🎯 CustomInput: onMouseDown cursor position calculated', {
              bestPosition,
              previousCursorPosition: cursorPosition,
              value: value,
              willSetCursorTo: bestPosition
            });
            
            setCursorPosition(bestPosition);
            // Clear selection on click
            setSelectionStart(null);
            setSelectionEnd(null);
          }
          
          if (!isFocused) {
            setFocusWithProtection(e.target as Element);
          }
        }}
        onClick={(e) => {
          console.log('🎯 CustomInput: Outer div onClick triggered', {
            target: e.target,
            targetTagName: (e.target as Element)?.tagName,
            targetTextContent: (e.target as Element)?.textContent,
            isInputRef: e.target === inputRef.current,
            clientX: e.clientX,
            clientY: e.clientY,
            isFocused,
            currentValue: value,
            currentCursorPosition: cursorPosition
          });

          if (e.target === inputRef.current) {
            e.preventDefault();
          }
          
          // Only handle focus setting here - cursor positioning is handled by handleTextClick
          if (!isFocused) {
            console.log('🎯 CustomInput: Setting focus from outer div click');
            setFocusWithProtection(e.target as Element);
          }
        }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onAuxClick={(e) => {
          if (e.button === 2) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div 
          style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '40px',
            fontSize: `${currentFontSize}px`,
            lineHeight: '1'
          }}
        >
          {/* Text with selection highlighting */}
          <span 
            onClick={handleTextClick}
            style={{ fontSize: `${currentFontSize}px`, lineHeight: '1', position: 'relative' }}
          >
            {(() => {
              const hasSelection = selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd;
              if (!hasSelection) {
                return value;
              }
              
              const start = Math.min(selectionStart!, selectionEnd!);
              const end = Math.max(selectionStart!, selectionEnd!);
              const beforeSelection = value.slice(0, start);
              const selectedText = value.slice(start, end);
              const afterSelection = value.slice(end);
              
              return (
                <>
                  {beforeSelection}
                  <span
                    style={{
                      backgroundColor: '#007AFF',
                      color: 'white',
                      borderRadius: '2px'
                    }}
                  >
                    {selectedText}
                  </span>
                  {afterSelection}
                </>
              );
            })()}
          </span>
          
          {/* Visual cursor */}
          {isFocused && showCursor && (
            <span
              ref={cursorRef}
              style={{
                position: 'absolute',
                left: `${cursorLeftPosition - 1}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0.5px',
                height: `${currentFontSize}px`,
                backgroundColor: '#007AFF',
                animation: 'blink 1s infinite',
                pointerEvents: 'none',
                zIndex: 1000
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}));

export { CustomInput };
