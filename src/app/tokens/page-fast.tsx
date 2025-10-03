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
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`🖼️ Image failed to load for ${token.symbol}:`, e.currentTarget.src);
    setImageError(true);
  }, [token.symbol]);

  const formatTokenBalance = () => {
    return "0";
  };

  const formatUSDValue = () => {
    return "$0";
  };

  const handleClick = useCallback(() => {
    console.log('🖱️ TokenItem: Click detected for token:', token.symbol);
    console.log('🖱️ TokenItem: About to call onSelect with token:', token);
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
            loading="lazy"
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
          style={{ 
            color: colors.text,
            opacity: 0.66
          }}
        >
          On TON ({token.name})
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
          style={{ 
            color: colors.text,
            opacity: 0.66
          }}
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
  const [isNavigating, setIsNavigating] = useState(false);

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

  // Use the cached tokens
  const { allTokens: allTokens = [], data: filteredTokens = [], isLoading, error, isFetching, isCacheFresh, hasMore } = useTokensCache(debouncedSearch);
  
  // Debug logging
  console.log('🔍 TokensPageFast: Cache state', {
    allTokensLength: allTokens.length,
    filteredTokensLength: filteredTokens.length,
    isLoading,
    error,
    isFetching,
    isCacheFresh,
    hasMore,
    debouncedSearch
  });
  
  // No timeout needed - cache handles loading all tokens
  
  // All tokens are displayed immediately - no state management needed
  
  // No timeout needed since we're loading all tokens in the background
  // The cache will handle loading all 1791 tokens which takes time

  // All tokens are displayed immediately - no progressive loading needed

  // No scroll handling needed - all tokens are displayed immediately

  // Use filtered tokens for rendering (search is handled by the cache hook)
  
  // All tokens are loaded, so no more loading needed
  const localHasMore = false;

  const handleTokenSelect = useCallback((token: any) => {
    console.log('🎯 handleTokenSelect called with:', token?.symbol, 'isNavigating:', isNavigating);
    
    // Prevent multiple rapid clicks
    if (isNavigating) {
      console.log('🚫 Token selection ignored - already navigating');
      return;
    }
    
    setIsNavigating(true);
    console.log('🎯 Token selected:', token);
    console.log('🎯 Token type:', tokenType);
    
    try {
      // Store selected token in localStorage with timestamp
      const storageKey = `selected${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)}Token`;
      const tokenWithTimestamp = {
        ...token,
        selectedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(tokenWithTimestamp));
      console.log('💾 Stored token in localStorage with key:', storageKey);
      
      // Set navigation flags BEFORE dispatching events
      sessionStorage.setItem('fromTokensPage', 'true');
      console.log('🎯 Tokens page: Set fromTokensPage flag to true');
      
      // Clear the asset selection flag since user completed selection
      sessionStorage.removeItem('inAssetSelection');
      console.log('🎯 Tokens page: Asset selection completed, clearing flag');
      
      // Dispatch custom event for immediate update
      const customEvent = new CustomEvent('tokenSelected', {
        detail: {
          type: tokenType,
          token: token
        }
      });
      
      // Dispatch immediately
      window.dispatchEvent(customEvent);
      console.log('📡 TokensPage: Dispatched custom event', customEvent.detail);
      console.log('📡 TokensPage: Token has address:', !!token.address);
      console.log('📡 TokensPage: Token has symbol:', !!token.symbol);
      console.log('📡 TokensPage: Full token object:', token);
      
      // Dispatch again after a small delay to ensure it's processed
      setTimeout(() => {
        console.log('📡 TokensPage: Dispatching delayed custom event');
        window.dispatchEvent(customEvent);
      }, 100);
      
      // Add a longer delay to ensure the event is processed before navigation
      setTimeout(() => {
        console.log('🏠 Navigating back to home page (delayed)');
        router.push('/');
      }, 300);
      
    } catch (error) {
      console.error('❌ Error during token selection:', error);
      setIsNavigating(false);
    }
  }, [router, tokenType, isNavigating]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <Page back={true}>
      <div 
        className="min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
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
        >
          {isLoading && filteredTokens.length === 0 ? (
            // Loading skeletons - show 6 skeletons only when no tokens are loaded yet
            Array.from({ length: 6 }).map((_, index) => (
              <TokenSkeleton key={index} colors={colors} />
            ))
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
          ) : filteredTokens.length === 0 ? (
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
        {(isLoading && filteredTokens.length > 0) && (
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm" style={{ color: colors.secondaryText || '#6b7280' }}>
                {`Loading tokens... (${allTokens.length} of ${TOTAL_TOKENS})`}
              </div>
              {allTokens.length > 0 && (
                <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min((allTokens.length / TOTAL_TOKENS) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Show completion message when all tokens are loaded */}
        {!isLoading && allTokens.length > 0 && allTokens.length >= TOTAL_TOKENS && (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm" style={{ color: colors.secondaryText || '#6b7280' }}>
              ✅ All {allTokens.length} tokens loaded successfully
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