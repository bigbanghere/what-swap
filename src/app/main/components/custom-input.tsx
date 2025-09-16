"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

export function CustomInput({
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
  const [hasMounted, setHasMounted] = useState(false);

  // Debug when isFocused changes
  useEffect(() => {
    console.log('🔍 ===== CustomInput isFocused STATE CHANGE =====');
    console.log('🔍 CustomInput isFocused changed to:', isFocused);
    console.log('🔍 CustomInput hasMounted:', hasMounted);
    console.log('🔍 CustomInput isFocused stack trace:', new Error().stack);
    console.log('🔍 ===== END CustomInput isFocused STATE CHANGE =====');
  }, [isFocused, hasMounted]);

  // Track when component has mounted
  useEffect(() => {
    console.log('🔍 CustomInput component mounted');
    console.log('🔍 CustomInput initial isFocused state:', isFocused);
    console.log('🔍 CustomInput initial prevIsFocused.current:', prevIsFocused.current);
    setHasMounted(true);
  }, []);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  console.log('🔍 CustomInput render - isFocused:', isFocused, 'value:', value);

  // Handle cursor blinking - DISABLED FOR DEBUGGING
  useEffect(() => {
    if (isFocused) {
      console.log('🔍 CustomInput setting cursor to visible (no blinking)');
      setShowCursor(true);
    } else {
      console.log('🔍 CustomInput hiding cursor');
      setShowCursor(false);
    }
  }, [isFocused]);

  // Ensure focus is maintained when input is active
  // useEffect(() => {
  //   if (isFocused && inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // }, [isFocused]);

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    console.log('🔍 CustomInput handleKeyDown called with key:', e.key, 'isFocused:', isFocused);
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
      console.log('🔍 CustomInput global keydown event:', e.key, 'isFocused:', isFocused);
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
    if (!hasMounted) {
      console.log('🔍 CustomInput not calling onFocusChange - component not mounted yet');
      return;
    }
    
    // Only call onFocusChange if the focus state actually changed
    if (prevIsFocused.current === isFocused) {
      console.log('🔍 CustomInput focus state unchanged, not calling onFocusChange');
      return;
    }
    
    console.log('🔍 ===== CustomInput FOCUS STATE CHANGE =====');
    console.log('🔍 CustomInput isFocused changed from:', prevIsFocused.current, 'to:', isFocused);
    console.log('🔍 CustomInput calling onFocusChange with:', isFocused);
    console.log('🔍 CustomInput onFocusChange callback:', onFocusChange);
    console.log('🔍 CustomInput onFocusChange callback type:', typeof onFocusChange);
    if (onFocusChange) {
      onFocusChange(isFocused);
      console.log('🔍 CustomInput onFocusChange completed');
    } else {
      console.log('🔍 CustomInput onFocusChange is undefined, not calling');
    }
    console.log('🔍 ===== END CustomInput FOCUS STATE CHANGE =====');
    
    // Update the previous state
    prevIsFocused.current = isFocused;
  }, [isFocused, onFocusChange, hasMounted]);

  // Update cursor position when value changes
  useEffect(() => {
    setCursorPosition(value.length);
  }, [value]);

  // Handle click to focus
  const handleClick = (e: React.MouseEvent) => {
    console.log('🔍 ===== CustomInput CLICK HANDLER =====');
    console.log('🔍 CustomInput handleClick called');
    console.log('🔍 CustomInput handleClick stack trace:', new Error().stack);
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 CustomInput setting isFocused to true');
    setIsFocused(true);
    setCursorPosition(value.length);
    console.log('🔍 CustomInput handleClick completed');
    console.log('🔍 ===== END CustomInput CLICK HANDLER =====');
  };

  // No blur handler needed - we handle focus through clicks only

  // Handle click to position cursor
  const handleTextClick = (e: React.MouseEvent) => {
    console.log('🔍 CustomInput handleTextClick called, isFocused:', isFocused);
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
      console.log('🔍 CustomInput handleTextClick setting isFocused to true');
      setIsFocused(true);
    }
    console.log('🔍 CustomInput handleTextClick completed');
  };

  // Split value at cursor position for rendering
  const beforeCursor = value.slice(0, cursorPosition);
  const afterCursor = value.slice(cursorPosition);

  return (
    <div
      ref={inputRef}
      className={`${className}`}
      style={{
        ...style,
        cursor: 'text',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {value || placeholder ? (
        <div 
          onClick={handleTextClick} 
          style={{ 
            position: 'relative',
            display: 'inline-block',
            width: '100%'
          }}
        >
          <span style={{ display: 'inline' }}>{beforeCursor}</span>
          {isFocused && (
            <span
              ref={cursorRef}
              style={{
                display: 'inline-block',
                width: '2px',
                height: '32px',
                backgroundColor: '#1ABCFF',
                marginLeft: '1px',
                verticalAlign: 'top'
              }}
            />
          )}
          <span style={{ display: 'inline' }}>{afterCursor}</span>
        </div>
      ) : (
        <div style={{ color: '#9CA3AF' }}>
          {placeholder}
          {isFocused && (
            <span
              ref={cursorRef}
              style={{
                display: 'inline-block',
                width: '2px',
                height: '32px',
                backgroundColor: '#1ABCFF',
                marginLeft: '4px',
                verticalAlign: 'top'
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
