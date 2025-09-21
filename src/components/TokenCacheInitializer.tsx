'use client';

import { useEffect } from 'react';
import { tokensCache } from '@/hooks/use-tokens-cache';

export function TokenCacheInitializer() {
  useEffect(() => {
    // Initialize the token cache when the component mounts
    console.log('🚀 App: Initializing token cache...');
    tokensCache.startLoading();
  }, []);

  // This component doesn't render anything
  return null;
}

