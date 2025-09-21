import { useState, useEffect, useCallback } from 'react';
import { swapCoffeeApiClient } from '@/lib/swap-coffee-api';

export const TOKENS_QUERY_KEY = 'tokens';

export interface Jetton {
  created_at: string;
  address: string;
  total_supply: string;
  name: string;
  symbol: string;
  decimals: number;
  mintable: boolean;
  verification: 'BLACKLISTED' | 'UNKNOWN' | 'COMMUNITY' | 'WHITELISTED';
  contract_interface: string;
  image_url: string;
  market_stats?: {
    holders_count: number;
    price_usd: number;
    price_change_5m: number;
    price_change_1h: number;
    price_change_6h: number;
    price_change_24h: number;
    volume_usd_24h: number;
    tvl_usd: number;
    fdmc: number;
    trust_score: number;
  };
  labels: Array<{
    label: string;
    label_id: number;
    created_at: string;
    expires_at: string;
  }>;
}

export const useTokensQueryFast = (searchQuery: string = '') => {
  const [tokens, setTokens] = useState<Jetton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 100; // Load 100 tokens per page as per API default

  const fetchTokens = useCallback(async (page: number, isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsFetching(true);
      }

      console.log(`🚀 Fetching page ${page} with size ${pageSize}${searchQuery ? ` (search: "${searchQuery}")` : ''}`);

      const response = await swapCoffeeApiClient.getJettonsPaginated({
        page,
        size: pageSize,
        verification: ['WHITELISTED', 'COMMUNITY'],
        ...(searchQuery && { search: searchQuery }),
      });

      console.log(`✅ Page ${page}: Got ${response.data.length} tokens (hasMore: ${response.hasMore})`);

      if (isInitial) {
        setTokens(response.data);
        console.log(`🎯 Initial load: Displaying ${response.data.length} tokens immediately`);
      } else {
        setTokens(prev => {
          const newTokens = [...prev, ...response.data];
          console.log(`📊 Total tokens now: ${newTokens.length} (added ${response.data.length})`);
          return newTokens;
        });
      }

      setHasMore(response.hasMore);
      setCurrentPage(page + 1);

      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsFetching(false);
      }

    } catch (err) {
      console.error(`❌ Failed to fetch page ${page}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      if (isInitial) {
        setIsLoading(false);
        // Set mock data as fallback
        const mockTokens: Jetton[] = [
          {
            address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
            symbol: 'TON',
            name: 'TON',
            image_url: 'https://ton.org/download/ton_symbol.png',
            decimals: 9,
            verification: 'WHITELISTED',
            created_at: '2022-01-01T00:00:00Z',
            total_supply: '5000000000',
            mintable: false,
            contract_interface: 'jetton',
            labels: [],
          },
          {
            address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            symbol: 'USDT',
            name: 'Tether USD',
            image_url: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
            decimals: 6,
            verification: 'WHITELISTED',
            created_at: '2022-01-01T00:00:00Z',
            total_supply: '1000000000',
            mintable: true,
            contract_interface: 'jetton',
            labels: [],
          },
          {
            address: 'EQD0vdSA_NedR9uvNH89V4TZEvEcvFll_HKhggT0v_t-4Q5_',
            symbol: 'USDC',
            name: 'USD Coin',
            image_url: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
            decimals: 6,
            verification: 'WHITELISTED',
            created_at: '2022-01-01T00:00:00Z',
            total_supply: '1000000000',
            mintable: true,
            contract_interface: 'jetton',
            labels: [],
          },
        ];
        setTokens(mockTokens);
        console.log('🔄 Using mock tokens as fallback');
      } else {
        setIsFetching(false);
      }
    }
  }, [searchQuery, pageSize]);

  // Initial load - fetch first page immediately
  useEffect(() => {
    console.log('🚀 Fast tokens query: Starting progressive loading');
    setTokens([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    fetchTokens(1, true);
  }, [searchQuery, fetchTokens]);

  // Auto-load more pages every 3 seconds if we have more data
  useEffect(() => {
    if (!isLoading && hasMore && !isFetching) {
      const interval = setInterval(() => {
        if (hasMore && !isFetching) {
          console.log(`⏰ Auto-loading: Fetching page ${currentPage}`);
          fetchTokens(currentPage, false);
        }
      }, 3000); // Load next page every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading, hasMore, isFetching, currentPage, fetchTokens]);

  return {
    data: tokens,
    isLoading,
    isFetching,
    error,
    hasMore,
    refetch: () => {
      setTokens([]);
      setCurrentPage(1);
      setHasMore(true);
      setError(null);
      fetchTokens(1, true);
    }
  };
};
