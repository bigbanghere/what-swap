'use client';

import React, { useState, useEffect } from 'react';

function isInTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.location.search.includes('tgWebAppPlatform') ||
      window.location.hash.includes('tgWebAppPlatform') ||
      (window as any).Telegram?.WebApp != null
    );
  } catch {
    return false;
  }
}

export function PersistentDebugDisplay() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const isTMA = isInTelegramMiniApp();

  useEffect(() => {
    if (!isTMA) return;

    // Listen for navigation flags being set
    const handleFlagsSet = (e: CustomEvent) => {
      if (e.detail.type === 'flagsSet') {
        const info = {
          type: 'Navigation Flags Set',
          timestamp: new Date().toLocaleTimeString(),
          data: e.detail.data
        };
        setDebugInfo(info);
        setVisible(true);
        
        // Store in sessionStorage so it persists across navigation
        sessionStorage.setItem('persistentDebugInfo', JSON.stringify(info));
      }
    };

    // Listen for navigation return logic
    const handleReturnLogic = (e: CustomEvent) => {
      if (e.detail.type === 'returnLogic') {
        const info = {
          type: 'Navigation Return Logic',
          timestamp: new Date().toLocaleTimeString(),
          data: e.detail.data
        };
        setDebugInfo(info);
        setVisible(true);
        
        // Store in sessionStorage
        sessionStorage.setItem('persistentDebugInfo', JSON.stringify(info));
      }
    };

    // Check for existing debug info on mount
    const existingInfo = sessionStorage.getItem('persistentDebugInfo');
    if (existingInfo) {
      try {
        const parsed = JSON.parse(existingInfo);
        setDebugInfo(parsed);
        setVisible(true);
      } catch (e) {
        console.error('Failed to parse persistent debug info', e);
      }
    }

    window.addEventListener('debugNavigation', handleFlagsSet as EventListener);
    window.addEventListener('debugNavigation', handleReturnLogic as EventListener);

    return () => {
      window.removeEventListener('debugNavigation', handleFlagsSet as EventListener);
      window.removeEventListener('debugNavigation', handleReturnLogic as EventListener);
    };
  }, [isTMA]);

  if (!isTMA || !visible || !debugInfo) return null;

  const clearDebug = () => {
    setVisible(false);
    setDebugInfo(null);
    sessionStorage.removeItem('persistentDebugInfo');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 10000,
        maxHeight: '300px',
        overflow: 'auto',
        border: '2px solid #00ff00'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <strong style={{ color: '#00ff00' }}>{debugInfo.type}</strong>
          <div style={{ fontSize: '9px', opacity: 0.7 }}>{debugInfo.timestamp}</div>
        </div>
        <button
          onClick={clearDebug}
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
      
      <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
        {debugInfo.type === 'Navigation Flags Set' && (
          <>
            <div style={{ marginBottom: '6px', color: '#ffff00' }}>
              <strong>When clicking token selection:</strong>
            </div>
            <div><strong>isInputFocused:</strong> {String(debugInfo.data.isInputFocused)}</div>
            <div><strong>isKeyboardOpen:</strong> {String(debugInfo.data.isKeyboardOpen)}</div>
            <div><strong>isViewportExpanded:</strong> {String(debugInfo.data.isViewportExpanded)}</div>
            <div><strong>shouldBeCompact:</strong> {String(debugInfo.data.shouldBeCompact)}</div>
            <div style={{ color: '#00aaff' }}>
              <strong>viewportHeight:</strong> {debugInfo.data.viewportHeight}px
            </div>
            <div style={{ color: '#00aaff' }}>
              <strong>tmaViewportHeight:</strong> {debugInfo.data.tmaViewportHeight}px
            </div>
            <div style={{ color: debugInfo.data.actuallyInCompactMode === true ? '#00ff00' : '#ff0000' }}>
              <strong>actuallyInCompactMode:</strong> {String(debugInfo.data.actuallyInCompactMode)}
            </div>
            <div style={{ color: debugInfo.data.currentlyCompact ? '#00ff00' : '#ff0000' }}>
              <strong>currentlyCompact:</strong> {String(debugInfo.data.currentlyCompact)}
            </div>
            <div style={{ color: '#ffff00' }}>
              <strong>STORED wasInCompactMode:</strong> {debugInfo.data.storedValue}
            </div>
          </>
        )}
        
        {debugInfo.type === 'Navigation Return Logic' && (
          <>
            <div style={{ marginBottom: '6px', color: '#ffff00' }}>
              <strong>When returning from assets:</strong>
            </div>
            <div><strong>fromTokensPage:</strong> {String(debugInfo.data.fromTokensPage)}</div>
            <div><strong>isNavigationReturn:</strong> {String(debugInfo.data.isNavigationReturn)}</div>
            <div><strong>wasInCompactModeRaw:</strong> &quot;{debugInfo.data.wasInCompactModeRaw}&quot;</div>
            <div><strong>wasInCompactMode:</strong> {String(debugInfo.data.wasInCompactMode)}</div>
            <div style={{ color: debugInfo.data.shouldRestoreCompact ? '#00ff00' : '#ff0000' }}>
              <strong>shouldRestoreCompact:</strong> {String(debugInfo.data.shouldRestoreCompact)}
            </div>
            <div style={{ color: debugInfo.data.willRestoreCompact ? '#00ff00' : '#ff0000' }}>
              <strong>WILL RESTORE COMPACT:</strong> {String(debugInfo.data.willRestoreCompact)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PersistentDebugDisplay;
