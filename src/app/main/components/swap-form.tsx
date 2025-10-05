"use client";

import Image from 'next/image';
import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { IoWalletSharp } from 'react-icons/io5';
import { useTonAddress } from "@tonconnect/ui-react";
import { CustomTonConnectButton } from "./full-tc-button";
import { CustomInput } from "./custom-input";
import { useValidation } from "@/contexts/validation-context";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDefaultTokens } from '@/hooks/use-default-tokens';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { useSwapCalculation } from '@/hooks/use-swap-calculation';

export function SwapForm({ onErrorChange }: { onErrorChange?: (error: string | null) => void }) {
    const router = useRouter();
    const walletAddress = useTonAddress();
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>(''); // Start empty, will be calculated
    const [isFromAmountFocused, setIsFromAmountFocused] = useState<boolean>(false);
    const [isToAmountFocused, setIsToAmountFocused] = useState<boolean>(false);
    const isToAmountFocusedRef = useRef<boolean>(false);
    const [selectedFromToken, setSelectedFromToken] = useState<any>(null);
    const [selectedToToken, setSelectedToToken] = useState<any>(null);
    const fromAmountRef = useRef<{ blur: () => void; focus: () => void; canAddMoreCharacters: (key: string) => boolean }>(null);
    const toAmountRef = useRef<{ blur: () => void; focus: () => void; canAddMoreCharacters: (key: string) => boolean }>(null);
    const { shouldBeCompact, setInputFocused, setNavigationFlags } = useKeyboardDetection();
    const t = useTranslations('translations');
    const { setCanAddMoreCharacters } = useValidation();
    const { usdt: defaultUsdt, ton: defaultTon, isLoading: defaultTokensLoading } = useDefaultTokens();
    const { allTokens } = useTokensCache();

    // Track user input vs programmatic updates
    const userInputRef = useRef<'from' | 'to' | null>(null);
    const lastCalculatedAmount = useRef<string | null>(null);
    const isToAmountCalculated = useRef(false); // Track if toAmount is a calculated value
    const isFromAmountCalculated = useRef(false); // Track if fromAmount is a calculated value
    const hasUserEnteredCustomValue = useRef(false); // Track if user has entered a custom value
    const [isUserTypingToAmount, setIsUserTypingToAmount] = useState(false); // Track when user is typing in toAmount field
    const isFromAmountDefault = useRef(true); // Track if fromAmount has the default value (1)
    const lastUserEnteredValue = useRef<string>('1'); // Track the last value entered by the user for rotation
    const isRotating = useRef(false); // Track if we're currently rotating tokens
    const rotatedTransferredToAmount = useRef<string | null>(null); // Value moved into get field during rotation
    const fromDefaultValueRef = useRef<string>('1'); // Tracks what the default send value should restore to on unfocus
    const isRestoringDefaults = useRef(false); // Guards effects during default restoration on unfocus
    const rotatedFromDefaultsRef = useRef<boolean>(false); // Tracks if last rotation started from true defaults
    const defaultBasisSideRef = useRef<'from' | 'to'>('from'); // Tracks where basis "1" should be on default restore
    const lastChangedTokenRef = useRef<'from' | 'to' | null>(null); // Tracks which token was last changed
    const originalBasisValueRef = useRef<string | null>(null); // Tracks the original basis value for rotations
    const basisFieldRef = useRef<'from' | 'to'>('from'); // Tracks which field currently has the basis value

    // Swap calculation hook
    const swapCalculationResult = useSwapCalculation({
        fromToken: selectedFromToken,
        toToken: selectedToToken,
        fromAmount,
        toAmount,
        hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
        isUserTypingToAmount: isUserTypingToAmount,
        isRestoringDefaults: isRestoringDefaults.current
    });
    
    const { 
        outputAmount: calculatedOutputAmount, 
        calcKey: calculationKey, 
        isLoading: isCalculating, 
        error: calculationError,
        executeCalculation
    } = swapCalculationResult;
    

    // Notify parent component of error changes
    useEffect(() => {
        if (onErrorChange) {
            onErrorChange(calculationError);
        }
    }, [calculationError, onErrorChange]);

    // Function to get full token data with market stats
    const getFullTokenData = useCallback((token: any) => {
        if (!token || !allTokens) {
            return token;
        }
        
        // If token already has market_stats, return as is
        if (token.market_stats?.price_usd) {
            return token;
        }
        
        // Try to find the full token data from allTokens cache
        const fullToken = allTokens.find(t => t.address === token.address);
        return fullToken || token;
    }, [allTokens]);

    // Function to calculate USD value for a token amount
    const calculateUSDValue = useCallback((amount: string, token: any) => {
        if (!token) {
            return null;
        }
        
        // If amount is empty, return 0
        if (!amount || amount.trim() === '') {
            return 0;
        }
        
        // Get full token data with market stats (inline to avoid dependency issues)
        let fullToken = token;
        if (allTokens && allTokens.length > 0) {
            const foundToken = allTokens.find(t => t.address === token.address);
            if (foundToken) {
                fullToken = foundToken;
            }
        }
        
        if (!fullToken.market_stats?.price_usd) {
            console.log('🔍 SwapForm: No price data for token:', fullToken.symbol, fullToken.market_stats);
            return null;
        }
        
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return 0;
        }
        
        const usdValue = numericAmount * fullToken.market_stats.price_usd;
        console.log('💰 SwapForm: USD calculation:', {
            amount: numericAmount,
            price: fullToken.market_stats.price_usd,
            usdValue: usdValue,
            symbol: fullToken.symbol
        });
        
        return usdValue;
    }, [allTokens]);

    // Function to format USD value
    const formatUSDValue = useCallback((usdValue: number | null) => {
        if (usdValue === null) {
            return null;
        }
        
        // Handle zero case
        if (usdValue === 0) {
            return '$0';
        }
        
        if (usdValue < 0.01) {
            return `$${usdValue.toFixed(6)}`;
        } else if (usdValue < 1) {
            return `$${usdValue.toFixed(4)}`;
        } else if (usdValue < 100) {
            return `$${usdValue.toFixed(2)}`;
        } else {
            return `$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
    }, []);

    // Stable USD calculations to prevent blinking
    const fromTokenUSDValueRef = useRef<string>('$0');
    const toTokenUSDValueRef = useRef<string>('$0');
    const lastFromAmountRef = useRef<string>('');
    const lastToAmountRef = useRef<string>('');
    const lastFromTokenRef = useRef<string>('');
    const lastToTokenRef = useRef<string>('');
    
    // Calculate USD values inline to prevent blinking
    const calculateUSDValueInline = useCallback((amount: string, token: any) => {
        if (!token) {
            return null;
        }
        
        // If amount is empty, return 0
        if (!amount || amount.trim() === '') {
            return 0;
        }
        
        // Get full token data with market stats (inline to avoid dependency issues)
        let fullToken = token;
        if (allTokens && allTokens.length > 0) {
            const foundToken = allTokens.find(t => t.address === token.address);
            if (foundToken) {
                fullToken = foundToken;
            }
        }
        
        if (!fullToken.market_stats?.price_usd) {
            return null;
        }
        
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return 0;
        }
        
        const usdValue = numericAmount * fullToken.market_stats.price_usd;
        return usdValue;
    }, [allTokens]);

    const formatUSDValueInline = useCallback((usdValue: number | null) => {
        if (usdValue === null) {
            return null;
        }
        if (usdValue === 0) {
            return '$0';
        }
        if (usdValue < 0.01) {
            return `$${usdValue.toFixed(6)}`;
        } else if (usdValue < 1) {
            return `$${usdValue.toFixed(4)}`;
        } else if (usdValue < 100) {
            return `$${usdValue.toFixed(2)}`;
        } else {
            return `$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
    }, []);

    // Calculate USD values with smart caching
    const fromTokenUSDValue = useMemo(() => {
        const currentToken = selectedFromToken || defaultUsdt;
        const currentAmount = fromAmount;
        const currentTokenAddress = currentToken?.address || '';
        
        // Check if we need to recalculate
        if (lastFromAmountRef.current === currentAmount && 
            lastFromTokenRef.current === currentTokenAddress &&
            fromTokenUSDValueRef.current !== '$0') {
            return fromTokenUSDValueRef.current;
        }
        
        const usdValue = calculateUSDValueInline(currentAmount, currentToken);
        const formattedValue = formatUSDValueInline(usdValue) || '$0';
        
        // Update refs
        fromTokenUSDValueRef.current = formattedValue;
        lastFromAmountRef.current = currentAmount;
        lastFromTokenRef.current = currentTokenAddress;
        
        return formattedValue;
    }, [fromAmount, selectedFromToken?.address, defaultUsdt?.address, calculateUSDValueInline, formatUSDValueInline]);

    const toTokenUSDValue = useMemo(() => {
        const currentToken = selectedToToken || defaultTon;
        const currentAmount = toAmount;
        const currentTokenAddress = currentToken?.address || '';
        
        // Check if we need to recalculate
        if (lastToAmountRef.current === currentAmount && 
            lastToTokenRef.current === currentTokenAddress &&
            toTokenUSDValueRef.current !== '$0') {
            return toTokenUSDValueRef.current;
        }
        
        const usdValue = calculateUSDValueInline(currentAmount, currentToken);
        const formattedValue = formatUSDValueInline(usdValue) || '$0';
        
        // Update refs
        toTokenUSDValueRef.current = formattedValue;
        lastToAmountRef.current = currentAmount;
        lastToTokenRef.current = currentTokenAddress;
        
        return formattedValue;
    }, [toAmount, selectedToToken?.address, defaultTon?.address, calculateUSDValueInline, formatUSDValueInline]);

    // Only reset to default tokens on actual page refresh, not on navigation
    useEffect(() => {
        
        // Simplified logic: Check if we're in the middle of token selection process
        const isTokenSelectionProcess = () => {
            // Check if we're coming from the tokens page (navigation)
            const fromTokensPage = sessionStorage.getItem('fromTokensPage');
            if (fromTokensPage === 'true') {
                console.log('🔄 SwapForm: Detected navigation from tokens page - token selection process');
                return true;
            }
            
            // Check if we're in the middle of asset selection process
            const inAssetSelection = sessionStorage.getItem('inAssetSelection');
            if (inAssetSelection === 'true') {
                console.log('🔄 SwapForm: Detected asset selection process - token selection process');
                return true;
            }
            
            // Check if we're coming from the tokens page via referrer
            if (document.referrer && document.referrer.includes('/tokens')) {
                console.log('🔄 SwapForm: Detected navigation from tokens page via referrer - token selection process');
                return true;
            }
            
            
            // If none of the above, this is a page refresh or regular navigation
            console.log('🔄 SwapForm: No token selection process detected - page refresh or regular navigation');
            return false;
        };
        
        // Check if this is a page reload and clear the processed flag if so
        const isPageReload = () => {
            // First check for actual page reload indicators (prioritize these)
            
            // Check if this is a hard refresh (F5, Ctrl+R, etc.)
            if (performance.navigation && performance.navigation.type === 1) {
                console.log('🔄 SwapForm: Performance navigation type 1 - page reload detected');
                return true;
            }
            
            // Check if the page was loaded via reload
            const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
                console.log('🔄 SwapForm: Navigation type reload - page reload detected');
                return true;
            }
            
            // Check if there's no referrer (direct page load or refresh)
            if (!document.referrer) {
                console.log('🔄 SwapForm: No referrer - page reload detected');
                return true;
            }
            
            // Only then check for navigation indicators (these are secondary)
            
            // Check if we're coming from the tokens page (navigation)
            const fromTokensPage = sessionStorage.getItem('fromTokensPage');
            if (fromTokensPage === 'true') {
                console.log('🔄 SwapForm: Coming from tokens page - not a page reload');
                return false;
            }
            
            // Check if we're in the middle of asset selection process
            const inAssetSelection = sessionStorage.getItem('inAssetSelection');
            if (inAssetSelection === 'true') {
                console.log('🔄 SwapForm: In asset selection process - not a page reload');
                return false;
            }
            
            // Check if we're coming from the tokens page via referrer
            if (document.referrer && document.referrer.includes('/tokens')) {
                console.log('🔄 SwapForm: Coming from tokens page via referrer - not a page reload');
                return false;
            }
            
            return false;
        };
        
        // If this is a page reload, clear the processed flag so we can process normally
        if (isPageReload()) {
            console.log('🔄 SwapForm: Page reload detected - clearing processed flag');
            sessionStorage.removeItem('swapFormProcessed');
            sessionStorage.removeItem('tokenSelectionProcessed');
            console.log('🧹 SwapForm: Cleared token selection processed flag on page reload');
            // Don't return here, continue with normal processing
        }
        
        // Check if we've already processed a token selection in this session
        const hasProcessedTokenSelection = sessionStorage.getItem('tokenSelectionProcessed');
        if (hasProcessedTokenSelection && !isPageReload()) {
            console.log('🔄 SwapForm: Token selection already processed in this session - skipping main processing');
            
            // Still try to load existing tokens from localStorage on navigation
            try {
                const storedFromToken = localStorage.getItem('selectedFromToken');
                const storedToToken = localStorage.getItem('selectedToToken');
                
                if (storedFromToken) {
                    const parsedToken = JSON.parse(storedFromToken);
                    if (parsedToken && parsedToken.symbol && parsedToken.address) {
                        setSelectedFromToken(parsedToken);
                        console.log('✅ SwapForm: Loaded selectedFromToken from localStorage (skipped processing):', parsedToken.symbol);
                    }
                } else {
                    console.log('🔄 SwapForm: No from token in localStorage (skipped processing)');
                }
                
                if (storedToToken) {
                    const parsedToken = JSON.parse(storedToToken);
                    if (parsedToken && parsedToken.symbol && parsedToken.address) {
                        setSelectedToToken(parsedToken);
                        console.log('✅ SwapForm: Loaded selectedToToken from localStorage (skipped processing):', parsedToken.symbol);
                    }
                } else {
                    console.log('🔄 SwapForm: No to token in localStorage (skipped processing)');
                }
            } catch (error) {
                console.error('❌ SwapForm: Error loading tokens from localStorage (skipped processing):', error);
            }
            
            return;
        }
        
        // Check if we're coming from the tokens page but haven't processed yet
        const fromTokensPage = sessionStorage.getItem('fromTokensPage');
        if (fromTokensPage === 'true' && !hasProcessedTokenSelection) {
            console.log('🔄 SwapForm: Coming from tokens page - not a page reload (second mount)');
            // Don't clear the flag yet, let the first mount handle it
        }
        
        const isTokenSelection = isTokenSelectionProcess();
        
        // Debug information
        console.log('🔄 SwapForm: Token selection detection debug:', {
            fromTokensPage: sessionStorage.getItem('fromTokensPage'),
            inAssetSelection: sessionStorage.getItem('inAssetSelection'),
            referrer: document.referrer,
            localStorageFromToken: localStorage.getItem('selectedFromToken') ? 'exists' : 'null',
            localStorageToToken: localStorage.getItem('selectedToToken') ? 'exists' : 'null',
            isTokenSelection,
            allSessionStorage: Object.fromEntries(
                Array.from({ length: sessionStorage.length }, (_, i) => {
                    const key = sessionStorage.key(i);
                    return [key, sessionStorage.getItem(key || '')];
                })
            )
        });
        
        if (isTokenSelection) {
            console.log('🔄 SwapForm: Token selection process detected - preserving selected tokens');
            
            // Mark that we've processed a token selection in this session
            sessionStorage.setItem('tokenSelectionProcessed', 'true');
            console.log('🎯 SwapForm: Marked token selection as processed');
            
            // Don't clear the fromTokensPage flag yet - let the second mount also see it
            // We'll clear it after a delay to ensure both mounts can process it
            if (sessionStorage.getItem('fromTokensPage') === 'true') {
                console.log('🧹 SwapForm: Keeping fromTokensPage flag for second mount');
                // Clear the flag after a delay to ensure both mounts can process it
                setTimeout(() => {
                    sessionStorage.removeItem('fromTokensPage');
                    console.log('🧹 SwapForm: Cleared fromTokensPage flag after delay');
                }, 100);
            }
            
            // Try to load existing tokens from localStorage
            try {
                const storedFromToken = localStorage.getItem('selectedFromToken');
                const storedToToken = localStorage.getItem('selectedToToken');
                
                if (storedFromToken) {
                    const parsedToken = JSON.parse(storedFromToken);
                    if (parsedToken && parsedToken.symbol && parsedToken.address) {
                        setSelectedFromToken(parsedToken);
                        console.log('✅ SwapForm: Loaded selectedFromToken from localStorage:', parsedToken.symbol);
                    }
                } else {
                    console.log('🔄 SwapForm: No from token in localStorage');
                }
                
                if (storedToToken) {
                    const parsedToken = JSON.parse(storedToToken);
                    if (parsedToken && parsedToken.symbol && parsedToken.address) {
                        setSelectedToToken(parsedToken);
                        console.log('✅ SwapForm: Loaded selectedToToken from localStorage:', parsedToken.symbol);
                    }
                } else {
                    console.log('🔄 SwapForm: No to token in localStorage');
                }
            } catch (error) {
                console.error('❌ SwapForm: Error loading tokens from localStorage:', error);
            }
        } else {
            console.log('🔄 SwapForm: No token selection process - resetting to default tokens');
            
            // Clear session flags on page refresh but keep localStorage tokens
            sessionStorage.removeItem('inAssetSelection');
            sessionStorage.removeItem('fromTokensPage');
            sessionStorage.removeItem('swapFormProcessed'); // Clear the processed flag so it can be processed again
            console.log('🧹 SwapForm: Cleared session flags on page refresh');
        }
        

    }, []);

  // Debug: Log when selectedFromToken or selectedToToken changes
  useEffect(() => {
    console.log('🔄 SwapForm: selectedFromToken changed:', selectedFromToken);
    if (selectedFromToken) {
      console.log('✅ SwapForm: selectedFromToken details:', {
        symbol: selectedFromToken.symbol,
        name: selectedFromToken.name,
        address: selectedFromToken.address,
        image_url: selectedFromToken.image_url
      });
    }
  }, [selectedFromToken]);

  useEffect(() => {
    console.log('🔄 SwapForm: selectedToToken changed:', selectedToToken);
    if (selectedToToken) {
      console.log('✅ SwapForm: selectedToToken details:', {
        symbol: selectedToToken.symbol,
        name: selectedToToken.name,
        address: selectedToToken.address,
        image_url: selectedToToken.image_url
      });
    }
  }, [selectedToToken]);

  // Fallback: Check localStorage for tokens when returning from tokens page
  useEffect(() => {
    const fromTokensPage = sessionStorage.getItem('fromTokensPage') === 'true';
    const inAssetSelection = sessionStorage.getItem('inAssetSelection') === 'true';
    
    if ((fromTokensPage || inAssetSelection) && (!selectedFromToken || !selectedToToken)) {
      console.log('🔄 SwapForm: Fallback - checking localStorage for tokens');
      
      const fromTokenData = localStorage.getItem('selectedFromToken');
      const toTokenData = localStorage.getItem('selectedToToken');
      
      if (fromTokenData && !selectedFromToken) {
        try {
          const parsedToken = JSON.parse(fromTokenData);
          if (parsedToken && parsedToken.symbol && parsedToken.address) {
            // Remove the timestamp before setting the token
            const { selectedAt, ...tokenWithoutTimestamp } = parsedToken;
            setSelectedFromToken(tokenWithoutTimestamp);
            console.log('✅ SwapForm: Fallback loaded selectedFromToken:', parsedToken.symbol);
          }
        } catch (error) {
          console.error('❌ SwapForm: Error parsing from token in fallback:', error);
        }
      }
      
      if (toTokenData && !selectedToToken) {
        try {
          const parsedToken = JSON.parse(toTokenData);
          if (parsedToken && parsedToken.symbol && parsedToken.address) {
            // Remove the timestamp before setting the token
            const { selectedAt, ...tokenWithoutTimestamp } = parsedToken;
            setSelectedToToken(tokenWithoutTimestamp);
            console.log('✅ SwapForm: Fallback loaded selectedToToken:', parsedToken.symbol);
          }
        } catch (error) {
          console.error('❌ SwapForm: Error parsing to token in fallback:', error);
        }
      }
    }
  }, [selectedFromToken, selectedToToken]);

  // Additional fallback: Periodic check when returning from tokens page
  useEffect(() => {
    const fromTokensPage = sessionStorage.getItem('fromTokensPage') === 'true';
    const inAssetSelection = sessionStorage.getItem('inAssetSelection') === 'true';
    
    if (fromTokensPage || inAssetSelection) {
      console.log('🔄 SwapForm: Setting up periodic fallback check');
      
      const checkInterval = setInterval(() => {
        const fromTokenData = localStorage.getItem('selectedFromToken');
        const toTokenData = localStorage.getItem('selectedToToken');
        
        if (fromTokenData && !selectedFromToken) {
          try {
            const parsedToken = JSON.parse(fromTokenData);
            if (parsedToken && parsedToken.symbol && parsedToken.address) {
              // Remove the timestamp before setting the token
              const { selectedAt, ...tokenWithoutTimestamp } = parsedToken;
              setSelectedFromToken(tokenWithoutTimestamp);
              console.log('✅ SwapForm: Periodic fallback loaded selectedFromToken:', parsedToken.symbol);
              clearInterval(checkInterval);
            }
          } catch (error) {
            console.error('❌ SwapForm: Error parsing from token in periodic fallback:', error);
          }
        }
        
        if (toTokenData && !selectedToToken) {
          try {
            const parsedToken = JSON.parse(toTokenData);
            if (parsedToken && parsedToken.symbol && parsedToken.address) {
              // Remove the timestamp before setting the token
              const { selectedAt, ...tokenWithoutTimestamp } = parsedToken;
              setSelectedToToken(tokenWithoutTimestamp);
              console.log('✅ SwapForm: Periodic fallback loaded selectedToToken:', parsedToken.symbol);
              clearInterval(checkInterval);
            }
          } catch (error) {
            console.error('❌ SwapForm: Error parsing to token in periodic fallback:', error);
          }
        }
        
        // Clear interval after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 5000);
      }, 100);
      
      return () => clearInterval(checkInterval);
    }
  }, [selectedFromToken, selectedToToken]);

    // Update amounts when we get a calculated output amount - SIMPLIFIED VERSION
    useEffect(() => {
        console.log('🔄 SwapForm: useEffect triggered for calculatedOutputAmount:', calculatedOutputAmount);
        
        // Skip if we're restoring defaults to prevent overriding the 0 value
        if (isRestoringDefaults.current) {
            console.log('🔄 SwapForm: Skipping calculatedOutputAmount update - restoring defaults');
            return;
        }
        
        // Apply only if current calcKey matches the expected context
        // For restoration, use the actual amount from the calculation key if fromAmount is empty
        let actualFromAmount = fromAmount;
        let actualToAmount = toAmount;
        
        // If fromAmount is empty but we have a calculation key, extract the amount from it
        if (!fromAmount && calculationKey && calculationKey.includes('-forward')) {
            const parts = calculationKey.split('-');
            if (parts.length >= 4) {
                actualFromAmount = parts[parts.length - 2]; // Second to last part is the amount
            }
        }
        
        // If toAmount is empty but we have a calculation key, extract the amount from it
        if (!toAmount && calculationKey && calculationKey.includes('-reverse')) {
            const parts = calculationKey.split('-');
            if (parts.length >= 4) {
                actualToAmount = parts[parts.length - 2]; // Second to last part is the amount
            }
        }
        
        const expectedForwardKey = selectedFromToken && selectedToToken && actualFromAmount ? `${selectedFromToken.address}-${selectedToToken.address}-${actualFromAmount}-forward` : null;
        const expectedReverseKey = selectedFromToken && selectedToToken && actualToAmount ? `${selectedFromToken.address}-${selectedToToken.address}-${actualToAmount}-reverse` : null;
        
        const isForwardCalculation = calculationKey === expectedForwardKey;
        const isReverseCalculation = calculationKey === expectedReverseKey;
        
        console.log('🔄 SwapForm: Calculation analysis:', {
            calculationKey,
            expectedForwardKey,
            expectedReverseKey,
            isForwardCalculation,
            isReverseCalculation,
            isFromAmountFocused,
            isToAmountFocused,
            currentToAmount: toAmount,
            calculatedOutputAmount
        });
        
        if (!isForwardCalculation && !isReverseCalculation) {
            console.log('⚠️ SwapForm: Ignoring calculatedOutputAmount due to calcKey mismatch');
            return;
        }
        
        // Check if we need to update the amount
        if (calculatedOutputAmount) {
            // SIMPLIFIED LOGIC - No overlapping conditions
            if (isForwardCalculation) {
                // Forward calculation: update toAmount (Get field)
                // Check if the current toAmount matches the calculated value
                if (toAmount !== calculatedOutputAmount) {
                    // Allow calculation if user is actively typing in Send field
                    // BUT prevent overriding user input in Get field when they're actively editing
                    const isUserActivelyEditingGetField = isToAmountFocused && userInputRef.current === 'to';
                    
                    if ((basisFieldRef.current !== 'to' || isFromAmountFocused) && !isToAmountFocusedRef.current && !isUserActivelyEditingGetField) {
                        console.log('🔄 SwapForm: Updating toAmount with forward calculation:', calculatedOutputAmount);
                        setToAmount(calculatedOutputAmount);
                        isToAmountCalculated.current = true;
                        lastCalculatedAmount.current = calculatedOutputAmount;
                    } else {
                        console.log('🔄 SwapForm: Skipping toAmount update - user is actively editing Get field or basis value is in Get field and Send field not focused');
                    }
                } else {
                    console.log('🔄 SwapForm: toAmount already matches calculated value');
                }
                userInputRef.current = null;
            } else if (isReverseCalculation) {
                // Reverse calculation: update fromAmount (Send field)
                // Check if the current fromAmount matches the calculated value
                if (fromAmount !== calculatedOutputAmount) {
                    // Allow calculation if user is actively typing in Get field
                    // BUT prevent overriding user input in Send field when they're actively editing
                    const isUserActivelyEditingSendField = isFromAmountFocused && userInputRef.current === 'from';
                    
                    if ((basisFieldRef.current !== 'from' || isToAmountFocusedRef.current) && !isUserActivelyEditingSendField) {
                        console.log('🔄 SwapForm: Updating fromAmount with reverse calculation:', calculatedOutputAmount);
                        setFromAmount(calculatedOutputAmount);
                        isFromAmountCalculated.current = true;
                        lastCalculatedAmount.current = calculatedOutputAmount;
                    } else {
                        console.log('🔄 SwapForm: Skipping fromAmount update - user is actively editing Send field or basis value is in Send field and Get field not focused');
                    }
                } else {
                    console.log('🔄 SwapForm: fromAmount already matches calculated value');
                }
                userInputRef.current = null;
            }
        } else {
            // calculatedOutputAmount is null - clear the appropriate field based on the calculation type
            if (isForwardCalculation) {
                // Forward calculation was cleared - clear the Get field (toAmount)
                console.log('🔄 SwapForm: Forward calculation cleared, clearing Get field');
                setToAmount('');
                isToAmountCalculated.current = false;
                lastCalculatedAmount.current = null;
            } else if (isReverseCalculation) {
                // Reverse calculation was cleared - clear the Send field (fromAmount)
                console.log('🔄 SwapForm: Reverse calculation cleared, clearing Send field');
                setFromAmount('');
                lastCalculatedAmount.current = null;
            }
        }
    }, [calculatedOutputAmount, calculationKey, toAmount, fromAmount, isFromAmountFocused, isToAmountFocused]);

    // REMOVED: Additional effect that was causing conflicts

    // REMOVED: Fallback effect that was causing conflicts

    // Handle zero/empty inputs - show 0 in opposite field when focusing empty field
    useEffect(() => {
        // COMPREHENSIVE GUARD: Skip entirely if user is actively typing in Get field
        if (isToAmountFocused && toAmount && parseFloat(toAmount) > 0) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING ENTIRELY - user typing in Get field');
            return;
        }
        
        // COMPREHENSIVE GUARD: Skip entirely if user has entered custom value
        if (hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING ENTIRELY - user has entered custom value');
            return;
        }
        
        // COMPREHENSIVE GUARD: Skip entirely if we have a valid calculation result
        if (calculatedOutputAmount && parseFloat(calculatedOutputAmount) > 0) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING ENTIRELY - valid calculation result present');
            return;
        }
        
        console.log('🔄 SwapForm: Zero handling effect triggered:', {
            fromAmount,
            toAmount,
            isFromAmountFocused,
            isToAmountFocused,
            isCalculating,
            isUserTyping: isUserTyping.current,
            hasUserEnteredCustomValue: hasUserEnteredCustomValue.current
        });
        
        // SPECIAL CASE: Always update when user enters "1" - bypass all complex logic
        if (fromAmount === '1' && isFromAmountFocused && !isToAmountFocused && calculatedOutputAmount && Number(calculatedOutputAmount) > 0) {
            console.log('🔄 SwapForm: Special case - user entered "1", updating toAmount directly:', calculatedOutputAmount);
            setToAmount(calculatedOutputAmount.toString());
            return;
        }
        
        // Don't interfere during calculations
        if (isCalculating) {
            console.log('🔄 SwapForm: Skipping zero handling - calculation in progress');
            return;
        }
        
        // Don't interfere when user is actively typing, but allow zero handling when field is empty
        if (isUserTyping.current && fromAmount !== '' && fromAmount !== '0') {
            console.log('🔄 SwapForm: Skipping zero handling - user is typing');
            return;
        }
        
        // Don't interfere if user has entered a custom value
        if (hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Skipping zero handling - user has entered custom value');
            return;
        }
        
        // Don't interfere when we have a valid calculation result
        if (calculatedOutputAmount && parseFloat(calculatedOutputAmount) > 0) {
            console.log('🔄 SwapForm: Skipping zero handling - valid calculation result present');
            return;
        }
        
        // Don't interfere when user is typing in the Get field (toAmount)
        if (isToAmountFocused && toAmount && parseFloat(toAmount) > 0) {
            console.log('🔄 SwapForm: Skipping zero handling - user typing in Get field');
            return;
        }
        
        // Don't interfere when we have a valid fromAmount (result of calculation)
        if (fromAmount && parseFloat(fromAmount) > 0 && !isFromAmountFocused) {
            console.log('🔄 SwapForm: Skipping zero handling - valid fromAmount present');
            return;
        }
        
        // Don't interfere when user enters "1" (even if not marked as custom value yet)
        // But only if the user has actually entered "1" (not when field is empty)
        if (fromAmount === '1' && isFromAmountFocused && !isToAmountFocused && hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Skipping zero handling - user entered "1"');
            return;
        }
        
        // Don't interfere when user is typing and fromAmount is "1"
        if (isUserTyping.current && fromAmount === '1') {
            console.log('🔄 SwapForm: Skipping zero handling - user is typing "1"');
            return;
        }
        
        // Don't interfere when we're in the process of restoring default behavior
        // (when fromAmount is being set to '1' and toAmount is empty)
        if (fromAmount === '1' && toAmount === '' && isToAmountFocused) {
            console.log('🔄 SwapForm: Skipping zero handling - restoring default behavior');
            return;
        }
        
        // Don't interfere when we're restoring defaults (isRestoringDefaults flag is set)
        if (isRestoringDefaults.current) {
            console.log('🔄 SwapForm: Skipping zero handling - restoring defaults');
            return;
        }
        
        // Don't interfere if fromAmount was recently restored to default (1) and toAmount is empty
        // This prevents zero handling from clearing the restored default value
        if (fromAmount === '1' && toAmount === '' && !isFromAmountFocused) {
            console.log('🔄 SwapForm: Skipping zero handling - fromAmount recently restored to default');
            return;
        }
        
        // Don't interfere when get field is empty and we want to show 0 in send field
        // But only if we're not in the process of setting it to 0
        if (fromAmount === '0' && toAmount === '' && isToAmountFocused && !isUserTypingToAmount) {
            console.log('🔄 SwapForm: Skipping zero handling - showing 0 in send field for empty get field');
            return;
        }
        
        // When user is focused on fromAmount and it's empty or 0
        if (isFromAmountFocused && !isToAmountFocused) {
            // Show 0 in get field when send field is empty/zero
            // But don't interfere if user has entered a custom value (including "1")
            // Also don't interfere if toAmount already has a calculated value
            if ((fromAmount === '' || fromAmount === '0' || parseFloat(fromAmount) === 0) && 
                !hasUserEnteredCustomValue.current) {
                console.log('🔄 SwapForm: fromAmount is empty/zero while focused, setting toAmount to 0');
                setToAmount('0');
            } else {
                console.log('🔄 SwapForm: Zero handling condition not met:', {
                    fromAmount,
                    hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
                    toAmount,
                    isFromAmountFocused,
                    isToAmountFocused
                });
            }
        }
        
        // Don't interfere with calculation results when user enters "1"
        // This prevents zero handling from overriding calculated values
        if (fromAmount === '1' && isFromAmountFocused && !isToAmountFocused && hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Skipping zero handling - user entered "1" and has custom value');
            return;
        }
        // When user is focused on toAmount and it's empty or 0
        else if (isToAmountFocused && !isFromAmountFocused) {
            // Show 0 in send field when get field is empty/zero
            if (toAmount === '' || toAmount === '0' || parseFloat(toAmount) === 0) {
                console.log('🔄 SwapForm: toAmount is empty/zero while focused, setting fromAmount to 0');
                setFromAmount('0');
            }
        }
    }, [fromAmount, toAmount, isFromAmountFocused, isToAmountFocused, isCalculating, isUserTypingToAmount]);

    // Track when user is actively typing to prevent zero handling from interfering
    const isUserTyping = useRef(false);
    const lastFromAmount = useRef<string>('');
    const lastToAmount = useRef<string>('');
    const userFinishedTypingToAmount = useRef(false); // Track when user has finished typing in toAmount field
    
    useEffect(() => {
        // Skip typing detection while restoring defaults
        if (isRestoringDefaults.current) {
            return;
        }
        
        // Don't set typing flags during rotation
        if (isRotating.current) {
            return;
        }
        
        // Don't set typing flags if we just rotated from defaults
        if (rotatedFromDefaultsRef.current) {
            return;
        }
        
        // Detect when user starts typing a valid number in fromAmount
        if (userInputRef.current === 'from' && fromAmount && parseFloat(fromAmount) > 0) {
            isUserTyping.current = true;
            // Mark that user has entered a custom value (not the default '1')
            if (fromAmount !== '1') {
                hasUserEnteredCustomValue.current = true;
                console.log('🔄 SwapForm: User entered custom value in fromAmount, marking as user input');
            }
            console.log('🔄 SwapForm: User typing valid number in fromAmount detected, blocking zero handling');
            // Reset after a short delay to allow calculation to complete
            setTimeout(() => {
                isUserTyping.current = false;
                console.log('🔄 SwapForm: User typing flag reset');
            }, 300);
        } 
        // Detect when user clears fromAmount field (for typing)
        else if (userInputRef.current === 'from' && fromAmount === '' && lastFromAmount.current && parseFloat(lastFromAmount.current) > 0) {
            // User cleared a field that had a value - they're probably typing
            isUserTyping.current = true;
            console.log('🔄 SwapForm: User cleared fromAmount field for typing, blocking zero handling');
            setTimeout(() => {
                isUserTyping.current = false;
                console.log('🔄 SwapForm: User typing flag reset after clear');
            }, 100);
        }
        // User is focused but fromAmount field is empty/zero and wasn't cleared from a valid value
        else if (userInputRef.current === 'from' && (fromAmount === '' || fromAmount === '0') && (!lastFromAmount.current || parseFloat(lastFromAmount.current) === 0)) {
            // User is focused on empty field, allow zero handling
            isUserTyping.current = false;
        }
        
        // Update last value
        lastFromAmount.current = fromAmount;
    }, [fromAmount]);

    // Track when user is actively typing in toAmount field
    useEffect(() => {
        // Skip typing detection while restoring defaults
        if (isRestoringDefaults.current) {
            return;
        }
        
        // Don't set typing flags during rotation
        if (isRotating.current) {
            return;
        }
        
        // Don't set typing flags if we just rotated from defaults
        if (rotatedFromDefaultsRef.current) {
            return;
        }
        
        // Detect when user starts typing a valid number in toAmount
        if (userInputRef.current === 'to' && toAmount && parseFloat(toAmount) > 0) {
            setIsUserTypingToAmount(true);
            hasUserEnteredCustomValue.current = true;
            userFinishedTypingToAmount.current = false; // Reset finished typing flag
            console.log('🔄 SwapForm: User entered custom value in toAmount, marking as user input');
            console.log('🔄 SwapForm: User typing valid number in toAmount detected, allowing reverse calculations');
        } 
        // Detect when user clears toAmount field (for typing)
        else if (userInputRef.current === 'to' && toAmount === '' && lastToAmount.current && parseFloat(lastToAmount.current) > 0) {
            // User cleared a field that had a value - they're probably typing
            // But don't set isUserTypingToAmount to true immediately - let zero handling work first
            userFinishedTypingToAmount.current = false; // Reset finished typing flag
            console.log('🔄 SwapForm: User cleared toAmount field for typing, allowing zero handling');
        }
        // User is focused but toAmount field is empty/zero and wasn't cleared from a valid value
        else if (userInputRef.current === 'to' && (toAmount === '' || toAmount === '0') && (!lastToAmount.current || parseFloat(lastToAmount.current) === 0)) {
            // User is focused on empty field, allow calculation overrides
            setIsUserTypingToAmount(false);
            userFinishedTypingToAmount.current = false; // Reset finished typing flag
        }
        
        // Update last value
        lastToAmount.current = toAmount;
    }, [toAmount]);

    // Reset typing flags when user unfocuses the toAmount field
    useEffect(() => {
        if (!isToAmountFocused) {
            // Keep isUserTypingToAmount true for a short time after unfocus to allow final calculations
            setTimeout(() => {
                setIsUserTypingToAmount(false);
                userFinishedTypingToAmount.current = true;
                console.log('🔄 SwapForm: Reset typing flags after toAmount unfocus');
            }, 100);
        }
    }, [isToAmountFocused]);

    // Set initial calculated value for get field when tokens are loaded
    useEffect(() => {
        if (selectedFromToken && selectedToToken && fromAmount === '1' && toAmount === '') {
            console.log('🔄 SwapForm: Setting initial calculated value for get field');
            // Trigger initial calculation
            userInputRef.current = 'from';
        }
    }, [selectedFromToken, selectedToToken, fromAmount, toAmount]);

    // Handle when user completely erases the get field - trigger calculation
    useEffect(() => {
        if (toAmount === '' && fromAmount === '1' && selectedFromToken && selectedToToken && isToAmountFocused) {
            console.log('🔄 SwapForm: Get field is empty and send field is 1, triggering calculation');
            // Trigger calculation by setting userInputRef to 'from'
            userInputRef.current = 'from';
        }
    }, [toAmount, fromAmount, selectedFromToken, selectedToToken, isToAmountFocused]);

    // Removed problematic effect that was causing infinite calculation loops


    // Ensure default tokens are set if no valid tokens are loaded
    // This runs when default tokens are loaded from API or when token state changes
    useEffect(() => {
        // Don't set defaults if we're still loading the default tokens from API
        if (defaultTokensLoading) {
            console.log('🔄 SwapForm: Waiting for default tokens to load from API...');
            return;
        }

        // Check if we need to set defaults - only if no tokens are loaded from localStorage
        const fromTokenInStorage = localStorage.getItem('selectedFromToken');
        const toTokenInStorage = localStorage.getItem('selectedToToken');
        
        // Only set defaults if there are no tokens in localStorage AND no valid tokens in state
        const needsFromDefault = !fromTokenInStorage && (!selectedFromToken || !selectedFromToken.symbol || !selectedFromToken.address);
        const needsToDefault = !toTokenInStorage && (!selectedToToken || !selectedToToken.symbol || !selectedToToken.address);

        console.log('🔄 SwapForm: Default token check:', {
            fromTokenInStorage: !!fromTokenInStorage,
            toTokenInStorage: !!toTokenInStorage,
            selectedFromToken: selectedFromToken?.symbol || 'null',
            selectedToToken: selectedToToken?.symbol || 'null',
            needsFromDefault,
            needsToDefault
        });

        // Only set defaults if we actually need them and don't have valid tokens
        // Always set TON as from token and USDT as to token for consistency
        if (needsFromDefault && defaultTon && (!selectedFromToken || !selectedFromToken.symbol || !selectedFromToken.address)) {
            console.log('🔄 SwapForm: Setting default from token (TON) from API - no token in localStorage');
            setSelectedFromToken({
                symbol: defaultTon.symbol,
                name: defaultTon.name,
                image_url: defaultTon.image_url,
                address: defaultTon.address
            });
        }
        if (needsToDefault && defaultUsdt && (!selectedToToken || !selectedToToken.symbol || !selectedToToken.address)) {
            console.log('🔄 SwapForm: Setting default to token (USDT) from API - no token in localStorage');
            setSelectedToToken({
                symbol: defaultUsdt.symbol,
                name: defaultUsdt.name,
                image_url: defaultUsdt.image_url,
                address: defaultUsdt.address
            });
        }
        
        // Initialize original basis value for rotations
        if (originalBasisValueRef.current === null) {
            originalBasisValueRef.current = '1';
            console.log('🔄 SwapForm: Initialized original basis value to 1');
        }
        
        // Additional safety check: if both tokens are the same, fix it
        if (selectedFromToken && selectedToToken && selectedFromToken.address === selectedToToken.address) {
            console.log('🔄 SwapForm: Detected same token in both fields, fixing...');
            console.log('🔄 SwapForm: Current fromToken:', selectedFromToken.symbol);
            console.log('🔄 SwapForm: Current toToken:', selectedToToken.symbol);
            
            // Universal fix: set toToken to the opposite of fromToken
            let replacementToken = null;
            
            // If fromToken is TON, set toToken to USDT
            if (selectedFromToken.symbol === 'TON' && defaultUsdt) {
                replacementToken = defaultUsdt;
            }
            // If fromToken is USDT, set toToken to TON
            else if (selectedFromToken.symbol === 'USDT' && defaultTon) {
                replacementToken = defaultTon;
            }
            // For any other token, try to find a different token from the cache
            else if (allTokens && allTokens.length > 0) {
                // Find a different token that's not the same as fromToken
                const differentToken = allTokens.find(token => 
                    token.address !== selectedFromToken.address && 
                    token.verification === 'WHITELISTED'
                );
                if (differentToken) {
                    replacementToken = {
                        symbol: differentToken.symbol,
                        name: differentToken.name,
                        image_url: differentToken.image_url,
                        address: differentToken.address
                    };
                }
            }
            
            if (replacementToken) {
                console.log(`🔄 SwapForm: Setting toToken to ${replacementToken.symbol} to avoid duplicate`);
                setSelectedToToken(replacementToken);
                localStorage.setItem('selectedToToken', JSON.stringify(replacementToken));
            }
        }
        
    }, [selectedFromToken, selectedToToken, defaultUsdt, defaultTon, defaultTokensLoading, allTokens]); // Include dependencies but logic prevents infinite loops

    // Function to get prioritized tokens for shortcuts (exclude both fromToken and toToken)
    const getPrioritizedTokens = useCallback((excludeFromToken: any, excludeToToken: any) => {
        if (!allTokens || allTokens.length === 0) {
            return [];
        }

        // Filter out both the fromToken and toToken
        const filteredTokens = allTokens.filter(token => 
            token.address !== excludeFromToken?.address &&
            token.address !== excludeToToken?.address
        );

        // Sort by verification status and market cap
        const sortedTokens = filteredTokens
            .sort((a, b) => {
                // Prioritize WHITELISTED tokens
                if (a.verification === 'WHITELISTED' && b.verification !== 'WHITELISTED') return -1;
                if (b.verification === 'WHITELISTED' && a.verification !== 'WHITELISTED') return 1;
                
                // Then sort by market cap (higher first)
                const aMarketCap = a.market_cap || 0;
                const bMarketCap = b.market_cap || 0;
                return bMarketCap - aMarketCap;
            })
            .slice(0, 5); // Show top 5 instead of 4

        return sortedTokens.map(token => ({
            symbol: token.symbol,
            image_url: token.image_url,
            address: token.address,
            name: token.name,
            decimals: token.decimals,
            verification: token.verification
        }));
    }, [allTokens]);

    // Function to get top 5 tokens excluding both fromToken and toToken
    const getTop5TokensExcludingBoth = useCallback(() => {
        if (!allTokens || allTokens.length === 0) {
            // Return empty array if no tokens are loaded
            return [];
        }

        // Use prioritized tokens (exclude both selected fromToken and toToken)
        const prioritizedTokens = getPrioritizedTokens(selectedFromToken, selectedToToken);
        
        // Return up to 5 tokens
        return prioritizedTokens;
    }, [allTokens, selectedFromToken, selectedToToken, getPrioritizedTokens]);

  // Listen for custom events (for same-tab updates)
  const handleTokenSelect = useCallback((e: CustomEvent) => {
    console.log('🔄 SwapForm: Custom token selection event received', e);
    console.log('🔄 SwapForm: Event detail:', e.detail);
    console.log('🔄 SwapForm: Event detail type:', e.detail?.type);
    console.log('🔄 SwapForm: Event detail token:', e.detail?.token);
    console.log('🔄 SwapForm: Token has address:', !!e.detail?.token?.address);
    console.log('🔄 SwapForm: Token has symbol:', !!e.detail?.token?.symbol);
    console.log('🔄 SwapForm: Full token object:', e.detail?.token);
    
    // Only process real tokens (with address), not test tokens
    if (e.detail?.token?.address && e.detail?.token?.symbol) {
      const token = e.detail.token;
      const type = e.detail.type;
      
      if (type === 'from' && token) {
        console.log('✅ SwapForm: Updating selectedFromToken from custom event');
        console.log('✅ SwapForm: New token:', token.symbol, token.name);
        setSelectedFromToken(token);
        lastChangedTokenRef.current = 'from'; // Track that from token was changed
        // Also store in localStorage for persistence
        localStorage.setItem('selectedFromToken', JSON.stringify(token));
        console.log('✅ SwapForm: Updated selectedFromToken from custom event and localStorage');
        
        // Force recalculation by triggering a state update
        console.log('🔄 SwapForm: Triggering recalculation after fromToken selection');
      }
      if (type === 'to' && token) {
        console.log('✅ SwapForm: Updating selectedToToken from custom event');
        console.log('✅ SwapForm: New token:', token.symbol, token.name);
        setSelectedToToken(token);
        lastChangedTokenRef.current = 'to'; // Track that to token was changed
        // Set userInputRef to 'to' to trigger reverse calculation if toAmount has a value
        userInputRef.current = 'to';
        // Also store in localStorage for persistence
        localStorage.setItem('selectedToToken', JSON.stringify(token));
        console.log('✅ SwapForm: Updated selectedToToken from custom event and localStorage');
        
        // Force recalculation by triggering a state update
        console.log('🔄 SwapForm: Triggering recalculation after toToken selection');
      }
    } else {
      console.log('⚠️ SwapForm: Ignoring invalid event (missing address or symbol)');
      console.log('⚠️ SwapForm: Address present:', !!e.detail?.token?.address);
      console.log('⚠️ SwapForm: Symbol present:', !!e.detail?.token?.symbol);
    }
  }, []);

  // Load tokens from localStorage on mount (only if they exist)
  useEffect(() => {
    console.log('🔄 SwapForm: Checking for tokens in localStorage on mount');
    console.log('🔄 SwapForm: localStorage selectedFromToken:', localStorage.getItem('selectedFromToken'));
    console.log('🔄 SwapForm: localStorage selectedToToken:', localStorage.getItem('selectedToToken'));
    
    // Check if this is a page reload (not navigation from tokens page)
    const isPageReload = performance.navigation?.type === 1 || 
                        (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload' ||
                        document.referrer === '' || 
                        (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload';
    
    // Check if we're returning from tokens page (don't clear localStorage in this case)
    const fromTokensPage = sessionStorage.getItem('fromTokensPage') === 'true';
    const inAssetSelection = sessionStorage.getItem('inAssetSelection') === 'true';
    
    console.log('🔄 SwapForm: Navigation state:', { isPageReload, fromTokensPage, inAssetSelection });
    console.log('🔄 SwapForm: All sessionStorage flags:', {
      fromTokensPage: sessionStorage.getItem('fromTokensPage'),
      inAssetSelection: sessionStorage.getItem('inAssetSelection'),
      isNavigationReturn: sessionStorage.getItem('isNavigationReturn'),
      wasInCompactMode: sessionStorage.getItem('wasInCompactMode')
    });
    
    // Clear sessionStorage flags on page reload to ensure fresh state
    if (isPageReload) {
      console.log('🔄 SwapForm: Page reload detected - clearing sessionStorage flags');
      sessionStorage.removeItem('fromTokensPage');
      sessionStorage.removeItem('inAssetSelection');
      sessionStorage.removeItem('isNavigationReturn');
      sessionStorage.removeItem('wasInCompactMode');
      sessionStorage.removeItem('tokenSelectionProcessed');
    }
    
    // Check if there are recent tokens in localStorage that might have been selected
    const recentFromTokenData = localStorage.getItem('selectedFromToken');
    const recentToTokenData = localStorage.getItem('selectedToToken');
    const hasStoredTokens = recentFromTokenData || recentToTokenData;
    
    // Check if tokens are recent (selected within last 30 seconds) - this indicates active token selection
    let hasRecentTokens = false;
    if (recentFromTokenData) {
      try {
        const parsed = JSON.parse(recentFromTokenData);
        if (parsed.selectedAt && (Date.now() - parsed.selectedAt) < 30000) {
          hasRecentTokens = true;
        }
      } catch (e) {
        // If parsing fails, treat as old token
      }
    }
    if (recentToTokenData) {
      try {
        const parsed = JSON.parse(recentToTokenData);
        if (parsed.selectedAt && (Date.now() - parsed.selectedAt) < 30000) {
          hasRecentTokens = true;
        }
      } catch (e) {
        // If parsing fails, treat as old token
      }
    }
    
    console.log('🔄 SwapForm: Token freshness check:', { hasRecentTokens, hasStoredTokens });
    
    // On page reload, always clear localStorage and use defaults
    if (isPageReload) {
      console.log('🔄 SwapForm: Page reload detected - clearing localStorage tokens to use defaults');
      localStorage.removeItem('selectedFromToken');
      localStorage.removeItem('selectedToToken');
      console.log('🔄 SwapForm: No tokens in localStorage after clear, will use defaults');
      return;
    }
    
    // If there are recent tokens and we're NOT on a page reload, preserve them even if flags are missing
    if (hasRecentTokens && !isPageReload && (!fromTokensPage && !inAssetSelection)) {
      console.log('🔄 SwapForm: Found recent tokens in localStorage, preserving them despite missing flags');
    }
    
    // If there are stored tokens and we're returning from tokens page, preserve them
    if (hasStoredTokens && (fromTokensPage || inAssetSelection)) {
      console.log('🔄 SwapForm: Found stored tokens in localStorage, preserving them from token selection');
    }
    
    if (fromTokensPage || inAssetSelection) {
      console.log('🔄 SwapForm: Returning from tokens page or in asset selection - preserving localStorage tokens');
    }
    
    // Only load from localStorage if tokens exist there (for navigation from tokens page)
    const loadFromTokenData = localStorage.getItem('selectedFromToken');
    const loadToTokenData = localStorage.getItem('selectedToToken');
    
    if (loadFromTokenData || loadToTokenData) {
      console.log('🔄 SwapForm: Found tokens in localStorage, loading them');
      
      // Load from token
      if (loadFromTokenData) {
        try {
          const parsedToken = JSON.parse(loadFromTokenData);
          if (parsedToken && parsedToken.symbol && parsedToken.address) {
            // Remove the timestamp before setting the token
            const { selectedAt, ...tokenWithoutTimestamp } = parsedToken;
            setSelectedFromToken(tokenWithoutTimestamp);
            console.log('✅ SwapForm: Loaded selectedFromToken from localStorage:', parsedToken.symbol);
          }
        } catch (error) {
          console.error('❌ SwapForm: Error parsing from token from localStorage:', error);
        }
      }
      
      // Load to token
      if (loadToTokenData) {
        try {
          const parsedToken = JSON.parse(loadToTokenData);
          if (parsedToken && parsedToken.symbol && parsedToken.address) {
            // Remove the timestamp before setting the token
            const { selectedAt, ...tokenWithoutTimestamp } = parsedToken;
            setSelectedToToken(tokenWithoutTimestamp);
            console.log('✅ SwapForm: Loaded selectedToToken from localStorage:', parsedToken.symbol);
          }
        } catch (error) {
          console.error('❌ SwapForm: Error parsing to token from localStorage:', error);
        }
      }
    } else {
      console.log('🔄 SwapForm: No tokens in localStorage, will use defaults');
    }
  }, []);

  // Set up event listeners for token selection
  useEffect(() => {
    // Listen for storage changes (when tokens are selected from tokens page)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔄 SwapForm: Storage change detected', e.key, e.newValue);
      if (e.key === 'selectedFromToken' && e.newValue) {
        try {
          const parsedToken = JSON.parse(e.newValue);
          // Only update if the token has required properties
          if (parsedToken && parsedToken.symbol && parsedToken.address) {
            setSelectedFromToken(parsedToken);
            console.log('✅ SwapForm: Updated selectedFromToken from storage:', parsedToken.symbol);
          }
        } catch (error) {
          console.error('❌ SwapForm: Error parsing from token from storage:', error);
        }
      }
      if (e.key === 'selectedToToken' && e.newValue) {
        try {
          const parsedToken = JSON.parse(e.newValue);
          // Only update if the token has required properties
          if (parsedToken && parsedToken.symbol && parsedToken.address) {
            setSelectedToToken(parsedToken);
            console.log('✅ SwapForm: Updated selectedToToken from storage:', parsedToken.symbol);
          }
        } catch (error) {
          console.error('❌ SwapForm: Error parsing to token from storage:', error);
        }
      }
    };

    // Set up event listeners immediately
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenSelected', handleTokenSelect as EventListener);
    
    // Add a global event listener for debugging
    const globalEventHandler = (e: Event) => {
      if (e.type === 'tokenSelected') {
        console.log('🌍 Global event listener caught tokenSelected event:', e);
      }
    };
    window.addEventListener('tokenSelected', globalEventHandler);

    console.log('🔧 SwapForm: Event listeners added');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenSelected', handleTokenSelect as EventListener);
      window.removeEventListener('tokenSelected', globalEventHandler);
    };
  }, [handleTokenSelect]); // Include handleTokenSelect in dependencies

    // Create validation function for keyboard
    const canAddMoreCharacters = useCallback((key: string) => {
        // Check which input is currently focused and use its validation
        if (isFromAmountFocused && fromAmountRef.current) {
            return fromAmountRef.current.canAddMoreCharacters(key);
        } else if (isToAmountFocused && toAmountRef.current) {
            return toAmountRef.current.canAddMoreCharacters(key);
        }
        return true; // Default to allowing input
    }, [isFromAmountFocused, isToAmountFocused]);

    // Register validation function with context
    React.useEffect(() => {
        if (typeof canAddMoreCharacters === 'function') {
            setCanAddMoreCharacters(canAddMoreCharacters);
        }
    }, [canAddMoreCharacters, setCanAddMoreCharacters]);

    const handleFocusChange = useCallback((isFocused: boolean) => {
        console.log('🟦 FROM input focus change:', isFocused);
        console.log('🟦 Current toAmount focused state:', isToAmountFocused);
        console.log('🟦 toAmountRef.current:', toAmountRef.current);
        
        const wasFocused = isFromAmountFocused;
        setIsFromAmountFocused(isFocused);
        
        // Unfocus the other input when this one is focused
        if (isFocused) {
            console.log('🟦 FROM input focused - attempting to blur TO input');
            setIsToAmountFocused(false);
            // Set userInputRef to 'from' for forward calculations
            userInputRef.current = 'from';
            // Reset typing flags when focusing fromAmount field
            setIsUserTypingToAmount(false);
            userFinishedTypingToAmount.current = false;
            // Blur the other input in the DOM
            if (toAmountRef.current) {
                console.log('🟦 Calling toAmountRef.current.blur()');
                toAmountRef.current.blur();
            } else {
                console.log('🟦 toAmountRef.current is null!');
            }
        }
        setInputFocused(isFocused || isToAmountFocused);
        
        // Send field mechanics: Handle focus behavior based on whether it's a default value or calculated value
        console.log('🔄 SwapForm: Send field focus check:', {
            isFocused,
            fromAmount,
            basisFieldRef: basisFieldRef.current,
            isUserTyping: isUserTyping.current,
            isUserTypingToAmount,
            hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
            isFromAmountCalculated: isFromAmountCalculated.current,
            condition1: isFocused,
            condition2: fromAmount && parseFloat(fromAmount) > 0,
            condition3: !isUserTyping.current,
            condition4: !isUserTypingToAmount,
            condition5: !hasUserEnteredCustomValue.current,
            allConditionsMet: isFocused && fromAmount && parseFloat(fromAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current
        });
        if (isFocused && fromAmount && parseFloat(fromAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current) {
            // Check if this is the default value "1" (basis field) or a calculated value
            console.log('🔄 SwapForm: Send field focus condition check:', {
                fromAmount,
                fromAmountType: typeof fromAmount,
                fromAmountString: String(fromAmount),
                basisFieldRef: basisFieldRef.current,
                fromAmountEquals1: fromAmount === '1',
                fromAmountEquals1Number: fromAmount === 1,
                fromAmountEquals1String: String(fromAmount) === '1',
                basisFieldEqualsFrom: basisFieldRef.current === 'from',
                bothConditionsMet: fromAmount === '1' && basisFieldRef.current === 'from',
                bothConditionsMetNumber: fromAmount === 1 && basisFieldRef.current === 'from',
                bothConditionsMetString: String(fromAmount) === '1' && basisFieldRef.current === 'from',
                finalCondition: (fromAmount === '1' || fromAmount === 1) && basisFieldRef.current === 'from'
            });
            
            // Simplified condition: check if fromAmount is 1 (number or string) and basis field is 'from'
            const isDefaultValue = (fromAmount === '1' || fromAmount === 1 || String(fromAmount) === '1');
            const isBasisField = basisFieldRef.current === 'from';
            
            console.log('🔄 SwapForm: Simplified condition check:', {
                isDefaultValue,
                isBasisField,
                shouldClear: isDefaultValue && isBasisField
            });
            
            if (isDefaultValue && isBasisField) {
                // This is the default value "1" on the Send field side - clear it and set Get field to 0
                console.log('🔄 SwapForm: Send field focused with default value 1, clearing Send field and setting Get field to 0');
                // Set a flag to prevent calculation from overriding the values
                isRestoringDefaults.current = true;
                setFromAmount(''); // Clear the Send field
                setToAmount('0'); // Set Get field to 0
                // Clear the flag after a short delay to allow the values to stick
                setTimeout(() => {
                    isRestoringDefaults.current = false;
                }, 100);
            } else if (isFromAmountCalculated.current) {
                // This is a calculated value - clear it and set Get field to 0
                console.log('🔄 SwapForm: Clearing fromAmount calculated value on focus for user input:', fromAmount);
                setFromAmount('');
                setToAmount('0'); // Set get field to 0 when focusing send field with calculated value
                isFromAmountCalculated.current = false;
                // Reset the custom value flag to allow zero handling to work
                hasUserEnteredCustomValue.current = false;
            } else {
                // This is an initial calculated value - clear it and set Get field to 0
                console.log('🔄 SwapForm: Clearing fromAmount initial calculated value on focus for user input');
                setFromAmount('');
                setToAmount('0'); // Set get field to 0 when focusing send field with calculated value
                isFromAmountCalculated.current = false;
                // Reset the custom value flag to allow zero handling to work
                hasUserEnteredCustomValue.current = false;
            }
        }
        // Send field mechanics: Reset to default value when unfocusing and empty or zero
        else if (!isFocused && wasFocused && (fromAmount === '' || fromAmount === '0')) {
            console.log('🔄 SwapForm: Restoration condition check:', {
                fromAmount,
                hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
                isFromAmountDefault: isFromAmountDefault.current,
                shouldRestore: !hasUserEnteredCustomValue.current || fromAmount === ''
            });
            // Only restore if user hasn't entered a custom value or if they cleared the field
            if (!hasUserEnteredCustomValue.current || fromAmount === '') {
                // Restore to defaults depending on where basis should be
                const defaultValue = fromDefaultValueRef.current || '1';
                console.log('🔄 SwapForm: Restoring fromAmount default value on unfocus:', defaultValue, 'basisSide:', defaultBasisSideRef.current);
                isRestoringDefaults.current = true;
                
                // Force immediate state updates with direct DOM manipulation
                console.log('🔄 SwapForm: Forcing immediate restoration with direct state updates');
                
                // Check where the basis value should be based on current rotation state
                if (basisFieldRef.current === 'from') {
                    // Basis on Send field - restore Send field to "1" and clear Get field
                    setFromAmount('1');
                    setToAmount('');
                    userInputRef.current = 'from';
                } else {
                    // Basis on Get field - restore Get field to "1" and clear Send field
                    setFromAmount('');
                    setToAmount('1');
                    userInputRef.current = 'to';
                }
                
                // Reset the custom value flag since we're back to default
                hasUserEnteredCustomValue.current = false;
                // Mark as default value so it can be cleared on focus
                isFromAmountDefault.current = true;
                
                // Force multiple re-renders to ensure UI reflects the restored values
                setTimeout(() => {
                    console.log('🔄 SwapForm: Forcing immediate UI update for restoration - attempt 1');
                    if (basisFieldRef.current === 'from') {
                        setFromAmount(prev => {
                            console.log('🔄 SwapForm: fromAmount state update:', prev, '-> 1');
                            return '1';
                        });
                        setToAmount(prev => {
                            console.log('🔄 SwapForm: toAmount state update:', prev, '-> (empty)');
                            return '';
                        });
                    } else {
                        setFromAmount(prev => {
                            console.log('🔄 SwapForm: fromAmount state update:', prev, '-> (empty)');
                            return '';
                        });
                        setToAmount(prev => {
                            console.log('🔄 SwapForm: toAmount state update:', prev, '-> 1');
                            return '1';
                        });
                    }
                }, 0);
                
                setTimeout(() => {
                    console.log('🔄 SwapForm: Forcing immediate UI update for restoration - attempt 2');
                    if (basisFieldRef.current === 'from') {
                        setFromAmount(prev => {
                            console.log('🔄 SwapForm: fromAmount state update 2:', prev, '-> 1');
                            return '1';
                        });
                        setToAmount(prev => {
                            console.log('🔄 SwapForm: toAmount state update 2:', prev, '-> (empty)');
                            return '';
                        });
                    } else {
                        setFromAmount(prev => {
                            console.log('🔄 SwapForm: fromAmount state update 2:', prev, '-> (empty)');
                            return '';
                        });
                        setToAmount(prev => {
                            console.log('🔄 SwapForm: toAmount state update 2:', prev, '-> 1');
                            return '1';
                        });
                    }
                }, 10);
                
                setTimeout(() => {
                    console.log('🔄 SwapForm: Forcing immediate UI update for restoration - attempt 3');
                    if (basisFieldRef.current === 'from') {
                        setFromAmount(prev => {
                            console.log('🔄 SwapForm: fromAmount state update 3:', prev, '-> 1');
                            return '1';
                        });
                        setToAmount(prev => {
                            console.log('🔄 SwapForm: toAmount state update 3:', prev, '-> (empty)');
                            return '';
                        });
                    } else {
                        setFromAmount(prev => {
                            console.log('🔄 SwapForm: fromAmount state update 3:', prev, '-> (empty)');
                            return '';
                        });
                        setToAmount(prev => {
                            console.log('🔄 SwapForm: toAmount state update 3:', prev, '-> 1');
                            return '1';
                        });
                    }
                }, 20);
                
                // Clear the guard after a longer delay to prevent action-based calculation manager interference
                setTimeout(() => { 
                    console.log('🔄 SwapForm: Clearing isRestoringDefaults flag after restoration');
                    isRestoringDefaults.current = false; 
                    // Trigger a calculation after restoration to populate the Get field
                    console.log('🔄 SwapForm: Triggering calculation after restoration');
                    // Directly call the calculation function with the correct amount
                    if (executeCalculation) {
                        console.log('🔄 SwapForm: Calling executeCalculation directly with amount 1');
                        executeCalculation('FORWARD', '1');
                    } else {
                        console.log('🔄 SwapForm: executeCalculation not available, falling back to action-based manager');
                        // Fallback: Force a calculation by setting userInputRef to trigger the action-based calculation manager
                        userInputRef.current = 'from';
                        // Force a re-render to ensure the calculation happens
                        setTimeout(() => {
                            console.log('🔄 SwapForm: Forcing calculation after state update');
                            // Trigger a state change that will be detected by the action-based calculation manager
                            setFromAmount(prev => {
                                console.log('🔄 SwapForm: Triggering calculation with fromAmount:', prev);
                                return prev; // This will trigger a re-render and action detection
                            });
                        }, 50);
                    }
                }, 200);
            }
        }
    }, [setInputFocused, fromAmount, isToAmountFocused]);


    const handleFromAmountChange = useCallback((value: string) => {
        console.log('🔄 SwapForm: fromAmount changed to:', value);
        userInputRef.current = 'from';
        setFromAmount(value);
        isFromAmountCalculated.current = false; // Reset calculated flag when user types
        
        // Don't set typing flags during rotation
        if (isRotating.current) {
            return;
        }
        
        userFinishedTypingToAmount.current = false; // Reset finished typing flag when user starts typing in fromAmount
        // Any user typing cancels the rotated-from-defaults context
        rotatedFromDefaultsRef.current = false;
        
        // If user completely erases the field (empty string), just leave it empty
        // The restoration to default (1) will happen in handleFocusChange when unfocusing
        if (value === '') {
            console.log('🔄 SwapForm: User completely erased fromAmount, leaving empty for now');
            // Don't immediately restore to default - let it stay empty
            // The restoration will happen on unfocus in handleFocusChange
            // Reset the custom value flag to allow restoration to work
            hasUserEnteredCustomValue.current = false;
            // Mark as no longer default since user cleared it
            isFromAmountDefault.current = false;
        } else {
            // Mark as no longer default when user types
            isFromAmountDefault.current = false;
            // Only mark as custom value when user enters a non-empty value
            hasUserEnteredCustomValue.current = true;
            // Update the last user entered value for rotation
            lastUserEnteredValue.current = value;
            // Update the original basis value for rotation preservation
            originalBasisValueRef.current = value;
            console.log('🔄 SwapForm: Updated last user entered value to:', value);
            console.log('🔄 SwapForm: Updated original basis value to:', value);
        }
    }, []);

    const handleToAmountFocusChange = useCallback((isFocused: boolean) => {
        console.log('🟨 TO input focus change:', isFocused);
        console.log('🟨 Current fromAmount focused state:', isFromAmountFocused);
        console.log('🟨 fromAmountRef.current:', fromAmountRef.current);
        
        setIsToAmountFocused(isFocused);
        isToAmountFocusedRef.current = isFocused; // Update ref immediately
        // Unfocus the other input when this one is focused
        if (isFocused) {
            console.log('🟨 TO input focused - attempting to blur FROM input');
            setIsFromAmountFocused(false);
            // Set userInputRef to 'to' for reverse calculations
            userInputRef.current = 'to';
            // Blur the other input in the DOM
            if (fromAmountRef.current) {
                console.log('🟨 Calling fromAmountRef.current.blur()');
                fromAmountRef.current.blur();
            } else {
                console.log('🟨 fromAmountRef.current is null!');
            }
        }
        setInputFocused(isFocused || isFromAmountFocused);
        
        // Get field mechanics: Handle focus behavior based on whether it's a default value or calculated value
        if (isFocused && toAmount && parseFloat(toAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current) {
            // Check if this is the default value "1" (basis field) or a calculated value
            if (toAmount === '1' && basisFieldRef.current === 'to') {
                // This is the default value "1" on the Get field side - clear it and set Send field to 0
                console.log('🔄 SwapForm: Get field focused with default value 1, clearing Get field and setting Send field to 0');
                // Set a flag to prevent calculation from overriding the values
                isRestoringDefaults.current = true;
                setToAmount(''); // Clear the Get field
                setFromAmount('0'); // Set Send field to 0
                // Clear the flag after a short delay to allow the values to stick
                setTimeout(() => {
                    isRestoringDefaults.current = false;
                }, 100);
            } else if (isToAmountCalculated.current) {
                // This is a calculated value - clear it and set Send field to 0
                console.log('🔄 SwapForm: Clearing toAmount calculated value on focus for user input:', toAmount);
                setToAmount('');
                setFromAmount('0'); // Set send field to 0 when focusing get field with calculated value
                isToAmountCalculated.current = false;
                // Reset the custom value flag to allow zero handling to work
                hasUserEnteredCustomValue.current = false;
            } else {
                // This is an initial calculated value - clear it and set Send field to 0
                console.log('🔄 SwapForm: Clearing toAmount initial calculated value on focus for user input');
                setToAmount('');
                setFromAmount('0'); // Set send field to 0 when focusing get field with calculated value
                isToAmountCalculated.current = false;
                // Reset the custom value flag to allow zero handling to work
                hasUserEnteredCustomValue.current = false;
            }
        }
        // Get field mechanics: Restore default values when unfocusing and empty or zero
        else if (!isFocused && (toAmount === '' || toAmount === '0')) {
            console.log('🔄 SwapForm: Restoring default values on unfocus (get field empty)');
            // Reset the finished typing flag to allow calculations
            userFinishedTypingToAmount.current = false;
            // Guard while restoring defaults
            isRestoringDefaults.current = true;
            // Use tracked default send value (may be not '1' after rotation)
            const defaultSend = fromDefaultValueRef.current || '1';
            // Decide where basis '1' belongs depending on rotation parity
            if (basisFieldRef.current === 'from') {
                // Basis on send side
                setFromAmount('1');
                setToAmount('');
                isFromAmountDefault.current = true;
                isToAmountCalculated.current = false;
            userInputRef.current = 'from';
            } else {
                // Basis on get side
                setFromAmount(defaultSend);
                setToAmount('1');
                isFromAmountDefault.current = true;
                isToAmountCalculated.current = false;
                // Trigger reverse calculation from get basis
                userInputRef.current = 'to';
            }
            // Reset flags to defaults
            hasUserEnteredCustomValue.current = false;
            
            // Clear the guard after a longer delay to prevent action-based calculation manager interference
            setTimeout(() => { 
                console.log('🔄 SwapForm: Clearing isRestoringDefaults flag after restoration (Get field)');
                isRestoringDefaults.current = false; 
                // Trigger a calculation after restoration to populate the Send field
                console.log('🔄 SwapForm: Triggering calculation after restoration (Get field)');
                // Directly call the calculation function with the correct amount
                if (executeCalculation) {
                    console.log('🔄 SwapForm: Calling executeCalculation directly with amount 1 (Get field)');
                    executeCalculation('REVERSE', '1');
                }
            }, 200);
        }
        // Reset the finished typing flag when unfocusing toAmount field (regardless of content)
        else if (!isFocused) {
            console.log('🔄 SwapForm: Resetting finished typing flag on toAmount unfocus');
            userFinishedTypingToAmount.current = false;
        }
    }, [setInputFocused, isFromAmountFocused, toAmount, isUserTypingToAmount]);

    const handleToAmountChange = useCallback((value: string) => {
        userInputRef.current = 'to';
        setToAmount(value);
        
        // Don't set typing flags during rotation
        if (isRotating.current) {
            return;
        }
        
        // Set typing flag immediately when user types in Get field
        setIsUserTypingToAmount(true);
        isToAmountCalculated.current = false; // Reset calculated flag when user types
        userFinishedTypingToAmount.current = false; // Reset finished typing flag when user starts typing again
        // Any user typing cancels the rotated-from-defaults context
        rotatedFromDefaultsRef.current = false;
        
        // If user completely erases the field (empty string), show 0 in send field
        if (value === '') {
            console.log('🔄 SwapForm: User completely erased toAmount, setting send field to 0');
            // Set send field to 0 when get field is empty
            setFromAmount('0');
            // Don't set hasUserEnteredCustomValue to true here - we want zero handling to work
        } else {
            // Only mark as custom value when user enters a non-empty value
            hasUserEnteredCustomValue.current = true;
            // Update the last user entered value for rotation
            lastUserEnteredValue.current = value;
            // Update the original basis value for rotation preservation
            originalBasisValueRef.current = value;
            console.log('🔄 SwapForm: Updated last user entered value from get field to:', value);
            console.log('🔄 SwapForm: Updated original basis value to:', value);
        }
    }, [setIsUserTypingToAmount]);

    return (
        <div 
            className={`w-full relative z-10 flex flex-col items-center justify-center mx-auto 
                ${shouldBeCompact ? '' : 'mb-[22px]'}
            `}
            style={{
                maxWidth: '460px',
                padding: shouldBeCompact ? '0' : '20px'
            }}
        >
            {/* Title - only visible in expanded mode */}
            <span 
                className="text-[33px] mb-[20px] text-center"
                style={{
                    display: shouldBeCompact ? 'none' : 'block'
                }}
            >
                {t('swap_tokens')}
            </span>
            
            {/* Main form container */}
            <div 
                style={{ 
                    border: shouldBeCompact ? '' : '1px solid rgba(26, 188, 255, 1)', 
                    borderRadius: '15px', 
                    backgroundColor: colors.background,
                }}
                className="w-full"
            >
                <div className='z-20 w-full p-[15px] flex flex-col'>
                    <div className='flex flex-row gap-[15px] items-center justify-between'>
                        <div className='flex flex-row w-full items-center gap-[5px]'>
                            {shouldBeCompact && (
                                <div style={{ width: '25px', height: '20px', overflow: 'hidden', transition: 'width 0.2s ease' }}>
                                    <Image
                                        src="/logo_sign.svg"
                                        alt="sign"
                                        width="25"
                                        height="20"
                                        style={{
                                            width: '25px !important',
                                            height: '20px !important',
                                            minWidth: '25px',
                                            minHeight: '20px',
                                            maxWidth: '25px',
                                            maxHeight: '20px',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            )}
                            {t('send')}
                        </div>
                        {walletAddress ? <div className='text-[#1ABCFF]'>
                            {t('max')}
                        </div> : null}
                        <div className='w-full flex justify-end gap-[5px]'>
                            {getTop5TokensExcludingBoth().map((token, index) => (
                                <div
                                    key={`from-token-${index}-${token.symbol}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🎯 SwapForm: Small token icon clicked for fromToken:', token.symbol);
                                        
                                        // Smart switching logic: if the selected token is already in toToken, swap them
                                        if (selectedToToken && selectedToToken.address === token.address) {
                                            console.log('🔄 SwapForm: Token already in toToken, swapping tokens');
                                            // Store the current fromToken before swapping
                                            const currentFromToken = selectedFromToken;
                                            
                                            // Swap: selectedFromToken becomes toToken, selected token becomes fromToken
                                            setSelectedToToken(currentFromToken);
                                            setSelectedFromToken(token);
                                            
                                            // Store swapped tokens in localStorage for persistence
                                            localStorage.setItem('selectedFromToken', JSON.stringify(token));
                                            localStorage.setItem('selectedToToken', JSON.stringify(currentFromToken));
                                            
                                            // Dispatch custom events for immediate update
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token: token, type: 'from' } 
                                            }));
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token: currentFromToken, type: 'to' } 
                                            }));
                                            
                                            console.log('✅ SwapForm: Swapped tokens - fromToken:', token.symbol, 'toToken:', currentFromToken?.symbol);
                                            console.log('🔄 SwapForm: Triggering recalculation after token swap');
                                            
                                            // Force a state update to trigger recalculation after swap
                                            setTimeout(() => {
                                                console.log('🔄 SwapForm: Forcing recalculation after swap timeout');
                                                setFromAmount(prev => prev);
                                                // Don't reset userInputRef here - preserve it for token change after user input logic
                                            }, 10);
                                        } else {
                                            // Normal selection - just update the from token
                                            setSelectedFromToken(token);
                                            lastChangedTokenRef.current = 'from'; // Track that from token was changed
                                            
                                            // Store in localStorage for persistence
                                            localStorage.setItem('selectedFromToken', JSON.stringify(token));
                                            
                                            // Dispatch custom event for immediate update
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token, type: 'from' } 
                                            }));
                                            
                                            console.log('✅ SwapForm: Updated fromToken from small icon:', token.symbol);
                                            console.log('🔄 SwapForm: Triggering recalculation after shortcut selection');
                                            
                                            // Force a state update to trigger recalculation
                                            // This ensures the useSwapCalculation hook detects the change
                                            setTimeout(() => {
                                                console.log('🔄 SwapForm: Forcing recalculation after timeout');
                                                // Trigger a small state change to force recalculation
                                                setFromAmount(prev => prev);
                                                // Don't reset userInputRef here - preserve it for token change after user input logic
                                            }, 10);
                                        }
                                        
                                        // Additional safety check: if both tokens are now the same, fix it
                                        if (selectedToToken && token.address === selectedToToken.address) {
                                            console.log('🔄 SwapForm: After selection, both tokens are the same, fixing...');
                                            
                                            // Universal fix: find a different token for toToken
                                            let replacementToken = null;
                                            
                                            // If fromToken is TON, set toToken to USDT
                                            if (token.symbol === 'TON' && defaultUsdt) {
                                                replacementToken = defaultUsdt;
                                            }
                                            // If fromToken is USDT, set toToken to TON
                                            else if (token.symbol === 'USDT' && defaultTon) {
                                                replacementToken = defaultTon;
                                            }
                                            // For any other token, try to find a different token from the cache
                                            else if (allTokens && allTokens.length > 0) {
                                                // Find a different token that's not the same as fromToken
                                                const differentToken = allTokens.find(t => 
                                                    t.address !== token.address && 
                                                    t.verification === 'WHITELISTED'
                                                );
                                                if (differentToken) {
                                                    replacementToken = {
                                                        symbol: differentToken.symbol,
                                                        name: differentToken.name,
                                                        image_url: differentToken.image_url,
                                                        address: differentToken.address
                                                    };
                                                }
                                            }
                                            
                                            if (replacementToken) {
                                                console.log(`🔄 SwapForm: Setting toToken to ${replacementToken.symbol} to avoid duplicate`);
                                                setSelectedToToken(replacementToken);
                                                localStorage.setItem('selectedToToken', JSON.stringify(replacementToken));
                                                window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                    detail: { token: replacementToken, type: 'to' } 
                                                }));
                                            }
                                        }
                                    }}
                                    className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF] cursor-pointer'
                                >
                                    <Image
                                        src={token.image_url || ''}
                                        alt={token.symbol || ''}
                                        width="15"
                                        height="15"
                                        style={{
                                            width: '15px !important',
                                            height: '15px !important',
                                            minWidth: '15px',
                                            minHeight: '15px',
                                            maxWidth: '15px',
                                            maxHeight: '15px',
                                            display: 'block',
                                            borderRadius: '50%',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div data-custom-keyboard className='flex flex-row items-center gap-[5px] my-[5px]'>
                        <CustomInput
                            key="from-amount-input"
                            ref={fromAmountRef}
                            value={fromAmount}
                            onChange={handleFromAmountChange}
                            className='w-full text-[#1ABCFF] text-[33px]'
                            type='number'
                            placeholder='0'
                            onFocusChange={handleFocusChange}
                            shouldBeCompact={shouldBeCompact}
                        />
                        <div 
                            key={`from-token-${selectedFromToken?.address || 'default'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🎯 SwapForm: Token selection clicked!');
                                // Set navigation flags to maintain compact mode when returning
                                setNavigationFlags();
                try {
                    router.push('/tokens-fast?type=from');
                    console.log('✅ SwapForm: Navigation to fast tokens page initiated');
                } catch (error) {
                    console.error('❌ SwapForm: Navigation error:', error);
                    window.location.href = '/tokens-fast?type=from';
                }
                            }}
                            className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[#1ABCFF] rounded-[15px] cursor-pointer select-none'
                            style={{ 
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                position: 'relative',
                                zIndex: 10,
                                pointerEvents: 'auto'
                            }}
                        >
                            {defaultTokensLoading ? (
                                <>
                                    <div 
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: 'transparent',
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <div 
                                        style={{
                                            width: '30.04px',
                                            height: '21px',
                                            backgroundColor: 'transparent',
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Image
                                        src={selectedFromToken?.image_url || defaultUsdt?.image_url}
                                        alt={selectedFromToken?.symbol || defaultUsdt?.symbol}
                                        width="20"
                                        height="20"
                                        priority
                                        style={{
                                            width: '20px !important',
                                            height: '20px !important',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            maxWidth: '20px',
                                            maxHeight: '20px',
                                            display: 'block',
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <span className='text-[#1ABCFF]'>
                                        {selectedFromToken?.symbol || defaultUsdt?.symbol}
                                    </span>
                                </>
                            )}
                            <MdKeyboardArrowRight 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#1ABCFF',
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center gap-[15px]'>
                        <div className='w-full' style={{ opacity: 0.66 }}>
                            {fromTokenUSDValue}
                        </div>
                        {walletAddress ? <div className='flex flex-row gap-[5px]'>
                            <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                            <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>
                                1111.00 {defaultTokensLoading ? (
                                    <span style={{ 
                                        display: 'inline-block',
                                        width: '38.23px',
                                        height: '21px',
                                        backgroundColor: 'transparent'
                                    }} />
                                ) : (
                                    selectedFromToken?.symbol || defaultUsdt?.symbol
                                )}
                            </span>
                        </div> : null}
                        <div className='flex flex-row w-full justify-end text-nowrap' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-[5px] mt-[5px] mb-[5px]'>
                        <div className='h-[1px] w-full bg-[#1ABCFF]'></div>
                        <div 
                            className='w-[30px] h-[30px] flex items-center justify-center cursor-pointer'
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔄 SwapForm: Rotate icon clicked - swapping tokens');
                                
                                // Check if currentTarget exists before accessing style
                                if (!e.currentTarget) {
                                    console.error('❌ SwapForm: currentTarget is null, cannot rotate');
                                    return;
                                }
                                
                                // Get current rotation and add random direction
                                const currentRotation = e.currentTarget.style.transform || 'rotate(0deg)';
                                const currentAngle = currentRotation.match(/-?\d+/) ? parseInt(currentRotation.match(/-?\d+/)![0]) : 0;
                                
                                // Random direction: either +180 or -180 degrees
                                const randomDirection = Math.random() < 0.5 ? 1 : -1;
                                const newAngle = currentAngle + (180 * randomDirection);
                                
                                // Apply the new rotation
                                e.currentTarget.style.transform = `rotate(${newAngle}deg)`;
                                
                                console.log(`🎲 SwapForm: Rotating ${randomDirection > 0 ? 'clockwise' : 'counterclockwise'} to ${newAngle} degrees`);
                                
                                // Only swap if both tokens are available
                                if (selectedFromToken && selectedToToken) {
                                    // Set rotation flag to prevent typing flags from being set
                                    isRotating.current = true;
                                    
                                    console.log('🔄 SwapForm: Swapping fromToken and toToken');
                                    console.log('🔄 SwapForm: Current fromToken:', selectedFromToken.symbol);
                                    console.log('🔄 SwapForm: Current toToken:', selectedToToken.symbol);
                                    console.log('🔄 SwapForm: Current fromAmount:', fromAmount);
                                    console.log('🔄 SwapForm: Current toAmount:', toAmount);
                                    
                                    // Store current tokens and amounts
                                    const currentFromToken = selectedFromToken;
                                    const currentToToken = selectedToToken;
                                    const currentFromAmount = fromAmount;
                                    const currentToAmount = toAmount;

                                    // Special case: if rotating while empty field is focused and the opposite is '0',
                                    // only switch currencies without swapping amounts or triggering recalculation.
                                    const rotatingEmptyWithZero = (
                                        (isFromAmountFocused && currentFromAmount === '' && currentToAmount === '0') ||
                                        (isToAmountFocused && currentToAmount === '' && currentFromAmount === '0')
                                    );
                                    if (rotatingEmptyWithZero) {
                                        console.log('🔁 SwapForm: Rotating with empty+zero state — switching only currencies');
                                        setSelectedFromToken(currentToToken);
                                        setSelectedToToken(currentFromToken);
                                        localStorage.setItem('selectedFromToken', JSON.stringify(currentToToken));
                                        localStorage.setItem('selectedToToken', JSON.stringify(currentFromToken));
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { detail: { token: currentToToken, type: 'from' } }));
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { detail: { token: currentFromToken, type: 'to' } }));
                                        // Do NOT change amounts, basis, or typing flags here
                                        setTimeout(() => { isRotating.current = false; }, 0);
                                        return;
                                    }
                                    
                                    // Swap the tokens
                                    setSelectedFromToken(currentToToken);
                                    setSelectedToToken(currentFromToken);
                                    
                                    // Perfect rotation logic: transfer last user entered value to opposite field
                                    // and recalculate the other amount
                                    
                                    // Determine which value to use for rotation
                                    let valueToTransfer = lastUserEnteredValue.current;
                                    
                                    // If we're rotating default values, use the current send field value
                                    if (fromAmount === '1' && isFromAmountDefault.current && !hasUserEnteredCustomValue.current) {
                                        valueToTransfer = fromAmount;
                                        console.log('🔄 SwapForm: Rotating default values, using send field value:', valueToTransfer);
                                    } else {
                                        // For non-default rotations, preserve the original basis value
                                        // Check if we have a stored original basis value
                                        if (originalBasisValueRef.current !== null) {
                                            valueToTransfer = originalBasisValueRef.current;
                                            console.log('🔄 SwapForm: Rotating with preserved original basis value:', valueToTransfer);
                                        } else {
                                            console.log('🔄 SwapForm: Rotating with last user entered value:', valueToTransfer);
                                        }
                                    }
                                    
                                    // Remember the exact value transferred into the get field to detect reverse completion
                                    rotatedTransferredToAmount.current = currentFromAmount;

                                    // Move the basis value to the opposite field of where it currently is
                                    // This ensures the basis value alternates between Send and Get fields
                                    if (basisFieldRef.current === 'from') {
                                        // Basis was in Send field, move it to Get field
                                        setFromAmount(''); // Clear send field to allow calculation
                                        setToAmount(valueToTransfer); // Put basis value in Get field
                                        basisFieldRef.current = 'to';
                                        console.log('🔄 SwapForm: Moved basis value to Get field');
                                    } else {
                                        // Basis was in Get field, move it to Send field
                                        setFromAmount(valueToTransfer); // Put basis value in Send field
                                        setToAmount(''); // Clear get field to allow calculation
                                        basisFieldRef.current = 'from';
                                        console.log('🔄 SwapForm: Moved basis value to Send field');
                                    }
                                    
                                    // Update default send reference to match new context (so unfocus restores this)
                                    fromDefaultValueRef.current = basisFieldRef.current === 'from' ? valueToTransfer : currentToAmount;
                                    
                                    // Update flags to reflect the state
                                    // Only treat rotated values as default if we rotated from true defaults
                                    const rotatedFromDefaults = (
                                        currentFromAmount === '1' &&
                                        isFromAmountDefault.current &&
                                        !hasUserEnteredCustomValue.current
                                    );
                                    // Persist this info for unfocus/default restoration logic
                                    rotatedFromDefaultsRef.current = rotatedFromDefaults;
                                    // Don't toggle defaultBasisSideRef during rotation - it should remain consistent
                                    // The basisFieldRef tracks the current position, but defaultBasisSideRef should stay stable
                                    isFromAmountDefault.current = rotatedFromDefaults; // New send is default only if rotation started from default '1'
                                    isToAmountCalculated.current = true; // The new get field value is calculated
                                    hasUserEnteredCustomValue.current = !rotatedFromDefaults; // If not default rotation, consider it user-entered
                                    
                                    // Reset typing flags after rotation to allow normal calculation updates
                                    setIsUserTypingToAmount(false);
                                    userFinishedTypingToAmount.current = false;
                                    
                                    // Update the last user entered value to the basis value
                                    lastUserEnteredValue.current = valueToTransfer;
                                    
                                    // Trigger calculation based on where the basis value was placed
                                    if (basisFieldRef.current === 'to') {
                                        // Basis value is in Get field, trigger reverse calculation
                                        userInputRef.current = 'to';
                                        console.log('🔍 Debug: Reverse calculation - basis value in Get field');
                                    } else {
                                        // Basis value is in Send field, trigger forward calculation
                                        userInputRef.current = 'from';
                                        console.log('🔍 Debug: Forward calculation - basis value in Send field');
                                    }
                                    
                                    // Debug: Log the exact API parameters that will be used for calculation
                                    console.log('🔍 Debug: Calculation parameters:', {
                                        basisField: basisFieldRef.current,
                                        basisValue: valueToTransfer,
                                        fromToken: currentToToken.symbol, // Swapped tokens
                                        toToken: currentFromToken.symbol, // Swapped tokens
                                        calculationType: basisFieldRef.current === 'to' ? 'REVERSE' : 'FORWARD'
                                    });
                                    
                                    // Update localStorage
                                    localStorage.setItem('selectedFromToken', JSON.stringify(currentToToken));
                                    localStorage.setItem('selectedToToken', JSON.stringify(currentFromToken));
                                    
                                    // Dispatch custom events for immediate update
                                    window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                        detail: { token: currentToToken, type: 'from' } 
                                    }));
                                    window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                        detail: { token: currentFromToken, type: 'to' } 
                                    }));
                                    
                                    console.log('✅ SwapForm: Tokens and values swapped successfully');
                                    console.log('✅ SwapForm: New fromToken:', currentToToken.symbol, 'New fromAmount:', currentToAmount);
                                    console.log('✅ SwapForm: New toToken:', currentFromToken.symbol, 'Transferred value:', currentFromAmount, '(will trigger recalculation)');
                                    
                                    // Use setTimeout to ensure typing flags are reset after handleToAmountChange has been called
                                    setTimeout(() => {
                                        // End rotation now so input effects resume normally
                                        isRotating.current = false;
                                        // Ensure typing flags are cleared
                                        setIsUserTypingToAmount(false);
                                        userFinishedTypingToAmount.current = false;
                                        // Preserve whether this rotation came from defaults
                                        hasUserEnteredCustomValue.current = !rotatedFromDefaults;
                                        isFromAmountDefault.current = rotatedFromDefaults;
                                        console.log('🔄 SwapForm: Final reset of typing flags after rotation (rotatedFromDefaults:', rotatedFromDefaults, ')');
                                    }, 0);
                                } else {
                                    console.log('⚠️ SwapForm: Cannot swap - one or both tokens are missing');
                                }
                            }}
                            style={{
                                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <Image
                                src="/rotate.svg"
                                alt="Rotate"
                                width="30"
                                height="30"
                                style={{
                                    width: '30px !important',
                                    height: '30px !important',
                                    minWidth: '30px',
                                    minHeight: '30px',
                                    maxWidth: '30px',
                                    maxHeight: '30px',
                                    display: 'block',
                                }}
                            />
                        </div>
                        <div className='h-[1px] w-full bg-[#1ABCFF]'></div>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        {t('get')}
                        <div className='w-full flex justify-end gap-[5px]'>
                            {getTop5TokensExcludingBoth().map((token, index) => (
                                <div
                                    key={`to-token-${index}-${token.symbol}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🎯 SwapForm: Small token icon clicked for toToken:', token.symbol);
                                        
                                        // Smart switching logic: if the selected token is already in fromToken, swap them
                                        if (selectedFromToken && selectedFromToken.address === token.address) {
                                            console.log('🔄 SwapForm: Token already in fromToken, swapping tokens');
                                            // Store the current toToken before swapping
                                            const currentToToken = selectedToToken;
                                            
                                            // Swap: selectedToToken becomes fromToken, selected token becomes toToken
                                            setSelectedFromToken(currentToToken);
                                            setSelectedToToken(token);
                                            
                                            // Store swapped tokens in localStorage for persistence
                                            localStorage.setItem('selectedFromToken', JSON.stringify(currentToToken));
                                            localStorage.setItem('selectedToToken', JSON.stringify(token));
                                            
                                            // Dispatch custom events for immediate update
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token: currentToToken, type: 'from' } 
                                            }));
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token: token, type: 'to' } 
                                            }));
                                            
                                            console.log('✅ SwapForm: Swapped tokens - fromToken:', currentToToken?.symbol, 'toToken:', token.symbol);
                                            console.log('🔄 SwapForm: Triggering recalculation after toToken swap');
                                            
                                            // Force a state update to trigger recalculation after swap
                                            setTimeout(() => {
                                                console.log('🔄 SwapForm: Forcing recalculation after toToken swap timeout');
                                                setFromAmount(prev => prev);
                                                // Don't reset userInputRef here - preserve it for token change after user input logic
                                            }, 10);
                                        } else {
                                            // Normal selection - just update the to token
                                            setSelectedToToken(token);
                                            lastChangedTokenRef.current = 'to'; // Track that to token was changed
                                            // Set userInputRef to 'to' to trigger reverse calculation if toAmount has a value
                                            userInputRef.current = 'to';
                                            
                                            // Store in localStorage for persistence
                                            localStorage.setItem('selectedToToken', JSON.stringify(token));
                                            
                                            // Dispatch custom event for immediate update
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token, type: 'to' } 
                                            }));
                                            
                                            console.log('✅ SwapForm: Updated toToken from small icon:', token.symbol);
                                            console.log('🔄 SwapForm: Triggering recalculation after toToken selection');
                                            
                                            // Force a state update to trigger recalculation
                                            setTimeout(() => {
                                                console.log('🔄 SwapForm: Forcing recalculation after toToken selection timeout');
                                                setFromAmount(prev => prev);
                                                // Don't reset userInputRef here - preserve it for token change after user input logic
                                            }, 10);
                                        }
                                        
                                        // Additional safety check: if both tokens are now the same, fix it
                                        if (selectedFromToken && token.address === selectedFromToken.address) {
                                            console.log('🔄 SwapForm: After selection, both tokens are the same, fixing...');
                                            
                                            // Universal fix: find a different token for fromToken
                                            let replacementToken = null;
                                            
                                            // If toToken is TON, set fromToken to USDT
                                            if (token.symbol === 'TON' && defaultUsdt) {
                                                replacementToken = defaultUsdt;
                                            }
                                            // If toToken is USDT, set fromToken to TON
                                            else if (token.symbol === 'USDT' && defaultTon) {
                                                replacementToken = defaultTon;
                                            }
                                            // For any other token, try to find a different token from the cache
                                            else if (allTokens && allTokens.length > 0) {
                                                // Find a different token that's not the same as toToken
                                                const differentToken = allTokens.find(t => 
                                                    t.address !== token.address && 
                                                    t.verification === 'WHITELISTED'
                                                );
                                                if (differentToken) {
                                                    replacementToken = {
                                                        symbol: differentToken.symbol,
                                                        name: differentToken.name,
                                                        image_url: differentToken.image_url,
                                                        address: differentToken.address
                                                    };
                                                }
                                            }
                                            
                                            if (replacementToken) {
                                                console.log(`🔄 SwapForm: Setting fromToken to ${replacementToken.symbol} to avoid duplicate`);
                                                setSelectedFromToken(replacementToken);
                                                localStorage.setItem('selectedFromToken', JSON.stringify(replacementToken));
                                                window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                    detail: { token: replacementToken, type: 'from' } 
                                                }));
                                            }
                                        }
                                    }}
                                    className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF] cursor-pointer'
                                >
                                    <Image
                                        src={token.image_url || ''}
                                        alt={token.symbol || ''}
                                        width="15"
                                        height="15"
                                        style={{
                                            width: '15px !important',
                                            height: '15px !important',
                                            minWidth: '15px',
                                            minHeight: '15px',
                                            maxWidth: '15px',
                                            maxHeight: '15px',
                                            display: 'block',
                                            borderRadius: '50%',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div data-custom-keyboard className='flex flex-row items-center gap-[5px] my-[5px]'>
                        <CustomInput
                            key="to-amount-input"
                            ref={toAmountRef}
                            value={toAmount}
                            onChange={handleToAmountChange}
                            className='w-full text-[#1ABCFF] text-[33px]'
                            type='number'
                            placeholder='0'
                            onFocusChange={handleToAmountFocusChange}
                            shouldBeCompact={shouldBeCompact}
                        />
                        <div 
                            key={`to-token-${selectedToToken?.address || 'default'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🎯 SwapForm: To token selection clicked');
                                // Set navigation flags to maintain compact mode when returning
                                setNavigationFlags();
                                try {
                                    router.push('/tokens-fast?type=to');
                                    console.log('✅ SwapForm: Navigation to tokens page initiated');
                                } catch (error) {
                                    console.error('❌ SwapForm: Navigation failed, using fallback', error);
                                    window.location.href = '/tokens-fast?type=to';
                                }
                            }}
                            className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[#1ABCFF] rounded-[15px] cursor-pointer select-none'
                            style={{ 
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                position: 'relative',
                                zIndex: 10,
                                pointerEvents: 'auto'
                            }}
                        >
                            {defaultTokensLoading ? (
                                <>
                                    <div 
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: 'transparent',
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <div 
                                        style={{
                                            width: '38.23px ',
                                            height: '21px',
                                            backgroundColor: 'transparent',
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Image
                                        src={selectedToToken?.image_url || defaultTon?.image_url}
                                        alt={selectedToToken?.symbol || defaultTon?.symbol}
                                        width="20"
                                        height="20"
                                        priority
                                        style={{
                                            width: '20px !important',
                                            height: '20px !important',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            maxWidth: '20px',
                                            maxHeight: '20px',
                                            display: 'block',
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <span className='text-[#1ABCFF]'>
                                        {selectedToToken?.symbol || defaultTon?.symbol}
                                    </span>
                                </>
                            )}
                            <MdKeyboardArrowRight 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#1ABCFF',
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center'>
                        <div className='w-full' style={{ opacity: 0.66 }}>
                            {isCalculating ? (
                                <span style={{ }}>
                                    ...
                                </span>
                            ) : (
                                toTokenUSDValue
                            )}
                        </div>
                        <div className='flex flex-row gap-[5px]'>
                            <div style={{ 
                                display: (!walletAddress && shouldBeCompact) ? 'block' : 'none',
                                transition: 'display 0.2s ease',
                                zIndex: 1002,
                                position: 'relative',
                                pointerEvents: 'auto'
                            }}>
                                <CustomTonConnectButton />
                            </div>
                            <div style={{ 
                                display: walletAddress ? 'flex' : 'none',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'display 0.2s ease'
                            }}>
                                <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                                <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>
                                    576.00 {defaultTokensLoading ? (
                                        <span style={{ 
                                            display: 'inline-block',
                                            width: '30.04px',
                                            height: '21px',
                                            backgroundColor: 'transparent'
                                        }} />
                                    ) : (
                                        selectedToToken?.symbol || defaultTon?.symbol
                                    )}
                                </span> 
                            </div>
                        </div>
                        <div className='flex flex-row w-full justify-end text-nowrap' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}