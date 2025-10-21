import { useState, useEffect } from 'react';
import { swapCoffeeApiClient, Jetton } from '@/lib/swap-coffee-api';

// Default token addresses (corrected)
const TON_ADDRESS = '0:0000000000000000000000000000000000000000000000000000000000000000';
const USDT_ADDRESS = '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe';

interface DefaultTokensState {
  usdt: Jetton | null;
  ton: Jetton | null;
  isLoading: boolean;
  error: Error | null;
}

// Global cache for default tokens
let defaultTokensCache: DefaultTokensState = {
  usdt: null,
  ton: null,
  isLoading: false,
  error: null,
};

// Cache listeners
const cacheListeners = new Set<() => void>();

const fetchDefaultTokens = async () => {
  if (defaultTokensCache.isLoading) return;
  
  defaultTokensCache.isLoading = true;
  defaultTokensCache.error = null;
  
  // Notify listeners
  cacheListeners.forEach(listener => listener());
  
  try {
    console.log('🔄 DefaultTokens: Fetching USDT and TON from API...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: API call took too long')), 3000); // 3 second timeout
    });
    
    // Fetch both tokens in parallel with timeout
    const [usdtResponse, tonResponse] = await Promise.race([
      Promise.all([
        swapCoffeeApiClient.getJettonByAddress(USDT_ADDRESS),
        swapCoffeeApiClient.getJettonByAddress(TON_ADDRESS),
      ]),
      timeoutPromise
    ]) as [any, any];
    
    defaultTokensCache.usdt = usdtResponse;
    defaultTokensCache.ton = tonResponse;
    defaultTokensCache.isLoading = false;
    defaultTokensCache.error = null;
    
    console.log('✅ DefaultTokens: Successfully fetched default tokens');
    console.log('✅ DefaultTokens: USDT:', usdtResponse.symbol, usdtResponse.name);
    console.log('✅ DefaultTokens: TON:', tonResponse.symbol, tonResponse.name);
    
  } catch (error) {
    console.error('❌ DefaultTokens: Failed to fetch default tokens:', error);
    defaultTokensCache.error = error instanceof Error ? error : new Error('Failed to fetch default tokens');
    defaultTokensCache.isLoading = false;
  }
  
  // Notify listeners
  cacheListeners.forEach(listener => listener());
};

// Initialize default tokens on module load
if (typeof window !== 'undefined') {
  fetchDefaultTokens();
}

export const useDefaultTokens = () => {
  const [state, setState] = useState(defaultTokensCache);

  useEffect(() => {
    const updateState = () => {
      setState({ ...defaultTokensCache });
    };

    cacheListeners.add(updateState);
    updateState(); // Initial update

    return () => {
      cacheListeners.delete(updateState);
    };
  }, []);

  return {
    usdt: state.usdt,
    ton: state.ton,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchDefaultTokens,
  };
};

// Export cache utilities
export const defaultTokensCacheUtils = {
  getTokens: () => defaultTokensCache,
  refetch: fetchDefaultTokens,
};
