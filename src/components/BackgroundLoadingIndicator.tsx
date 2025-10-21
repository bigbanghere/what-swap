'use client';

import { useState, useEffect } from 'react';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { useDefaultTokens } from '@/hooks/use-default-tokens';
import { useTheme } from '@/core/theme';

export function BackgroundLoadingIndicator() {
  const { isDark } = useTheme();
  const { usdt: defaultUsdt, ton: defaultTon, isLoading: defaultTokensLoading, error: defaultTokensError } = useDefaultTokens();
  const { allTokens, isLoading: tokensLoading } = useTokensCache();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    // Debug logging
    console.log('🔍 BackgroundLoadingIndicator: State check', {
      defaultTokensLoading,
      hasUsdt: !!defaultUsdt,
      hasTon: !!defaultTon,
      defaultTokensError,
      showLoading
    });
    
    // Only show loading if essential tokens are loading AND we have no tokens yet
    const essentialTokensLoading = defaultTokensLoading;
    const hasNoTokens = !defaultUsdt || !defaultTon;
    
    if (essentialTokensLoading && hasNoTokens) {
      console.log('🔍 BackgroundLoadingIndicator: Showing loading indicator');
      setShowLoading(true);
      
      // Very fast progress simulation
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30; // Very fast progress
        if (progress > 90) progress = 90;
        setLoadingProgress(progress);
      }, 100); // Very fast updates
      
      // Very short timeout - only 1 second maximum
      const timeout = setTimeout(() => {
        console.warn('⚠️ BackgroundLoadingIndicator: Timeout reached, hiding loading indicator');
        setShowLoading(false);
        setLoadingProgress(100);
      }, 1000); // Only 1 second timeout
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      console.log('🔍 BackgroundLoadingIndicator: Hiding loading indicator');
      // Essential tokens are ready or we have tokens, hide loading immediately
      setShowLoading(false);
      setLoadingProgress(100);
    }
  }, [defaultTokensLoading, defaultUsdt, defaultTon, defaultTokensError, showLoading]);
  
  // Additional safety: hide loading after 500ms regardless of state
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ BackgroundLoadingIndicator: Safety timeout reached, forcing hide');
      setShowLoading(false);
    }, 500);
    
    return () => clearTimeout(safetyTimeout);
  }, []);
  
  // Don't show loading if we have tokens, if there's an error, or if loading is complete
  if (!showLoading || defaultTokensError || defaultUsdt || defaultTon) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100 ease-out"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      <div className="bg-white dark:bg-gray-900 px-4 py-2 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading essential tokens...
        </div>
      </div>
    </div>
  );
}
