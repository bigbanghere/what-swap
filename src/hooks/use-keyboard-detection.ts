import { useState, useEffect } from 'react';
import { useSignal, viewport } from '@telegram-apps/sdk-react';

export function useKeyboardDetection() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isViewportExpanded, setIsViewportExpanded] = useState(false);
  const [isInBrowser, setIsInBrowser] = useState(false);
  const [mockViewportExpanded, setMockViewportExpanded] = useState(true);
  
  // Get viewport expansion state from Telegram SDK
  const telegramIsExpanded = useSignal(viewport.isExpanded);

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
    if (isInBrowser) {
      // In browser, use mock state unless keyboard is open
      setIsViewportExpanded(mockViewportExpanded && !isKeyboardOpen);
    } else {
      // In Telegram, use the actual Telegram SDK state
      setIsViewportExpanded(Boolean(telegramIsExpanded));
    }
  }, [telegramIsExpanded, isInBrowser, isKeyboardOpen, mockViewportExpanded]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Viewport state:', {
      isKeyboardOpen,
      isViewportExpanded,
      isInBrowser,
      mockViewportExpanded,
      shouldBeCompact: isKeyboardOpen || isViewportExpanded
    });
  }, [isKeyboardOpen, isViewportExpanded, isInBrowser, mockViewportExpanded]);

  // Return object with both individual states and combined state
  return {
    isKeyboardOpen,
    isViewportExpanded,
    isInBrowser,
    shouldBeCompact: isKeyboardOpen || isViewportExpanded
  };
}
