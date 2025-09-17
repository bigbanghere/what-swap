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
  const [hasMounted, setHasMounted] = useState(false);
  const shouldBeFocusedRef = useRef(false);
  
  console.log('🔍 CustomInput render - isFocused:', isFocused, 'shouldBeFocusedRef:', shouldBeFocusedRef.current);
  
  // Track when component has mounted
  useEffect(() => {
    setHasMounted(true);
    
    // Cleanup on unmount
    return () => {
      shouldBeFocusedRef.current = false;
    };
  }, []);

  // Restore focus if we should be focused but aren't (due to re-render)
  useEffect(() => {
    if (hasMounted && shouldBeFocusedRef.current && !isFocused) {
      console.log('🔍 CustomInput restoring focus after re-render');
      // Use a small delay to ensure the layout transition is complete
      const timeoutId = setTimeout(() => {
        console.log('🔍 CustomInput setting focus to true after timeout');
        setIsFocused(true);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasMounted, isFocused]);

  // Also check on every render if we should be focused
  useEffect(() => {
    if (hasMounted && shouldBeFocusedRef.current && !isFocused) {
      console.log('🔍 CustomInput render effect - restoring focus');
      setIsFocused(true);
    }
  }, [hasMounted, isFocused]);

  // Track focus state changes
  useEffect(() => {
    // Focus state changed - no additional logging needed
  }, [isFocused]);

  // Ensure cursor is properly positioned when focused
  useEffect(() => {
    if (isFocused && cursorRef.current) {
      // Cursor element is mounted and should be visible
    }
  }, [isFocused]);

  // Custom input doesn't use browser focus - we manage focus state manually

  // Handle click outside to unfocus - only unfocus when clicking truly outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isFocused) {
        return;
      }
      
      const target = event.target as Element;
      
      // Check if click was on our input or keyboard
      const isInputClick = inputRef.current?.contains(target);
      const isKeyboardClick = target?.closest('[data-custom-keyboard]') !== null;
      
      if (!isInputClick && !isKeyboardClick) {
        shouldBeFocusedRef.current = false;
        setIsFocused(false);
      }
    };

    if (isFocused) {
      // Add a small delay to prevent immediate unfocus when clicking the input itself
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true); // Use capture phase
        document.addEventListener('touchstart', handleClickOutside, true);
      }, 50); // Reduced delay

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside, true);
        document.removeEventListener('touchstart', handleClickOutside, true);
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
        // Handle character input
        if (e.key.length === 1) {
          if (maxLength && value.length >= maxLength) return;
          
          // For number type, only allow digits and decimal point
          if (type === 'number') {
            if (!/^[0-9.]$/.test(e.key)) return;
            // Prevent multiple decimal points
            if (e.key === '.' && value.includes('.')) return;
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
        // Convert to React event and call our handler
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

  // Notify parent component when focus state changes (only after mount and only when state actually changes)
  useEffect(() => {
    console.log('🔍 CustomInput focus change effect - hasMounted:', hasMounted, 'isFocused:', isFocused, 'prevIsFocused:', prevIsFocused.current);
    
    if (!hasMounted) {
      console.log('🔍 CustomInput not calling onFocusChange - component not mounted yet');
      return;
    }
    
    // Only call onFocusChange if the focus state actually changed
    if (prevIsFocused.current === isFocused) {
      console.log('🔍 CustomInput focus state unchanged, not calling onFocusChange');
      return;
    }
    
    console.log('🔍 CustomInput calling onFocusChange with:', isFocused);
    if (onFocusChange) {
      onFocusChange(Boolean(isFocused));
      console.log('🔍 CustomInput onFocusChange called successfully');
    } else {
      console.log('🔍 CustomInput onFocusChange is undefined');
    }
    
    // Update the previous state
    prevIsFocused.current = isFocused;
  }, [isFocused, onFocusChange, hasMounted]);

  // Update cursor position when value changes
  useEffect(() => {
    setCursorPosition(value.length);
  }, [value]);

  // Handle click to focus
  const handleClick = (e: React.MouseEvent) => {
    console.log('🔍 CustomInput handleClick - setting focus to true');
    e.preventDefault();
    e.stopPropagation();
    shouldBeFocusedRef.current = true;
    setIsFocused(true);
    setCursorPosition(value.length);
    console.log('🔍 CustomInput handleClick - focus set to true, cursor position:', value.length);
  };

  // Handle click to position cursor
  const handleTextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inputRef.current) return;
    
    const rect = inputRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    // Simple approximation of cursor position based on character width
    const charWidth = rect.width / Math.max(value.length || 1, 1);
    const approximatePosition = Math.round(clickX / charWidth);
    setCursorPosition(Math.max(0, Math.min(value.length, approximatePosition)));
    
    // Ensure focus is maintained
    if (!isFocused) {
      shouldBeFocusedRef.current = true;
      setIsFocused(true);
    }
  };

  // Split value at cursor position for rendering
  const beforeCursor = value.slice(0, cursorPosition);
  const afterCursor = value.slice(cursorPosition);

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
        e.preventDefault();
        e.stopPropagation();
        if (!isFocused) {
          shouldBeFocusedRef.current = true;
          setIsFocused(true);
        }
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isFocused) {
          shouldBeFocusedRef.current = true;
          setIsFocused(true);
        }
      }}
      onKeyDown={handleKeyDown}
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
        <span style={{ fontSize: '33px', lineHeight: '1' }}>{beforeCursor}</span>
        {isFocused && (
          <span
            ref={cursorRef}
            style={{
              display: 'inline-block',
              width: '2px',
              height: '33px',
              backgroundColor: '#1ABCFF',
              marginLeft: '2px',
              animation: 'blink 1s infinite'
            }}
          />
        )}
        <span style={{ fontSize: '33px', lineHeight: '1' }}>{afterCursor}</span>
      </div>
      </div>
    </>
  );
});

export { CustomInput };