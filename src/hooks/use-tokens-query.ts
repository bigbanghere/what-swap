import { useState, useEffect, useCallback, useRef } from 'react';
import { swapCoffeeApiClient, Jetton, JettonsParams } from '@/lib/swap-coffee-api';

interface UseTokensQueryOptions {
  initialPageSize?: number;
  searchQuery?: string;
  verification?: string[];
  label_id?: number;
}

interface UseTokensQueryReturn {
  tokens: Jetton[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  search: (query: string) => void;
  clearSearch: () => void;
  refetch: () => void;
}

export function useTokensQuery(options: UseTokensQueryOptions = {}): UseTokensQueryReturn {
  const {
    initialPageSize = 20,
    searchQuery = '',
    verification = ['WHITELISTED', 'COMMUNITY'], // Default to verified tokens
    label_id,
  } = options;

  const [tokens, setTokens] = useState<Jetton[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearch, setCurrentSearch] = useState(searchQuery);
  const hasInitiallyLoaded = useRef(false);
  const fetchTokensRef = useRef<((page: number, search: string, append?: boolean) => Promise<void>) | undefined>();

  // Function to validate if a token has a valid image URL
  const isValidTokenImage = useCallback((token: Jetton): boolean => {
    if (!token.image_url || token.image_url.trim() === '') {
      console.log('❌ Token rejected - no image_url:', token.symbol);
      return false;
    }
    
    // Check if it's a valid URL format
    try {
      new URL(token.image_url);
      return true;
    } catch (error) {
      console.log('❌ Token rejected - invalid URL:', token.symbol, token.image_url, error);
      return false;
    }
  }, []);

  // Function to filter out tokens without valid images
  const filterValidTokens = useCallback((tokens: Jetton[]): Jetton[] => {
    // Temporarily disable filtering to debug
    console.log(`🔍 DEBUG: Received ${tokens.length} tokens, checking validity...`);
    
    const validTokens = tokens.filter(isValidTokenImage);
    const invalidCount = tokens.length - validTokens.length;
    
    if (invalidCount > 0) {
      console.log(`🚫 Filtered out ${invalidCount} tokens without valid images`);
    }
    
    console.log(`✅ Returning ${validTokens.length} valid tokens`);
    return validTokens;
  }, [isValidTokenImage]);

  const fetchTokens = useCallback(async (page: number, search: string, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const params: JettonsParams = {
        page,
        size: initialPageSize,
        verification,
        ...(label_id && { label_id }),
        ...(search && { search }),
      };

      const response = await swapCoffeeApiClient.getJettonsPaginated(params);
      
      console.log(`📊 Fetched ${response.data.length} tokens (page ${page}, size ${initialPageSize})`);
      console.log(`📈 Total tokens so far: ${append ? 'appending to existing' : 'replacing all'}`);
      
      // Filter out tokens without valid images
      const validTokens = filterValidTokens(response.data);
      console.log(`✅ After filtering: ${validTokens.length} valid tokens (removed ${response.data.length - validTokens.length} invalid)`);
      
      if (append) {
        setTokens(prev => {
          const newTokens = [...prev, ...validTokens];
          console.log(`📊 Total tokens after append: ${newTokens.length}`);
          return newTokens;
        });
      } else {
        setTokens(validTokens);
        console.log(`📊 Total tokens after replace: ${validTokens.length}`);
      }
      
      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tokens';
      setError(errorMessage);
      console.error('Error fetching tokens:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [initialPageSize, verification, label_id, filterValidTokens]);

  // Update ref whenever fetchTokens changes
  useEffect(() => {
    fetchTokensRef.current = fetchTokens;
  }, [fetchTokens]);

  // Function to fetch all available pages
  const fetchAllPages = useCallback(async () => {
    if (!fetchTokensRef.current) return;
    
    let currentPage = 1;
    let allTokens: Jetton[] = [];
    let hasMorePages = true;
    
    console.log('🚀 Starting to fetch all token pages...');
    
    while (hasMorePages) {
      try {
        console.log(`📄 Fetching page ${currentPage}...`);
        const response = await swapCoffeeApiClient.getJettonsPaginated({
          page: currentPage,
          size: initialPageSize,
          verification,
          ...(label_id && { label_id }),
        });
        
        // Filter out tokens without valid images
        const validTokens = filterValidTokens(response.data);
        allTokens = [...allTokens, ...validTokens];
        console.log(`✅ Page ${currentPage}: Got ${response.data.length} tokens, ${validTokens.length} valid (Total so far: ${allTokens.length})`);
        
        hasMorePages = response.hasMore;
        currentPage++;
        
        // Safety check to prevent infinite loops
        if (currentPage > 50) {
          console.warn('⚠️ Stopped fetching after 50 pages to prevent infinite loop');
          break;
        }
      } catch (err) {
        console.error(`❌ Error fetching page ${currentPage}:`, err);
        break;
      }
    }
    
    console.log(`🎉 Finished fetching all pages. Total valid tokens: ${allTokens.length}`);
    setTokens(allTokens);
    setHasMore(false); // No more pages to load
    setCurrentPage(currentPage - 1);
  }, [initialPageSize, verification, label_id, filterValidTokens]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchTokens(currentPage + 1, currentSearch, true);
    }
  }, [fetchTokens, currentPage, currentSearch, isLoadingMore, hasMore]);

  const search = useCallback((query: string) => {
    setCurrentSearch(query);
    setCurrentPage(1);
    setTokens([]);
    setHasMore(true);
    fetchTokens(1, query, false);
  }, [fetchTokens]);

  const clearSearch = useCallback(() => {
    setCurrentSearch('');
    setCurrentPage(1);
    setTokens([]);
    setHasMore(true);
    fetchTokens(1, '', false);
  }, [fetchTokens]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    setTokens([]);
    setHasMore(true);
    fetchTokens(1, currentSearch, false);
  }, [fetchTokens, currentSearch]);

  // Initial load - fetch all pages automatically
  useEffect(() => {
    if (!hasInitiallyLoaded.current && fetchTokensRef.current) {
      hasInitiallyLoaded.current = true;
      fetchAllPages();
    }
  }, [fetchAllPages]); // Include fetchAllPages dependency

  // Handle search query changes
  useEffect(() => {
    if (searchQuery !== currentSearch) {
      setCurrentSearch(searchQuery);
      setCurrentPage(1);
      setTokens([]);
      setHasMore(true);
      
      if (searchQuery.trim() === '') {
        // If search is empty, fetch all pages
        fetchAllPages();
      } else {
        // If searching, fetch only first page for search results
        fetchTokens(1, searchQuery, false);
      }
    }
  }, [searchQuery, currentSearch, fetchTokens, fetchAllPages]);

  return {
    tokens,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    search,
    clearSearch,
    refetch,
  };
}
