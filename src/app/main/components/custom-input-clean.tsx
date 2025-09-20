"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  type?: 'text' | 'number';
  onFocusChange?: (isFocused: boolean) => void;
}

const CustomInput = memo(function CustomInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  style = {},
  maxLength,
  type = 'text',
  onFocusChange
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const justFocusedRef = useRef(false);
  const justFocusedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusClickTargetRef = useRef<Element | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const shouldBeFocusedRef = useRef(false);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [cursorLeftPosition, setCursorLeftPosition] = useState(0);
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  const hasMovedDuringTouch = useRef<boolean>(false);
  const lastTouchEndTime = useRef<number>(0);
  
  // Helper function to set focus with justFocused protection
  const setFocusWithProtection = useCallback((clickTarget?: Element) => {
    const wasUnfocused = !isFocused;
    
    shouldBeFocusedRef.current = true;
    setIsFocused(true);
    
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
      
      if (!isInputClick && !isKeyboardClick && !isButtonClick) {
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

    switch (e.key) {
      case 'Backspace':
        if (cursorPosition > 0) {
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
        setCursorPosition(Math.max(0, cursorPosition - 1));
        break;
      case 'ArrowRight':
        setCursorPosition(Math.min(value.length, cursorPosition + 1));
        break;
      case 'Home':
        setCursorPosition(0);
        break;
      case 'End':
        setCursorPosition(value.length);
        break;
      case 'Escape':
        shouldBeFocusedRef.current = false;
        setIsFocused(false);
        break;
      default:
        if (e.key.length === 1) {
          if (maxLength && value.length >= maxLength) return;
          
          if (type === 'number') {
            if (!/^[0-9.]$/.test(e.key)) return;
            if (e.key === '.' && value.includes('.')) return;
            
            if (e.key === '.' && value === '') {
              const newValue = '0.';
              onChange(newValue);
              setCursorPosition(2);
              return;
            }
          }
          
          const newValue = value.slice(0, cursorPosition) + e.key + value.slice(cursorPosition);
          onChange(newValue);
          setCursorPosition(cursorPosition + 1);
        }
        break;
    }
  }, [isFocused, cursorPosition, value, onChange, maxLength, type]);

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
    
    if (onFocusChange) {
      onFocusChange(Boolean(isFocused));
    }
    
    prevIsFocused.current = isFocused;
  }, [isFocused, onFocusChange, hasMounted]);

  // Update cursor position when value changes
  useEffect(() => {
    if (cursorPosition > value.length) {
      setCursorPosition(value.length);
    }
  }, [value, cursorPosition]);

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
    tempElement.style.fontSize = '33px';
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
  }, [cursorPosition, value]);

  // Handle click to focus
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusWithProtection(e.target as Element);
    setCursorPosition(value.length);
  };

  // Handle click to position cursor
  const handleTextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!inputRef.current) return;
    
    const rect = inputRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    const bestPosition = calculateCursorPosition(clickX);
    
    setCursorPosition(bestPosition);
    
    if (!isFocused) {
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
    if (!inputRef.current) return 0;
    
    const rect = inputRef.current.getBoundingClientRect();
    const textElement = inputRef.current.querySelector('span');
    
    if (!textElement) {
      const charWidth = rect.width / Math.max(value.length || 1, 1);
      const approximatePosition = Math.round(clickX / charWidth);
      return Math.max(0, Math.min(value.length, approximatePosition));
    }
    
    let bestPosition = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i <= value.length; i++) {
      const testText = value.slice(0, i);
      
      const tempElement = document.createElement('span');
      tempElement.style.fontSize = '33px';
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
    }
    
    return bestPosition;
  }, [value]);

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
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
          if (!isFocused) {
            setFocusWithProtection(e.target as Element);
          }
        }}
        onClick={(e) => {
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
          if (!isFocused) {
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
          onClick={handleTextClick} 
          style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '40px',
            fontSize: '33px',
            lineHeight: '1'
          }}
        >
          <span style={{ fontSize: '33px', lineHeight: '1' }}>{value}</span>
          {isFocused && (
            <span
              ref={cursorRef}
              style={{
                position: 'absolute',
                left: `${cursorLeftPosition - 1}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1px',
                height: '33px',
                backgroundColor: '#1ABCFF',
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
});

export { CustomInput };






