'use client';

import React, { useState, useEffect } from 'react';
import { useSignal, viewport } from '@telegram-apps/sdk-react';

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

export function ViewportDebugPanel() {
  const isTMA = isInTelegramMiniApp();
  const [mounted, setMounted] = useState(false);
  const [telegramIsExpanded, setTelegramIsExpanded] = useState(false);
  
  // Always call useSignal unconditionally (required by React hooks rules)
  const sdkIsExpanded = useSignal(viewport.isExpanded);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTMA && mounted) {
      setTelegramIsExpanded(sdkIsExpanded);
    }
  }, [isTMA, mounted, sdkIsExpanded]);

  if (!isTMA || !mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: telegramIsExpanded ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 10002,
        fontFamily: 'monospace'
      }}
    >
      <div>TMA Viewport: {telegramIsExpanded ? 'EXPANDED' : 'COMPACT'}</div>
      <div style={{ fontSize: '11px', opacity: 0.9 }}>
        viewport.isExpanded = {String(telegramIsExpanded)} | 
        height = {typeof window !== 'undefined' ? window.innerHeight : 0}px
      </div>
    </div>
  );
}

export default ViewportDebugPanel;
