'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/core/theme';
import { Page } from '@/components/Page';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { useUserTokensCache } from '@/hooks/use-user-tokens-cache';
import { useDefaultTokens } from '@/hooks/use-default-tokens';
import { IoSearchOutline } from 'react-icons/io5';
import { TOTAL_TOKENS } from '@/constants/tokens';
import { IoSearchSharp } from "react-icons/io5";
import { useTonAddress } from "@tonconnect/ui-react";
import { swapCoffeeApiClient, UserJetton } from '@/lib/swap-coffee-api';

// Hardcoded TON token data for fallback
const HARDCODED_TON_TOKEN = {
  address: '0:0000000000000000000000000000000000000000000000000000000000000000',
  symbol: 'TON',
  name: 'Toncoin',
  image_url: 'https://cdn.swap.coffee/p/G3PJbgH0FNOqD7kGPZaK9ZqyVqJFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/image.png',
  decimals: 9,
  verification: 'WHITELISTED' as const,
};

// Skeleton component for loading state
const TokenSkeleton = ({ colors }: { colors: any }) => (
  <div className="flex items-center gap-[5px] py-[10px] px-[20px]">
    <div 
      className="w-[30px] h-[30px] rounded-full animate-pulse flex-shrink-0"
      style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
    />
    <div className="flex-1 min-w-0">
      <div 
        className="h-4 w-16 mb-1 animate-pulse rounded"
        style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
      />
      <div 
        className="h-3 w-24 animate-pulse rounded"
        style={{ backgroundColor: colors.secondaryBackground || '#f3f4f6' }}
      />
    </div>
    <div className="text-right flex-shrink-0">
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
    // If token has a balance (from user's wallet), format it
    if (token.balance && token.decimals !== undefined) {
      const balance = parseFloat(token.balance);
      const decimals = token.decimals;
      
      // Check if balance is already formatted (contains decimal point)
      // This happens for TON balance which is already converted from nanoTON to TON
      const isAlreadyFormatted = token.balance.includes('.');
      
      const formattedBalance = isAlreadyFormatted 
        ? balance  // Use balance as-is if already formatted
        : balance / Math.pow(10, decimals);  // Convert from raw units if not formatted
      
      // Format with appropriate decimal places
      if (formattedBalance >= 1000000) {
        return `${(formattedBalance / 1000000).toFixed(1)}M`;
      } else if (formattedBalance >= 1000) {
        return `${(formattedBalance / 1000).toFixed(1)}K`;
      } else if (formattedBalance >= 1) {
        return formattedBalance.toFixed(2);
      } else if (formattedBalance > 0) {
        return formattedBalance.toFixed(6);
      } else {
        return "0";
      }
    }
    return "0";
  };

  const formatUSDValue = () => {
    // If token has balance and price, calculate USD value
    if (token.balance && token.decimals !== undefined && token.market_stats?.price_usd) {
      const balance = parseFloat(token.balance);
      const decimals = token.decimals;
      
      // Check if balance is already formatted (contains decimal point)
      // This happens for TON balance which is already converted from nanoTON to TON
      const isAlreadyFormatted = token.balance.includes('.');
      
      const formattedBalance = isAlreadyFormatted 
        ? balance  // Use balance as-is if already formatted
        : balance / Math.pow(10, decimals);  // Convert from raw units if not formatted
      
      const usdValue = formattedBalance * token.market_stats.price_usd;
      
      if (usdValue >= 1000000) {
        return `$${(usdValue / 1000000).toFixed(1)}M`;
      } else if (usdValue >= 1000) {
        return `$${(usdValue / 1000).toFixed(1)}K`;
      } else if (usdValue >= 1) {
        return `$${usdValue.toFixed(2)}`;
      } else if (usdValue > 0) {
        return `$${usdValue.toFixed(4)}`;
      } else {
        return "$0";
      }
    }
    return "$0";
  };

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️👆 TokenItem: Interaction detected for token:', token.symbol, 'Type:', e.type);
    console.log('🖱️👆 TokenItem: About to call onSelect with token:', token);
    onSelect(token);
  }, [token, onSelect]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const target = e.currentTarget as any;
    const touchStartTime = target.touchStartTime;
    const touchStartY = target.touchStartY;
    
    if (touchStartTime && touchStartY !== undefined) {
      const touchDuration = Date.now() - touchStartTime;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDistance = Math.abs(touchEndY - touchStartY);
      
      console.log('👆 TokenItem: Touch end analysis:', {
        duration: touchDuration,
        distance: touchDistance,
        isTap: touchDuration < 300 && touchDistance < 10
      });
      
      // Only trigger selection if it's a tap (short duration and small distance)
      if (touchDuration < 300 && touchDistance < 10) {
        e.preventDefault();
        e.stopPropagation();
        console.log('👆 TokenItem: Touch end - tap detected, selecting token:', token.symbol);
        onSelect(token);
      } else {
        console.log('👆 TokenItem: Touch end - scroll detected, ignoring');
      }
    }
  }, [token, onSelect]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('👆 TokenItem: Touch start detected for token:', token.symbol);
    // Store the touch start time to detect if it's a tap vs scroll
    (e.currentTarget as any).touchStartTime = Date.now();
    (e.currentTarget as any).touchStartY = e.touches[0].clientY;
  }, [token.symbol]);

  return (
    <div
      className="flex items-center gap-[5px] py-[10px] px-[20px] cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleInteraction}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

// Helper function to convert UserJetton to token format
const convertUserJettonToToken = (userJetton: UserJetton) => ({
  ...userJetton.jetton,
  balance: userJetton.balance,
  jetton_wallet: userJetton.jetton_wallet,
});

export default function TokensPageFast() {
  const router = useRouter();
  const { colors } = useTheme();
  const walletAddress = useTonAddress();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tokenType, setTokenType] = useState<'from' | 'to'>('from');
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  
  // Use user tokens cache hook
  const { userTokens, tonBalance, isLoading: isLoadingUserTokens, error: userTokensError } = useUserTokensCache(walletAddress);
  
  // Use default tokens hook to get TON token data
  const { ton: defaultTonToken } = useDefaultTokens();

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
      // Reset navigation state on unmount
      isNavigatingRef.current = false;
      setIsNavigating(false);
      console.log('🧹 Tokens page: Reset isNavigating on unmount');
      
      // Only clear if user didn't select a token (no fromTokensPage flag set)
      const fromTokensPage = sessionStorage.getItem('fromTokensPage');
      if (!fromTokensPage) {
        sessionStorage.removeItem('inAssetSelection');
        console.log('🧹 Tokens page: Cleared inAssetSelection flag - user navigated back without selecting');
      }
    };
  }, []);

  // Use the cached tokens - delay all tokens loading if user tokens are loading
  const { allTokens: allTokens = [], data: filteredTokens = [], isLoading, error, isFetching, isCacheFresh, hasMore } = useTokensCache(debouncedSearch);
  
  // Filter out user-owned tokens from the main list
  const userTokenAddresses = new Set(userTokens.map(ut => ut.jetton_address));
  
  // Create TON token for My Tokens section if wallet is connected
  // Use default TON token data for consistent display (icon, name, etc.)
  // Fallback to hardcoded data if defaultTonToken is not loaded yet
  const tonTokenData = defaultTonToken || HARDCODED_TON_TOKEN;
  const tonToken = tonBalance ? {
    address: tonTokenData.address,
    symbol: tonTokenData.symbol,
    name: tonTokenData.name,
    image_url: tonTokenData.image_url,
    balance: tonBalance.balanceFormatted,
    decimals: tonTokenData.decimals,
    verification: tonTokenData.verification,
    ...('market_stats' in tonTokenData && tonTokenData.market_stats && { market_stats: tonTokenData.market_stats }), // Include market stats for USD price calculation
  } : null;

  // Combine user tokens with TON token
  const allUserTokens = [
    ...(tonToken ? [tonToken] : []),
    ...userTokens
  ];

  // Debug logging
  console.log('🔍 TokensPageFast Debug:', {
    tonBalance: tonBalance,
    tonBalanceFormatted: tonBalance?.balanceFormatted,
    tonBalanceExists: !!tonBalance,
    defaultTonToken: defaultTonToken?.symbol,
    tonToken: tonToken,
    tonTokenExists: !!tonToken,
    userTokensLength: userTokens.length,
    allUserTokensLength: allUserTokens.length,
    walletAddress: walletAddress,
    isLoadingUserTokens: isLoadingUserTokens,
    userTokensError: userTokensError
  });

  const filteredUserTokens = allUserTokens.filter(token => {
    // Handle TON token (has symbol property directly)
    if ('symbol' in token && token.symbol === 'TON') {
      return 'ton'.includes(debouncedSearch.toLowerCase()) || 
             'toncoin'.includes(debouncedSearch.toLowerCase()) ||
             token.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    }
    
    // Handle UserJetton tokens
    if ('jetton' in token) {
      return token.jetton.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
             token.jetton.symbol.toLowerCase().includes(debouncedSearch.toLowerCase());
    }
    
    return false;
  }).sort((a, b) => {
    const searchLower = debouncedSearch.toLowerCase();
    
    // Handle TON token sorting
    if ('symbol' in a && a.symbol === 'TON' && 'symbol' in b && b.symbol === 'TON') {
      return 0; // Both are TON, maintain order
    }
    
    // Handle UserJetton tokens sorting
    if ('jetton' in a && 'jetton' in b) {
      const aSymbolMatch = a.jetton.symbol.toLowerCase().includes(searchLower);
      const bSymbolMatch = b.jetton.symbol.toLowerCase().includes(searchLower);
      const aNameMatch = a.jetton.name.toLowerCase().includes(searchLower);
      const bNameMatch = b.jetton.name.toLowerCase().includes(searchLower);
      
      // Priority order: symbol > name
      if (aSymbolMatch && !bSymbolMatch) return -1;
      if (!aSymbolMatch && bSymbolMatch) return 1;
      if (aNameMatch && !bNameMatch && !bSymbolMatch) return -1;
      if (!aNameMatch && bNameMatch && !aSymbolMatch) return 1;
      
      return 0;
    }
    
    return 0;
  });

  // Exclude TON from "All tokens" if user has TON balance (it's already in "My tokens")
  // Only show TON in "All tokens" if user has no balance
  const filteredOtherTokens = filteredTokens.filter(token => {
    // Exclude tokens that are already in user's jetton tokens
    if (userTokenAddresses.has(token.address)) {
      return false;
    }
    
    // Exclude TON if user has TON balance (already shown in My tokens)
    // Check both 'native' and the actual TON address
    if (tonToken && (token.address === 'native' || token.address === tonTokenData.address)) {
      return false;
    }
    
    return true;
  });
  
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
    console.log('🎯 handleTokenSelect called with:', token?.symbol, 'isNavigating:', isNavigatingRef.current);
    
    // Prevent multiple rapid clicks
    if (isNavigatingRef.current) {
      console.log('🚫 Token selection ignored - already navigating');
      return;
    }
    
    isNavigatingRef.current = true;
    setIsNavigating(true);
    console.log('🎯 Token selected:', token);
    console.log('🎯 Token type:', tokenType);
    
    // Safety timeout to reset navigation state in case something goes wrong
    const safetyTimeout = setTimeout(() => {
      console.log('⚠️ Safety timeout: Resetting isNavigating state');
      isNavigatingRef.current = false;
      setIsNavigating(false);
    }, 5000);
    
    try {
      // Store selected token in localStorage with timestamp
      const storageKey = `selected${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)}Token`;
      const tokenWithTimestamp = {
        ...token,
        selectedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(tokenWithTimestamp));
      console.log('💾 Stored token in localStorage with key:', storageKey);
      
      // Preserve the other token to prevent it from being cleared
      const otherTokenKey = tokenType === 'from' ? 'selectedToToken' : 'selectedFromToken';
      const otherToken = localStorage.getItem(otherTokenKey);
      if (otherToken) {
        console.log('💾 Preserving other token:', otherTokenKey);
        // Re-store the other token to ensure it's not lost
        localStorage.setItem(otherTokenKey, otherToken);
      }
      
      // Set navigation flags BEFORE dispatching events
      sessionStorage.setItem('fromTokensPage', 'true');
      console.log('🎯 Tokens page: Set fromTokensPage flag to true');
      
      // Keep the asset selection flag until the token is actually loaded in the swap form
      // This prevents the default token logic from running prematurely
      sessionStorage.setItem('inAssetSelection', 'true');
      console.log('🎯 Tokens page: Asset selection in progress, keeping flag');
      
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
      }, 10);
      
      // Navigate back to home page immediately
      setTimeout(() => {
        console.log('🏠 Navigating back to home page (delayed)');
        router.push('/');
        // Reset navigation state after navigation starts
        setTimeout(() => {
          clearTimeout(safetyTimeout);
          isNavigatingRef.current = false;
          setIsNavigating(false);
          console.log('🔄 Reset isNavigating to false after navigation');
        }, 10);
      }, 30);
      
    } catch (error) {
      console.error('❌ Error during token selection:', error);
      clearTimeout(safetyTimeout);
      isNavigatingRef.current = false;
      setIsNavigating(false);
    }
  }, [router, tokenType]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle touch events to allow both viewport expansion and scrolling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('📱 Touch start - allowing natural viewport expansion and scrolling');
    // Don't prevent default to allow natural Telegram WebApp behavior
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    console.log('📱 Touch move - allowing both viewport expansion and scrolling');
    // Don't prevent default to allow natural scrolling and viewport expansion
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log('📱 Touch end - natural behavior');
    // Don't prevent default to allow natural behavior
  }, []);

  return (
    <Page back={true}>
      <div 
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: colors.background,
          // Allow natural touch behavior for viewport expansion
          touchAction: 'pan-y',
          overscrollBehavior: 'auto',
          // Ensure container doesn't exceed viewport width
          width: '100%',
          maxWidth: '100vw'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Content Wrapper - centers content with 420px max width */}
        <div className="flex flex-col items-center w-full">
          {/* Search Bar */}
          <div className="px-[20px] pt-[20px] pb-[10px]" style={{ width: '100%', maxWidth: '420px' }}>
          <div 
            className="relative flex items-center rounded-[15px] border border-solid gap-[5px] p-[15px]"
            style={{ 
              backgroundColor: colors.background,
              borderColor: 'rgba(0, 122, 255, 0.22)',
              height: '50px',
            }}
          >
            <IoSearchSharp 
              style={{ 
                color: '#007AFF',
                width: 20,
                height: 20,
              }}
            />
            <input
              type="text"
              placeholder={`Search from ${TOTAL_TOKENS.toLocaleString()} tokens`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-[#007AFF]"
              style={{ color: colors.text }}
            />
          </div>
          </div>
        </div>
        {/* My Tokens Section - only show when wallet is connected and has tokens */}
        {walletAddress && (isLoadingUserTokens || userTokensError || filteredUserTokens.length > 0) && (
          <>
            <div 
              className='py-[10px]' 
              style={{ 
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto',
                paddingLeft: '20px',
                paddingRight: '20px',
                color: colors.text
              }}
            >
              My tokens
            </div>
            <div
              className='h-[1px] my-[10px]'
              style={{
                backgroundColor: 'rgba(0, 122, 255, 0.22)',
                width: 'calc(100% - 40px)',
                maxWidth: '380px',
                margin: '0 auto'
              }}
            ></div>
            
            {/* My Tokens List */}
            <div 
              style={{
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'auto',
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto'
              }}
            >
              {isLoadingUserTokens ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TokenSkeleton key={`user-${index}`} colors={colors} />
                ))
              ) : userTokensError ? (
                <div 
                  className="text-center py-4"
                  style={{ color: colors.text }}
                >
                  <div className="text-sm text-red-500 mb-1">Failed to load your tokens</div>
                  <div className="text-xs" style={{ color: colors.secondaryText }}>
                    {userTokensError?.message || 'Unknown error'}
                  </div>
                </div>
              ) : filteredUserTokens.length > 0 ? (
                filteredUserTokens.map((token: any, index: number) => {
                  // Handle TON token (already in correct format)
                  if (token.symbol === 'TON') {
                    return (
                      <TokenItem
                        key={`user-${token.address}`}
                        token={token}
                        colors={colors}
                        onSelect={handleTokenSelect}
                      />
                    );
                  }
                  // Handle UserJetton tokens
                  const convertedToken = convertUserJettonToToken(token);
                  return (
                    <TokenItem
                      key={`user-${convertedToken.address}`}
                      token={convertedToken}
                      colors={colors}
                      onSelect={handleTokenSelect}
                    />
                  );
                })
              ) : null}
            </div>
          </>
        )}
        
        {/* All Tokens Section - only show when wallet is connected and has tokens */}
        {walletAddress && filteredOtherTokens.length > 0 && (
          <>
            <div 
              className='py-[10px]' 
              style={{ 
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto',
                paddingLeft: '20px',
                paddingRight: '20px',
                color: colors.text
              }}
            >
              All tokens
            </div>
            <div
              className='h-[1px] my-[10px]'
              style={{
                backgroundColor: 'rgba(0, 122, 255, 0.22)',
                width: 'calc(100% - 40px)',
                maxWidth: '380px',
                margin: '0 auto'
              }}
            ></div>
          </>
        )}
        {/* Tokens List */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            // Allow natural Telegram WebApp viewport expansion and scrolling
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            // Don't contain overscroll to allow viewport expansion
            overscrollBehavior: 'auto',
            width: '100%',
            maxWidth: '420px',
            margin: '0 auto'
          }}
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
          ) : (
            // Token list - show all tokens section
            <>
              {/* All Tokens Section */}
              {filteredOtherTokens.length > 0 ? (
                filteredOtherTokens.map((token: any, index: number) => {
                  console.log(`🔄 Tokens page: Rendering token ${index}:`, token.symbol);
                  return (
                    <TokenItem
                      key={token.address}
                      token={token}
                      colors={colors}
                      onSelect={handleTokenSelect}
                    />
                  );
                })
              ) : !walletAddress && filteredTokens.length === 0 ? (
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
              ) : walletAddress && filteredOtherTokens.length === 0 && !debouncedSearch ? (
                <div 
                  className="text-center py-4"
                  style={{ color: colors.secondaryText || '#6b7280' }}
                >
                  <div className="text-sm">All your tokens are shown above</div>
                </div>
              ) : null}
            
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