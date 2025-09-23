'use client';

import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/core/theme';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { IoSearchOutline, IoArrowBack, IoOpenOutline } from 'react-icons/io5';
import { Jetton } from '@/lib/swap-coffee-api';
import Image from 'next/image';
import { Page } from '@/components/Page';

// Using regular img tags for external images to avoid Next.js image domain configuration issues

// Memoized token item component to prevent unnecessary re-renders
const TokenItem = memo(({ 
  token, 
  onSelect, 
  formatTokenBalance, 
  formatUSDValue, 
  colors 
}: {
  token: Jetton;
  onSelect: (token: Jetton) => void;
  formatTokenBalance: (token: Jetton) => string;
  formatUSDValue: (token: Jetton) => string;
  colors: any;
}) => (
  <div
    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2"
    onClick={() => onSelect(token)}
    style={{ minHeight: '60px' }}
  >
    {/* Token Icon */}
    <div className="relative">
      {token.image_url ? (
        <img
          src={token.image_url}
          alt={token.symbol}
          className="w-[30px] h-[30px] rounded-full"
          loading="lazy"
          onError={(e) => {
            console.warn('Image failed to load:', token.image_url);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-medium ${token.image_url ? 'hidden' : 'flex'}`}
        style={{ 
          backgroundColor: colors.inputBackground || '#f3f4f6',
          color: colors.text,
        }}
      >
        {token.symbol.slice(0, 2).toUpperCase()}
      </div>
    </div>

    {/* Token Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-[5px]">
        <h3 
          className="truncate"
          style={{ color: colors.text }}
        >
          {token.symbol}
        </h3>
        <Image
          alt='External link'
          src='external_link.svg'
          width="20"
          height="20"
          className="w-[20px] h-[20px]"
        />
      </div>
        <p 
          className="truncate"
          style={{ color: colors.text }}
        >
        {token.name} • On TON
      </p>
    </div>

    {/* Token Values */}
    <div className="text-right">
      <div 
        className="text-sm font-medium"
        style={{ color: colors.text }}
      >
        0
      </div>
      <div 
        className="text-xs"
        style={{ color: colors.secondary || '#6b7280' }}
      >
        $0
      </div>
    </div>
  </div>
));

TokenItem.displayName = 'TokenItem';

export default function TokensPage() {
  console.log('🎯 TokensPage: Component rendering');
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tokenType, setTokenType] = useState<'from' | 'to'>('from');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // listRef removed since infinite scroll is not needed
  
  console.log('🎯 TokensPage: State initialized', { tokenType, searchQuery, isInitialLoad });

  // Get token type from URL query params
  useEffect(() => {
    console.log('🎯 TokensPage: Getting token type from URL');
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type') as 'from' | 'to';
      console.log('🎯 TokensPage: URL params', { type, search: window.location.search });
      if (type) {
        setTokenType(type);
        console.log('✅ TokensPage: Token type set to', type);
      }
    } catch (error) {
      console.error('❌ TokensPage: Error getting token type:', error);
    }
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  console.log('🎯 TokensPage: About to call useTokensCache');
  const {
    allTokens: tokens = [],
    isLoading = false,
    isFetching = false,
    error = null,
    hasMore = false,
  } = useTokensCache();
  
  console.log('🎯 TokensPage: useTokensQuery result', { 
    tokensCount: tokens.length, 
    isLoading, 
    error,
    hasMore,
  });

  // Debug the loading indicator values
  console.log('📊 Loading indicator values:', {
    tokensLength: tokens.length,
    isLoading,
    isFetching
  });

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    console.log(`🔍 Filtering tokens: ${tokens.length} total, search: "${debouncedSearch}"`);
    if (!debouncedSearch.trim()) {
      return tokens;
    }
    
    const searchLower = debouncedSearch.toLowerCase();
    const filtered = tokens.filter(token => 
      token.symbol.toLowerCase().includes(searchLower) ||
      token.name.toLowerCase().includes(searchLower) ||
      token.address.toLowerCase().includes(searchLower)
    );
    console.log(`🔍 Filtered result: ${filtered.length} tokens`);
    return filtered;
  }, [tokens, debouncedSearch]);

  // Set initial load to false once we have data or error
  useEffect(() => {
    if (tokens.length > 0 || error) {
      console.log('✅ TokensPage: Data loaded, hiding initial loading screen', { tokensLength: tokens.length, error });
      setIsInitialLoad(false);
    }
  }, [tokens.length, error]);

  // Debug effect to track tokens changes
  useEffect(() => {
    console.log('🔄 Tokens array changed:', { length: tokens.length, isLoading, isFetching });
  }, [tokens.length, isLoading, isFetching]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle token selection
  const handleTokenSelect = useCallback((token: Jetton) => {
    try {
      console.log('🎯 TokensPage: Token selected', { token, tokenType });
      
      // Store selected token in localStorage for the swap form to pick up
      const tokenData = {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image_url: token.image_url,
        verification: token.verification,
      };
      
      const storageKey = tokenType === 'from' ? 'selectedFromToken' : 'selectedToToken';
      localStorage.setItem(storageKey, JSON.stringify(tokenData));
      console.log('💾 TokensPage: Saved to localStorage', { storageKey, tokenData });
      
      // Dispatch custom event for immediate update in swap form
      const customEvent = new CustomEvent('tokenSelected', {
        detail: {
          type: tokenType,
          token: tokenData
        }
      });
      window.dispatchEvent(customEvent);
      console.log('📡 TokensPage: Dispatched custom event', customEvent.detail);
      
      // Navigate back to the previous page
      router.push('/');
    } catch (error) {
      console.error('❌ TokensPage: Error selecting token:', error);
      router.push('/');
    }
  }, [router, tokenType]);

  // Format token balance (placeholder - would need actual balance data)
  const formatTokenBalance = useCallback((token: Jetton) => {
    // This would need to be implemented with actual wallet balance data
    // For now, showing placeholder values - using stable hash for consistent display
    const stableHash = token.address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const mockBalance = Math.abs(stableHash) % 1000000;
    return mockBalance.toLocaleString();
  }, []);

  // Format USD value (placeholder - would need actual price data)
  const formatUSDValue = useCallback((token: Jetton) => {
    // This would need to be implemented with actual price data
    // For now, showing placeholder values - using stable hash for consistent display
    const mockPrice = token.market_stats?.price_usd || 0.001;
    const stableHash = token.address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const mockBalance = Math.abs(stableHash) % 1000000;
    const usdValue = mockBalance * mockPrice;
    return `$${usdValue.toFixed(2)}`;
  }, []);

  // Note: Infinite scroll is not needed since useTokensCache loads all tokens automatically

  console.log('🎯 TokensPage: About to render');
  
  // Show loading screen immediately for fast navigation
  if (isInitialLoad && (isLoading || tokens.length === 0)) {
    console.log('⏳ TokensPage: Showing initial loading screen');
    return (
      <Page back={true}>
        <div 
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: colors.background }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Loading Tokens...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {tokenType === 'from' ? 'Select token to send' : 'Select token to receive'}
            </p>
          </div>
        </div>
      </Page>
    );
  }

  // Simple fallback if there's an error
  if (error) {
    console.log('❌ TokensPage: Error detected, showing fallback');
    return (
      <Page back={true}>
        <div 
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: colors.background }}
        >
          <h1 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
            Select Token
          </h1>
          <p className="text-sm mb-4" style={{ color: colors.text }}>
            Token type: {tokenType}
          </p>
          <p className="text-red-500 mb-4">Error loading tokens: {error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go Back
          </button>
        </div>
      </Page>
    );
  }
  
  return (
    <Page back={true}>
      <div 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div className="p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Select Token
          </h1>
          <p className="text-sm" style={{ color: colors.text }}>
            Token type: {tokenType}
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-[15px] flex-shrink-0">
        <div 
          className="relative flex items-center rounded-[15px] p-[15px]"
          style={{ border: '1px solid #1ABCFF' }}
        >
          <IoSearchOutline 
            className="absolute left-4 w-5 h-5"
            style={{ color: '#1ABCFF' }}
          />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 bg-transparent border-0 outline-none text-sm"
            style={{ color: colors.text }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div 
        className="flex-1 px-4 pb-4 overflow-y-auto"
      >
        {isLoading ? (
          // Loading skeletons - fixed number to prevent layout shifts
          Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={`skeleton-${index}`} 
              className="flex items-center gap-3 py-3 animate-pulse"
              style={{ minHeight: '60px' }}
            >
              <div 
                className="w-10 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors.inputBackground || '#f3f4f6' }}
              ></div>
              <div className="flex-1 min-w-0">
                <div 
                  className="h-4 rounded w-16 mb-1"
                  style={{ backgroundColor: colors.inputBackground || '#f3f4f6' }}
                ></div>
                <div 
                  className="h-3 rounded w-24"
                  style={{ backgroundColor: colors.inputBackground || '#f3f4f6' }}
                ></div>
              </div>
              <div className="text-right flex-shrink-0">
                <div 
                  className="h-4 rounded w-12 mb-1"
                  style={{ backgroundColor: colors.inputBackground || '#f3f4f6' }}
                ></div>
                <div 
                  className="h-3 rounded w-16"
                  style={{ backgroundColor: colors.inputBackground || '#f3f4f6' }}
                ></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div 
            className="text-center py-8"
            style={{ color: colors.secondary || '#6b7280' }}
          >
            <p>Failed to load tokens</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 rounded-lg text-sm"
              style={{ 
                backgroundColor: colors.primary || '#3b82f6',
                color: 'white'
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div 
            className="text-center py-8"
            style={{ color: colors.secondary || '#6b7280' }}
          >
            {debouncedSearch.trim() ? 'No tokens found matching your search' : 'No tokens found'}
          </div>
        ) : (
          filteredTokens.map((token, index) => (
            <TokenItem
              key={`${token.address}-${index}`}
              token={token}
              onSelect={handleTokenSelect}
              formatTokenBalance={formatTokenBalance}
              formatUSDValue={formatUSDValue}
              colors={colors}
            />
          ))
        )}

        {/* Cache is loading all tokens automatically */}

        {/* Loading All Tokens Indicator */}
        {isFetching && (
          <div className="flex justify-center py-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Loading tokens... {tokens.length} loaded
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading More Indicator */}
        {isLoading && !isFetching && (
          <div className="flex justify-center py-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Loading more tokens...
                </span>
              </div>
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* End of List Indicator */}
        {!hasMore && tokens.length > 0 && !isLoading && !isFetching && (
          <div 
            className="text-center py-4 text-xs"
            style={{ color: colors.secondary || '#6b7280' }}
          >
            No more tokens to load
          </div>
        )}
      </div>
      </div>
    </Page>
  );
}
