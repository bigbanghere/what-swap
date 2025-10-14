import { useState, useEffect, useCallback } from 'react';
import { swapCoffeeApiClient, UserJetton } from '@/lib/swap-coffee-api';
import { startAllTokensLoading } from './use-tokens-cache';

interface UserTokensCacheState {
  tokens: UserJetton[];
  isLoading: boolean;
  error: Error | null;
  lastFetchTime: number;
  walletAddress: string | null;
}

// Global cache state for user tokens
let userTokensCacheState: UserTokensCacheState = {
  tokens: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,
  walletAddress: null,
};

// Cache listeners for components that need to react to cache updates
const userTokensCacheListeners = new Set<() => void>();

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter than all tokens cache)

const fetchUserTokens = async (walletAddress: string, retryCount = 0): Promise<UserJetton[]> => {
  console.log(`🚀 UserTokensCache: Fetching user tokens for wallet: ${walletAddress}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
  
  try {
    const tokens = await swapCoffeeApiClient.getUserJettons(walletAddress);
    console.log(`✅ UserTokensCache: Got ${tokens.length} user tokens`);
    return tokens;
  } catch (error) {
    if (retryCount < 2) {
      console.log(`🔄 UserTokensCache: Retrying in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserTokens(walletAddress, retryCount + 1);
    } else {
      throw error;
    }
  }
};

const loadUserTokens = async (walletAddress: string) => {
  try {
    userTokensCacheState.isLoading = true;
    userTokensCacheState.error = null;
    userTokensCacheState.walletAddress = walletAddress;
    
    // Notify listeners
    userTokensCacheListeners.forEach(listener => listener());

    const tokens = await fetchUserTokens(walletAddress);
    
    userTokensCacheState.tokens = tokens;
    userTokensCacheState.lastFetchTime = Date.now();
    userTokensCacheState.isLoading = false;
    
    console.log(`✅ UserTokensCache: Loaded ${tokens.length} user tokens`);
    
    // Notify listeners
    userTokensCacheListeners.forEach(listener => listener());
    
    // Trigger all tokens loading after user tokens are loaded
    console.log('🚀 UserTokensCache: Triggering all tokens loading...');
    startAllTokensLoading();

  } catch (err) {
    console.error(`❌ UserTokensCache: Failed to fetch user tokens:`, err);
    userTokensCacheState.error = err instanceof Error ? err : new Error('Unknown error');
    userTokensCacheState.isLoading = false;
    userTokensCacheState.tokens = [];
    
    // Notify listeners even on error
    userTokensCacheListeners.forEach(listener => listener());
    
    // Still trigger all tokens loading even if user tokens failed
    console.log('🚀 UserTokensCache: Triggering all tokens loading despite user tokens error...');
    startAllTokensLoading();
  }
};

// Check if cache is fresh for current wallet
const isUserTokensCacheFresh = (walletAddress: string | null): boolean => {
  if (!walletAddress || userTokensCacheState.walletAddress !== walletAddress) {
    return false;
  }
  return Date.now() - userTokensCacheState.lastFetchTime < CACHE_DURATION;
};

// Clear cache when wallet changes
const clearUserTokensCache = () => {
  userTokensCacheState.tokens = [];
  userTokensCacheState.isLoading = false;
  userTokensCacheState.error = null;
  userTokensCacheState.lastFetchTime = 0;
  userTokensCacheState.walletAddress = null;
  userTokensCacheListeners.forEach(listener => listener());
};

export const useUserTokensCache = (walletAddress: string | null) => {
  const [state, setState] = useState(userTokensCacheState);

  // Update state when cache changes
  useEffect(() => {
    const updateState = () => {
      setState({ ...userTokensCacheState });
    };

    userTokensCacheListeners.add(updateState);
    updateState(); // Initial update

    return () => {
      userTokensCacheListeners.delete(updateState);
    };
  }, []);

  // Load user tokens when wallet address changes or on initial mount
  useEffect(() => {
    if (!walletAddress) {
      clearUserTokensCache();
      // Don't start all tokens loading immediately when wallet address is empty
      // because it might become available shortly (timing issue with useTonAddress hook)
      // Instead, we'll use a timeout to wait for wallet connection
      const timeoutId = setTimeout(() => {
        // If wallet address is still empty after 500ms, start all tokens loading
        if (!walletAddress) {
          console.log('🚀 UserTokensCache: No wallet connected after timeout, starting all tokens loading...');
          startAllTokensLoading();
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }

    // Always load user tokens immediately when wallet is connected
    // Don't check cache freshness - always load fresh when wallet connects
    if (!userTokensCacheState.isLoading) {
      console.log('🚀 UserTokensCache: Loading user tokens for wallet:', walletAddress);
      loadUserTokens(walletAddress);
    }
  }, [walletAddress]);

  // Note: Removed the second useEffect that was running on mount only
  // because it's redundant with the wallet address change effect above

  // Force refresh
  const refresh = useCallback(() => {
    if (walletAddress) {
      console.log('🔄 UserTokensCache: Refreshing user tokens...');
      loadUserTokens(walletAddress);
    }
  }, [walletAddress]);

  return {
    userTokens: state.tokens,
    isLoading: state.isLoading,
    error: state.error,
    isCacheFresh: isUserTokensCacheFresh(walletAddress),
    refresh,
  };
};

// Export cache utilities
export const userTokensCache = {
  getUserTokens: () => userTokensCacheState.tokens,
  isCacheFresh: (walletAddress: string | null) => isUserTokensCacheFresh(walletAddress),
  refresh: (walletAddress: string | null) => {
    if (walletAddress) {
      loadUserTokens(walletAddress);
    }
  },
  clear: clearUserTokensCache,
};
