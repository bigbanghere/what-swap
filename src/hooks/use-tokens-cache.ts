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

// Utility function to deduplicate tokens by address
const deduplicateTokens = (tokens: Jetton[]): Jetton[] => {
  const seen = new Set<string>();
  return tokens.filter(token => {
    if (seen.has(token.address)) {
      console.warn(`⚠️ Duplicate token detected: ${token.symbol} (${token.address})`);
      return false;
    }
    seen.add(token.address);
    return true;
  });
};

// Global loading coordination
let globalLoadingState = {
  isInitialized: false,
  isLoading: false,
  loadingPromise: null as Promise<void> | null,
  lastTriggerTime: 0,
  triggerCount: 0,
};

// Request deduplication
const activeRequests = new Map<string, Promise<any>>();

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
const pageSize = 100; // Swap.coffee API max size is 100

const fetchTokensPage = async (page: number, retryCount = 0): Promise<{ data: Jetton[]; hasMore: boolean }> => {
  const requestKey = `tokens-page-${page}`;
  
  // Check if request is already in progress
  if (activeRequests.has(requestKey)) {
    console.log(`🔄 Cache: Request for page ${page} already in progress, reusing...`);
    return activeRequests.get(requestKey)!;
  }
  
  const requestPromise = (async () => {
    console.log(`🚀 Cache: Fetching page ${page} with size ${pageSize}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
    
    try {
      const response = await swapCoffeeApiClient.getJettonsPaginated({
        page,
        size: pageSize,
        verification: ['WHITELISTED', 'COMMUNITY'],
      });

      console.log(`✅ Cache: Page ${page}: Got ${response.data.length} tokens (hasMore: ${response.hasMore})`);
      console.log(`🔍 API Response details:`, {
        page,
        dataLength: response.data.length,
        hasMore: response.hasMore,
        total: response.total,
        pageSize: response.size,
        expectedPageSize: pageSize
      });
      
      return {
        data: response.data,
        hasMore: response.hasMore,
      };
    } catch (error) {
      console.error(`❌ Cache: Page ${page} failed:`, error);
      console.error(`❌ Cache: Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        retryCount
      });
      
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
    } finally {
      // Clean up the request from active requests
      activeRequests.delete(requestKey);
    }
  })();
  
  // Store the request promise
  activeRequests.set(requestKey, requestPromise);
  
  return requestPromise;
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
      cacheState.tokens = deduplicateTokens(data);
      console.log(`🎯 Cache: Initial load: Cached ${cacheState.tokens.length} tokens (deduplicated from ${data.length})`);
    } else {
      // Merge with existing tokens and deduplicate
      const mergedTokens = [...cacheState.tokens, ...data];
      const beforeCount = mergedTokens.length;
      cacheState.tokens = deduplicateTokens(mergedTokens);
      const duplicatesRemoved = beforeCount - cacheState.tokens.length;
      console.log(`📊 Cache: Total cached tokens: ${cacheState.tokens.length} (added ${data.length}, removed ${duplicatesRemoved} duplicates)`);
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

// Coordinated loading function to prevent multiple simultaneous loads
const startBackgroundLoading = (delay = 0) => {
  const now = Date.now();
  
  // Prevent rapid successive calls (debounce within 1 second)
  if (now - globalLoadingState.lastTriggerTime < 1000) {
    console.log('🚀 Cache: Skipping duplicate loading trigger (debounced)');
    return;
  }
  
  globalLoadingState.lastTriggerTime = now;
  globalLoadingState.triggerCount++;
  
  // If already loading, return the existing promise
  if (globalLoadingState.isLoading && globalLoadingState.loadingPromise) {
    console.log('🚀 Cache: Already loading, returning existing promise');
    return globalLoadingState.loadingPromise;
  }
  
  // If tokens are already loaded and cache is fresh, skip loading
  if (cacheState.tokens.length > 0 && isCacheFresh()) {
    console.log('🚀 Cache: Tokens already loaded and cache is fresh, skipping');
    globalLoadingState.isInitialized = true;
    return Promise.resolve();
  }
  
  // If no tokens are loaded, we need to load them regardless of cache freshness
  if (cacheState.tokens.length === 0) {
    console.log('🚀 Cache: No tokens loaded, starting loading...');
  }
  
  const loadTokens = async () => {
    // Always load tokens if we don't have all of them yet
    if (cacheState.tokens.length === 0 || cacheState.hasMore) {
      console.log(`🚀 Cache: Starting coordinated token loading (trigger #${globalLoadingState.triggerCount})...`);
      globalLoadingState.isLoading = true;
      globalLoadingState.isInitialized = true;
      
      // Set loading state immediately and notify listeners
      cacheState.isLoading = true;
      cacheListeners.forEach(listener => listener());
      
      try {
        await loadAllTokens();
      } finally {
        globalLoadingState.isLoading = false;
        globalLoadingState.loadingPromise = null;
      }
    } else {
      console.log('🚀 Cache: Skipping loading - all tokens already loaded');
      globalLoadingState.isInitialized = true;
    }
  };
  
  if (delay > 0) {
    console.log(`🚀 Cache: Starting background token loading with ${delay}ms delay...`);
    globalLoadingState.loadingPromise = new Promise((resolve) => {
      setTimeout(async () => {
        await loadTokens();
        resolve();
      }, delay);
    });
  } else {
    console.log('🚀 Cache: Starting background token loading...');
    globalLoadingState.loadingPromise = loadTokens();
  }
  
  return globalLoadingState.loadingPromise;
};

// Module-level auto-loading removed - loading is now coordinated through the hook

// Simple API test function
const testAPI = async () => {
  console.log('🧪 Testing API directly...');
  try {
    const response = await fetch('/api/proxy/tokens?path=jettons&page=1&size=100&verification=WHITELISTED&verification=COMMUNITY');
    const data = await response.json();
    console.log('🧪 Direct API test result:', {
      status: response.status,
      ok: response.ok,
      dataLength: data.data?.length || 0,
      hasMore: data.hasMore,
      total: data.total,
      page: data.page,
      size: data.size
    });
  } catch (error) {
    console.error('🧪 Direct API test failed:', error);
  }
};

// Check if we have TMA parameters (for limiting token loading)
const hasTMAParams = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hasSearchParams = !!(urlParams.get('startapp') || urlParams.get('tgWebAppStartParam'));
  
  // Check hash parameters
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const hasHashParams = !!(hashParams.get('startapp') || hashParams.get('tgWebAppStartParam'));
  
  const hasParams = hasSearchParams || hasHashParams;
  console.log(`🔍 TMA Detection: search=${hasSearchParams}, hash=${hasHashParams}, total=${hasParams}`);
  
  return hasParams;
};

// Load tokens progressively (all available tokens)
const loadAllTokens = async () => {
  const isTMAMode = hasTMAParams();
  // Load all available tokens regardless of TMA mode
  const maxPages = Infinity; // Load all available tokens
  
  console.log(`🚀 Cache: Starting progressive loading (TMA mode detected: ${isTMAMode}, loading all tokens)...`);
  
  // Test API first
  await testAPI();
  
  // Set initial loading state
  cacheState.isLoading = true;
  cacheState.error = null;
  cacheListeners.forEach(listener => listener());
  
  // Start from current page if tokens are already loaded
  let page = cacheState.tokens.length > 0 ? Math.floor(cacheState.tokens.length / pageSize) + 1 : 1;
  let hasMore = cacheState.hasMore !== false; // Use cached hasMore if available
  let allTokens: Jetton[] = [...cacheState.tokens]; // Start with existing tokens
  const startTime = Date.now();
  
  console.log(`🚀 Cache: Starting from page ${page} with ${allTokens.length} existing tokens`);
  
  while (hasMore && page <= maxPages && page <= 100) { // Safety limit of 100 pages max
    try {
      console.log(`📥 Cache: Loading page ${page}... (hasMore: ${hasMore}, page <= maxPages: ${page <= maxPages}, maxPages: ${maxPages})`);
      const { data, hasMore: pageHasMore } = await fetchTokensPage(page);
      
      // Check if we got data
      if (data.length === 0) {
        console.log(`⚠️ Cache: Empty page ${page}, stopping`);
        break;
      } else {
        allTokens = [...allTokens, ...data];
        console.log(`✅ Cache: Page ${page}: Got ${data.length} tokens (Total: ${allTokens.length})`);
        
        // Log some sample tokens for debugging
        if (page <= 3) {
          console.log(`🔍 Sample tokens from page ${page}:`, data.slice(0, 3).map(t => ({ symbol: t.symbol, address: t.address })));
        }
      }
      
      hasMore = pageHasMore && data.length > 0;
      
      // Safety check: if we got a full page of data but API says no more, 
      // continue for a few more pages to be sure (API might be wrong)
      if (!pageHasMore && data.length === pageSize && page < 100) {
        console.log(`⚠️ Cache: API says no more pages but got full page (${data.length} tokens), continuing for safety...`);
        hasMore = true;
      }
      
      // Additional safety: if we have very few tokens loaded compared to expected total, keep trying
      const expectedMinTokens = 4000; // Expected around 4471 tokens
      if (!hasMore && allTokens.length < expectedMinTokens && page < 50) {
        console.log(`⚠️ Cache: Only ${allTokens.length} tokens loaded (expected ~${expectedMinTokens}), continuing to page ${page + 1}...`);
        hasMore = true;
      }
      
      // If API says no more but we have very few tokens, try a different approach
      if (!hasMore && allTokens.length < 1000 && page < 5) {
        console.log(`⚠️ Cache: API says no more but only ${allTokens.length} tokens loaded. Trying alternative approach...`);
        
        // Try to get all tokens without pagination
        try {
          const allTokensResponse = await swapCoffeeApiClient.getJettons({
            verification: ['WHITELISTED', 'COMMUNITY'],
          });
          
          if (allTokensResponse.length > allTokens.length) {
            console.log(`✅ Cache: Got ${allTokensResponse.length} tokens via non-paginated API`);
            allTokens = allTokensResponse;
            hasMore = false; // We got all tokens
            break;
          }
        } catch (error) {
          console.log(`⚠️ Cache: Non-paginated API also failed:`, error);
        }
      }
      
      page++;
      
      console.log(`🔄 Cache: After page ${page-1}: hasMore=${hasMore}, page=${page}, maxPages=${maxPages}, continuing=${hasMore && page <= maxPages}`);
      
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
  
  // Deduplicate final tokens
  const beforeDedup = allTokens.length;
  allTokens = deduplicateTokens(allTokens);
  const duplicatesRemoved = beforeDedup - allTokens.length;
  
  // Final state update
  cacheState.tokens = allTokens;
  cacheState.isLoading = false;
  cacheState.isFetching = false;
  cacheState.hasMore = hasMore && page <= maxPages; // Keep hasMore true if there are more pages and we haven't hit the limit
  
  const loadingMode = isTMAMode ? ' (TMA mode - limited load)' : '';
  console.log(`✅ Cache: Loaded ${allTokens.length} tokens in ${Date.now() - startTime}ms${loadingMode}! (removed ${duplicatesRemoved} duplicates)`);
  
  // Ensure we have at least some tokens for shortcuts
  if (allTokens.length < 10) {
    console.warn(`⚠️ Cache: Very few tokens loaded (${allTokens.length}), shortcuts may not work properly`);
  }
  
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

    // Start loading if no tokens are loaded yet
    if (cacheState.tokens.length === 0) {
      console.log('🚀 useTokensCache: Starting initial token loading...');
      startBackgroundLoading(200); // Small delay to let UI render first
    }
    
    // Fallback: if no tokens loaded after 5 seconds, try to load at least some
    if (cacheState.tokens.length === 0) {
      const fallbackTimeout = setTimeout(async () => {
        if (cacheState.tokens.length === 0) {
          console.log('🚀 useTokensCache: Fallback loading - trying to get at least some tokens...');
          try {
            const fallbackTokens = await swapCoffeeApiClient.getJettons({
              verification: ['WHITELISTED', 'COMMUNITY'],
            });
            if (fallbackTokens.length > 0) {
              cacheState.tokens = fallbackTokens.slice(0, 100); // Take first 100 tokens
              cacheState.isLoading = false;
              cacheState.lastFetchTime = Date.now();
              cacheListeners.forEach(listener => listener());
              console.log(`✅ useTokensCache: Fallback loaded ${fallbackTokens.length} tokens`);
            }
          } catch (error) {
            console.error('❌ useTokensCache: Fallback loading failed:', error);
          }
        }
      }, 5000);
      
      return () => clearTimeout(fallbackTimeout);
    }

    return () => {
      cacheListeners.delete(updateState);
    };
  }, []);

  // Search tokens and ensure deduplication
  const filteredTokens = searchQuery ? searchTokens(searchQuery) : deduplicateTokens(state.tokens);

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
    allTokens: deduplicateTokens(state.tokens),
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
