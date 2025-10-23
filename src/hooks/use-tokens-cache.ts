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

const fetchTokensPage = async (page: number, retryCount = 0): Promise<{ data: Jetton[]; hasMore: boolean }> => {
  console.log(`🚀 Cache: Fetching page ${page} with size ${pageSize}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
  
  try {
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
  } catch (error) {
    if (retryCount < 2 && error instanceof Error && error.message.includes('422')) {
      console.log(`⚠️ Cache: Page ${page} failed with 422, likely end of data`);
      return { data: [], hasMore: false };
    } else if (retryCount < 2) {
      console.log(`🔄 Cache: Retrying page ${page} in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchTokensPage(page, retryCount + 1);
    } else {
      throw error;
    }
  }
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
const startBackgroundLoading = (delay = 0) => {
  if (cacheState.tokens.length === 0 && !cacheState.isLoading && !cacheState.isFetching && !cacheState.error) {
    if (delay > 0) {
      console.log(`🚀 Cache: Starting background token loading with ${delay}ms delay...`);
      setTimeout(() => {
        loadAllTokens();
      }, delay);
    } else {
      console.log('🚀 Cache: Starting background token loading...');
      loadAllTokens();
    }
  } else {
    console.log('🚀 Cache: Skipping background loading - already in progress or completed');
  }
};

// Start loading immediately when the module loads (for better performance)
if (typeof window !== 'undefined') {
  // Start background loading with a small delay to let the UI render first
  setTimeout(() => {
    startBackgroundLoading();
  }, 200);
}

// Check if we have TMA parameters (for limiting token loading)
const hasTMAParams = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return !!(urlParams.get('startapp') || urlParams.get('tgWebAppStartParam'));
};

// Load tokens progressively (all available tokens)
const loadAllTokens = async () => {
  const isTMAMode = hasTMAParams();
  const maxPages = isTMAMode ? 3 : Infinity; // Load only first 3 pages (~150 tokens) for TMA mode
  
  console.log(`🚀 Cache: Starting progressive loading ${isTMAMode ? '(TMA mode - limited to 3 pages)' : '(all tokens)'}...`);
  
  // Set initial loading state
  cacheState.isLoading = true;
  cacheState.error = null;
  cacheListeners.forEach(listener => listener());
  
  let page = 1;
  let hasMore = true;
  let allTokens: Jetton[] = [];
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
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`❌ Cache: Failed to load page ${page}:`, err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('422')) {
          console.log(`⚠️ Cache: Page ${page} returned 422 - likely reached end of data`);
          hasMore = false;
          break;
        } else if (err.message.includes('429')) {
          console.log(`⚠️ Cache: Rate limited on page ${page}, waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      
      cacheState.error = err instanceof Error ? err : new Error('Unknown error');
      break;
    }
  }
  
  // Final state update
  cacheState.isLoading = false;
  cacheState.isFetching = false;
  cacheState.hasMore = hasMore && page <= maxPages; // Keep hasMore true if there are more pages and we haven't hit the limit
  
  const loadingMode = isTMAMode ? ' (TMA mode - limited load)' : '';
  console.log(`✅ Cache: Loaded ${allTokens.length} tokens in ${Date.now() - startTime}ms${loadingMode}!`);
  
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
  ).sort((a, b) => {
    // Prioritize tokens where symbol matches over name matches
    const aSymbolMatch = a.symbol?.toLowerCase().includes(lowercaseQuery) || false;
    const bSymbolMatch = b.symbol?.toLowerCase().includes(lowercaseQuery) || false;
    const aNameMatch = a.name?.toLowerCase().includes(lowercaseQuery) || false;
    const bNameMatch = b.name?.toLowerCase().includes(lowercaseQuery) || false;
    
    // If both have symbol matches or both have name matches, maintain original order
    if (aSymbolMatch === bSymbolMatch) return 0;
    // If only one has symbol match, prioritize it
    if (aSymbolMatch && !bSymbolMatch) return -1;
    if (!aSymbolMatch && bSymbolMatch) return 1;
    
    return 0;
  });
};

// Check if cache is fresh
const isCacheFresh = (): boolean => {
  return Date.now() - cacheState.lastFetchTime < CACHE_DURATION;
};

// Initialize cache on module load
if (typeof window !== 'undefined') {
  // Don't start loading immediately - wait for user tokens to load first
  // startBackgroundLoading(); // Commented out - will be triggered by user tokens completion
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

    // Don't start background loading here - wait for user tokens to complete
    // startBackgroundLoading(); // Removed - will be triggered by user tokens completion

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

// Function to start all tokens loading (can be called from user tokens cache)
export const startAllTokensLoading = (delay = 0) => {
  console.log('🚀 AllTokensCache: Starting loading triggered by user tokens completion');
  startBackgroundLoading(delay);
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
  startAllTokensLoading,
};
