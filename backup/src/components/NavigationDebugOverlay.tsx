'use client';

import React, { useState, useEffect } from 'react';

function isInTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hasParam = window.location.search.includes('tgWebAppPlatform') ||
                     window.location.hash.includes('tgWebAppPlatform');
    const hasWebApp = (window as any).Telegram?.WebApp != null;
    const persisted = sessionStorage.getItem('isTMA') === 'true';
    if (hasParam || hasWebApp || persisted) {
      try { sessionStorage.setItem('isTMA', 'true'); } catch {}
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function NavigationDebugOverlay() {
  const [debugData, setDebugData] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const isTMA = isInTelegramMiniApp();

  useEffect(() => {
    if (!isTMA) return;

    const checkDebugData = () => {
      let data = (window as any).debugNavigationData;
      
      // Fallback to sessionStorage if window data not available
      if (!data) {
        const storedData = sessionStorage.getItem('debugNavigationData');
        if (storedData) {
          try {
            data = JSON.parse(storedData);
          } catch (e) {
            console.error('Failed to parse debug data from sessionStorage', e);
          }
        }
      }
      
      if (data) {
        console.log('🎯 NavigationDebugOverlay: Found debug data', data);
        setDebugData(data);
        setVisible(true);
        // Auto-hide after 30 seconds instead of 10
        setTimeout(() => setVisible(false), 30000);
      } else {
        console.log('🎯 NavigationDebugOverlay: No debug data found');
      }
    };

    // Check immediately
    checkDebugData();
    
    // Check again after 100ms (for timing issues)
    setTimeout(checkDebugData, 100);
    
    // Check again after 500ms (for slow hook initialization)
    setTimeout(checkDebugData, 500);
    
    // Show debug button after 2 seconds
    setTimeout(() => setShowButton(true), 2000);

    // Listen for debug events
    const handleDebugNavigation = (e: CustomEvent) => {
      console.log('🎯 NavigationDebugOverlay: Received debug event', e.detail);
      if (e.detail.type === 'returnLogic') {
        setDebugData(e.detail.data);
        setVisible(true);
        setTimeout(() => setVisible(false), 30000);
      }
    };

    window.addEventListener('debugNavigation', handleDebugNavigation as EventListener);

    return () => {
      window.removeEventListener('debugNavigation', handleDebugNavigation as EventListener);
    };
  }, [isTMA]);

  // Show debug button if in TMA
  if (!isTMA) return null;
  
  // Show manual debug button if no overlay visible
  if (!visible && showButton) {
    return (
      <button
        onClick={() => {
          let data = (window as any).debugNavigationData;
          
          // Fallback to sessionStorage
          if (!data) {
            const storedData = sessionStorage.getItem('debugNavigationData');
            if (storedData) {
              try {
                data = JSON.parse(storedData);
              } catch (e) {
                console.error('Failed to parse debug data from sessionStorage', e);
              }
            }
          }
          
          if (data) {
            setDebugData(data);
            setVisible(true);
          } else {
            console.log('🎯 No debug data found on window or sessionStorage');
            // Show current sessionStorage state for debugging
            console.log('🎯 Current sessionStorage keys:', Object.keys(sessionStorage));
            console.log('🎯 fromTokensPage:', sessionStorage.getItem('fromTokensPage'));
            console.log('🎯 isNavigationReturn:', sessionStorage.getItem('isNavigationReturn'));
          }
        }}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10001
        }}
      >
        🔧 Debug
      </button>
    );
  }
  
  if (!visible || !debugData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        maxHeight: '200px',
        overflow: 'auto',
        border: '2px solid #ff0000'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong>🔧 Navigation Debug</strong>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
        <div><strong>fromTokensPage:</strong> {String(debugData.fromTokensPage)}</div>
        <div><strong>isNavigationReturn:</strong> {String(debugData.isNavigationReturn)}</div>
        <div><strong>wasInCompactModeRaw:</strong> &quot;{debugData.wasInCompactModeRaw}&quot;</div>
        <div><strong>wasInCompactMode:</strong> {String(debugData.wasInCompactMode)}</div>
        <div style={{ color: debugData.shouldRestoreCompact ? '#00ff00' : '#ff0000' }}>
          <strong>shouldRestoreCompact:</strong> {String(debugData.shouldRestoreCompact)}
        </div>
        <div><strong>isInBrowser:</strong> {String(debugData.isInBrowser)}</div>
        <div style={{ color: debugData.willRestoreCompact ? '#00ff00' : '#ff0000' }}>
          <strong>willRestoreCompact:</strong> {String(debugData.willRestoreCompact)}
        </div>
      </div>
    </div>
  );
}

export default NavigationDebugOverlay;

