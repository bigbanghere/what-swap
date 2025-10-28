import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

// Global state to prevent reset on hook re-initialization
let globalIsInputActive = false;
const globalInputActiveListeners = new Set<(value: boolean) => void>();

// Separate global state for input focus that's independent of viewport
let globalInputFocused = false;
const globalInputFocusedListeners = new Set<(value: boolean) => void>();

// Global state for viewport expansion to persist across page navigations
let globalViewportExpanded = false;
const globalViewportExpandedListeners = new Set<(value: boolean) => void>();

// Short-term lock to force compact mode after navigation from tokens/assets page
let compactModeLockUntilTs: number | null = null;

// Reset global state on module reload (for development)
if (typeof window !== 'undefined' && (window as any).__GLOBAL_STATE_RESET) {
  globalIsInputActive = false;
  globalInputFocused = false;
  globalViewportExpanded = false;
  globalInputActiveListeners.clear();
  globalInputFocusedListeners.clear();
  globalViewportExpandedListeners.clear();
  (window as any).__GLOBAL_STATE_RESET = false;
}

export function useKeyboardDetection() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  // Establish initial viewport state BEFORE first render, using navigation flags if present
  const initialExpandedFromNav = (() => {
    if (typeof window === 'undefined') return globalViewportExpanded;
    try {
      const isNavigationReturn = sessionStorage.getItem('isNavigationReturn') === 'true';
      const wasInCompactModeRaw = sessionStorage.getItem('wasInCompactMode');
      const wasInCompactMode = wasInCompactModeRaw === 'true';
      if (isNavigationReturn) {
        // If previously compact, start compact; otherwise start expanded
        return !wasInCompactMode;
      }
      // Fallback to any persisted viewport state
      const savedViewportState = sessionStorage.getItem('viewportExpanded');
      if (savedViewportState !== null) {
        return savedViewportState === 'true';
      }
    } catch {}
    return globalViewportExpanded;
  })();
  const [isViewportExpanded, setIsViewportExpanded] = useState(initialExpandedFromNav);
  // Keep global in sync immediately so other consumers see the same initial state
  globalViewportExpanded = initialExpandedFromNav;
  // Freeze environment detection at first render to avoid flips
  const initialInBrowser = typeof window !== 'undefined' ? (() => {
    const hasTgParam = window.location.search.includes('tgWebAppPlatform') ||
                       window.location.hash.includes('tgWebAppPlatform');
    const hasWebApp = Boolean((window as any).Telegram?.WebApp);
    const persistedTMA = sessionStorage.getItem('isTMA') === 'true';
    const inTelegram = hasTgParam || hasWebApp || persistedTMA;
    // Persist detection for subsequent client-side navigations
    try { if (inTelegram) sessionStorage.setItem('isTMA', 'true'); } catch {}
    return !inTelegram;
  })() : false;
  const [isInBrowser] = useState(initialInBrowser);
  // In browser, do not auto-expand; only expand when input is focused
  const [mockViewportExpanded, setMockViewportExpanded] = useState(false);
  const [isInputActive, setIsInputActive] = useState(globalIsInputActive);
  const [isInputFocused, setIsInputFocused] = useState(globalInputFocused);
  const debug = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.log('🧭 useKeyboardDetection:', ...args);
  };
  
  // Prefer SDK signal for TMA viewport expansion; it updates on manual expansion
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

  // Sync with global viewport expanded state
  useEffect(() => {
    const listener = (value: boolean) => {
      setIsViewportExpanded(value);
    };
    
    globalViewportExpandedListeners.add(listener);
    setIsViewportExpanded(globalViewportExpanded);
    
    return () => {
      globalViewportExpandedListeners.delete(listener);
    };
  }, []);

  // Force sync with global state on every render
  useEffect(() => {
    if (isInputFocused !== globalInputFocused) {
      setIsInputFocused(globalInputFocused);
    }
    if (isViewportExpanded !== globalViewportExpanded) {
      setIsViewportExpanded(globalViewportExpanded);
    }
  }, [isInputFocused, isViewportExpanded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
      const expandViewport = () => {
        try {
          viewport.expand();
          debug('Viewport expansion successful');
        } catch (error) {
          console.error('Failed to expand TMA viewport:', error);
          
          // Retry viewport expansion with exponential backoff
          let retryCount = 0;
          const maxRetries = 5;
          const retryDelay = 50;
          
          const retryExpansion = () => {
            if (retryCount >= maxRetries) {
              debug('Viewport expansion failed after max retries');
              return;
            }
            
            retryCount++;
            debug(`Viewport expansion retry attempt ${retryCount}/${maxRetries}`);
            
            try {
              viewport.expand();
              debug('Viewport expansion successful on retry');
            } catch (retryError) {
              console.error(`Viewport expansion retry ${retryCount} failed:`, retryError);
              
              // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms
              const delay = retryDelay * Math.pow(2, retryCount - 1);
              setTimeout(retryExpansion, delay);
            }
          };
          
          // Start retry after initial delay
          setTimeout(retryExpansion, retryDelay);
        }
      };
      
      expandViewport();
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

  // Function to control viewport expanded state globally
  const setViewportExpanded = useCallback((expanded: boolean) => {
    globalViewportExpanded = expanded;
    
    // Notify all listeners
    globalViewportExpandedListeners.forEach((listener) => {
      try {
        listener(expanded);
      } catch (error) {
        console.error('Error in viewport expanded listener:', error);
      }
    });
  }, []);

  // Function to set navigation flags for maintaining viewport state
  const setNavigationFlags = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we're currently in compact mode
    const currentlyCompact = isInputFocused || (!isKeyboardOpen && !isViewportExpanded);
    
    // Always set navigation flags to preserve current state
    sessionStorage.setItem('isNavigationReturn', 'true');
    sessionStorage.setItem('wasInCompactMode', currentlyCompact.toString());
    
    debug('setNavigationFlags', { 
      currentlyCompact, 
      isInputFocused, 
      isKeyboardOpen, 
      isViewportExpanded 
    });
    
    // Direct console.log for TMA debugging
    const flagsData = {
      currentlyCompact,
      isInputFocused,
      isKeyboardOpen,
      isViewportExpanded,
      globalViewportExpanded,
      sessionStorageViewportExpanded: sessionStorage.getItem('viewportExpanded'),
      storedValue: sessionStorage.getItem('wasInCompactMode'),
      viewportHeight: window.innerHeight,
      tmaViewportHeight: (window as any).Telegram?.WebApp?.viewportHeight || 'N/A'
    };
    console.log('🚀 SET NAVIGATION FLAGS:', flagsData);
    console.log('🚀 STORING wasInCompactMode as:', currentlyCompact.toString());
    console.log('🚀 Current viewport state - isViewportExpanded:', isViewportExpanded, 'globalViewportExpanded:', globalViewportExpanded);
    console.log('🚀 TMA viewport state - Telegram.WebApp.isExpanded:', (window as any).Telegram?.WebApp?.isExpanded);
    console.log('🚀 TMA viewport state - telegramIsExpanded from useSignal:', telegramIsExpanded);
    console.log('🚀 TMA viewport height - window.innerHeight:', window.innerHeight);
    console.log('🚀 TMA viewport height - Telegram.WebApp.viewportHeight:', (window as any).Telegram?.WebApp?.viewportHeight);
    console.log('🚀 Calculation breakdown:');
    console.log('  - isInputFocused:', isInputFocused);
    console.log('  - isKeyboardOpen:', isKeyboardOpen);
    console.log('  - isViewportExpanded:', isViewportExpanded);
    console.log('  - (!isKeyboardOpen && !isViewportExpanded):', (!isKeyboardOpen && !isViewportExpanded));
    console.log('  - Final currentlyCompact:', currentlyCompact);
    
    // Also dispatch custom event for debug panel
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('debugNavigation', {
        detail: { type: 'flagsSet', data: flagsData }
      }));
    }
  }, [isInputFocused, isKeyboardOpen, isViewportExpanded, telegramIsExpanded]);

  // Initialize viewport state from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // If we are returning from the tokens/assets page, force compact mode
    // regardless of current keyboard/viewport state to prevent layout jumps
    // and potential hook-order issues in children relying on compact layout.
    const fromTokensPage = sessionStorage.getItem('fromTokensPage') === 'true';
    debug('mount', {
      fromTokensPage,
      savedViewport: sessionStorage.getItem('viewportExpanded'),
      isInTelegram: Boolean((window as any).Telegram?.WebApp),
    });

    // Retry logic for TMA initialization
    const initializeTMA = () => {
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp) {
        debug('TMA found, initializing viewport state');
        
        // Check initial viewport state
        const isExpanded = Boolean(webApp.isExpanded);
        debug('Initial TMA viewport state:', { isExpanded });
        
        // Set initial viewport state
        setIsViewportExpanded(isExpanded);
        globalViewportExpanded = isExpanded;
        setViewportExpanded(isExpanded);
        sessionStorage.setItem('viewportExpanded', isExpanded.toString());
        
        // Call ready() to ensure TMA is properly initialized
        if (webApp.ready) {
          webApp.ready();
        }
        
        return true; // Success
      }
      return false; // Not ready yet
    };

    // Try to initialize TMA immediately
    if (!initializeTMA()) {
      // If TMA is not ready, retry with exponential backoff
      let retryCount = 0;
      const maxRetries = 10;
      const retryDelay = 100; // Start with 100ms
      
      const retryTMA = () => {
        if (retryCount >= maxRetries) {
          debug('TMA initialization failed after max retries');
          return;
        }
        
        retryCount++;
        debug(`TMA retry attempt ${retryCount}/${maxRetries}`);
        
        if (initializeTMA()) {
          debug('TMA initialization successful on retry');
          return;
        }
        
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
        const delay = retryDelay * Math.pow(2, retryCount - 1);
        setTimeout(retryTMA, delay);
      };
      
      // Start retry after initial delay
      setTimeout(retryTMA, retryDelay);
    }

    // Check if we're returning from navigation (not a page reload)
    const isNavigationReturn = sessionStorage.getItem('isNavigationReturn') === 'true';
    const wasInCompactModeRaw = sessionStorage.getItem('wasInCompactMode');
    const wasInCompactMode = wasInCompactModeRaw === 'true';
    
    debug('navigation flags check', {
      fromTokensPage,
      isNavigationReturn,
      wasInCompactModeRaw,
      wasInCompactMode,
      allSessionStorage: Object.fromEntries(
        Array.from({ length: sessionStorage.length }, (_, i) => {
          const key = sessionStorage.key(i);
          return [key, sessionStorage.getItem(key || '')];
        })
      )
    });
    
    if (fromTokensPage || isNavigationReturn) {
      // When returning from tokens page or any navigation, restore prior state
      const shouldRestoreCompact = isNavigationReturn && wasInCompactMode;

      debug('navigation return logic', { 
        fromTokensPage, 
        isNavigationReturn, 
        wasInCompactMode, 
        shouldRestoreCompact,
        isInBrowser 
      });
      
      // Direct console.log for TMA debugging
      const returnData = {
        fromTokensPage,
        isNavigationReturn,
        wasInCompactModeRaw,
        wasInCompactMode,
        shouldRestoreCompact,
        isInBrowser,
        willRestoreCompact: shouldRestoreCompact
      };
      console.log('🔧 NAVIGATION RETURN LOGIC:', returnData);
      
      // Also dispatch custom event for debug panel
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('debugNavigation', {
          detail: { type: 'returnLogic', data: returnData }
        }));
      }
      
      // Store debug info for direct UI display - persist longer
      if (typeof window !== 'undefined') {
        (window as any).debugNavigationData = returnData;
        // Also store in sessionStorage as backup
        sessionStorage.setItem('debugNavigationData', JSON.stringify(returnData));
      }

      // Add a delay to prevent interference with token selection
      setTimeout(() => {
        if (shouldRestoreCompact) {
          // Restore compact because it was compact prior to navigation
          globalViewportExpanded = false;
          setViewportExpanded(false);
          setIsViewportExpanded(false);
          sessionStorage.setItem('viewportExpanded', 'false');

          // Apply compact lock only in Telegram to prevent immediate expansion
          if (!isInBrowser) {
            compactModeLockUntilTs = Date.now() + 3000;
            debug('engaging compact lock for compact restore', { until: compactModeLockUntilTs });
          }
        } else {
          // Restore expanded state if not forcing compact
          globalViewportExpanded = true;
          setViewportExpanded(true);
          setIsViewportExpanded(true);
          sessionStorage.setItem('viewportExpanded', 'true');
          compactModeLockUntilTs = null;

          debug('restoring expanded state', { 
            reason: isNavigationReturn ? 'was expanded before nav' : 'no navigation flags' 
          });
        }
      }, 100); // Small delay to allow token selection to complete

      // Clear the navigation flags
      if (isNavigationReturn) {
        sessionStorage.removeItem('isNavigationReturn');
        sessionStorage.removeItem('wasInCompactMode');
      }
      // Clear fromTokensPage marker on return from assets selection
      // Delay this to allow swap form to process the flag first
      if (fromTokensPage) {
        setTimeout(() => {
          sessionStorage.removeItem('fromTokensPage');
          console.log('🧹 useKeyboardDetection: Cleared fromTokensPage flag after delay');
        }, 500); // Give swap form time to process the flag
      }
    } else {
      // Desktop/browser should default to expanded; ignore stale stored compact flag
      if (isInBrowser) {
        globalViewportExpanded = true;
        setViewportExpanded(true);
        sessionStorage.setItem('viewportExpanded', 'true');
      } else {
        // In Telegram, try to restore viewport state from sessionStorage
        const savedViewportState = sessionStorage.getItem('viewportExpanded');
        if (savedViewportState !== null) {
          const isExpanded = savedViewportState === 'true';
          globalViewportExpanded = isExpanded;
          setViewportExpanded(isExpanded);
        }
      }
    }
  }, [setViewportExpanded, isInBrowser]);

  // Memoize the return object to prevent unnecessary re-renders
  const shouldBeCompact = useMemo(() => {
    const forcedCompact = compactModeLockUntilTs && Date.now() < compactModeLockUntilTs;
    
    // If viewport is expanded AND keyboard is not open, force fullscreen mode
    // This handles the case where user manually expands from compact to fullscreen
    if (isViewportExpanded && !isKeyboardOpen && !isInputFocused) {
      return false; // Fullscreen mode
    }
    
    const result = forcedCompact || isInputFocused || (!isKeyboardOpen && !isViewportExpanded);
    return result;
  }, [isInputFocused, isKeyboardOpen, isViewportExpanded]);

  // Update viewport expansion state
  useEffect(() => {
    // Check if user manually expanded (this should override any compact lock)
    const isManuallyExpanded = !isInBrowser && typeof window !== 'undefined' && 
      Boolean((window as any).Telegram?.WebApp?.isExpanded);
    
    // If user manually expanded, release compact lock immediately
    if (isManuallyExpanded && compactModeLockUntilTs) {
      debug('lock released due to manual expansion detected');
      compactModeLockUntilTs = null;
    }
    
    // If compact mode is locked, keep it compact and skip updates
    if (compactModeLockUntilTs && Date.now() < compactModeLockUntilTs && !isManuallyExpanded) {
      debug('lock active, forcing compact');
      if (isViewportExpanded) {
        setIsViewportExpanded(false);
        globalViewportExpanded = false;
        setViewportExpanded(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('viewportExpanded', 'false');
        }
      }
      return;
    }
    // Clear the lock if time elapsed
    if (compactModeLockUntilTs && Date.now() >= compactModeLockUntilTs) {
      debug('lock released');
      compactModeLockUntilTs = null;
    }

    // Only update viewport expansion if it's actually different
    if (isInBrowser) {
      // In browser/desktop: expanded unless the keyboard is explicitly open
      const newViewportExpanded = !isKeyboardOpen || Boolean(isInputFocused);
      debug('update viewport (browser)', { isKeyboardOpen, isInputFocused, current: isViewportExpanded, next: newViewportExpanded });
      if (newViewportExpanded !== isViewportExpanded) {
        setIsViewportExpanded(newViewportExpanded);
        globalViewportExpanded = newViewportExpanded;
        setViewportExpanded(newViewportExpanded);
        
        // Persist to sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('viewportExpanded', newViewportExpanded.toString());
        }
      }
    } else {
      // In Telegram: reflect SDK state and also listen to runtime viewport changes
      const newViewportExpanded = Boolean(telegramIsExpanded);
      debug('update viewport (telegram)', { telegramIsExpanded, current: isViewportExpanded, next: newViewportExpanded });
      if (newViewportExpanded !== isViewportExpanded) {
        setIsViewportExpanded(newViewportExpanded);
        globalViewportExpanded = newViewportExpanded;
        setViewportExpanded(newViewportExpanded);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('viewportExpanded', newViewportExpanded.toString());
        }
        // If user expanded, release any compact lock immediately
        if (newViewportExpanded && compactModeLockUntilTs) {
          compactModeLockUntilTs = null;
          debug('lock released due to manual expansion');
        }
      }

      // Subscribe to Telegram viewport changes with polling fallback
      const setupViewportListener = () => {
        try {
          const tg = (window as any).Telegram?.WebApp;
          if (tg?.onEvent) {
            const handler = () => {
              const expanded = Boolean(tg.isExpanded);
              debug('telegram viewportChanged', { expanded });
              setIsViewportExpanded(expanded);
              globalViewportExpanded = expanded;
              setViewportExpanded(expanded);
              sessionStorage.setItem('viewportExpanded', expanded.toString());
              
              // Release any compact lock if user manually expanded
              if (expanded && compactModeLockUntilTs) {
                compactModeLockUntilTs = null;
                debug('lock released due to manual expansion via event');
              }
            };
            tg.onEvent('viewportChanged', handler);
            debug('Viewport change listener set up successfully');
            
            // Also set up a polling mechanism as a fallback
            const pollInterval = setInterval(() => {
              const tgCurrent = (window as any).Telegram?.WebApp;
              if (tgCurrent && tgCurrent.isExpanded !== globalViewportExpanded) {
                const expanded = Boolean(tgCurrent.isExpanded);
                debug('polling detected viewport change', { expanded, previous: globalViewportExpanded });
                setIsViewportExpanded(expanded);
                globalViewportExpanded = expanded;
                setViewportExpanded(expanded);
                sessionStorage.setItem('viewportExpanded', expanded.toString());
                
                // Release any compact lock if user manually expanded
                if (expanded && compactModeLockUntilTs) {
                  compactModeLockUntilTs = null;
                  debug('lock released due to manual expansion via polling');
                }
              }
            }, 500); // Poll every 500ms as fallback
            
            return () => {
              try { tg.offEvent?.('viewportChanged', handler); } catch {}
              clearInterval(pollInterval);
            };
          }
          return null;
        } catch (e) {
          console.error('Failed to bind Telegram viewportChanged', e);
          return null;
        }
      };

      // Try to set up listener immediately
      let cleanup = setupViewportListener();
      
      // If setup failed, retry with exponential backoff
      if (!cleanup) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 100;
        
        const retrySetup = () => {
          if (retryCount >= maxRetries) {
            debug('Viewport listener setup failed after max retries');
            return;
          }
          
          retryCount++;
          debug(`Viewport listener setup retry attempt ${retryCount}/${maxRetries}`);
          
          cleanup = setupViewportListener();
          if (cleanup) {
            debug('Viewport listener setup successful on retry');
            return;
          }
          
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
          const delay = retryDelay * Math.pow(2, retryCount - 1);
          setTimeout(retrySetup, delay);
        };
        
        // Start retry after initial delay
        setTimeout(retrySetup, retryDelay);
      }
      
      return cleanup || (() => {});
    }
  }, [telegramIsExpanded, isInBrowser, isKeyboardOpen, mockViewportExpanded, isInputActive, isViewportExpanded, isInputFocused, setViewportExpanded]); // Include all dependencies

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

  // Debug changes
  useEffect(() => {
    debug('state change', { isKeyboardOpen, isViewportExpanded, isInBrowser, isInputFocused, mockViewportExpanded, compactLockActive: Boolean(compactModeLockUntilTs && Date.now() < compactModeLockUntilTs) });
  }, [isKeyboardOpen, isViewportExpanded, isInBrowser, isInputFocused, mockViewportExpanded]);
  useEffect(() => {
    debug('shouldBeCompact', { shouldBeCompact, isKeyboardOpen, isViewportExpanded, isInputFocused, compactLockActive: Boolean(compactModeLockUntilTs && Date.now() < compactModeLockUntilTs) });
  }, [shouldBeCompact, isKeyboardOpen, isViewportExpanded, isInputFocused]);

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
    shouldBeCompact,
    setViewportExpanded,
    setNavigationFlags
  }), [isKeyboardOpen, isViewportExpanded, isInBrowser, isInputActive, setInputActive, setInputFocused, isInputFocused, shouldBeCompact, setViewportExpanded, setNavigationFlags]);
}
