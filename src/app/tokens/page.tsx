'use client';

import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/core/theme';
import { useTokensQuery } from '@/hooks/use-tokens-query';
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
      <img
        src={token.image_url}
        alt={token.symbol}
        className="w-[30px] h-[30px] rounded-full"
        loading="lazy"
        onError={(e) => {
          console.warn('Image failed to load (this should be rare after filtering):', token.image_url);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div 
        className="w-10 h-10 rounded-full items-center justify-center text-[14px] hidden"
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
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tokenType, setTokenType] = useState<'from' | 'to'>('from');
  const listRef = useRef<HTMLDivElement>(null);

  // Get token type from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') as 'from' | 'to';
    if (type) {
      setTokenType(type);
    }
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const tokensQueryOptions = useMemo(() => ({
    initialPageSize: 100, // Use maximum page size allowed by Swap Coffee API
    verification: ['WHITELISTED', 'COMMUNITY'],
  }), []);

  const {
    tokens,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    search: searchTokens,
  } = useTokensQuery(tokensQueryOptions);

  // Handle debounced search
  useEffect(() => {
    searchTokens(debouncedSearch);
  }, [debouncedSearch, searchTokens]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle token selection
  const handleTokenSelect = useCallback((token: Jetton) => {
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
    
    // Navigate back to the previous page
    router.back();
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

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom) {
      loadMore();
    }
  }, [loadMore, isLoadingMore, hasMore]);

  return (
    <Page back={true}>
      <div 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: colors.background }}
      >

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
        ref={listRef}
        className="flex-1 px-4 pb-4 overflow-y-auto"
        onScroll={handleScroll}
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
        ) : tokens.length === 0 ? (
          <div 
            className="text-center py-8"
            style={{ color: colors.secondary || '#6b7280' }}
          >
            No tokens found
          </div>
        ) : (
          tokens.map((token, index) => (
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

        {/* Load More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span 
                className="text-sm"
                style={{ color: colors.secondary || '#6b7280' }}
              >
                Loading more tokens...
              </span>
            </div>
          </div>
        )}

        {/* End of List Indicator */}
        {!hasMore && tokens.length > 0 && !isLoadingMore && (
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
