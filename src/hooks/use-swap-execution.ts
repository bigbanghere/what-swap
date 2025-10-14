"use client";

import { useState, useCallback } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { swapService, SwapParams, SwapResult } from '@/lib/swap-service';

export interface UseSwapExecutionReturn {
  isExecuting: boolean;
  executeSwap: (params: SwapParams) => Promise<SwapResult>;
  lastResult: SwapResult | null;
  clearResult: () => void;
}

export function useSwapExecution(): UseSwapExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<SwapResult | null>(null);
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const executeSwap = useCallback(async (params: SwapParams): Promise<SwapResult> => {
    if (!walletAddress) {
      const error = 'Wallet not connected';
      console.error('❌', error);
      return { success: false, error };
    }

    // Validate parameters
    const validation = swapService.validateSwapParams(params);
    if (!validation.valid) {
      const error = validation.error || 'Invalid swap parameters';
      console.error('❌', error);
      return { success: false, error };
    }

    setIsExecuting(true);
    setLastResult(null);

    try {
      console.log('🚀 Executing swap with parameters:', params);
      
      const result = await swapService.executeSwap(params, tonConnectUI, walletAddress);
      
      console.log('✅ Swap execution completed:', result);
      setLastResult(result);
      
      return result;
    } catch (error) {
      console.error('❌ Swap execution error:', error);
      
      const errorResult: SwapResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, [walletAddress, tonConnectUI]);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    isExecuting,
    executeSwap,
    lastResult,
    clearResult
  };
}
