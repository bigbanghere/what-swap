import { useState, useEffect, useCallback } from 'react';
import { swapCoffeeApiClient } from '@/lib/swap-coffee-api';
import { TOTAL_TOKENS } from '@/constants/tokens';

export interface Jetton {
  address: string;
  symbol: string;
  name: string;
  image_url?: string;
  decimals: number;
  description?: string;
  verification: 'BLACKLISTED' | 'UNKNOWN' | 'COMMUNITY' | 'WHITELISTED';
  social_links?: string[];
  websites?: string[];
  market_cap?: number;
  volume_24h?: number;
  price?: number;
  price_change_24h?: number;
  holders_count?: number;
  total_supply?: string;
  circulating_supply?: string;
  created_at?: string;
  updated_at?: string;
  mintable?: boolean;
  contract_interface?: string;
  labels?: any[];
}

interface TokensCacheState {
  tokens: Jetton[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  hasMore: boolean;
  currentPage: number;
  lastFetchTime: number;
  totalLoaded: number;
  totalExpected: number;
}

// Global cache state
let cacheState: TokensCacheState = {
  tokens: [],
  isLoading: false,
  isFetching: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  lastFetchTime: 0,
  totalLoaded: 0,
  totalExpected: TOTAL_TOKENS,
};

// Cache listeners for components that need to react to cache updates
const cacheListeners = new Set<() => void>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pageSize = 100;

const fetchTokensPage = async (page: number): Promise<{ data: Jetton[]; hasMore: boolean }> => {
  console.log(`🚀 Cache: Fetching page ${page} with size ${pageSize}`);
  
  const response = await swapCoffeeApiClient.getJettonsPaginated({
    page,
    size: pageSize,
    verification: ['WHITELISTED', 'COMMUNITY'],
  });

  console.log(`✅ Cache: Page ${page}: Got ${response.data.length} tokens (hasMore: ${response.hasMore})`);
  
  return {
    data: response.data,
    hasMore: response.hasMore,
  };
};

const loadTokensPage = async (page: number, isInitial = false) => {
  try {
    if (isInitial) {
      cacheState.isLoading = true;
      cacheState.error = null;
    } else {
      cacheState.isFetching = true;
    }

    const { data, hasMore } = await fetchTokensPage(page);

    if (isInitial) {
      cacheState.tokens = data;
      console.log(`🎯 Cache: Initial load: Cached ${data.length} tokens`);
    } else {
      cacheState.tokens = [...cacheState.tokens, ...data];
      console.log(`📊 Cache: Total cached tokens: ${cacheState.tokens.length} (added ${data.length})`);
    }

    cacheState.hasMore = hasMore;
    cacheState.currentPage = page + 1;
    cacheState.lastFetchTime = Date.now();

    if (isInitial) {
      cacheState.isLoading = false;
    } else {
      cacheState.isFetching = false;
    }

    // Notify all listeners
    cacheListeners.forEach(listener => listener());

  } catch (err) {
    console.error(`❌ Cache: Failed to fetch page ${page}:`, err);
    cacheState.error = err instanceof Error ? err : new Error('Unknown error');
    
    if (isInitial) {
      cacheState.isLoading = false;
    } else {
      cacheState.isFetching = false;
    }

    // Notify listeners even on error
    cacheListeners.forEach(listener => listener());
  }
};

// Start background loading immediately
const startBackgroundLoading = () => {
  if (cacheState.tokens.length === 0 && !cacheState.isLoading && !cacheState.isFetching && !cacheState.error) {
    console.log('🚀 Cache: Starting background token loading...');
    loadAllTokens();
  } else {
    console.log('🚀 Cache: Skipping background loading - already in progress or completed');
  }
};

// Load tokens progressively (first 5 pages only for performance)
const loadAllTokens = async () => {
  console.log('🚀 Cache: Starting progressive loading of tokens (limited to first 5 pages)...');
  
  // Set initial loading state
  cacheState.isLoading = true;
  cacheState.error = null;
  cacheListeners.forEach(listener => listener());
  
  let page = 1;
  let hasMore = true;
  let allTokens: Jetton[] = [];
  const maxPages = 5; // Limit to first 5 pages for performance (500 tokens)
  const startTime = Date.now();
  
  while (hasMore && page <= maxPages) {
    try {
      console.log(`📥 Cache: Loading page ${page}...`);
      const { data, hasMore: pageHasMore } = await fetchTokensPage(page);
      
      // Check if we got data
      if (data.length === 0) {
        console.log(`⚠️ Cache: Empty page ${page}, stopping`);
        break;
      } else {
        allTokens = [...allTokens, ...data];
        console.log(`✅ Cache: Page ${page}: Got ${data.length} tokens (Total: ${allTokens.length})`);
      }
      
      hasMore = pageHasMore && data.length > 0;
      page++;
      
      // Update cache state with current progress
      cacheState.tokens = allTokens;
      cacheState.currentPage = page;
      cacheState.hasMore = hasMore;
      cacheState.lastFetchTime = Date.now();
      cacheState.totalLoaded = allTokens.length;
      
      // Notify listeners of progress
      cacheListeners.forEach(listener => listener());
      
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (err) {
      console.error(`❌ Cache: Failed to load page ${page}:`, err);
      cacheState.error = err instanceof Error ? err : new Error('Unknown error');
      break;
    }
  }
  
  // Final state update
  cacheState.isLoading = false;
  cacheState.isFetching = false;
  cacheState.hasMore = hasMore; // Keep hasMore true if there are more pages
  
  console.log(`✅ Cache: Loaded ${allTokens.length} tokens in ${Date.now() - startTime}ms!`);
  
  // Final notification
  cacheListeners.forEach(listener => listener());
};

// Search tokens in cache
const searchTokens = (query: string): Jetton[] => {
  if (!query.trim()) return cacheState.tokens;
  
  const lowercaseQuery = query.toLowerCase();
  return cacheState.tokens.filter(token => 
    token.symbol?.toLowerCase().includes(lowercaseQuery) ||
    token.name?.toLowerCase().includes(lowercaseQuery)
  );
};

// Check if cache is fresh
const isCacheFresh = (): boolean => {
  return Date.now() - cacheState.lastFetchTime < CACHE_DURATION;
};

// Initialize cache on module load
if (typeof window !== 'undefined') {
  // Start loading ALL tokens immediately when the module is imported
  startBackgroundLoading();
}

export const useTokensCache = (searchQuery: string = '') => {
  const [state, setState] = useState(cacheState);

  // Update state when cache changes
  useEffect(() => {
    const updateState = () => {
      setState({ ...cacheState });
    };

    cacheListeners.add(updateState);
    updateState(); // Initial update

    // Start background loading if not already started
    startBackgroundLoading();

    return () => {
      cacheListeners.delete(updateState);
    };
  }, []);

  // Search tokens
  const filteredTokens = searchQuery ? searchTokens(searchQuery) : state.tokens;

  // Force refresh if cache is stale
  const refresh = useCallback(() => {
    if (!isCacheFresh()) {
      console.log('🔄 Cache: Refreshing stale cache...');
      cacheState.tokens = [];
      cacheState.currentPage = 1;
      cacheState.hasMore = true;
      cacheState.error = null;
      loadTokensPage(1, true);
    }
  }, []);

  return {
    data: filteredTokens,
    allTokens: state.tokens,
    isLoading: state.isLoading,
    isFetching: state.isFetching,
    error: state.error,
    hasMore: state.hasMore,
    isCacheFresh: isCacheFresh(),
    refresh,
  };
};

// Export cache utilities
export const tokensCache = {
  getTokens: () => cacheState.tokens,
  searchTokens,
  isCacheFresh,
  refresh: () => {
    cacheState.tokens = [];
    cacheState.currentPage = 1;
    cacheState.hasMore = true;
    cacheState.error = null;
    loadAllTokens();
  },
  startLoading: startBackgroundLoading,
};
