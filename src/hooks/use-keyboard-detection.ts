import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSignal, viewport } from '@telegram-apps/sdk-react';

// Global state to prevent reset on hook re-initialization
let globalIsInputActive = false;
const globalInputActiveListeners = new Set<(value: boolean) => void>();

// Separate global state for input focus that's independent of viewport
let globalInputFocused = false;
const globalInputFocusedListeners = new Set<(value: boolean) => void>();

// Reset global state on module reload (for development)
if (typeof window !== 'undefined' && (window as any).__GLOBAL_STATE_RESET) {
  globalIsInputActive = false;
  globalInputFocused = false;
  globalInputActiveListeners.clear();
  globalInputFocusedListeners.clear();
  (window as any).__GLOBAL_STATE_RESET = false;
}

export function useKeyboardDetection() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isViewportExpanded, setIsViewportExpanded] = useState(false);
  const [isInBrowser, setIsInBrowser] = useState(false);
  const [mockViewportExpanded, setMockViewportExpanded] = useState(true);
  const [isInputActive, setIsInputActive] = useState(globalIsInputActive);
  const [isInputFocused, setIsInputFocused] = useState(globalInputFocused);
  
  // Get viewport expansion state from Telegram SDK
  const telegramIsExpanded = useSignal(viewport.isExpanded);

  // Sync with global state
  useEffect(() => {
    const listener = (value: boolean) => {
      setIsInputActive(value);
    };
    
    globalInputActiveListeners.add(listener);
    setIsInputActive(globalIsInputActive);
    
    return () => {
      globalInputActiveListeners.delete(listener);
    };
  }, []);

  // Sync with global input focused state
  useEffect(() => {
    const listener = (value: boolean) => {
      setIsInputFocused(value);
    };
    
    globalInputFocusedListeners.add(listener);
    setIsInputFocused(globalInputFocused);
    
    return () => {
      globalInputFocusedListeners.delete(listener);
    };
  }, []);

  // Force sync with global state on every render
  useEffect(() => {
    if (isInputFocused !== globalInputFocused) {
      setIsInputFocused(globalInputFocused);
    }
  }, [isInputFocused]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if we're in a browser (not Telegram)
    const isInTelegram = window.location.search.includes('tgWebAppPlatform') || 
                        window.location.hash.includes('tgWebAppPlatform') ||
                        (window as any).Telegram?.WebApp;
    
    setIsInBrowser(!isInTelegram);
    
    let initialViewportHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // Consider keyboard open if viewport height decreased by more than 150px
        const keyboardOpen = heightDifference > 150;
        setIsKeyboardOpen(keyboardOpen);
        
        // Update initial height when keyboard closes
        if (!keyboardOpen) {
          initialViewportHeight = currentHeight;
        }
      }, 100);
    };

    // Listen for viewport changes
    window.addEventListener('resize', handleResize);
    
    // Also listen for visual viewport changes (more accurate for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  // Listen for mock viewport changes from console
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMockViewportChange = (event: CustomEvent) => {
      setMockViewportExpanded(event.detail.isExpanded);
    };

    window.addEventListener('mockViewportChanged', handleMockViewportChange as EventListener);
    
    return () => {
      window.removeEventListener('mockViewportChanged', handleMockViewportChange as EventListener);
    };
  }, []);

  // Update viewport expansion state
  useEffect(() => {
    // Only update viewport expansion if it's actually different
    if (isInBrowser) {
      // In browser, use mock state unless keyboard is open, OR if input is focused (for custom keyboard)
      const newViewportExpanded = (mockViewportExpanded && !isKeyboardOpen) || isInputFocused;
      if (newViewportExpanded !== isViewportExpanded) {
        setIsViewportExpanded(newViewportExpanded);
      }
    } else {
      // In Telegram, use the actual Telegram SDK state (TMA viewport expansion is handled by setInputFocused)
      const newViewportExpanded = Boolean(telegramIsExpanded);
      if (newViewportExpanded !== isViewportExpanded) {
        setIsViewportExpanded(newViewportExpanded);
      }
    }
  }, [telegramIsExpanded, isInBrowser, isKeyboardOpen, mockViewportExpanded, isInputActive, isViewportExpanded, isInputFocused]); // Include all dependencies

  // Functions to control input active state
  const setInputActive = useCallback((active: boolean) => {
    globalIsInputActive = active;
    
    // Notify all listeners
    globalInputActiveListeners.forEach((listener) => {
      listener(active);
    });
  }, []);

  // Separate function for input focus that doesn't affect viewport
  const setInputFocused = useCallback((focused: boolean) => {
    globalInputFocused = focused;
    
    // Handle TMA viewport expansion when input is focused
    if (focused && !isInBrowser) {
      try {
        viewport.expand();
      } catch (error) {
        console.error('Failed to expand TMA viewport:', error);
      }
    }
    
    // Notify all listeners
    globalInputFocusedListeners.forEach((listener) => {
      try {
        listener(focused);
      } catch (error) {
        console.error('Error in input focused listener:', error);
      }
    });
  }, [isInBrowser]);

  // Handle viewport becoming compact - auto-close input focus
  useEffect(() => {
    // Only auto-close if viewport was previously expanded and now became compact
    // AND it's not due to input focus (which would make isInputFocused true)
    // This prevents interference with normal focus behavior
    const viewportBecameCompact = !isViewportExpanded && !isKeyboardOpen;
    
    // Don't auto-close if the input is focused - this means the custom keyboard is open
    // and we want to keep it open
    if (viewportBecameCompact && isInputFocused) {
      return;
    }
    
    // Only auto-close if viewport became compact and input is NOT focused
    // This handles cases where the viewport becomes compact due to external factors
    if (viewportBecameCompact && !isInputFocused) {
      // No action needed since input is not focused
    }
  }, [isViewportExpanded, isKeyboardOpen, isInputFocused, setInputFocused]);

  // Track isInputActive state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // isInputActive state changed
  }, [isInputActive]);

  // Track isInputFocused state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // isInputFocused state changed
  }, [isInputFocused]);

  // Debug logging (removed for production)
  useEffect(() => {
    // Viewport state tracking - no logging needed
  }, [isKeyboardOpen, isViewportExpanded, isInBrowser, mockViewportExpanded, isInputFocused, isInputActive]); // Include all dependencies

  // Memoize the return object to prevent unnecessary re-renders
  const shouldBeCompact = useMemo(() => {
    const result = isInputFocused || (!isKeyboardOpen && !isViewportExpanded);
    return result;
  }, [isInputFocused, isKeyboardOpen, isViewportExpanded]);

  // Set isKeyboardOpen to true when input is focused (for custom keyboard)
  // This handles the custom keyboard case where viewport height doesn't change
  useEffect(() => {
    if (isInputFocused) {
      setIsKeyboardOpen(true);
    } else {
      setIsKeyboardOpen(false);
    }
  }, [isInputFocused]);

  // Removed auto-focus mechanism to prevent excessive re-renders

  // Return object with both individual states and combined state
  return useMemo(() => ({
    isKeyboardOpen,
    isViewportExpanded,
    isInBrowser,
    isInputActive,
    setInputActive,
    setInputFocused,
    isInputFocused,
    shouldBeCompact
  }), [isKeyboardOpen, isViewportExpanded, isInBrowser, isInputActive, setInputActive, setInputFocused, isInputFocused, shouldBeCompact]);
}
