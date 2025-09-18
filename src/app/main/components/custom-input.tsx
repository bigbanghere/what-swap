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
  
  console.log('🔍 CustomInput render - isFocused:', isFocused, 'shouldBeFocusedRef:', shouldBeFocusedRef.current, 'cursorLeftPosition:', cursorLeftPosition);
  
  // Helper function to set focus with justFocused protection
  const setFocusWithProtection = useCallback((clickTarget?: Element) => {
    // Only set justFocused flag if we're transitioning from unfocused to focused
    const wasUnfocused = !isFocused;
    
    console.log('🔍 setFocusWithProtection called:', {
      wasUnfocused,
      currentIsFocused: isFocused,
      justFocusedRef: justFocusedRef.current,
      clickTarget: clickTarget?.tagName,
      timestamp: Date.now()
    });
    
    // Set the focus
    shouldBeFocusedRef.current = true;
    setIsFocused(true);
    
    // Only set the protection flag if we were unfocused before
    if (wasUnfocused) {
      // Clear any existing timeout
      if (justFocusedTimeoutRef.current) {
        clearTimeout(justFocusedTimeoutRef.current);
      }
      
      justFocusedRef.current = true;
      lastFocusClickTargetRef.current = clickTarget || null;
      console.log('🔍 Setting justFocusedRef to true for transition from unfocused to focused, clickTarget:', clickTarget?.tagName);
      
      // Reset the justFocused flag after a much longer delay to ensure click outside handler has time to attach and run
      justFocusedTimeoutRef.current = setTimeout(() => {
        console.log('🔍 Resetting justFocusedRef to false after timeout');
        justFocusedRef.current = false;
        lastFocusClickTargetRef.current = null;
        justFocusedTimeoutRef.current = null;
      }, 500); // Increased to 500ms to ensure click outside handler has plenty of time to attach and run
    } else {
      console.log('🔍 Input was already focused, not setting justFocusedRef protection');
    }
  }, [isFocused]);

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
        setFocusWithProtection();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasMounted, isFocused, setFocusWithProtection]);

  // Also check on every render if we should be focused
  useEffect(() => {
    if (hasMounted && shouldBeFocusedRef.current && !isFocused) {
      console.log('🔍 CustomInput render effect - restoring focus');
      setFocusWithProtection();
    }
  }, [hasMounted, isFocused, setFocusWithProtection]);

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
      console.log('🔍 Click outside handler called:', {
        isFocused,
        justFocusedRef: justFocusedRef.current,
        eventType: event.type,
        target: (event.target as Element)?.tagName,
        timestamp: Date.now()
      });
      
      if (!isFocused) {
        console.log('🔍 Not focused, ignoring click outside');
        return;
      }
      
      // Ignore the click that just caused the focus
      if (justFocusedRef.current) {
        console.log('🔍 Ignoring click outside - this click just caused the focus, justFocusedRef:', justFocusedRef.current);
        return;
      }
      
      // Also ignore if this is the same click target that caused the focus
      if (lastFocusClickTargetRef.current && event.target === lastFocusClickTargetRef.current) {
        console.log('🔍 Ignoring click outside - this is the same click target that caused the focus');
        return;
      }
      
      const target = event.target as Element;
      
      // Check if click was on our input or keyboard
      const isInputClick = inputRef.current?.contains(target);
      const isKeyboardClick = target?.closest('[data-custom-keyboard]') !== null;
      
      // Don't unfocus if clicking on buttons (like connect button)
      const isButtonClick = target?.closest('button') !== null || 
                           target?.closest('[role="button"]') !== null ||
                           target?.closest('.cursor-pointer') !== null;
      
      console.log('🔍 Click outside check:', {
        isInputClick,
        isKeyboardClick,
        isButtonClick,
        target: target?.tagName,
        className: target?.className,
        id: target?.id,
        dataCustomKeyboard: target?.closest('[data-custom-keyboard]') !== null
      });
      
      if (!isInputClick && !isKeyboardClick && !isButtonClick) {
        console.log('🔍 Unfocusing input due to click outside');
        shouldBeFocusedRef.current = false;
        setIsFocused(false);
      } else {
        console.log('🔍 Keeping input focused - click was on protected element');
      }
    };

    if (isFocused) {
      // Add a small delay to prevent immediate unfocus when clicking the input itself
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, false); // Use bubble phase to allow button clicks first
        document.addEventListener('touchstart', handleClickOutside, false);
      }, 10); // Reduced delay to 10ms to attach handler quickly

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
        // Handle character input
        if (e.key.length === 1) {
          if (maxLength && value.length >= maxLength) return;
          
          // For number type, only allow digits and decimal point
          if (type === 'number') {
            if (!/^[0-9.]$/.test(e.key)) return;
            // Prevent multiple decimal points
            if (e.key === '.' && value.includes('.')) return;
            
            // If user types "." on empty input, prepend "0"
            if (e.key === '.' && value === '') {
              const newValue = '0.';
              onChange(newValue);
              setCursorPosition(2); // Position cursor after "0."
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

  // Update cursor position when value changes (only if cursor is beyond the new length)
  useEffect(() => {
    // Only adjust cursor if it's beyond the new value length
    // This prevents cursor from jumping to end when typing in the middle
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
    
    // Use a more accurate method by measuring the actual text width
    const textElement = inputRef.current.querySelector('span');
    if (!textElement) {
      setCursorLeftPosition(0);
      return;
    }
    
    // Create a temporary element to measure character widths
    const tempElement = document.createElement('span');
    tempElement.style.fontSize = '33px';
    tempElement.style.lineHeight = '1';
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempElement);
    
    // Measure the width of text before cursor
    const beforeText = value.slice(0, cursorPosition);
    tempElement.textContent = beforeText;
    const beforeWidth = tempElement.getBoundingClientRect().width;
    
    document.body.removeChild(tempElement);
    
    console.log('🔍 Updating cursor position:', {
      value,
      cursorPosition,
      beforeText,
      beforeWidth,
      containerWidth: inputRef.current.getBoundingClientRect().width
    });
    
    // Ensure cursor stays within bounds
    const containerWidth = inputRef.current.getBoundingClientRect().width;
    let finalPosition = Math.max(0, Math.min(beforeWidth, containerWidth - 2));
    
    // Fallback: if measurement failed, use simple character-based calculation
    if (beforeWidth === 0 && cursorPosition > 0) {
      const charWidth = containerWidth / value.length;
      finalPosition = Math.max(0, Math.min(cursorPosition * charWidth, containerWidth - 2));
    }
    
    console.log('🔍 Final cursor position:', {
      beforeWidth,
      finalPosition,
      containerWidth,
      cursorPosition,
      valueLength: value.length
    });
    
    setCursorLeftPosition(finalPosition);
  }, [cursorPosition, value]);

  // Handle click to focus
  const handleClick = (e: React.MouseEvent) => {
    console.log('🔍 CustomInput handleClick called:', {
      isFocused,
      justFocusedRef: justFocusedRef.current,
      timestamp: Date.now(),
      target: e.target
    });
    e.preventDefault();
    e.stopPropagation();
    setFocusWithProtection(e.target as Element);
    setCursorPosition(value.length);
    console.log('🔍 CustomInput handleClick completed:', {
      justFocusedRef: justFocusedRef.current,
      cursorPosition: value.length
    });
  };

  // Handle click to position cursor
  const handleTextClick = (e: React.MouseEvent) => {
    // Only prevent default for text positioning, allow other interactions
    e.preventDefault();
    
    
    if (!inputRef.current) return;
    
    const rect = inputRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    const bestPosition = calculateCursorPosition(clickX);
    
    console.log('🔍 Mouse cursor positioning:', {
      clickX,
      value,
      bestPosition,
      containerWidth: rect.width
    });
    
    setCursorPosition(bestPosition);
    
    // Ensure focus is maintained
    if (!isFocused) {
      console.log('🔍 handleTextClick - setting focus, justFocusedRef before:', justFocusedRef.current);
      setFocusWithProtection(e.target as Element);
      console.log('🔍 handleTextClick - focus set, justFocusedRef after:', justFocusedRef.current);
    }
  };

  // Split value at cursor position for rendering
  const beforeCursor = value.slice(0, cursorPosition);
  const afterCursor = value.slice(cursorPosition);

  // Validate clipboard content for amount input
  const validateClipboardContent = (clipboardText: string): boolean => {
    if (type === 'number') {
      // For number input, only allow valid decimal numbers
      const cleanText = clipboardText.replace(/[^0-9.]/g, '');
      const isValidNumber = cleanText && !isNaN(parseFloat(cleanText)) && isFinite(parseFloat(cleanText));
      
      if (!isValidNumber) {
        console.log('🔍 Clipboard validation failed for number input:', clipboardText);
        return false;
      }
    } else {
      // For text input, allow any non-empty content
      if (!clipboardText || clipboardText.trim() === '') {
        console.log('🔍 Clipboard validation failed: empty content');
        return false;
      }
    }
    
    console.log('🔍 Clipboard validation passed:', clipboardText);
    return true;
  };

  // Calculate cursor position based on X coordinate
  const calculateCursorPosition = useCallback((clickX: number): number => {
    if (!inputRef.current) return 0;
    
    const rect = inputRef.current.getBoundingClientRect();
    const textElement = inputRef.current.querySelector('span');
    
    if (!textElement) {
      // Fallback to simple calculation
      const charWidth = rect.width / Math.max(value.length || 1, 1);
      const approximatePosition = Math.round(clickX / charWidth);
      return Math.max(0, Math.min(value.length, approximatePosition));
    }
    
    // Accurate positioning using character measurement
    let bestPosition = 0;
    let minDistance = Infinity;
    
    // Test each possible cursor position
    for (let i = 0; i <= value.length; i++) {
      const testText = value.slice(0, i);
      
      // Create temporary element to measure text width
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
      
      // Calculate distance from click point to this position
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
    // Only prevent context menu on the input itself
    e.preventDefault();
    e.stopPropagation();
    
    if (!isFocused) {
      console.log('🔍 handleContextMenu - setting focus, justFocusedRef before:', justFocusedRef.current);
      setFocusWithProtection(e.target as Element);
      console.log('🔍 handleContextMenu - focus set, justFocusedRef after:', justFocusedRef.current);
    }
  };

  // Handle touch events for cursor positioning and long press
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('🔍 Touch start detected');
    
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    const touch = e.touches[0];
    dragStartPosition.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();
    hasMovedDuringTouch.current = false;
    
    console.log('🔍 Touch start - setting up long press timer');
    
    // Set up long press timer for paste menu
    longPressTimer.current = setTimeout(async () => {
      console.log('🔍 Long press timer triggered, hasMovedDuringTouch:', hasMovedDuringTouch.current);
      
      // Show paste menu even if there was small movement, but not if there was significant movement
      // Reset the movement flag to allow paste menu to show
      if (hasMovedDuringTouch.current) {
        console.log('🔍 Movement detected during long press, but allowing paste menu anyway for small movements');
        // For now, always allow paste menu to show even with movement
        // The movement threshold in handleTouchMove will prevent it if movement was too significant
        hasMovedDuringTouch.current = false;
      }
      
      // Start cursor dragging mode if user moved during long press
      if (hasMovedDuringTouch.current) {
        console.log('🔍 Long tap + move: Starting cursor drag mode');
        setIsDraggingCursor(true);
      }
    }, 500); // 500ms long press
  };

  // Handle touch move for cursor dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    
    // Only mark as moved if there's significant movement
    if (dragStartPosition.current && !hasMovedDuringTouch.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - dragStartPosition.current.x);
      const deltaY = Math.abs(touch.clientY - dragStartPosition.current.y);
      
      // Increase threshold to 15px to be more tolerant of small movements
      // Also check if we're in the middle of a long press (more than 300ms)
      const timeSinceTouchStart = Date.now() - touchStartTime.current;
      const isDuringLongPress = timeSinceTouchStart > 300;
      
      // Only mark as moved if user moved more than 15px, or 10px if not during long press
      const movementThreshold = isDuringLongPress ? 15 : 10;
      
      if (deltaX > movementThreshold || deltaY > movementThreshold) {
        hasMovedDuringTouch.current = true;
        console.log('🔍 Touch movement detected, marking as moved:', {
          deltaX,
          deltaY,
          threshold: movementThreshold,
          isDuringLongPress,
          timeSinceTouchStart
        });
      }
    }
    
    // If we're already in drag mode, handle cursor positioning
    if (isDraggingCursor && inputRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const rect = inputRef.current.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      
      const bestPosition = calculateCursorPosition(clickX);
      
      console.log('🔍 Touch drag cursor positioning:', {
        clickX,
        value,
        bestPosition,
        containerWidth: rect.width
      });
      
      setCursorPosition(bestPosition);
    }
    // If not in drag mode but user moved significantly, start drag mode
    else if (dragStartPosition.current && !isDraggingCursor && hasMovedDuringTouch.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - dragStartPosition.current.x);
      const deltaY = Math.abs(touch.clientY - dragStartPosition.current.y);
      
      // If user moved more than 10px, start cursor dragging
      if (deltaX > 10 || deltaY > 10) {
        console.log('🔍 Significant touch movement detected, starting cursor drag mode');
        setIsDraggingCursor(true);
        
        // Clear the long press timer since we're now dragging
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
    
    
    // Clear long press timer if touch ends before 500ms
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      
      // This was a short tap - position cursor (only if not dragging)
      if (!isDraggingCursor && inputRef.current) {
        const touch = e.changedTouches[0];
        const rect = inputRef.current.getBoundingClientRect();
        const clickX = touch.clientX - rect.left;
        
        const bestPosition = calculateCursorPosition(clickX);
        
        console.log('🔍 Short tap cursor positioning:', {
          clickX,
          value,
          bestPosition,
          containerWidth: rect.width
        });
        
        setCursorPosition(bestPosition);
        
        // Ensure focus is maintained
        if (!isFocused) {
          console.log('🔍 handleTouchEnd - setting focus, justFocusedRef before:', justFocusedRef.current);
          setFocusWithProtection(e.target as Element);
          console.log('🔍 handleTouchEnd - focus set, justFocusedRef after:', justFocusedRef.current);
        }
      }
    }
    
    // Stop dragging
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
      
      console.log('🔍 Global touch drag cursor positioning:', {
        clickX,
        value,
        bestPosition,
        containerWidth: rect.width
      });
      
      setCursorPosition(bestPosition);
    };

    const handleGlobalTouchEnd = () => {
      if (isDraggingCursor) {
        console.log('🔍 Global touch end - stopping cursor drag');
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
        // Only prevent default for the input area itself, not child elements
        if (e.target === inputRef.current) {
          e.preventDefault();
        }
        if (!isFocused) {
          console.log('🔍 onMouseDown - setting focus, justFocusedRef before:', justFocusedRef.current);
          setFocusWithProtection(e.target as Element);
          console.log('🔍 onMouseDown - focus set, justFocusedRef after:', justFocusedRef.current);
        }
      }}
      onClick={(e) => {
        // Only prevent default for the input area itself, not child elements
        if (e.target === inputRef.current) {
          e.preventDefault();
        }
        if (!isFocused) {
          console.log('🔍 onClick - setting focus, justFocusedRef before:', justFocusedRef.current);
          setFocusWithProtection(e.target as Element);
          console.log('🔍 onClick - focus set, justFocusedRef after:', justFocusedRef.current);
        }
      }}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      onAuxClick={(e) => {
        // Prevent middle mouse button context menu
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
            onLoad={() => console.log('🔍 Cursor span loaded with position:', cursorLeftPosition)}
          />
        )}
      </div>
      
      </div>
    </>
  );
});

export { CustomInput };