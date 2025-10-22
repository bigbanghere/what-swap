"use client";

import { useState, useEffect } from 'react';
import { useTokensCache } from './use-tokens-cache';
import { useDefaultTokens } from './use-default-tokens';
import { swapCoffeeApiClient } from '@/lib/swap-coffee-api';

interface TMAParams {
  tokenAddress?: string;
  mode?: "buy" | "sell";
  amount?: string;
}

// Parse startapp parameter for token address
function parseStartAppParams(startParam: string): TMAParams | null {
  try {
    // Check if it's a base64 encoded token address
    if (startParam.length > 20 && !startParam.includes('{')) {
      // Assume it's a token address
      return {
        tokenAddress: startParam,
        mode: "buy", // Default to buy mode
        amount: "1" // Default to 1 TON
      };
    }
    
    // Try to parse as JSON
    const decoded = decodeURIComponent(startParam);
    const params = JSON.parse(decoded);
    
    return {
      tokenAddress: params.tokenAddress || params.token_address,
      mode: params.mode || "buy",
      amount: params.amount || "1"
    };
  } catch (error) {
    console.error("Failed to parse startapp parameters:", error);
    return null;
  }
}

export function useTMAParams() {
  const [isTMAReady, setIsTMAReady] = useState(true); // Start as true, don't block the UI
  const [tmaLoadingReason, setTmaLoadingReason] = useState<string>("");
  const [tmaParams, setTmaParams] = useState<TMAParams | null>(null);
  const [tmaToken, setTmaToken] = useState<any>(null);
  const { allTokens, isLoading: tokensLoading } = useTokensCache();
  const { usdt: defaultUsdt, ton: defaultTon, isLoading: defaultTokensLoading } = useDefaultTokens();
  
  // Track if we've already processed parameters using localStorage to persist across re-renders
  const getProcessedFlag = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('tmaParamsProcessed') === 'true';
    }
    return false;
  };
  
  const setProcessedFlag = (value: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem('tmaParamsProcessed', value.toString());
    }
  };
  
  // Clear the processed flag when the page is refreshed or navigated to
  useEffect(() => {
    const handleBeforeUnload = () => {
      setProcessedFlag(false);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  
  // Clear processed flag when URL parameters change
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const startappParam = urlParams.get('startapp');
    const tgWebAppStartParam = urlParams.get('tgWebAppStartParam');
    const hasStartParams = startappParam || tgWebAppStartParam;
    
    // If we have new start parameters, clear the processed flag
    if (hasStartParams) {
      const currentParams = startappParam || tgWebAppStartParam;
      const storedParams = localStorage.getItem('tmaParamsProcessed');
      
      // If the parameters are different from what we processed before, clear the flag
      if (storedParams !== currentParams) {
        localStorage.removeItem('tmaParamsProcessed');
      }
    }
  }, []);

  // Main effect for TMA parameter processing
  useEffect(() => {
    console.log('🔄 TMA: Starting parameter processing');
    console.log('🔄 TMA: Current URL:', window.location.href);
    console.log('🔄 TMA: Search params:', window.location.search);
    
    // Don't proceed if we've already processed parameters
    if (getProcessedFlag()) {
      console.log('✅ TMA: Already processed, marking as ready');
      setIsTMAReady(true);
      return;
    }
    
    // Check if we have startapp parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const startappParam = urlParams.get('startapp');
    const tgWebAppStartParam = urlParams.get('tgWebAppStartParam');
    
    console.log('🔄 TMA: startappParam:', startappParam);
    console.log('🔄 TMA: tgWebAppStartParam:', tgWebAppStartParam);
    
    const hasStartParams = startappParam || tgWebAppStartParam;
    
    // Check if we're in a TMA context by looking at the URL pattern OR if we have startapp parameters
    const isTMAContext = window.location.href.includes('t.me') || 
                         window.location.href.includes('telegram.org') ||
                         (window as any).Telegram?.WebApp ||
                         hasStartParams;
    
    // If not in TMA context, we're ready immediately
    if (!isTMAContext) {
      console.log('✅ TMA: Not in TMA context, marking as ready');
      setIsTMAReady(true);
      return;
    }
    
    // If no start parameters, we're ready immediately
    if (!hasStartParams) {
      console.log('✅ TMA: No start parameters, marking as ready');
      setIsTMAReady(true);
      return;
    }
    
    // We have start parameters, process them in the background without blocking the UI
    setTmaLoadingReason("Processing TMA parameters...");
    // Don't set isTMAReady to false - let the UI load normally
    
    // Function to fetch token by address using API
    const fetchTokenByAddress = async (tokenAddress: string) => {
      try {
        console.log(`🔄 TMA: Fetching token by address: ${tokenAddress}`);
        setTmaLoadingReason(`Fetching token ${tokenAddress}...`);
        
        const token = await swapCoffeeApiClient.getJettonByAddress(tokenAddress);
        console.log(`✅ TMA: Successfully fetched token:`, token);
        return token;
      } catch (error) {
        console.log(`❌ TMA: Failed to fetch token ${tokenAddress}:`, error);
        return null;
      }
    };
    
    // Function to apply parameters
    const applyParameters = async (params: TMAParams) => {
      if (!params.tokenAddress) {
        console.log("No token address in TMA parameters");
        setTmaLoadingReason("");
        return false;
      }
      
      // Try to fetch the token by address using API
      const fetchedToken = await fetchTokenByAddress(params.tokenAddress);
      
      if (!fetchedToken) {
        console.log("Token not found via API, will use fallback when default tokens are available");
        // Store the parameters but don't set a token yet - will be handled by swap form
        setTmaParams(params);
        console.log("TMA parameters stored, waiting for default tokens");
      } else {
        console.log("Using fetched token for TMA parameters:", fetchedToken);
        setTmaToken(fetchedToken);
        setTmaParams(params);
      }
      
      // Mark as processed
      setProcessedFlag(true);
      setTmaLoadingReason("");
      return true;
    };
    
    // Function to parse and apply parameters
    const parseAndApply = async (startParam: string) => {
      try {
        const params = parseStartAppParams(startParam);
        
        if (params) {
          return await applyParameters(params);
        } else {
          setTmaLoadingReason("");
          return false;
        }
      } catch (error) {
        console.error("Failed to parse TMA parameters:", error);
        setTmaLoadingReason("");
        return false;
      }
    };
    
    // Process the parameters in the background
    const processParams = async () => {
      try {
        if (tgWebAppStartParam) {
          await parseAndApply(tgWebAppStartParam);
        } else if (startappParam) {
          await parseAndApply(startappParam);
        } else {
          setTmaLoadingReason("");
        }
      } catch (error) {
        console.error("Error processing TMA parameters:", error);
        setTmaLoadingReason("");
      }
    };
    
    // Process in the background without blocking
    processParams();
  }, []); // Remove dependencies to prevent infinite loops

  return {
    isTMAReady,
    tmaLoadingReason,
    tmaParams,
    tmaToken,
    isLoading: !isTMAReady
  };
}
