'use client';

import { useEffect } from 'react';
import { tokensCache } from '@/hooks/use-tokens-cache';

export function TokenCacheInitializer() {
  useEffect(() => {
    // Don't start loading immediately - wait for user tokens to complete
    console.log('🚀 App: Token cache initializer ready - waiting for user tokens to complete...');
    // tokensCache.startLoading(); // Removed - will be triggered by user tokens completion
  }, []);

  // This component doesn't render anything
  return null;
}

