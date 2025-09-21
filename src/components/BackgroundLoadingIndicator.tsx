'use client';

import { useState, useEffect } from 'react';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { useTheme } from '@/core/theme';
import { TOTAL_TOKENS } from '@/constants/tokens';

export function BackgroundLoadingIndicator() {
  const { colors } = useTheme();
  const { isLoading, isFetching, allTokens, hasMore } = useTokensCache();

  // Show completion message briefly when loading is done
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!isLoading && !isFetching && allTokens.length > 0) {
      setShowCompletion(true);
      const timer = setTimeout(() => setShowCompletion(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetching, allTokens.length]);

  // Show indicator if loading, fetching, or showing completion
  if (!isLoading && !isFetching && !showCompletion) return null;

  // Calculate progress percentage
  const progress = Math.min((allTokens.length / TOTAL_TOKENS) * 100, 100);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg transition-all duration-300"
      style={{ 
        backgroundColor: colors.secondaryBackground || '#f3f4f6',
        border: `1px solid ${colors.border || '#e5e7eb'}`,
        color: colors.text
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        {!showCompletion && (
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {showCompletion && (
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        )}
        <div className="flex flex-col">
          <span>
            {showCompletion 
              ? `✅ All ${allTokens.length} tokens loaded!`
              : isLoading 
                ? 'Loading all tokens...' 
                : `Loading more... (${allTokens.length} cached)`
            }
          </span>
          {!showCompletion && (
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
