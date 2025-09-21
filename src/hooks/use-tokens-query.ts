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

  // No filtering - show all tokens including those without images

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
        verification: ['WHITELISTED'],
        ...(label_id && { label_id }),
        ...(search && { search }),
      };

      const response = await swapCoffeeApiClient.getJettonsPaginated(params);
      
      console.log(`📊 Fetched ${response.data.length} tokens (page ${page}, size ${initialPageSize})`);
      console.log(`📈 Total tokens so far: ${append ? 'appending to existing' : 'replacing all'}`);
      
      // No filtering - use all tokens as received
      console.log(`✅ Using all ${response.data.length} tokens (no filtering)`);
      
      if (append) {
        setTokens(prev => {
          const newTokens = [...prev, ...response.data];
          console.log(`📊 Total tokens after append: ${newTokens.length}`);
          return newTokens;
        });
      } else {
        setTokens(response.data);
        console.log(`📊 Total tokens after replace: ${response.data.length}`);
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
  }, [initialPageSize, verification, label_id]);

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
        
        // No filtering - use all tokens
        allTokens = [...allTokens, ...response.data];
        console.log(`✅ Page ${currentPage}: Got ${response.data.length} tokens (Total so far: ${allTokens.length})`);
        
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
    
    console.log(`🎉 Finished fetching all pages. Total tokens: ${allTokens.length}`);
    setTokens(allTokens);
    setHasMore(false); // No more pages to load
    setCurrentPage(currentPage - 1);
  }, [initialPageSize, verification, label_id]);

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

  // Initial load - fetch only first page for fast loading
  useEffect(() => {
    if (!hasInitiallyLoaded.current && fetchTokensRef.current) {
      hasInitiallyLoaded.current = true;
      console.log('🚀 Initial load: Fetching first page only for fast loading');
      fetchTokens(1, '', false);
    }
  }, [fetchTokens]);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery !== currentSearch) {
      setCurrentSearch(searchQuery);
      setCurrentPage(1);
      setTokens([]);
      setHasMore(true);
      
      if (searchQuery.trim() === '') {
        // If search is empty, fetch only first page for fast loading
        fetchTokens(1, '', false);
      } else {
        // If searching, fetch only first page for search results
        fetchTokens(1, searchQuery, false);
      }
    }
  }, [searchQuery, currentSearch, fetchTokens]);

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
