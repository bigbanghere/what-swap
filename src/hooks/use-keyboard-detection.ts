import { useState, useEffect, useRef, useCallback } from 'react';
import { useSignal, viewport } from '@telegram-apps/sdk-react';

// Global state to prevent reset on hook re-initialization
let globalIsInputActive = false;
const globalInputActiveListeners = new Set<(value: boolean) => void>();

// Separate global state for input focus that's independent of viewport
let globalInputFocused = false;
const globalInputFocusedListeners = new Set<(value: boolean) => void>();

// Console logging for global state changes
console.log('🔍 Global state initialized - globalIsInputActive:', globalIsInputActive, 'globalInputFocused:', globalInputFocused);

// Reset global state on module reload (for development)
if (typeof window !== 'undefined' && (window as any).__GLOBAL_STATE_RESET) {
  console.log('🔍 Resetting global state due to module reload');
  globalIsInputActive = false;
  globalInputFocused = false;
  globalInputActiveListeners.clear();
  globalInputFocusedListeners.clear();
  (window as any).__GLOBAL_STATE_RESET = false;
}

export function useKeyboardDetection() {
  console.log('🔍 useKeyboardDetection hook initialized/re-rendered');
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
      console.log('🔍 Global isInputActive listener triggered with:', value);
      setIsInputActive(value);
    };
    
    console.log('🔍 Adding isInputActive listener, total listeners:', globalInputActiveListeners.size);
    globalInputActiveListeners.add(listener);
    console.log('🔍 isInputActive listeners after add:', globalInputActiveListeners.size);
    
    // Set initial value from global state
    console.log('🔍 Setting initial isInputActive from global state:', globalIsInputActive);
    setIsInputActive(globalIsInputActive);
    
    return () => {
      console.log('🔍 Removing isInputActive listener, total listeners before:', globalInputActiveListeners.size);
      globalInputActiveListeners.delete(listener);
      console.log('🔍 isInputActive listeners after remove:', globalInputActiveListeners.size);
    };
  }, []);

  // Sync with global input focused state
  useEffect(() => {
    const listener = (value: boolean) => {
      console.log('🔍 Global isInputFocused listener triggered with:', value);
      setIsInputFocused(value);
    };
    
    console.log('🔍 Adding isInputFocused listener, total listeners:', globalInputFocusedListeners.size);
    globalInputFocusedListeners.add(listener);
    console.log('🔍 isInputFocused listeners after add:', globalInputFocusedListeners.size);
    
    // Set initial value from global state
    console.log('🔍 Setting initial isInputFocused from global state:', globalInputFocused);
    setIsInputFocused(globalInputFocused);
    
    return () => {
      console.log('🔍 Removing isInputFocused listener, total listeners before:', globalInputFocusedListeners.size);
      globalInputFocusedListeners.delete(listener);
      console.log('🔍 isInputFocused listeners after remove:', globalInputFocusedListeners.size);
    };
  }, []);

  // Force sync with global state on every render
  useEffect(() => {
    if (isInputFocused !== globalInputFocused) {
      console.log('🔍 Force syncing isInputFocused with global state:', globalInputFocused);
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
    console.log('🔍 Viewport expansion effect running - TRIGGERED BY:', {
      isInBrowser,
      mockViewportExpanded,
      isKeyboardOpen,
      telegramIsExpanded,
      currentIsViewportExpanded: isViewportExpanded,
      currentIsInputActive: isInputActive,
      currentIsInputFocused: isInputFocused
    });
    
    // Only update viewport expansion if it's actually different
    if (isInBrowser) {
      // In browser, use mock state unless keyboard is open, OR if input is focused (for custom keyboard)
      const newViewportExpanded = (mockViewportExpanded && !isKeyboardOpen) || isInputFocused;
      if (newViewportExpanded !== isViewportExpanded) {
        console.log('🔍 Setting isViewportExpanded to:', newViewportExpanded, 'from:', isViewportExpanded);
        console.log('🔍 Viewport expansion reason:', isInputFocused ? 'input focused' : 'normal logic');
        setIsViewportExpanded(newViewportExpanded);
      } else {
        console.log('🔍 Viewport expansion unchanged:', newViewportExpanded);
      }
    } else {
      // In Telegram, use the actual Telegram SDK state (TMA viewport expansion is handled by setInputFocused)
      const newViewportExpanded = Boolean(telegramIsExpanded);
      if (newViewportExpanded !== isViewportExpanded) {
        console.log('🔍 Setting isViewportExpanded to:', newViewportExpanded, 'from:', isViewportExpanded);
        console.log('🔍 TMA viewport expansion handled by setInputFocused, not this effect');
        setIsViewportExpanded(newViewportExpanded);
      } else {
        console.log('🔍 Viewport expansion unchanged:', newViewportExpanded);
      }
    }
  }, [telegramIsExpanded, isInBrowser, isKeyboardOpen, mockViewportExpanded, isInputActive, isViewportExpanded, isInputFocused]); // Include all dependencies

  // Functions to control input active state
  const setInputActive = useCallback((active: boolean) => {
    console.log('🔍 ===== setInputActive CALLED =====');
    console.log('🔍 Input active state change:', globalIsInputActive, '→', active);
    console.log('🔍 setInputActive stack trace:', new Error().stack);
    
    globalIsInputActive = active;
    console.log('🔍 ✅ Global isInputActive state updated to:', globalIsInputActive);
    
    // Notify all listeners
    console.log('🔍 Notifying', globalInputActiveListeners.size, 'listeners about isInputActive change');
    let listenerIndex = 0;
    globalInputActiveListeners.forEach((listener) => {
      console.log(`🔍 Notifying listener ${listenerIndex + 1} with:`, active);
      listener(active);
      listenerIndex++;
    });
    
    console.log('🔍 ===== setInputActive COMPLETED =====');
    console.log('🔍 Final global state - isInputActive:', globalIsInputActive, 'isInputFocused:', globalInputFocused);
  }, []);

  // Separate function for input focus that doesn't affect viewport
  const setInputFocused = useCallback((focused: boolean) => {
    console.log('🔍 ===== setInputFocused CALLED =====');
    console.log('🔍 Input focused state change:', globalInputFocused, '→', focused);
    console.log('🔍 setInputFocused stack trace:', new Error().stack);
    console.log('🔍 setInputFocused called from:', new Error().stack?.split('\n')[2]);
    
    globalInputFocused = focused;
    console.log('🔍 ✅ Global inputFocused state updated to:', globalInputFocused);
    
    // Handle TMA viewport expansion when input is focused
    if (focused && !isInBrowser) {
      console.log('🔍 Expanding TMA viewport for custom keyboard');
      console.log('🔍 Available viewport methods:', Object.keys(viewport));
      console.log('🔍 Current viewport state:', {
        isExpanded: viewport.isExpanded,
        height: viewport.height,
        width: viewport.width
      });
      try {
        viewport.expand();
        console.log('🔍 ✅ TMA viewport expanded successfully');
      } catch (error) {
        console.error('🔍 ❌ Failed to expand TMA viewport:', error);
      }
    } else if (!focused && !isInBrowser) {
      console.log('🔍 Input unfocused - TMA viewport will contract automatically');
      console.log('🔍 Current viewport state:', {
        isExpanded: viewport.isExpanded,
        height: viewport.height,
        width: viewport.width
      });
    }
    
    // Notify all listeners
    console.log('🔍 Notifying', globalInputFocusedListeners.size, 'listeners about isInputFocused change');
    let listenerIndex = 0;
    globalInputFocusedListeners.forEach((listener) => {
      console.log(`🔍 Notifying input focused listener ${listenerIndex + 1} with:`, focused);
      try {
        listener(focused);
        console.log(`🔍 Listener ${listenerIndex + 1} executed successfully`);
      } catch (error) {
        console.error(`🔍 Error in listener ${listenerIndex + 1}:`, error);
      }
      listenerIndex++;
    });
    
    console.log('🔍 ===== setInputFocused COMPLETED =====');
    console.log('🔍 Final global state - isInputActive:', globalIsInputActive, 'isInputFocused:', globalInputFocused);
  }, [isInBrowser]);

  // Track isInputActive state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('🔍 isInputActive state changed to:', isInputActive);
  }, [isInputActive]);

  // Track isInputFocused state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('🔍 isInputFocused state changed to:', isInputFocused);
  }, [isInputFocused]);

  // Debug logging
  useEffect(() => {
    const shouldBeCompactValue = isInputFocused || (!isKeyboardOpen && !isViewportExpanded);
    console.log('🔍 ===== VIEWPORT STATE DEBUG =====');
    console.log('🔍 Current state values:');
    console.log('🔍   isKeyboardOpen:', isKeyboardOpen);
    console.log('🔍   isViewportExpanded:', isViewportExpanded);
    console.log('🔍   isInBrowser:', isInBrowser);
    console.log('🔍   mockViewportExpanded:', mockViewportExpanded);
    console.log('🔍   isInputActive (local):', isInputActive);
    console.log('🔍   isInputFocused (local):', isInputFocused);
    console.log('🔍   globalIsInputActive:', globalIsInputActive);
    console.log('🔍   globalInputFocused:', globalInputFocused);
    console.log('🔍 shouldBeCompact calculation:');
    console.log('🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)');
    console.log('🔍   ', isInputFocused, '|| (', !isKeyboardOpen, '&&', !isViewportExpanded, ')');
    console.log('🔍   ', isInputFocused, '|| (', !isKeyboardOpen && !isViewportExpanded, ')');
    console.log('🔍   =', shouldBeCompactValue);
    console.log('🔍 Viewport expansion for custom keyboard:', isInputFocused ? 'YES (input focused)' : 'NO');
    console.log('🔍 ===== END VIEWPORT STATE DEBUG =====');
  }, [isKeyboardOpen, isViewportExpanded, isInBrowser, mockViewportExpanded, isInputFocused, isInputActive]); // Include all dependencies

  // Return object with both individual states and combined state
  return {
    isKeyboardOpen,
    isViewportExpanded,
    isInBrowser,
    isInputActive,
    setInputActive,
    setInputFocused,
    isInputFocused,
    // shouldBeCompact should be true when input is focused (for custom keyboard) OR when viewport is not expanded
    shouldBeCompact: isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
  };
}
