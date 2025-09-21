'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/core/theme';
import { Page } from '@/components/Page';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { IoSearchOutline } from 'react-icons/io5';
import { TOTAL_TOKENS } from '@/constants/tokens';
import { IoSearchSharp } from "react-icons/io5";

// Skeleton component for loading state
const TokenSkeleton = ({ colors }: { colors: any }) => (
  <div className="flex items-center gap-3 py-3">
    <div 
      className="w-8 h-8 rounded-full animate-pulse"
      style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
    />
    <div className="flex-1">
      <div 
        className="h-4 w-16 mb-1 animate-pulse rounded"
        style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
      />
      <div 
        className="h-3 w-24 animate-pulse rounded"
        style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
      />
    </div>
    <div className="text-right">
      <div 
        className="h-4 w-8 mb-1 animate-pulse rounded"
        style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
      />
      <div 
        className="h-3 w-12 animate-pulse rounded"
        style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
      />
    </div>
  </div>
);

// Token item component
const TokenItem = React.memo(({ 
  token, 
  colors, 
  onSelect 
}: { 
  token: any; 
  colors: any; 
  onSelect: (token: any) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const formatTokenBalance = () => {
    return "0";
  };

  const formatUSDValue = () => {
    return "$0";
  };

  const handleClick = useCallback(() => {
    console.log('🖱️ TokenItem: Click detected for token:', token.symbol);
    onSelect(token);
  }, [token, onSelect]);

  return (
    <div
      className="flex items-center gap-[5px] py-[10px] px-[20px] cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      {/* Token Icon */}
      <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0">
        {token.image_url && !imageError ? (
          <img
            src={token.image_url}
            alt={token.symbol}
            className="w-[30px] h-[30px] object-cover"
            onError={handleImageError}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs font-medium"
            style={{ 
              backgroundColor: colors.secondaryBackground || '#f3f4f6',
              color: colors.text 
            }}
          >
            {token.symbol?.slice(0, 2) || '??'}
          </div>
        )}
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <div 
          className="truncate"
          style={{ color: colors.text }}
        >
          {token.symbol}
        </div>
        <div 
          className="truncate"
          style={{ opacity: 0.66 }}
        >
          {token.name}
        </div>
      </div>

      {/* Balance */}
      <div className="text-right flex-shrink-0">
        <div 
          className=""
          style={{ color: colors.text }}
        >
          {formatTokenBalance()}
        </div>
        <div 
          className=""
          style={{ opacity: 0.66 }}
        >
          {formatUSDValue()}
        </div>
      </div>
    </div>
  );
});

TokenItem.displayName = 'TokenItem';

export default function TokensPageFast() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tokenType, setTokenType] = useState<'from' | 'to'>('from');
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get token type from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') as 'from' | 'to';
    if (type) {
      setTokenType(type);
      // Mark that user is in asset selection process
      sessionStorage.setItem('inAssetSelection', 'true');
      console.log('🎯 Tokens page: User entered asset selection process for', type);
    }
  }, []);

  // Cleanup: Clear asset selection flag when component unmounts (user navigates back without selecting)
  useEffect(() => {
    return () => {
      // Only clear if user didn't select a token (no fromTokensPage flag set)
      const fromTokensPage = sessionStorage.getItem('fromTokensPage');
      if (!fromTokensPage) {
        sessionStorage.removeItem('inAssetSelection');
        console.log('🧹 Tokens page: Cleared inAssetSelection flag - user navigated back without selecting');
      }
    };
  }, []);

  // Use the cached tokens with progressive loading
  const { data: tokens = [], isLoading, error, isFetching, isCacheFresh, hasMore } = useTokensCache(debouncedSearch);
  
  // State for progressive loading
  const [displayedTokens, setDisplayedTokens] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Add a timeout fallback for loading state
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Progressive loading: Show first 100 tokens immediately, then load more as needed
  useEffect(() => {
    if (tokens.length > 0) {
      const initialTokens = tokens.slice(0, 100); // Show first 100 tokens immediately
      setDisplayedTokens(initialTokens);
      setCurrentPage(1);
      console.log(`🚀 Tokens page: Showing first ${initialTokens.length} tokens immediately`);
    }
  }, [tokens.length > 0 ? tokens[0]?.address : null]); // Only trigger when tokens change
  
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
        console.warn('⚠️ Tokens page: Loading timeout reached');
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // Load more tokens when scrolling near bottom
  const loadMoreTokens = useCallback(() => {
    console.log('🔄 Tokens page: loadMoreTokens called', {
      isLoadingMore,
      displayedTokensLength: displayedTokens.length,
      totalTokensLength: tokens.length,
      currentPage
    });
    
    if (isLoadingMore || displayedTokens.length >= tokens.length) {
      console.log('⚠️ Tokens page: Skipping loadMoreTokens', {
        isLoadingMore,
        displayedTokensLength: displayedTokens.length,
        totalTokensLength: tokens.length
      });
      return;
    }
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = nextPage * 100;
    const endIndex = startIndex + 100;
    
    console.log('📥 Tokens page: Loading more tokens', {
      nextPage,
      startIndex,
      endIndex,
      totalTokens: tokens.length
    });
    
    // Get next batch of tokens
    const nextBatch = tokens.slice(startIndex, endIndex);
    
    if (nextBatch.length > 0) {
      setDisplayedTokens((prev: any[]) => {
        const newTokens = [...prev, ...nextBatch];
        console.log(`📥 Tokens page: Loaded page ${nextPage}, showing ${newTokens.length} tokens`);
        return newTokens;
      });
      setCurrentPage(nextPage);
    } else {
      console.log('⚠️ Tokens page: No more tokens to load');
    }
    
    setIsLoadingMore(false);
  }, [currentPage, tokens, isLoadingMore, displayedTokens.length]);

  // Handle scroll to detect when user is near bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNear = scrollTop + clientHeight >= scrollHeight - 100; // 100px from bottom
    setIsNearBottom(isNear);
    
    console.log('🔄 Tokens page: Scroll detected', {
      scrollTop,
      scrollHeight,
      clientHeight,
      isNear,
      displayedTokens: displayedTokens.length,
      totalTokens: tokens.length,
      isLoadingMore
    });
    
    // Load more tokens when near bottom
    if (isNear && !isLoadingMore && displayedTokens.length < tokens.length) {
      console.log('📥 Tokens page: Loading more tokens...');
      loadMoreTokens();
    }
  }, [isNearBottom, isLoadingMore, displayedTokens.length, tokens.length, loadMoreTokens]);

  // Use displayed tokens for rendering (progressive loading)
  const filteredTokens = displayedTokens;
  
  // Calculate hasMore based on local tokens, not API response
  const localHasMore = displayedTokens.length < tokens.length;

  const handleTokenSelect = useCallback((token: any) => {
    console.log('🎯 Token selected:', token);
    console.log('🎯 Token type:', tokenType);
    
    // Store selected token in localStorage
    const storageKey = `selected${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)}Token`;
    localStorage.setItem(storageKey, JSON.stringify(token));
    console.log('💾 Stored token in localStorage with key:', storageKey);
    
    // Dispatch custom event for immediate update
    const eventDetail = { token, type: tokenType };
    console.log('📡 Dispatching custom event with detail:', eventDetail);
    window.dispatchEvent(new CustomEvent('tokenSelected', { 
      detail: eventDetail 
    }));
    console.log('✅ Custom event dispatched');
    
    // Set navigation flag to indicate we're navigating back from tokens page
    sessionStorage.setItem('fromTokensPage', 'true');
    console.log('🎯 Tokens page: Set fromTokensPage flag to true');
    
    // Clear the asset selection flag since user completed selection
    sessionStorage.removeItem('inAssetSelection');
    console.log('🎯 Tokens page: Asset selection completed, clearing flag');
    
    // Debug: Log all sessionStorage
    console.log('🎯 Tokens page: All sessionStorage:', Object.fromEntries(
        Array.from({ length: sessionStorage.length }, (_, i) => {
            const key = sessionStorage.key(i);
            return [key, sessionStorage.getItem(key || '')];
        })
    ));
    
    // Navigate back with a small delay to ensure state update is processed
    console.log('🏠 Navigating back to home page');
    setTimeout(() => {
      router.push('/');
    }, 100);
  }, [router, tokenType]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <Page back={true}>
      <div 
        className="min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        {/* Debug Panel - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-80 text-white text-xs p-2 rounded max-w-xs">
            <div className="font-bold mb-1">Debug Info:</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Timeout: {loadingTimeout ? 'Yes' : 'No'}</div>
            <div>Error: {error ? 'Yes' : 'No'}</div>
            <div>Tokens: {tokens.length}</div>
            <div>Cache Fresh: {isCacheFresh ? 'Yes' : 'No'}</div>
            <div>API Has More: {hasMore ? 'Yes' : 'No'}</div>
            <div>Local Has More: {localHasMore ? 'Yes' : 'No'}</div>
            <div>Displayed: {displayedTokens.length} / {tokens.length}</div>
            <div>Search: &quot;{debouncedSearch}&quot;</div>
            <div>Type: {tokenType}</div>
          </div>
        )}
        {/* Search Bar */}
        <div className="px-[20px] pt-[20px] pb-[10px]">
          <div 
            className="relative flex items-center rounded-[15px] border gap-[5px] p-[15px]"
            style={{ 
              borderColor: '#1ABCFF',
              height: '50px',
            }}
          >
            <IoSearchSharp 
              style={{ 
                color: '#1ABCFF',
                width: 20,
                height: 20,
              }}
            />
            <input
              type="text"
              placeholder={`Search from ${TOTAL_TOKENS.toLocaleString()} tokens`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-[#1ABCFF]"
              style={{ color: colors.text }}
            />
          </div>
        </div>

        {/* Tokens List */}
        <div 
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {isLoading && !loadingTimeout && tokens.length === 0 ? (
            // Loading skeletons - show 6 skeletons only when no tokens are loaded yet
            Array.from({ length: 6 }).map((_, index) => (
              <TokenSkeleton key={index} colors={colors} />
            ))
          ) : loadingTimeout ? (
            // Timeout fallback - show error with retry option
            <div 
              className="text-center py-8"
              style={{ color: colors.text }}
            >
              <div className="text-yellow-500 mb-2">Loading is taking longer than expected</div>
              <div className="text-sm mb-4" style={{ color: colors.secondaryText }}>
                The tokens are still loading in the background. You can wait or try refreshing the page.
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          ) : error ? (
            // Error state
            <div 
              className="text-center py-8"
              style={{ color: colors.text }}
            >
              <div className="text-red-500 mb-2">Failed to load tokens</div>
              <div className="text-sm" style={{ color: colors.secondaryText }}>
                {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            </div>
          ) : tokens.length === 0 ? (
            // No results
            <div 
              className="text-center py-8"
              style={{ color: colors.secondaryText || '#6b7280' }}
            >
              {debouncedSearch ? (
                `No tokens found matching "${debouncedSearch}"`
              ) : (
                "No tokens found"
              )}
            </div>
          ) : (
            // Token list - show tokens as they're loaded
            <>
              {filteredTokens.map((token: any, index: number) => {
                console.log(`🔄 Tokens page: Rendering token ${index}:`, token.symbol);
                return (
                  <TokenItem
                    key={token.address}
                    token={token}
                    colors={colors}
                    onSelect={handleTokenSelect}
                  />
                );
              })}
              
              {/* Show loading indicator at bottom when more tokens are being loaded */}
        {(isLoadingMore || (isLoading && displayedTokens.length > 0)) && (
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm" style={{ color: colors.secondaryText || '#6b7280' }}>
                {isLoadingMore
                  ? `Loading more tokens... (${displayedTokens.length} of ${tokens.length} shown)`
                  : `Loading tokens... (${displayedTokens.length} of ${tokens.length} shown)`
                }
              </div>
              {tokens.length > 0 && (
                <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min((displayedTokens.length / tokens.length) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
            </>
          )}
        </div>
      </div>
    </Page>
  );
}