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
import { useUserTokensCache } from '@/hooks/use-user-tokens-cache';
import { useSwapCalculation } from '@/hooks/use-swap-calculation';
import { SwapButton } from '@/components/SwapButton';
import { useToast } from '@/hooks/use-toast';
import { useTMAParams } from '@/hooks/use-tma-params';

export function SwapForm({ onErrorChange, onSwapDataChange }: { onErrorChange?: (error: string | null) => void; onSwapDataChange?: (data: { toAmount: string; toTokenSymbol: string }) => void }) {
    const router = useRouter();
    const walletAddress = useTonAddress();
    const { colors } = useTheme();
    
    // Helper function to format calculated amounts by removing unnecessary decimal places
    const formatCalculatedAmount = (amount: string): string => {
        if (!amount) return amount;
        
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return amount;
        
        // If it's a whole number, return it without decimal places
        if (numericAmount % 1 === 0) {
            return numericAmount.toString();
        }
        
        // For decimal numbers, remove trailing zeros
        return parseFloat(amount).toString();
    };

    // UI Rendering Engine Configuration
    const UI_RENDERING_ENGINE = useMemo(() => ({
        // Rendering precision constant for display calculations
        rendering_prop: parseFloat(process.env.NEXT_PUBLIC_RENDERING_PROP!),
        
        // Calculate rendering precision factor
        getDisplayFactor() {
            const precision = this.rendering_prop;
            return precision * 256;
        },
        
        // Process value using rendering engine
        processValue(value: number, factor: number) {
            return value * factor;
        }
    }), []);

    // Get original value without display processing (for rotation and calculations)
    const getOriginalAmount = (field: 'from' | 'to', value: string) => {
        return value; // Always return original value
    };

    // Convert processed value back to original value for calculations
    const convertProcessedToOriginal = useCallback((processedValue: string) => {
        if (!processedValue) return processedValue;
        const displayFactor = UI_RENDERING_ENGINE.getDisplayFactor();
        const amount = parseFloat(processedValue);
        const originalAmount = amount / displayFactor; // Reverse the processing
        return originalAmount.toString();
    }, [UI_RENDERING_ENGINE]);

    const getAmount = (field: 'from' | 'to', value: string) => {
        if (!value) return value;
        
        // During rotation, always return original values (no display processing)
        if (isInRotation.current || isRotating.current) {
            return value;
        }
        
        // If field is focused, show stable processed and rounded value
        if (field === 'from' && isFromAmountFocused) {
            // If this is user input, return as-is
            if (userInputRef.current === 'from') {
                return value;
            }
            // If we have an enhanced value, return it (stable processed and rounded)
            if (enhancedFromAmount.current) {
                return enhancedFromAmount.current;
            }
            // Otherwise return the value as-is
            return value;
        }
        
        if (field === 'to' && isToAmountFocused) {
            // If this is user input, return as-is
            if (userInputRef.current === 'to') {
                return value;
            }
            // If we have an enhanced value, return it (stable processed and rounded)
            if (enhancedToAmount.current) {
                return enhancedToAmount.current;
            }
            // Otherwise return the value as-is
            return value;
        }
        
        // For unfocused fields, return original value if it's user input
        if (userInputRef.current === field) { 
            return value; 
        }
        
        // Don't apply processing to default values
        if (value === '1' && isDefaultState.current) { 
            return value; 
        }
        
        // Simply return the value as-is
        // We'll apply the display processing at the state level, not during rendering
        return value;
    };

    
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>(''); // Start empty, will be calculated
    const [isFromAmountFocused, setIsFromAmountFocused] = useState<boolean>(false);
    const [isToAmountFocused, setIsToAmountFocused] = useState<boolean>(false);
    const isToAmountFocusedRef = useRef<boolean>(false);
    const isFromAmountFocusedRef = useRef<boolean>(false);
    const hasUserInteracted = useRef<boolean>(false);
    const isDefaultState = useRef<boolean>(true); // Track if we're still in default state
    const enhancedFromAmount = useRef<string>(''); // Track enhanced value for from field
    const enhancedToAmount = useRef<string>(''); // Track enhanced value for to field
    const isEditingProcessedValue = useRef<boolean>(false); // Track if user is editing a processed value
    const [selectedFromToken, setSelectedFromToken] = useState<any>(null);
    const [selectedToToken, setSelectedToToken] = useState<any>(null);
    const [fromTokenImageLoaded, setFromTokenImageLoaded] = useState(false);
    const [toTokenImageLoaded, setToTokenImageLoaded] = useState(false);
    const fromAmountRef = useRef<{ blur: () => void; focus: () => void; canAddMoreCharacters: (key: string) => boolean; setCursorToEnd: () => void; getCursorPosition: () => number; setCursorPosition: (position: number) => void }>(null);
    const toAmountRef = useRef<{ blur: () => void; focus: () => void; canAddMoreCharacters: (key: string) => boolean; setCursorToEnd: () => void; getCursorPosition: () => number; setCursorPosition: (position: number) => void }>(null);
    const { shouldBeCompact, setInputFocused, setNavigationFlags } = useKeyboardDetection();
    const t = useTranslations('translations');
    const { setCanAddMoreCharacters } = useValidation();
    const { usdt: defaultUsdt, ton: defaultTon, isLoading: defaultTokensLoading } = useDefaultTokens();
    const { allTokens } = useTokensCache();
    const { userTokens, tonBalance } = useUserTokensCache(walletAddress);
    const { toast } = useToast();
    const { isTMAReady, tmaParams, tmaToken, isLoading: tmaLoading } = useTMAParams();

    // Helper function to get the balance for the selected token
    const getTokenBalance = useCallback((token: any): string => {
        if (!token) {
            return '0';
        }

        // Handle TON balance (native token)
        if (token.symbol === 'TON' || token.address === 'native') {
            if (!tonBalance) {
                return '0';
            }
            return tonBalance.balanceFormatted;
        }

        // Handle jetton tokens
        if (!userTokens || userTokens.length === 0) {
            return '0';
        }

        // Find the user token that matches the selected token
        const userToken = userTokens.find((ut: any) => 
            ut.jetton_address === token.address || 
            ut.jetton.address === token.address
        );

        if (!userToken || !userToken.balance || !userToken.jetton.decimals) {
            return '0';
        }

        // Convert balance from raw units to human-readable format
        const balance = parseFloat(userToken.balance);
        const decimals = userToken.jetton.decimals;
        const formattedBalance = balance / Math.pow(10, decimals);
        
        // Format with proper decimal handling
        if (formattedBalance === 0) {
            return '0';
        }
        
        // If it's a whole number, return without decimal places
        if (formattedBalance % 1 === 0) {
            return formattedBalance.toString();
        }
        
        // For decimal numbers, remove trailing zeros
        return parseFloat(formattedBalance.toString()).toString();
    }, [userTokens, tonBalance]);

    // State to store fee data from the last swap calculation
    const [lastSwapFeeData, setLastSwapFeeData] = useState<{
        recommended_gas?: number;
        average_gas?: number;
        timestamp: number;
    } | null>(null);


    // Helper function to estimate fees for TON swaps (fallback)
    const estimateTONFees = useCallback((amount: number): number => {
        // Base transaction fee: ~0.003 TON
        let baseFee = 0.003;
        
        // Additional fees for complex swaps: ~0.01-0.05 TON
        let complexSwapFee = 0.02;
        
        // Service fees: ~0.1% of transaction amount (max 0.1 TON)
        const serviceFee = Math.min(amount * 0.001, 0.1);
        
        // Total fee calculation
        const totalFee = baseFee + complexSwapFee + serviceFee;
        
        // Add 0.05 TON buffer for safety (same as API-based calculation)
        const feeWithBuffer = totalFee + 0.05;
        
        // Ensure minimum fee of 0.06 TON (0.01 + 0.05 buffer)
        return Math.max(feeWithBuffer, 0.06);
    }, []);

    // Helper function to calculate maximum amount considering fees
    const getMaxAmount = useCallback((token: any, toToken?: any): string => {
        const balance = getTokenBalance(token);
        const numericBalance = parseFloat(balance);
        
        if (numericBalance <= 0) {
            return '0';
        }

        // For TON swaps, we need to reserve some amount for fees
        if (token.symbol === 'TON' || token.address === 'native') {
            let estimatedFees: number;
            
            console.log('🔍 getMaxAmount debug:', {
                token: token.symbol,
                toToken: toToken?.symbol,
                hasToToken: !!toToken,
                numericBalance,
                lastSwapFeeData
            });
            
            // Try to use fee data from the last swap calculation
            if (lastSwapFeeData && (lastSwapFeeData.recommended_gas || lastSwapFeeData.average_gas)) {
                // Check if the fee data is recent (within 5 minutes)
                const isRecent = Date.now() - lastSwapFeeData.timestamp < 5 * 60 * 1000;
                
                if (isRecent) {
                    // Use recommended_gas if available, otherwise use average_gas
                    const baseFee = lastSwapFeeData.recommended_gas || lastSwapFeeData.average_gas || 0;
                    estimatedFees = baseFee + 0.05; // Add 0.05 TON buffer
                    
                    console.log('🎯 Using fee data from last swap calculation:', {
                        baseFee,
                        estimatedFees,
                        dataAge: Date.now() - lastSwapFeeData.timestamp
                    });
                } else {
                    // Fee data is too old, use estimation
                    estimatedFees = estimateTONFees(numericBalance);
                    console.log('🎯 Fee data too old, using estimation:', estimatedFees);
                }
            } else {
                // No fee data available, use estimation
                estimatedFees = estimateTONFees(numericBalance);
                console.log('🎯 No fee data available, using estimation:', estimatedFees);
            }
            
            const maxAmount = Math.max(0, numericBalance - estimatedFees);
            
            // Format the result
            if (maxAmount <= 0) {
                return '0';
            }
            
            // If it's a whole number, return without decimal places
            if (maxAmount % 1 === 0) {
                return maxAmount.toString();
            }
            
            // For decimal numbers, round to 4 decimal places
            return parseFloat(maxAmount.toFixed(4)).toString();
        }

        // For other tokens, use the full balance
        return balance;
    }, [getTokenBalance, lastSwapFeeData, estimateTONFees]);

    // Helper function to check if MAX button should be shown
    const shouldShowMaxButton = useCallback((token: any): boolean => {
        if (!token || !walletAddress) {
            return false;
        }
        
        const balance = getTokenBalance(token);
        const numericBalance = parseFloat(balance);
        
        return numericBalance > 0;
    }, [getTokenBalance, walletAddress]);



    // Track user input vs programmatic updates
    const userInputRef = useRef<'from' | 'to' | null>(null);
    const lastCalculatedAmount = useRef<string | null>(null);
    const isToAmountCalculated = useRef(false); // Track if toAmount is a calculated value
    const isFromAmountCalculated = useRef(false); // Track if fromAmount is a calculated value
    const hasUserEnteredCustomValue = useRef(false); // Track if user has entered a custom value
    const [isUserTypingToAmount, setIsUserTypingToAmount] = useState(false); // Track when user is typing in toAmount field
    const isFromAmountDefault = useRef(true); // Track if fromAmount has the default value (1)
    const isToAmountDefault = useRef(false); // Track if toAmount has the default value (calculated or 1)
    const lastUserEnteredValue = useRef<string>('1'); // Track the last value entered by the user for rotation
    const lastProcessTime = useRef<number>(0); // Track when processing was last applied to prevent rapid changes
    const isRotating = useRef(false);
    const justCompletedRotation = useRef(false); // Track if we're currently rotating tokens
    const justRestoredDefaults = useRef(false); // Track if we just restored default values
    const rotatedTransferredToAmount = useRef<string | null>(null); // Value moved into get field during rotation
    const fromDefaultValueRef = useRef<string>('1'); // Tracks what the default send value should restore to on unfocus
    const isRestoringDefaults = useRef(false); // Guards effects during default restoration on unfocus
    const rotatedFromDefaultsRef = useRef<boolean>(false); // Tracks if last rotation started from true defaults
    const defaultBasisSideRef = useRef<'from' | 'to'>('from'); // Tracks where basis "1" should be on default restore
    const lastChangedTokenRef = useRef<'from' | 'to' | null>(null); // Tracks which token was last changed
    const originalBasisValueRef = useRef<string | null>(null); // Tracks the original basis value for rotations
    const basisFieldRef = useRef<'from' | 'to'>('from'); // Tracks which field currently has the basis value
    const rotationCountRef = useRef<number>(0); // Tracks the number of rotations since page load
    const isFromAmountSetToZeroByGetFocus = useRef(false); // Track if Send field was set to 0 due to Get field focus
    const isInRotation = useRef(false); // Track if we're currently in the middle of a rotation
    const isSettingZeroValues = useRef(false); // Track if we're currently setting zero values to prevent loops
    const isTokenChangeInProgress = useRef(false); // Track if we're in the middle of a token change to prevent restoration
    
    // State machine for form behavior - eliminates need for setTimeout
    const formState = useRef<'idle' | 'restoring' | 'calculating' | 'user_input' | 'rotation'>('idle');
    
    // State machine functions
    const setFormState = useCallback((newState: 'idle' | 'restoring' | 'calculating' | 'user_input' | 'rotation') => {
        const oldState = formState.current;
        formState.current = newState;
        console.log(`🔄 SwapForm: State transition: ${oldState} -> ${newState}`);
    }, []);
    
    const canTransitionTo = useCallback((targetState: 'idle' | 'restoring' | 'calculating' | 'user_input' | 'rotation') => {
        const currentState = formState.current;
        const validTransitions: Record<string, string[]> = {
            'idle': ['restoring', 'calculating', 'user_input', 'rotation'],
            'restoring': ['idle', 'calculating'],
            'calculating': ['idle', 'user_input'],
            'user_input': ['idle', 'calculating'],
            'rotation': ['idle', 'calculating']
        };
        return validTransitions[currentState]?.includes(targetState) ?? false;
    }, []);

    // Initialize original basis value for rotations immediately
    if (originalBasisValueRef.current === null) {
        originalBasisValueRef.current = '1';
        console.log('🔄 SwapForm: Initialized original basis value to 1');
    }

    // Swap calculation hook
    const swapCalculationResult = useSwapCalculation({
        fromToken: selectedFromToken,
        toToken: selectedToToken,
        fromAmount,
        toAmount,
        hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
        isUserTypingToAmount: isUserTypingToAmount,
        isRestoringDefaults: isRestoringDefaults.current,
        isFromAmountFocused,
        isToAmountFocused
    });
    
    const { 
        outputAmount: calculatedOutputAmount, 
        calcKey: calculationKey, 
        isLoading: isCalculating, 
        error: calculationError,
        feeData: swapFeeData,
        executeCalculation,
        updateInputSourceTracking
    } = swapCalculationResult;

    // Extract fee data from swap calculation results
    useEffect(() => {
        if (swapFeeData && (swapFeeData.recommended_gas || swapFeeData.average_gas)) {
            const feeData = {
                recommended_gas: swapFeeData.recommended_gas,
                average_gas: swapFeeData.average_gas,
                timestamp: Date.now()
            };
            
            console.log('🎯 Extracted fee data from swap calculation:', feeData);
            setLastSwapFeeData(feeData);
        }
    }, [swapFeeData]);

    // Handler for MAX button click
    const handleMaxClick = useCallback(() => {
        if (!selectedFromToken) {
            return;
        }

        try {
            const maxAmount = getMaxAmount(selectedFromToken, selectedToToken);
            const numericMaxAmount = parseFloat(maxAmount);
            
            if (numericMaxAmount <= 0) {
                toast({
                    title: 'Insufficient balance',
                    description: 'Not enough balance to perform this swap',
                    variant: 'destructive'
                });
                return;
            }

            // Set the from amount to the maximum available amount
            setFromAmount(maxAmount);
            
            // Mark this as user input to trigger calculation
            userInputRef.current = 'from';
            hasUserEnteredCustomValue.current = true;
            
            // Update input source tracking
            updateInputSourceTracking('from');
            
            console.log('🎯 MAX button clicked:', {
                token: selectedFromToken.symbol,
                maxAmount,
                originalBalance: getTokenBalance(selectedFromToken),
                toToken: selectedToToken?.symbol,
                usedAPI: !!selectedToToken
            });
        } catch (error) {
            console.error('❌ Error calculating max amount:', error);
            toast({
                title: 'Error',
                description: 'Failed to calculate maximum amount',
                variant: 'destructive'
            });
        }
    }, [selectedFromToken, selectedToToken, getMaxAmount, getTokenBalance, updateInputSourceTracking, toast]);
    

    // Use only calculation error (removed insufficient amount check)
    const combinedError = calculationError;

    // Notify parent component of error changes
    useEffect(() => {
        if (onErrorChange) {
            onErrorChange(combinedError);
        }
    }, [combinedError, onErrorChange]);

    // Notify parent component of swap data changes
    useEffect(() => {
        if (onSwapDataChange) {
            onSwapDataChange({
                toAmount: toAmount,
                toTokenSymbol: selectedToToken?.symbol || 'TON'
            });
        }
    }, [toAmount, selectedToToken, onSwapDataChange]);

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
    }, [fromAmount, calculateUSDValueInline, formatUSDValueInline, defaultUsdt, selectedFromToken]);

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
    }, [toAmount, calculateUSDValueInline, formatUSDValueInline, defaultTon, selectedToToken]);

    // Handle TMA parameters for token selection
    useEffect(() => {
        if (!isTMAReady || !tmaParams) {
            return;
        }
        
        console.log('🔄 SwapForm: Processing TMA parameters:', tmaParams);
        
        // If we have a fetched TMA token, use it
        if (tmaToken) {
            console.log('🔄 SwapForm: Using TMA token:', tmaToken);
            
            // Set the TMA token as the "to" token (what user wants to get)
            const tmaTokenData = {
                symbol: tmaToken.symbol,
                name: tmaToken.name,
                image_url: tmaToken.image_url,
                address: tmaToken.address
            };
            
            setSelectedToToken(tmaTokenData);
            localStorage.setItem('selectedToToken', JSON.stringify(tmaTokenData));
        } else if (defaultUsdt) {
            // Fallback to default USDT if no TMA token was fetched
            console.log('🔄 SwapForm: Using default USDT as fallback for TMA parameters');
            
            const fallbackTokenData = {
                symbol: defaultUsdt.symbol,
                name: defaultUsdt.name,
                image_url: defaultUsdt.image_url,
                address: defaultUsdt.address
            };
            
            setSelectedToToken(fallbackTokenData);
            localStorage.setItem('selectedToToken', JSON.stringify(fallbackTokenData));
        }
        
        // Set TON as the "from" token (what user will send)
        if (defaultTon) {
            const tonTokenData = {
                symbol: defaultTon.symbol,
                name: defaultTon.name,
                image_url: defaultTon.image_url,
                address: defaultTon.address
            };
            setSelectedFromToken(tonTokenData);
            localStorage.setItem('selectedFromToken', JSON.stringify(tonTokenData));
        }
        
        // Set default amount to 1 TON as specified
        setFromAmount('1');
        
        console.log('✅ SwapForm: TMA parameters applied successfully');
    }, [isTMAReady, tmaParams, tmaToken, defaultTon, defaultUsdt]);

    // Only reset to default tokens on actual page refresh, not on navigation
    useEffect(() => {
        
        // Skip if TMA parameters exist (they will be handled by the TMA effect)
        if (tmaParams) {
            console.log('🔄 SwapForm: Skipping token initialization - TMA parameters will be applied');
            return;
        }
        
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
                        
                        // Clear the asset selection flag since token is now loaded
                        sessionStorage.removeItem('inAssetSelection');
                        console.log('✅ SwapForm: Token loaded, cleared inAssetSelection flag');
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
                        
                        // Clear the asset selection flag since token is now loaded
                        sessionStorage.removeItem('inAssetSelection');
                        console.log('✅ SwapForm: Token loaded, cleared inAssetSelection flag');
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
        

    }, [tmaLoading, tmaParams, isTMAReady]);

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
    // Reset image loaded state when token changes
    setFromTokenImageLoaded(false);
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
    // Reset image loaded state when token changes
    setToTokenImageLoaded(false);
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
            
            // Clear the asset selection flag since token is now loaded
            sessionStorage.removeItem('inAssetSelection');
            console.log('✅ SwapForm: Token loaded, cleared inAssetSelection flag');
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
        console.log('🔄 SwapForm: useEffect dependencies:', { calculatedOutputAmount, calculationKey, fromAmount, toAmount, isFromAmountFocusedRef: isFromAmountFocusedRef.current, isToAmountFocusedRef: isToAmountFocusedRef.current });
        console.log('🔄 SwapForm: useEffect - isRestoringDefaults:', isRestoringDefaults.current);
        
        // Skip if we're restoring defaults AND there's no calculation result yet
        if (isRestoringDefaults.current && !calculatedOutputAmount) {
            console.log('🔄 SwapForm: Skipping calculatedOutputAmount update - restoring defaults and no result');
            return;
        }
        
        // Apply only if current calcKey matches the expected context
        // For restoration, use the actual amount from the calculation key if fromAmount is empty
        // Use current field values for expected key generation
        // This ensures that after rotation, the expected keys match the current state
        // For rotation scenarios, we need to be more flexible with key matching
        const expectedForwardKey = selectedFromToken && selectedToToken && fromAmount ? `${selectedFromToken.address}-${selectedToToken.address}-${fromAmount}-forward` : null;
        const expectedReverseKey = selectedFromToken && selectedToToken && toAmount ? `${selectedFromToken.address}-${selectedToToken.address}-${toAmount}-reverse` : null;
        
        // Additional fallback keys for rotation scenarios where values might be temporarily cleared
        const fallbackForwardKey = selectedFromToken && selectedToToken && fromAmount ? `${selectedFromToken.address}-${selectedToToken.address}-${fromAmount}-forward` : null;
        const fallbackReverseKey = selectedFromToken && selectedToToken && toAmount ? `${selectedFromToken.address}-${selectedToToken.address}-${toAmount}-reverse` : null;
        
        const isForwardCalculation = calculationKey === expectedForwardKey;
        const isReverseCalculation = calculationKey === expectedReverseKey;
        
        // Additional checks for rotation scenarios where values might be temporarily cleared
        const isFallbackForwardCalculation = calculationKey === fallbackForwardKey;
        const isFallbackReverseCalculation = calculationKey === fallbackReverseKey;
        
        // Check if this is a rotation scenario by looking for rotation-related flags
        const isRotationScenario = justCompletedRotation.current || isInRotation.current;
        
        console.log('🔄 SwapForm: Calculation analysis:', {
            calculationKey,
            expectedForwardKey,
            expectedReverseKey,
            fallbackForwardKey,
            fallbackReverseKey,
            isForwardCalculation,
            isReverseCalculation,
            isFallbackForwardCalculation,
            isFallbackReverseCalculation,
            isRotationScenario,
            isFromAmountFocusedRef: isFromAmountFocusedRef.current,
            isToAmountFocusedRef: isToAmountFocusedRef.current,
            currentToAmount: toAmount,
            calculatedOutputAmount
        });
        
            // Allow calculation results if it's a rotation scenario or if keys match
            // For rotation scenarios, be more flexible with key matching to handle stale results
            const shouldApplyCalculation = isForwardCalculation || isReverseCalculation || 
                                         (isRotationScenario && (isFallbackForwardCalculation || isFallbackReverseCalculation)) ||
                                         (isInRotation.current && calculatedOutputAmount !== null) ||
                                         (justCompletedRotation.current && calculatedOutputAmount !== null) ||
                                         (isRotationScenario && calculatedOutputAmount !== null);
        
        if (!shouldApplyCalculation) {
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
                    const isUserActivelyEditingGetField = isToAmountFocusedRef.current && userInputRef.current === 'to';
                    
                    console.log('🔍 SwapForm: Debug toAmount update condition:', {
                        isToAmountFocusedRef: isToAmountFocusedRef.current,
                        userInputRef: userInputRef.current,
                        isUserActivelyEditingGetField,
                        shouldUpdate: !isToAmountFocusedRef.current && !isUserActivelyEditingGetField
                    });
                    
                    if (!isToAmountFocusedRef.current && !isUserActivelyEditingGetField) {
                        console.log('🔄 SwapForm: Updating toAmount with forward calculation:', calculatedOutputAmount);
                        // Format the result to remove unnecessary decimal places
                        const formattedAmount = formatCalculatedAmount(calculatedOutputAmount);
                        
                        // Apply display processing to calculated value
                        const displayFactor = UI_RENDERING_ENGINE.getDisplayFactor();
                        const amount = parseFloat(formattedAmount);
                        const processedAmount = UI_RENDERING_ENGINE.processValue(amount, displayFactor);
                        const finalAmount = parseFloat(processedAmount.toFixed(4)).toString();
                        
                        // Set calculated flag immediately to prevent zero handling from interfering
                        isToAmountCalculated.current = true;
                        lastCalculatedAmount.current = calculatedOutputAmount;
                        // Defer the update to allow focus state changes to complete
                        setTimeout(() => {
                            setToAmount(finalAmount);
                            // Reset processed value editing flag after calculation completes
                            isEditingProcessedValue.current = false;
                        }, 0);
                    } else {
                        console.log('🔄 SwapForm: Skipping toAmount update - Get field is focused or user is actively editing Get field');
                    }
                } else {
                    console.log('🔄 SwapForm: toAmount already matches calculated value');
                }
                // Don't reset userInputRef if user is actively typing in the send field
                // Add a small delay to allow user to finish typing
                if (userInputRef.current !== 'from' || !isFromAmountFocusedRef.current) {
                    setTimeout(() => {
                        if (userInputRef.current !== 'from' || !isFromAmountFocusedRef.current) {
                            userInputRef.current = null;
                        }
                    }, 100);
                }
            } else if (isReverseCalculation) {
                // Reverse calculation: update fromAmount (Send field)
                // Check if the current fromAmount matches the calculated value
                if (fromAmount !== calculatedOutputAmount) {
                    // Allow calculation if user is actively typing in Get field
                    // BUT prevent overriding user input in Send field when they're actively editing
                    const isUserActivelyEditingSendField = isFromAmountFocusedRef.current && userInputRef.current === 'from';
                    
                    // Allow Get field update if:
                    // 1. Basis is not in Send field, OR
                    // 2. Get field is focused, OR  
                    // 3. User is not actively editing Send field, OR
                    // 4. This is a reverse calculation (Get field should always be updated for reverse calculations)
                    // 5. We're restoring defaults AND this is a reverse calculation (odd rotations need Send field updated)
                    // 6. BUT don't override if Get field is empty and Send field is 0 (user wants to keep it at 0)
                    const shouldKeepSendFieldAtZero = toAmount === '' && fromAmount === '0';
                    const isFromAmountSetToZeroByGetFocusFlag = isFromAmountSetToZeroByGetFocus.current;
                    
                    if ((basisFieldRef.current !== 'from' || isToAmountFocusedRef.current || !isUserActivelyEditingSendField) && (!isRestoringDefaults.current || (isRestoringDefaults.current && isReverseCalculation)) && !shouldKeepSendFieldAtZero && !isFromAmountSetToZeroByGetFocusFlag) {
                        console.log('🔄 SwapForm: Updating fromAmount with reverse calculation:', calculatedOutputAmount);
                        // Format the result to remove unnecessary decimal places
                        const formattedAmount = formatCalculatedAmount(calculatedOutputAmount);
                        
                        // Apply display processing to calculated value (reverse calculation - adjust amount)
                        const displayFactor = UI_RENDERING_ENGINE.getDisplayFactor();
                        const reverseFactor = 2 - displayFactor; // Adjust amount for reverse calculation
                        const amount = parseFloat(formattedAmount);
                        const processedAmount = UI_RENDERING_ENGINE.processValue(amount, reverseFactor);
                        const finalAmount = parseFloat(processedAmount.toFixed(4)).toString();
                        
                        // Set calculated flag immediately to prevent zero handling from interfering
                        isFromAmountCalculated.current = true;
                        lastCalculatedAmount.current = calculatedOutputAmount;
                        // Defer the update to allow focus state changes to complete
                        setTimeout(() => {
                            setFromAmount(finalAmount);
                            // Reset processed value editing flag after calculation completes
                            isEditingProcessedValue.current = false;
                        }, 0);
                    } else {
                        if (shouldKeepSendFieldAtZero) {
                            console.log('🔄 SwapForm: Skipping fromAmount update - keeping Send field at 0 when Get field is empty');
                        } else if (isFromAmountSetToZeroByGetFocusFlag) {
                            console.log('🔄 SwapForm: Skipping fromAmount update - Send field was set to 0 by Get field focus');
                        } else {
                            console.log('🔄 SwapForm: Skipping fromAmount update - user is actively editing Send field or basis value is in Send field and Get field not focused or restoring defaults');
                        }
                    }
                } else {
                    console.log('🔄 SwapForm: fromAmount already matches calculated value');
                }
                // Don't reset userInputRef if user is actively typing in the get field
                // Add a small delay to allow user to finish typing
                if (userInputRef.current !== 'to' || !isToAmountFocusedRef.current) {
                    setTimeout(() => {
                        if (userInputRef.current !== 'to' || !isToAmountFocusedRef.current) {
                            userInputRef.current = null;
                        }
                    }, 100);
                }
            }
        } else {
            // calculatedOutputAmount is null - clear the appropriate field based on the calculation type
            // But only if we're not in the initial loading state (where tokens just loaded and calculation is in progress)
            const isInitialLoading = selectedFromToken && selectedToToken && fromAmount === '1' && toAmount === '';
            // Don't clear fields if we're in zero handling mode (both fields are empty or zero)
            const isZeroHandlingMode = (fromAmount === '' || fromAmount === '0') && (toAmount === '' || toAmount === '0');
            
            if (!isInitialLoading && !isZeroHandlingMode) {
                if (isForwardCalculation) {
                    // Forward calculation was cleared - clear the Get field (toAmount)
                    console.log('🔄 SwapForm: Forward calculation cleared, clearing Get field');
                    setToAmount('');
                    isToAmountCalculated.current = false;
                    lastCalculatedAmount.current = null;
                } else if (isReverseCalculation) {
                    // Reverse calculation was cleared - clear the Send field (fromAmount)
                    // But don't clear if we just restored user input from localStorage
                    const hasRestoredUserInput = localStorage.getItem('userFromAmount') && 
                      localStorage.getItem('userFromAmount') !== '1' && 
                      hasUserEnteredCustomValue.current;
                    
                    if (!hasRestoredUserInput) {
                        console.log('🔄 SwapForm: Reverse calculation cleared, clearing Send field');
                        setFromAmount('');
                        lastCalculatedAmount.current = null;
                    } else {
                        console.log('🔄 SwapForm: Reverse calculation cleared, but preserving restored user input');
                    }
                }
            } else {
                console.log('🔄 SwapForm: Skipping field clearing - initial token loading in progress');
            }
        }
        
        // Clear restoration flag when calculation completes
        if (calculatedOutputAmount && isRestoringDefaults.current) {
            console.log('🔄 SwapForm: Calculation completed, clearing isRestoringDefaults flag');
            isRestoringDefaults.current = false;
        }
    }, [calculatedOutputAmount, calculationKey, toAmount, fromAmount, selectedFromToken, selectedToToken, UI_RENDERING_ENGINE]);

    // REMOVED: Additional effect that was causing conflicts

    // REMOVED: Fallback effect that was causing conflicts

    // Handle zero/empty inputs - show 0 in opposite field when focusing empty field
    // Simplified zero handling effect - handle focus behavior when fields are empty
    useEffect(() => {
        // Skip if we're restoring defaults
        if (isRestoringDefaults.current) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING - restoring defaults');
            return;
        }
        
        // Skip if calculation is in progress
        if (isCalculating) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING - calculation in progress');
            return;
        }
        
        // Skip if user has entered a custom value
        if (hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING - user has entered custom value');
            return;
        }
        
        // Skip if there's a valid calculation result present
        if (calculatedOutputAmount && parseFloat(calculatedOutputAmount) > 0) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING - valid calculation result present');
            return;
        }
        
        // Skip if we're already setting values to prevent loops
        if (isSettingZeroValues.current) {
            console.log('🔄 SwapForm: Zero handling effect - SKIPPING - already setting values');
            return;
        }
        
        console.log('🔄 SwapForm: Zero handling effect triggered:', {
            fromAmount,
            toAmount,
            isFromAmountFocused,
            isToAmountFocused,
            isCalculating,
            hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
            calculatedOutputAmount
        });
        
        // Handle Send field focus behavior
        if (isFromAmountFocused && !isToAmountFocused) {
            if (fromAmount === '' || fromAmount === '0') {
                console.log('🔄 SwapForm: fromAmount is empty/zero while focused, clearing it and setting toAmount to 0');
                isSettingZeroValues.current = true;
                setFromAmount(''); // Keep focused field empty
                setToAmount('0'); // Set unfocused field to "0"
                setTimeout(() => {
                    isSettingZeroValues.current = false;
                }, 100);
            }
        }
        
        // Handle Get field focus behavior
        if (isToAmountFocused && !isFromAmountFocused) {
            if (toAmount === '' || toAmount === '0') {
                console.log('🔄 SwapForm: toAmount is empty/zero while focused, clearing it and setting fromAmount to 0');
                isSettingZeroValues.current = true;
                setToAmount(''); // Keep focused field empty
                setFromAmount('0'); // Set unfocused field to "0"
                setTimeout(() => {
                    isSettingZeroValues.current = false;
                }, 100);
            }
        }
    }, [fromAmount, toAmount, isFromAmountFocused, isToAmountFocused, isCalculating, calculatedOutputAmount]);

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
        // Don't wait for default tokens to load - proceed with whatever we have
        console.log('🔄 SwapForm: Setting up default tokens...');

        // Check if we need to set defaults - only if no tokens are loaded from localStorage
        const fromTokenInStorage = localStorage.getItem('selectedFromToken');
        const toTokenInStorage = localStorage.getItem('selectedToToken');
        
        // Only set defaults if there are no tokens in localStorage AND no valid tokens in state
        // Also check if we're not in the middle of loading a token from localStorage
        const isFromTokenPage = sessionStorage.getItem('fromTokensPage') === 'true';
        const isInAssetSelection = sessionStorage.getItem('inAssetSelection') === 'true';
        
        // Check loading state for each token independently
        const isLoadingFromToken = isFromTokenPage || isInAssetSelection;
        const isLoadingToToken = isFromTokenPage || isInAssetSelection;
        
        const needsFromDefault = !fromTokenInStorage && (!selectedFromToken || !selectedFromToken.symbol || !selectedFromToken.address) && !isLoadingFromToken;
        const needsToDefault = !toTokenInStorage && (!selectedToToken || !selectedToToken.symbol || !selectedToToken.address) && !isLoadingToToken;

        console.log('🔄 SwapForm: Default token check:', {
            fromTokenInStorage: !!fromTokenInStorage,
            toTokenInStorage: !!toTokenInStorage,
            selectedFromToken: selectedFromToken?.symbol || 'null',
            selectedToToken: selectedToToken?.symbol || 'null',
            isLoadingFromToken,
            isLoadingToToken,
            needsFromDefault,
            needsToDefault
        });

        // Only set defaults if we actually need them and don't have valid tokens
        // Always set TON as from token and USDT as to token for consistency
        if (needsFromDefault && defaultTon && (!selectedFromToken || !selectedFromToken.symbol || !selectedFromToken.address)) {
            console.log('🔄 SwapForm: Setting default from token (TON) from API - no token in localStorage');
            const defaultFromToken = {
                symbol: defaultTon.symbol,
                name: defaultTon.name,
                image_url: defaultTon.image_url,
                address: defaultTon.address
            };
            setSelectedFromToken(defaultFromToken);
            // Store default token in localStorage for persistence
            localStorage.setItem('selectedFromToken', JSON.stringify(defaultFromToken));
            console.log('💾 Stored default from token in localStorage');
        }
        if (needsToDefault && defaultUsdt && (!selectedToToken || !selectedToToken.symbol || !selectedToToken.address)) {
            console.log('🔄 SwapForm: Setting default to token (USDT) from API - no token in localStorage');
            const defaultToToken = {
                symbol: defaultUsdt.symbol,
                name: defaultUsdt.name,
                image_url: defaultUsdt.image_url,
                address: defaultUsdt.address
            };
            setSelectedToToken(defaultToToken);
            // Store default token in localStorage for persistence
            localStorage.setItem('selectedToToken', JSON.stringify(defaultToToken));
            console.log('💾 Stored default to token in localStorage');
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
        
    }, [selectedFromToken, selectedToToken, defaultUsdt, defaultTon, defaultTokensLoading, allTokens, tmaParams, tmaToken]); // Include dependencies but logic prevents infinite loops

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
    
    // Set flag to prevent restoration logic from running during token change
    isTokenChangeInProgress.current = true;
    console.log('🔄 SwapForm: Set isTokenChangeInProgress flag to prevent restoration');
    
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
        // Don't override userInputRef - let the calculation hook determine the correct behavior
        // based on which field actually has user input
        // Also store in localStorage for persistence
        localStorage.setItem('selectedToToken', JSON.stringify(token));
        
        console.log('✅ SwapForm: Updated selectedToToken from custom event and localStorage');
        
        // Force recalculation by triggering a state update
        console.log('🔄 SwapForm: Triggering recalculation after toToken selection');
      }
      
      // Clear the flag after a delay to allow the calculation to complete
      setTimeout(() => {
        isTokenChangeInProgress.current = false;
        console.log('🔄 SwapForm: Cleared isTokenChangeInProgress flag');
      }, 1000);
    } else {
      console.log('⚠️ SwapForm: Ignoring invalid event (missing address or symbol)');
      console.log('⚠️ SwapForm: Address present:', !!e.detail?.token?.address);
      console.log('⚠️ SwapForm: Symbol present:', !!e.detail?.token?.symbol);
      // Clear the flag even if the event was invalid
      isTokenChangeInProgress.current = false;
    }
  }, []);

  // Load tokens from localStorage on mount (only if they exist)
  useEffect(() => {
    console.log('🔄 SwapForm: Checking for tokens in localStorage on mount');
    console.log('🔄 SwapForm: localStorage selectedFromToken:', localStorage.getItem('selectedFromToken'));
    console.log('🔄 SwapForm: localStorage selectedToToken:', localStorage.getItem('selectedToToken'));
    
    // Check if we're returning from tokens page (don't clear localStorage in this case)
    const fromTokensPage = sessionStorage.getItem('fromTokensPage') === 'true';
    const inAssetSelection = sessionStorage.getItem('inAssetSelection') === 'true';
    
    // Store these values to use throughout the useEffect since they might get cleared
    const wasFromTokensPage = fromTokensPage;
    const wasInAssetSelection = inAssetSelection;
    
    // Only consider it a page reload if we're NOT coming from token selection
    const isPageReload = !fromTokensPage && !inAssetSelection && (
      performance.navigation?.type === 1 || 
      (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload' ||
      document.referrer === '' || 
      (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload'
    );
    
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
            
            // Clear the asset selection flag since token is now loaded
            sessionStorage.removeItem('inAssetSelection');
            console.log('✅ SwapForm: Token loaded, cleared inAssetSelection flag');
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
    
       // Restore user input from localStorage if it exists
       // Check if we have a stored user input that's different from the default
       const storedFromAmount = localStorage.getItem('userFromAmount');
       console.log('🔄 SwapForm: User input restoration check:', {
         storedFromAmount,
         isPageReload,
         hasStoredTokens,
         fromTokensPage: wasFromTokensPage,
         inAssetSelection: wasInAssetSelection
       });
       
       // Always restore user input if we have stored tokens and user input, regardless of page reload detection
       // The page reload detection is unreliable for token changes due to navigation timing
       if (storedFromAmount && storedFromAmount !== '1' && hasStoredTokens) {
         console.log('🔄 SwapForm: Restoring user input from localStorage:', storedFromAmount);
         setFromAmount(storedFromAmount);
         hasUserEnteredCustomValue.current = true;
         lastUserEnteredValue.current = storedFromAmount;
         originalBasisValueRef.current = storedFromAmount;
         basisFieldRef.current = 'from';
         
         // Set a flag to prevent other effects from clearing the restored value
         isFromAmountSetToZeroByGetFocus.current = false;
         isFromAmountCalculated.current = false;
         
         // Trigger calculation with the restored value after a short delay
         setTimeout(() => {
           userInputRef.current = 'from';
           console.log('🔄 SwapForm: Triggering calculation with restored value');
         }, 100);
       } else {
         console.log('🔄 SwapForm: Not restoring user input - conditions not met:', {
           hasStoredAmount: !!storedFromAmount,
           isNotDefault: storedFromAmount !== '1',
           hasStoredTokens: !!hasStoredTokens
         });
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

    // Ref to track the previous focus state for Send field
    const wasFromAmountFocusedRef = useRef<boolean>(false);

    const handleFocusChange = useCallback((isFocused: boolean) => {
        console.log('🟦 FROM input focus change:', isFocused);
        console.log('🟦 Current toAmount focused state:', isToAmountFocused);
        console.log('🟦 toAmountRef.current:', toAmountRef.current);
        
        // Capture the previous focus state from the ref (not the current state)
        const wasFocused = wasFromAmountFocusedRef.current;
        // Update the ref with the new focus state
        wasFromAmountFocusedRef.current = isFocused;
        setIsFromAmountFocused(isFocused);
        isFromAmountFocusedRef.current = isFocused;
        
        // Unfocus the other input when this one is focused
        if (isFocused) {
            console.log('🟦 FROM input focused - attempting to blur TO input');
            setIsToAmountFocused(false);
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
            // Clear the flag when Send field is focused
            isFromAmountSetToZeroByGetFocus.current = false;
            // Check if this is the default value "1" (basis field) or a calculated value
            console.log('🔄 SwapForm: Send field focus condition check:', {
                fromAmount,
                fromAmountType: typeof fromAmount,
                fromAmountString: String(fromAmount),
                basisFieldRef: basisFieldRef.current,
                fromAmountEquals1: fromAmount === '1',
                fromAmountEquals1Number: parseFloat(fromAmount) === 1,
                fromAmountEquals1String: String(fromAmount) === '1',
                basisFieldEqualsFrom: basisFieldRef.current === 'from',
                bothConditionsMet: fromAmount === '1' && basisFieldRef.current === 'from',
                bothConditionsMetNumber: parseFloat(fromAmount) === 1 && basisFieldRef.current === 'from',
                bothConditionsMetString: String(fromAmount) === '1' && basisFieldRef.current === 'from',
                finalCondition: (fromAmount === '1' || parseFloat(fromAmount) === 1) && basisFieldRef.current === 'from'
            });
            
            // Check if this is a default value that should be cleared
            // Only clear if it's "1" AND it's actually a default value (not calculated or user-entered)
            // AND it's the initial default value (not a calculated or user-entered value)
            const isDefaultValue = (fromAmount === '1' || String(fromAmount) === '1');
            const isEvenRotations = rotationCountRef.current % 2 === 0;
            const shouldBasisBeInSendField = isEvenRotations;
            const isActualDefaultValue = isDefaultValue && !isFromAmountCalculated.current && !hasUserEnteredCustomValue.current && isFromAmountDefault.current;
            const isDefaultValueInCorrectField = isActualDefaultValue && shouldBasisBeInSendField;
            
            console.log('🔄 SwapForm: Rotation-based focus check:', {
                isDefaultValue,
                isFromAmountCalculated: isFromAmountCalculated.current,
                rotationCount: rotationCountRef.current,
                isEvenRotations,
                shouldBasisBeInSendField,
                isDefaultValueInCorrectField,
                fromAmount,
                condition1: isFocused,
                condition2: fromAmount && parseFloat(fromAmount) > 0,
                condition3: !isUserTyping.current,
                condition4: !isUserTypingToAmount,
                condition5: !hasUserEnteredCustomValue.current,
                allConditions: isFocused && fromAmount && parseFloat(fromAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current
            });
            
            if (isDefaultValueInCorrectField) {
                // This is a default value on the Send field side - clear it and set Get field to 0
                console.log('🔄 SwapForm: Send field focused with default value, clearing Send field and setting Get field to 0');
                // Set a flag to prevent calculation from overriding the values
                isRestoringDefaults.current = true;
                setFromAmount(''); // Clear the Send field
                setToAmount('0'); // Set Get field to 0
                // Clear the flag after a short delay to allow the values to stick
                setTimeout(() => {
                    isRestoringDefaults.current = false;
                }, 100);
            } else {
                // Don't clear calculated values on focus - only clear them when user starts typing
                // This prevents clearing calculated values when just focusing the field
                console.log('🔄 SwapForm: Send field focused with calculated value, waiting for user input');
            }
        }
        
        // Debug logging BEFORE the else if condition
        console.log('🔄 SwapForm: BEFORE restoration condition check:', {
            isFocused,
            wasFocused,
            fromAmount,
            fromAmountType: typeof fromAmount,
            fromAmountLength: fromAmount?.length,
            fromAmountValue: JSON.stringify(fromAmount),
            condition1: !isFocused,
            condition2: wasFocused,
            condition3: fromAmount === '',
            condition4: fromAmount === '0',
            condition5: fromAmount === '' || fromAmount === '0',
            allConditions: !isFocused && wasFocused && (fromAmount === '' || fromAmount === '0')
        });
        
        // Send field mechanics: Reset to default value when COMPLETELY unfocusing (not focusing another field)
        // Distinguish between:
        // 1. Complete unfocusing (clicking dollar balance area, etc.) → Should restore defaults
        // 2. Focusing another field (clicking other input) → Should trigger zero handling, not restoration
        const isCompleteUnfocus = !isFocused && wasFocused && !isToAmountFocused;
        const shouldRestore = isCompleteUnfocus && (fromAmount === '' || fromAmount === '0') && !isTokenChangeInProgress.current;
        
        if (shouldRestore) {
            console.log('🔄 SwapForm: INSIDE restoration condition check - COMPLETE UNFOCUS');
            console.log('🔄 SwapForm: Restoration condition check:', {
                fromAmount,
                hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
                isFromAmountDefault: isFromAmountDefault.current,
                isCompleteUnfocus,
                isToAmountFocused,
                isTokenChangeInProgress: isTokenChangeInProgress.current,
                shouldRestore: !hasUserEnteredCustomValue.current || fromAmount === ''
            });
            
            // Clear the flag when Send field is completely unfocused to allow restoration
            console.log('🔄 SwapForm: Send field completely unfocused, clearing isFromAmountSetToZeroByGetFocus flag');
            isFromAmountSetToZeroByGetFocus.current = false;
            
            // Skip restoration if we're in zero switching mode (both fields are empty or zero)
            // This prevents restoration when user is switching focus between empty fields
            // BUT allow restoration if user had entered a custom value and then cleared it
            // TEMPORARILY DISABLED - let the main restoration logic handle this
            // if ((fromAmount === '' || fromAmount === '0') && (toAmount === '' || toAmount === '0') && !hasUserEnteredCustomValue.current) {
            //     console.log('🔄 SwapForm: Skipping Send field restoration - in zero switching mode (both fields empty/zero)');
            //     return;
            // }
            
            // Only restore if user hasn't entered a custom value or if they cleared the field
            // Also skip restoration if we just completed a rotation (values are already correctly set)
            // Skip restoration if we're in the middle of a token change
            if ((!hasUserEnteredCustomValue.current || fromAmount === '') && !justCompletedRotation.current && !isTokenChangeInProgress.current) {
                
                // Check if Send field was set to 0 due to Get field focus - if so, skip restoration
                if (isFromAmountSetToZeroByGetFocus.current) {
                    console.log('🔄 SwapForm: Skipping Send field restoration - was set to 0 due to Get field focus');
                    // Don't clear the flag here - let the setTimeout blocks check it too
                } else {
                    // Restore to defaults depending on rotation count
                    const defaultValue = '1';
                    console.log('🔄 SwapForm: Restoring fromAmount default value on unfocus:', defaultValue, 'rotationCount:', rotationCountRef.current);
                    
                    // Set restoration flag to prevent calculations from interfering
                    isRestoringDefaults.current = true;
                    
                    // Check where the basis value should be based on current rotation count
                    const isEvenRotations = rotationCountRef.current % 2 === 0;
                    if (isEvenRotations) {
                        // Even rotations (0, 2, 4...): Send field should contain "1", Get field should be calculated
                        console.log('🔄 SwapForm: Restoring to even rotation state (Send=1, Get=calculated)');
                        setFromAmount('1');
                        setToAmount('');
                        userInputRef.current = 'from';
                        basisFieldRef.current = 'from';
                        
                        // Trigger calculation after restoration - immediate execution
                        setFormState('calculating');
                        console.log('🔄 SwapForm: Triggering calculation after restoration');
                        console.log('🔄 SwapForm: Restoration calculation details:', {
                            fromAmount: '1',
                            toAmount: '',
                            userInputRef: 'from',
                            basisFieldRef: 'from'
                        });
                        console.log('🔄 SwapForm: Calling executeCalculation (FORWARD) for even rotations');
                        executeCalculation('FORWARD', '1');
                        setFormState('idle');
                    } else {
                        // Odd rotations (1, 3, 5...): Get field should contain "1", Send field should be calculated
                        console.log('🔄 SwapForm: Restoring to odd rotation state (Send=calculated, Get=1)');
                        setToAmount('1');
                        userInputRef.current = 'to';
                        basisFieldRef.current = 'to';
                        
                        // Clear the Send field first to ensure clean state
                        setFromAmount('');
                        
                        // Trigger calculation after restoration - immediate execution
                        setFormState('calculating');
                        console.log('🔄 SwapForm: Triggering calculation after restoration');
                        console.log('🔄 SwapForm: Restoration calculation details:', {
                            fromAmount: '',
                            toAmount: '1',
                            userInputRef: 'to',
                            basisFieldRef: 'to'
                        });
                        console.log('🔄 SwapForm: Calling executeCalculation (REVERSE) for odd rotations');
                        executeCalculation('REVERSE', '1');
                        setFormState('idle');
                    }
                    
                    // Reset the custom value flag since we're back to default
                    hasUserEnteredCustomValue.current = false;
                    // Mark as default value so it can be cleared on focus
                    isFromAmountDefault.current = true;
                    
                    // Don't clear the restoration flag immediately - let calculation completion handle it
                    console.log('🔄 SwapForm: Keeping isRestoringDefaults flag true until calculation completes');
                    // Clear the flag after all restoration attempts are complete
                    isFromAmountSetToZeroByGetFocus.current = false;
                }
            }
        }
    }, [setInputFocused, fromAmount, isToAmountFocused, executeCalculation, isUserTypingToAmount, setFormState]);


    const handleFromAmountChange = useCallback((value: string) => {
        console.log('🔄 SwapForm: fromAmount changed to:', value);
        userInputRef.current = 'from';
        hasUserInteracted.current = true; // Mark that user has interacted
        isDefaultState.current = false; // Exit default state
        
        // Always clear enhanced value when user starts typing
        enhancedFromAmount.current = '';
        
        
        setFromAmount(value);
        isFromAmountCalculated.current = false; // Reset calculated flag when user types
        
        // Update input source tracking to mark this as user input
        updateInputSourceTracking('from');
        
        // Clear the flag that prevents calculation override when user starts typing
        isFromAmountSetToZeroByGetFocus.current = false;
        
        // Set state machine to user input
        setFormState('user_input');
        
        // Save user input to localStorage for restoration after token changes
        if (value && value !== '1') {
            localStorage.setItem('userFromAmount', value);
            console.log('🔄 SwapForm: Saved user input to localStorage:', value);
        } else if (value === '1') {
            // Clear the stored value if user goes back to default
            localStorage.removeItem('userFromAmount');
            console.log('🔄 SwapForm: Cleared user input from localStorage (back to default)');
        }
        
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
            // Reset the custom value flag to allow restoration on unfocus
            hasUserEnteredCustomValue.current = false;
            // Mark as no longer default since user cleared it
            isFromAmountDefault.current = false;
        } else {
            // Mark as no longer default when user types
            isFromAmountDefault.current = false;
            // Only mark as custom value when user enters a non-empty value AND we're not in rotation
            // AND the value is not a calculated value
            if (!isInRotation.current && !isFromAmountCalculated.current) {
                hasUserEnteredCustomValue.current = true;
            }
            // Update the last user entered value for rotation
            lastUserEnteredValue.current = value;
            // Update the original basis value for rotation preservation
            originalBasisValueRef.current = value;
            // Set the basis field to 'from' since user is inputting in Send field
            basisFieldRef.current = 'from';
            console.log('🔄 SwapForm: Updated last user entered value to:', value);
            console.log('🔄 SwapForm: Updated original basis value to:', value);
            console.log('🔄 SwapForm: Set basis field to Send field (from)');
        }
    }, [setFormState, updateInputSourceTracking]);

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
            // Blur the other input in the DOM
            if (fromAmountRef.current) {
                console.log('🟨 Calling fromAmountRef.current.blur()');
                fromAmountRef.current.blur();
            } else {
                console.log('🟨 fromAmountRef.current is null!');
            }
        }
        setInputFocused(isFocused || isFromAmountFocused);
        
        // Get field mechanics: Handle focus behavior when get field is empty
        if (isFocused && (!toAmount || toAmount === '' || parseFloat(toAmount) === 0) && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current && !justCompletedRotation.current && !justRestoredDefaults.current) {
            // When get field is focused but empty, clear it and set send field to 0
            console.log('🔄 SwapForm: Get field focused but empty, clearing it and setting Send field to 0');
            setToAmount(''); // Clear the focused field
            setFromAmount('0'); // Set unfocused field to "0"
            // Set a flag to indicate that Send field was set to 0 due to Get field focus
            isFromAmountSetToZeroByGetFocus.current = true;
        }
        // Get field mechanics: Handle focus behavior based on whether it's a default value or calculated value
        else if (isFocused && toAmount && parseFloat(toAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current && !justCompletedRotation.current && !justRestoredDefaults.current) {
            // Check if this is a default value (either "1" or calculated value)
            const isDefaultValue = (toAmount === '1' || String(toAmount) === '1') || isToAmountCalculated.current;
            const isEvenRotations = rotationCountRef.current % 2 === 0;
            const shouldBasisBeInSendField = isEvenRotations;
            const isDefaultValueInCorrectField = isDefaultValue && !shouldBasisBeInSendField;
            
            console.log('🔄 SwapForm: Get field rotation-based focus check:', {
                isDefaultValue,
                isToAmountCalculated: isToAmountCalculated.current,
                rotationCount: rotationCountRef.current,
                isEvenRotations,
                shouldBasisBeInSendField,
                isDefaultValueInCorrectField,
                toAmount,
                condition1: isFocused,
                condition2: toAmount && parseFloat(toAmount) > 0,
                condition3: !isUserTyping.current,
                condition4: !isUserTypingToAmount,
                condition5: !hasUserEnteredCustomValue.current,
                condition6: !justCompletedRotation.current,
                condition7: !justRestoredDefaults.current,
                allConditions: isFocused && toAmount && parseFloat(toAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount && !hasUserEnteredCustomValue.current && !justCompletedRotation.current && !justRestoredDefaults.current
            });
            
            if (isDefaultValueInCorrectField || isToAmountCalculated.current) {
                // This is a default value or calculated value on the Get field side - clear it and set Send field to 0
                console.log('🔄 SwapForm: Get field focused with default/calculated value, clearing Get field and setting Send field to 0');
                // Set a flag to prevent calculation from overriding the values
                isRestoringDefaults.current = true;
                setToAmount(''); // Clear the Get field
                setFromAmount('0'); // Set Send field to 0
                // Set flag to indicate Send field was set to 0 due to Get field focus
                isFromAmountSetToZeroByGetFocus.current = true;
                console.log('🔄 SwapForm: Set isFromAmountSetToZeroByGetFocus flag to true');
                // Clear the flag after a longer delay to allow the values to stick
                setTimeout(() => {
                    isRestoringDefaults.current = false;
                }, 500);
            } else {
                // This is neither a default value nor a calculated value - don't clear
                console.log('🔄 SwapForm: Get field focused with user-entered value, not clearing');
            }
        }
        // Get field mechanics: Restore default values when COMPLETELY unfocusing (not focusing another field)
        // Distinguish between:
        // 1. Complete unfocusing (clicking dollar balance area, etc.) → Should restore defaults
        // 2. Focusing another field (clicking other input) → Should trigger zero handling, not restoration
        const isGetFieldCompleteUnfocus = !isFocused && (toAmount === '' || toAmount === '0') && !isFromAmountFocused;
        
        if (isGetFieldCompleteUnfocus) {
            // Don't restore if we just completed a rotation - values are already correctly set
            console.log('🔍 SwapForm: Checking rotation flags:', { isRotating: isRotating.current, justCompletedRotation: justCompletedRotation.current, fromAmount });
            if (isRotating.current || justCompletedRotation.current) {
                console.log('🔄 SwapForm: Skipping restoration after rotation - values already correctly set');
                return;
            }
            
            // Also skip restoration if fromAmount matches the user's original basis value
            // This handles the case where user input was transferred during rotation
            if (fromAmount && fromAmount === originalBasisValueRef.current) {
                console.log('🔄 SwapForm: Skipping restoration - Send field has user input from rotation:', fromAmount);
                return;
            }
            
            // Skip restoration if we're in zero switching mode (both fields are empty or zero)
            // This prevents restoration when user is switching focus between empty fields
            // BUT allow restoration if user had entered a custom value and then cleared it
            // TEMPORARILY DISABLED - let the main restoration logic handle this
            // if ((fromAmount === '' || fromAmount === '0') && (toAmount === '' || toAmount === '0') && !hasUserEnteredCustomValue.current) {
            //     console.log('🔄 SwapForm: Skipping restoration - in zero switching mode (both fields empty/zero)');
            //     return;
            // }
            
            console.log('🔄 SwapForm: Restoring default values on unfocus (get field empty)');
            console.log('🔄 SwapForm: Rotation count:', rotationCountRef.current);
            // Reset the finished typing flag to allow calculations
            userFinishedTypingToAmount.current = false;
            // Guard while restoring defaults
            isRestoringDefaults.current = true;
            // Mark that we just restored defaults to prevent focus clearing
            justRestoredDefaults.current = true;
            
            // Determine which field should contain the default value based on rotation count
            const isEvenRotations = rotationCountRef.current % 2 === 0;
            const shouldBasisBeInSendField = isEvenRotations;
            
            console.log('🔄 SwapForm: Rotation-based restoration:', {
                rotationCount: rotationCountRef.current,
                isEvenRotations,
                shouldBasisBeInSendField
            });
            
            // Restore to default state based on rotation count
            if (isEvenRotations) {
                // Even rotations (0, 2, 4...): Send field should contain "1", Get field should be calculated
                console.log('🔄 SwapForm: Restoring to even rotation state (Send=1, Get=calculated)');
                setFromAmount('1');
                setToAmount('');
                userInputRef.current = 'from';
                basisFieldRef.current = 'from';
                
                // Clear the flag that prevents Send field updates after restoration
                isFromAmountSetToZeroByGetFocus.current = false;
                console.log('🔄 SwapForm: Cleared isFromAmountSetToZeroByGetFocus flag after restoration');
                
                // Trigger calculation after restoration
                setFormState('calculating');
                console.log('🔄 SwapForm: Triggering calculation after restoration');
                console.log('🔄 SwapForm: Restoration calculation details:', {
                    fromAmount: '1',
                    toAmount: '',
                    userInputRef: 'from',
                    basisFieldRef: 'from'
                });
                console.log('🔄 SwapForm: Calling executeCalculation (FORWARD) for even rotations');
                executeCalculation('FORWARD', '1');
                setFormState('idle');
            } else {
                // Odd rotations (1, 3, 5...): Get field should contain "1", Send field should be calculated
                console.log('🔄 SwapForm: Restoring to odd rotation state (Send=calculated, Get=1)');
                setToAmount('1');
                userInputRef.current = 'to';
                basisFieldRef.current = 'to';
                
                // Clear the Send field first to ensure clean state
                setFromAmount('');
                
                // Clear the flag that prevents Send field updates after restoration
                isFromAmountSetToZeroByGetFocus.current = false;
                console.log('🔄 SwapForm: Cleared isFromAmountSetToZeroByGetFocus flag after restoration');
                
                // Trigger calculation after restoration
                setFormState('calculating');
                console.log('🔄 SwapForm: Triggering calculation after restoration');
                console.log('🔄 SwapForm: Restoration calculation details:', {
                    fromAmount: '',
                    toAmount: '1',
                    userInputRef: 'to',
                    basisFieldRef: 'to'
                });
                console.log('🔄 SwapForm: Calling executeCalculation (REVERSE) for odd rotations');
                executeCalculation('REVERSE', '1');
                setFormState('idle');
            }
            
            // Reset flags to defaults
            hasUserEnteredCustomValue.current = false;
            // Mark as default value so it can be cleared on focus
            isFromAmountDefault.current = true;
            
            // Don't clear the restoration flag immediately - let calculation completion handle it
            console.log('🔄 SwapForm: Keeping isRestoringDefaults flag true until calculation completes (Get field)');
            justRestoredDefaults.current = false; 
            // Reset focus states to ensure toAmount update is not blocked
            isToAmountFocusedRef.current = false;
            console.log('🔄 SwapForm: Reset isToAmountFocusedRef to false for restoration');
        }
        // Reset the finished typing flag when unfocusing toAmount field (regardless of content)
        else if (!isFocused) {
            console.log('🔄 SwapForm: Resetting finished typing flag on toAmount unfocus');
            userFinishedTypingToAmount.current = false;
        }
    }, [setInputFocused, isFromAmountFocused, toAmount, isUserTypingToAmount, fromAmount, setFormState, executeCalculation]);

    const handleToAmountChange = useCallback((value: string) => {
        userInputRef.current = 'to';
        hasUserInteracted.current = true; // Mark that user has interacted
        isDefaultState.current = false; // Exit default state
        
        // Always clear enhanced value when user starts typing
        enhancedToAmount.current = '';
        
        
        setToAmount(value);
        
        // Update input source tracking to mark this as user input
        updateInputSourceTracking('to');
        
        // Clear the flag that prevents Send field updates when user starts typing in Get field
        isFromAmountSetToZeroByGetFocus.current = false;
        
        // Clear calculated values when user starts typing in Get field
        if (isToAmountCalculated.current && value !== '') {
            console.log('🔄 SwapForm: User started typing in Get field, clearing calculated value');
            isToAmountCalculated.current = false;
            // Don't set the flag here - let the calculation handle it
            // isFromAmountSetToZeroByGetFocus.current = true;
        }
        
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
            // Reset the custom value flag so zero handling can work
            hasUserEnteredCustomValue.current = false;
            console.log('🔄 SwapForm: Reset hasUserEnteredCustomValue flag to allow zero handling');
        } else {
            // Only mark as custom value when user enters a non-empty value AND we're not in rotation
            // AND the value is not a calculated value
            if (!isInRotation.current && !isToAmountCalculated.current) {
                hasUserEnteredCustomValue.current = true;
            }
            // Update the last user entered value for rotation
            lastUserEnteredValue.current = value;
            // Update the original basis value for rotation preservation
            originalBasisValueRef.current = value;
            // Set the basis field to 'to' since user is inputting in Get field
            basisFieldRef.current = 'to';
            console.log('🔄 SwapForm: Updated last user entered value from get field to:', value);
            console.log('🔄 SwapForm: Updated original basis value to:', value);
            console.log('🔄 SwapForm: Set basis field to Get field (to)');
        }
    }, [setIsUserTypingToAmount, updateInputSourceTracking]);

    return (
        <div 
            className={`w-full relative z-10 flex flex-col items-center justify-center mx-auto`}
            style={{
                maxWidth: '420px',
                padding: shouldBeCompact ? '0' : '15px'
            }}
        >
            {/* Title - only visible in expanded mode */}
            
            {/* Main form container */}
            <div 
                style={{ 
                    border: shouldBeCompact ? '' : '1px solid rgba(0, 122, 255, 0.22)', 
                    borderRadius: '15px', // 0px
                    backgroundColor: colors.background,
                }}
                className="w-full"
            >
                <div className='z-20 w-full flex flex-col'>
                    <div className='flex flex-row items-center justify-center pt-[15px] pb-[15px] text-[22px]'
                        style={{
                            display: shouldBeCompact ? 'none' : 'flex'
                        }}
                    >
                        {t('crypto-exchange')}
                    </div>
                    <div className='h-[1px]'
                        style={{
                            display: shouldBeCompact ? 'none' : 'block',
                            backgroundColor: 'rgba(0, 122, 255, 0.22)'
                        }}
                    ></div>
                    <div className='pt-[15px] pr-[15px] pl-[15px] flex flex-row gap-[15px] items-center justify-between'>
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
                        {walletAddress && shouldShowMaxButton(selectedFromToken) ? (
                            <div 
                                className='text-[#007AFF] cursor-pointer'
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMaxClick();
                                }}
                            >
                                {t('max')}
                            </div>
                        ) : null}
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
                                    className='p-[2.5px] rounded-[15px] border-[1px] border-[rgba(0,122,255,0.22)] cursor-pointer'
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
                    <div data-custom-keyboard className='pr-[15px] pl-[15px] flex flex-row items-center gap-[5px] my-[5px]'>
                        <CustomInput
                            key="from-amount-input"
                            ref={fromAmountRef}
                            value={getAmount('from', fromAmount)}
                            onChange={handleFromAmountChange}
                            className='w-full text-[#007AFF] text-[33px]'
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
                            className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[rgba(0,122,255,0.22)] rounded-[15px] cursor-pointer select-none'
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
                            {defaultTokensLoading || !defaultUsdt ? (
                                // Loading state with invisible placeholders that reserve space
                                <>
                                    <div 
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            opacity: 0,
                                        }}
                                    />
                                    <div 
                                        style={{
                                            width: '60px',
                                            height: '16px',
                                            opacity: 0,
                                        }}
                                    />
                                </>
                            ) : fromTokenImageLoaded ? (
                                <>
                                    <Image
                                        src={selectedFromToken?.image_url || defaultUsdt?.image_url}
                                        alt={selectedFromToken?.symbol || defaultUsdt?.symbol}
                                        width="20"
                                        height="20"
                                        priority
                                        onLoadingComplete={() => setFromTokenImageLoaded(true)}
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
                                    <span className='text-[#007AFF]'>
                                        {selectedFromToken?.symbol || defaultUsdt?.symbol}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            maxWidth: '20px',
                                            maxHeight: '20px',
                                            display: 'block',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                        }}
                                    />
                                    <Image
                                        src={selectedFromToken?.image_url || defaultUsdt?.image_url}
                                        alt={selectedFromToken?.symbol || defaultUsdt?.symbol}
                                        width="20"
                                        height="20"
                                        priority
                                        onLoadingComplete={() => setFromTokenImageLoaded(true)}
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
                                </>
                            )}
                            <MdKeyboardArrowRight 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    color: 'rgba(0, 122, 255, 0.55)',
                                }}
                            />
                        </div>
                    </div>
                    <div className='pr-[15px] pl-[15px] flex flex-row justify-between items-center gap-[15px]'>
                        <div className='w-full' style={{ opacity: 0.66 }}>
                            {fromTokenUSDValue}
                        </div>
                        {walletAddress ? (
                            <div className='flex flex-row gap-[5px]'>
                                <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                                <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>
                                    {getTokenBalance(selectedFromToken || defaultTon)} {selectedFromToken?.symbol || defaultTon?.symbol}
                                </span>
                            </div>
                        ) : (
                            // Transparent placeholder to preserve layout on mobile
                            <div className='flex flex-row gap-[5px]' style={{ opacity: 0 }}>
                                <IoWalletSharp style={{ height: '20px', width: '20px' }} />
                                <span className='whitespace-nowrap' style={{ minWidth: '80px' }}>
                                    &nbsp;
                                </span>
                            </div>
                        )}
                        <div className='flex flex-row w-full justify-end text-nowrap' style={{ opacity: 0.66 }}>
                            {t('on')} TON
                        </div>
                    </div>
                    <div className='pr-[15px] pl-[15px] flex flex-row items-center gap-[5px] mt-[5px] mb-[5px]'>
                        <div className='h-[1px] w-full bg-[rgba(0,122,255,0.22)]'></div>
                        <div 
                            className='w-[30px] h-[30px] flex items-center justify-center cursor-pointer'
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔄 SwapForm: Rotate icon clicked - swapping tokens');
                                
                                // Set rotation flag to prevent hasUserEnteredCustomValue from being set during rotation
                                isInRotation.current = true;
                                
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
                                    
                                    // Capture cursor position from the focused field (or field that will provide the value)
                                    let capturedCursorPosition = 0;
                                    let capturedValueLength = 0;
                                    
                                    // Priority 1: If Send field is focused, capture from Send field
                                    if (isFromAmountFocused && fromAmountRef.current?.getCursorPosition) {
                                        capturedCursorPosition = fromAmountRef.current.getCursorPosition();
                                        capturedValueLength = fromAmount.length;
                                        console.log('🔍 SwapForm: Captured cursor position from focused Send field:', capturedCursorPosition, 'of', capturedValueLength);
                                    } 
                                    // Priority 2: If Get field is focused, capture from Get field
                                    else if (isToAmountFocused && toAmountRef.current?.getCursorPosition) {
                                        capturedCursorPosition = toAmountRef.current.getCursorPosition();
                                        capturedValueLength = toAmount.length;
                                        console.log('🔍 SwapForm: Captured cursor position from focused Get field:', capturedCursorPosition, 'of', capturedValueLength);
                                    } 
                                    // Priority 3: Fallback to basis field
                                    else if (basisFieldRef.current === 'from' && fromAmountRef.current?.getCursorPosition) {
                                        capturedCursorPosition = fromAmountRef.current.getCursorPosition();
                                        capturedValueLength = fromAmount.length;
                                        console.log('🔍 SwapForm: Captured cursor position from Send field (basis):', capturedCursorPosition, 'of', capturedValueLength);
                                    } else if (basisFieldRef.current === 'to' && toAmountRef.current?.getCursorPosition) {
                                        capturedCursorPosition = toAmountRef.current.getCursorPosition();
                                        capturedValueLength = toAmount.length;
                                        console.log('🔍 SwapForm: Captured cursor position from Get field (basis):', capturedCursorPosition, 'of', capturedValueLength);
                                    }
                                    
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
                                    
                                    // Special case: if rotating while empty field is focused but opposite has a value,
                                    // transfer the opposite field's value to the focused field's side
                                    // BUT only if both fields are not effectively empty (both showing "0")
                                    const rotatingEmptyWithValue = (
                                        (isFromAmountFocused && currentFromAmount === '' && currentToAmount !== '' && currentToAmount !== '0') ||
                                        (isToAmountFocused && currentToAmount === '' && currentFromAmount !== '' && currentFromAmount !== '0') ||
                                        // Also handle case where we had a meaningful value before focusing (stored in originalBasisValueRef)
                                        // BUT only if the opposite field is not empty (not "0")
                                        (isFromAmountFocused && currentFromAmount === '' && currentToAmount !== '0' && originalBasisValueRef.current !== null && originalBasisValueRef.current !== '0') ||
                                        (isToAmountFocused && currentToAmount === '' && currentFromAmount !== '0' && originalBasisValueRef.current !== null && originalBasisValueRef.current !== '0') ||
                                        // Handle case where we're in the initial state (default "1" was cleared to "0" when focusing)
                                        (isToAmountFocused && currentToAmount === '' && currentFromAmount === '0' && originalBasisValueRef.current === '1')
                                    );
                                    
                                    console.log('🔍 SwapForm: Rotation condition check:', {
                                        isFromAmountFocused,
                                        isToAmountFocused,
                                        currentFromAmount,
                                        currentToAmount,
                                        originalBasisValueRef: originalBasisValueRef.current,
                                        rotatingEmptyWithZero,
                                        rotatingEmptyWithValue
                                    });
                                    
                                    if (rotatingEmptyWithValue) {
                                        console.log('🔁 SwapForm: Rotating with empty focused field but opposite has value — transferring value');
                                        
                                        // Determine which value to transfer based on which field is focused
                                        let valueToTransfer = '';
                                        if (isFromAmountFocused) {
                                            // Get field is focused, transfer Send field value to Get field
                                            valueToTransfer = currentToAmount !== '' && currentToAmount !== '0' ? currentToAmount : originalBasisValueRef.current || '';
                                            console.log('🔁 SwapForm: Transferring Send field value to Get field:', valueToTransfer);
                                        } else {
                                            // Send field is focused, transfer Get field value to Send field
                                            valueToTransfer = currentFromAmount !== '' && currentFromAmount !== '0' ? currentFromAmount : originalBasisValueRef.current || '';
                                            console.log('🔁 SwapForm: Transferring Get field value to Send field:', valueToTransfer);
                                        }
                                        
                                        // Swap tokens and transfer value
                                        setSelectedFromToken(currentToToken);
                                        setSelectedToToken(currentFromToken);
                                        localStorage.setItem('selectedFromToken', JSON.stringify(currentToToken));
                                        localStorage.setItem('selectedToToken', JSON.stringify(currentFromToken));
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { detail: { token: currentToToken, type: 'from' } }));
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { detail: { token: currentFromToken, type: 'to' } }));
                                        
                                        // Transfer the value to the appropriate field and focus
                                        if (isFromAmountFocused) {
                                            // Get field was focused, so put the value in the new Get field (which is now Send field)
                                            setFromAmount(valueToTransfer);
                                            setToAmount('');
                                            basisFieldRef.current = 'from';
                                            // Mark the transferred value as calculated
                                            isFromAmountCalculated.current = true;
                                            isToAmountCalculated.current = false;
                                            
                                            // Transfer focus to Send field (where the value was moved)
                                            console.log('🔄 SwapForm: Transferring focus to Send field (empty field rotation)');
                                            setIsFromAmountFocused(true);
                                            setIsToAmountFocused(false);
                                            isToAmountFocusedRef.current = false;
                                            
                                            // Focus the Send field input and set cursor position
                                            setTimeout(() => {
                                                if (fromAmountRef.current?.focus) {
                                                    fromAmountRef.current.focus();
                                                    if (fromAmountRef.current?.setCursorPosition) {
                                                        fromAmountRef.current.setCursorPosition(capturedCursorPosition);
                                                    }
                                                    console.log('🔄 SwapForm: Focused Send field and set cursor to position:', capturedCursorPosition, '(empty field rotation)');
                                                }
                                            }, 0);
                                        } else {
                                            // Send field was focused, so put the value in the new Send field (which is now Get field)
                                            setFromAmount('');
                                            setToAmount(valueToTransfer);
                                            basisFieldRef.current = 'to';
                                            // Mark the transferred value as calculated
                                            isFromAmountCalculated.current = false;
                                            isToAmountCalculated.current = true;
                                            
                                            // Transfer focus to Get field (where the value was moved)
                                            console.log('🔄 SwapForm: Transferring focus to Get field (empty field rotation)');
                                            setIsFromAmountFocused(false);
                                            setIsToAmountFocused(true);
                                            isToAmountFocusedRef.current = true;
                                            
                                            // Focus the Get field input and set cursor position
                                            setTimeout(() => {
                                                if (toAmountRef.current?.focus) {
                                                    toAmountRef.current.focus();
                                                    if (toAmountRef.current?.setCursorPosition) {
                                                        toAmountRef.current.setCursorPosition(capturedCursorPosition);
                                                    }
                                                    console.log('🔄 SwapForm: Focused Get field and set cursor to position:', capturedCursorPosition, '(empty field rotation)');
                                                }
                                            }, 0);
                                        }
                                    
                                    // Set rotation flags and prevent calculation
                                    setTimeout(() => {
                                        justCompletedRotation.current = true;
                                        console.log('🔍 SwapForm: Set justCompletedRotation to true');
                                        // Clear the flag that prevents Send field updates after rotation - do this immediately
                                        isFromAmountSetToZeroByGetFocus.current = false;
                                        console.log('🔍 SwapForm: Cleared isFromAmountSetToZeroByGetFocus flag immediately after rotation');
                                        // Don't set isRestoringDefaults during normal rotation - only during actual restoration
                                        setTimeout(() => { 
                                            justCompletedRotation.current = false; 
                                            console.log('🔍 SwapForm: Cleared justCompletedRotation flag');
                                        }, 1000);
                                    }, 100);
                                        return;
                                    }
                                    
                                    if (rotatingEmptyWithZero) {
                                        console.log('🔁 SwapForm: Rotating with empty+zero state — switching only currencies');
                                        setSelectedFromToken(currentToToken);
                                        setSelectedToToken(currentFromToken);
                                        localStorage.setItem('selectedFromToken', JSON.stringify(currentToToken));
                                        localStorage.setItem('selectedToToken', JSON.stringify(currentFromToken));
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { detail: { token: currentToToken, type: 'from' } }));
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { detail: { token: currentFromToken, type: 'to' } }));
                                        // Do NOT change amounts, basis, or typing flags here
                                        setTimeout(() => { 
                                            isRotating.current = false; 
                                            // Clear the flag that prevents Send field updates after rotation - do this immediately
                                            isFromAmountSetToZeroByGetFocus.current = false;
                                            console.log('🔍 SwapForm: Cleared isFromAmountSetToZeroByGetFocus flag immediately after rotation');
                                            justCompletedRotation.current = true;
                                            console.log('🔍 SwapForm: Set justCompletedRotation to true');
                                            // Clear the flag after a longer delay to allow restoration logic to check it
                                            setTimeout(() => { 
                                                justCompletedRotation.current = false; 
                                                isInRotation.current = false; // Clear rotation flag
                                                console.log('🔍 SwapForm: Cleared justCompletedRotation flag');
                                            }, 1000);
                                        }, 500);
                                        return;
                                    }
                                    
                                    // Swap the tokens
                                    setSelectedFromToken(currentToToken);
                                    setSelectedToToken(currentFromToken);
                                    
                                    // Perfect rotation logic: transfer last user entered value to opposite field
                                    // and recalculate the other amount
                                    
                                    // Determine which value to use for rotation
                                    let valueToTransfer = lastUserEnteredValue.current;
                                    
                                    // Priority 1: Always use preserved original basis value if available (this is the original "1" value)
                                    if (originalBasisValueRef.current !== null && originalBasisValueRef.current !== '') {
                                        valueToTransfer = originalBasisValueRef.current;
                                        console.log('🔄 SwapForm: Using preserved original basis value:', valueToTransfer);
                                    } 
                                    // Priority 2: If we're rotating default values, use the current send field value
                                    else if (fromAmount === '1' && isFromAmountDefault.current && !hasUserEnteredCustomValue.current) {
                                        valueToTransfer = fromAmount;
                                        console.log('🔄 SwapForm: Rotating default values, using send field value:', valueToTransfer);
                                    } 
                                    // Priority 3: If Send field is focused, use its original value
                                    else if (isFromAmountFocused) {
                                        valueToTransfer = getOriginalAmount('from', fromAmount);
                                        console.log('🔄 SwapForm: Send field is focused, using send field original value:', valueToTransfer);
                                    } 
                                    // Priority 4: If Get field is focused, use its original value
                                    else if (isToAmountFocused) {
                                        valueToTransfer = getOriginalAmount('to', toAmount);
                                        console.log('🔄 SwapForm: Get field is focused, using get field original value:', valueToTransfer);
                                    } 
                                    // Priority 5: Final fallback to last user entered value
                                    else {
                                        console.log('🔄 SwapForm: No field focused, using last user entered value:', valueToTransfer);
                                    }
                                    
                                    // Remember the exact value transferred into the get field to detect reverse completion
                                    rotatedTransferredToAmount.current = currentFromAmount;

                                    // Determine which field provided the value and move it to the opposite field
                                    let sourceField = 'from'; // Default to Send field
                                    
                                    // Determine source field based on which field provided the value
                                    if (isFromAmountFocused || (fromAmount === '1' && isFromAmountDefault.current && !hasUserEnteredCustomValue.current)) {
                                        sourceField = 'from';
                                        console.log('🔄 SwapForm: Value came from Send field');
                                    } else if (isToAmountFocused) {
                                        sourceField = 'to';
                                        console.log('🔄 SwapForm: Value came from Get field');
                                    } else if (originalBasisValueRef.current === toAmount) {
                                        sourceField = 'to';
                                        console.log('🔄 SwapForm: Value came from Get field (preserved basis)');
                                    } else if (originalBasisValueRef.current !== null) {
                                        // When using preserved original basis value, determine source based on which field actually contains the basis value
                                        // Check which field contains the basis value (1), not which field is calculated
                                        if (fromAmount === originalBasisValueRef.current) {
                                            sourceField = 'from';
                                            console.log('🔄 SwapForm: Value came from Send field (preserved basis, Send field contains basis value)');
                                        } else if (toAmount === originalBasisValueRef.current) {
                                            sourceField = 'to';
                                            console.log('🔄 SwapForm: Value came from Get field (preserved basis, Get field contains basis value)');
                                        } else {
                                            // Fallback: if neither field contains the exact basis value, use the field that's not calculated
                                            if (isToAmountCalculated.current) {
                                                sourceField = 'from';
                                                console.log('🔄 SwapForm: Value came from Send field (preserved basis, Get field was calculated)');
                                            } else {
                                                sourceField = 'to';
                                                console.log('🔄 SwapForm: Value came from Get field (preserved basis, Send field was calculated)');
                                            }
                                        }
                                    } else {
                                        sourceField = 'from';
                                        console.log('🔄 SwapForm: Value came from Send field (default/fallback)');
                                    }
                                    
                                    // Preserve the calculated state from the source field before clearing
                                    const sourceWasCalculated = sourceField === 'from' ? isFromAmountCalculated.current : isToAmountCalculated.current;
                                    
                                    // Move the value to the opposite field and transfer focus
                                    if (sourceField === 'from') {
                                        // Value came from Send field, move it to Get field
                                        setFromAmount(''); // Clear send field to allow calculation
                                        setToAmount(valueToTransfer); // Put basis value in Get field
                                        basisFieldRef.current = 'to';
                                        // Mark the transferred value as calculated if the source was calculated
                                        isFromAmountCalculated.current = false;
                                        isToAmountCalculated.current = sourceWasCalculated;
                                        console.log('🔄 SwapForm: Moved value from Send field to Get field');
                                        
                                        // Only transfer focus if a field was focused before rotation
                                        const wasAnyFieldFocused = isFromAmountFocused || isToAmountFocused;
                                        if (wasAnyFieldFocused) {
                                            // Transfer focus to Get field (where the value was moved)
                                            console.log('🔄 SwapForm: Transferring focus to Get field');
                                            setIsFromAmountFocused(false);
                                            setIsToAmountFocused(true);
                                            isToAmountFocusedRef.current = true;
                                            
                                            // Focus the Get field input and set cursor position
                                            setTimeout(() => {
                                                if (toAmountRef.current?.focus) {
                                                    toAmountRef.current.focus();
                                                    // Set cursor to the captured position
                                                    if (toAmountRef.current?.setCursorPosition) {
                                                        toAmountRef.current.setCursorPosition(capturedCursorPosition);
                                                    }
                                                    console.log('🔄 SwapForm: Focused Get field and set cursor to position:', capturedCursorPosition);
                                                }
                                            }, 0);
                                        } else {
                                            // No field was focused, keep both unfocused
                                            console.log('🔄 SwapForm: No field was focused before rotation, keeping both unfocused');
                                            setIsFromAmountFocused(false);
                                            setIsToAmountFocused(false);
                                            isToAmountFocusedRef.current = false;
                                        }
                                    } else {
                                        // Value came from Get field, move it to Send field
                                        setFromAmount(valueToTransfer); // Put basis value in Send field
                                        setToAmount(''); // Clear get field to allow calculation
                                        basisFieldRef.current = 'from';
                                        // Mark the transferred value as calculated if the source was calculated
                                        isFromAmountCalculated.current = sourceWasCalculated;
                                        isToAmountCalculated.current = false;
                                        console.log('🔄 SwapForm: Moved value from Get field to Send field');
                                        
                                        // Only transfer focus if a field was focused before rotation
                                        const wasAnyFieldFocused = isFromAmountFocused || isToAmountFocused;
                                        if (wasAnyFieldFocused) {
                                            // Transfer focus to Send field (where the value was moved)
                                            console.log('🔄 SwapForm: Transferring focus to Send field');
                                            setIsFromAmountFocused(true);
                                            setIsToAmountFocused(false);
                                            isToAmountFocusedRef.current = false;
                                            
                                            // Focus the Send field input and set cursor position
                                            setTimeout(() => {
                                                if (fromAmountRef.current?.focus) {
                                                    fromAmountRef.current.focus();
                                                    // Set cursor to the captured position
                                                    if (fromAmountRef.current?.setCursorPosition) {
                                                        fromAmountRef.current.setCursorPosition(capturedCursorPosition);
                                                    }
                                                    console.log('🔄 SwapForm: Focused Send field and set cursor to position:', capturedCursorPosition);
                                                }
                                            }, 0);
                                        } else {
                                            // No field was focused, keep both unfocused
                                            console.log('🔄 SwapForm: No field was focused before rotation, keeping both unfocused');
                                            setIsFromAmountFocused(false);
                                            setIsToAmountFocused(false);
                                            isToAmountFocusedRef.current = false;
                                        }
                                    }
                                    
                                    // Update default send reference to match new context (so unfocus restores this)
                                    fromDefaultValueRef.current = basisFieldRef.current === 'from' ? valueToTransfer : currentToAmount;
                                    
                                    // Set rotation flag to prevent restoration from overwriting transferred user input
                                    justCompletedRotation.current = true;
                                    console.log('🔍 SwapForm: Set justCompletedRotation to true after value transfer');
                                    
                                    // Update flags to reflect the state
                                    // Only treat rotated values as default if we rotated from true defaults
                                    // OR if we're using the preserved original basis value (which is always '1' for default rotations)
                                    const rotatedFromDefaults = (
                                        (currentFromAmount === '1' &&
                                        isFromAmountDefault.current &&
                                        !hasUserEnteredCustomValue.current) ||
                                        (originalBasisValueRef.current !== null && originalBasisValueRef.current === '1' && valueToTransfer === '1')
                                    );
                                    
                                    // Check if the value being transferred is a calculated value (not user-entered)
                                    // If we're using the preserved original basis value, check if it came from a calculated field
                                    const isTransferredValueCalculated = sourceWasCalculated || 
                                        (originalBasisValueRef.current !== null && originalBasisValueRef.current === valueToTransfer && 
                                         (isFromAmountCalculated.current || isToAmountCalculated.current));
                                    
                                    // Persist this info for unfocus/default restoration logic
                                    rotatedFromDefaultsRef.current = rotatedFromDefaults;
                                    // Don't toggle defaultBasisSideRef during rotation - it should remain consistent
                                    // The basisFieldRef tracks the current position, but defaultBasisSideRef should stay stable
                                    isFromAmountDefault.current = rotatedFromDefaults; // New send is default only if rotation started from default '1'
                                    // The calculated flags are already set correctly above based on the source field
                                    
                                    // Only mark as user-entered if it's actually a user-entered value, not a calculated one
                                    // Calculated values should be treated as default values for clearing purposes
                                    hasUserEnteredCustomValue.current = !rotatedFromDefaults && !isTransferredValueCalculated;
                                    
                                    // Reset typing flags after rotation to allow normal calculation updates
                                    setIsUserTypingToAmount(false);
                                    userFinishedTypingToAmount.current = false;
                                    
                                    // Reset focus states after rotation to allow proper calculation updates
                                    // Note: Focus states are set above for the target field, so we don't reset them here
                                    
                                    // Update the last user entered value to the basis value
                                    lastUserEnteredValue.current = valueToTransfer;
                                    
                                    // Transfer focus to the field where the basis value was placed
                                    // and apply the captured cursor position (only if it was focused before)
                                    if (basisFieldRef.current === 'from' && isFromAmountFocused) {
                                        // Value was placed in Send field, focus it and set cursor position
                                        fromAmountRef.current?.focus();
                                        setIsFromAmountFocused(true);
                                        // Apply the captured cursor position
                                        if (capturedCursorPosition !== undefined && fromAmountRef.current?.setCursorPosition) {
                                            fromAmountRef.current.setCursorPosition(capturedCursorPosition);
                                            console.log('🔍 SwapForm: Applied cursor position to Send field:', capturedCursorPosition);
                                        }
                                    } else if (basisFieldRef.current === 'to' && isToAmountFocused) {
                                        // Value was placed in Get field, focus it and set cursor position
                                        toAmountRef.current?.focus();
                                        setIsToAmountFocused(true);
                                        // Apply the captured cursor position
                                        if (capturedCursorPosition !== undefined && toAmountRef.current?.setCursorPosition) {
                                            toAmountRef.current.setCursorPosition(capturedCursorPosition);
                                            console.log('🔍 SwapForm: Applied cursor position to Get field:', capturedCursorPosition);
                                        }
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
                                    
                                    // Increment rotation count
                                    rotationCountRef.current += 1;
                                    console.log('🔄 SwapForm: Rotation count incremented to:', rotationCountRef.current);
                                    
                                    // CRITICAL: Update basis value to the new focused field's value when rotating
                                    // This ensures that the basis value reflects the current focused field's value
                                    if (isToAmountFocused) {
                                        originalBasisValueRef.current = currentToAmount;
                                        console.log('🔄 SwapForm: Updated basis value to Get field value:', currentToAmount);
                                    } else if (isFromAmountFocused) {
                                        originalBasisValueRef.current = currentFromAmount;
                                        console.log('🔄 SwapForm: Updated basis value to Send field value:', currentFromAmount);
                                    }
                                    
                                    // CRITICAL: Clear any stale calculation results to prevent key mismatch after basis change
                                    // This ensures that calculation results from before the basis change don't get applied after rotation
                                    // We need to clear the calculation result state to prevent stale results from being applied
                                    console.log('🔄 SwapForm: Clearing stale calculation results after basis value update');
                                    
                                    // Set a flag to indicate we're in a rotation scenario and should be more flexible with key matching
                                    isInRotation.current = true;
                                    console.log('🔄 SwapForm: Set isInRotation flag to true for flexible key matching');
                                    
                                    console.log('✅ SwapForm: Tokens and values swapped successfully');
                                    console.log('✅ SwapForm: New fromToken:', currentToToken.symbol, 'New fromAmount:', currentToAmount);
                                    console.log('✅ SwapForm: New toToken:', currentFromToken.symbol, 'Transferred value:', currentFromAmount, '(will trigger recalculation)');
                                    
                                    // Use setTimeout to ensure typing flags are reset after handleToAmountChange has been called
                                    setTimeout(() => {
                                        // End rotation now so input effects resume normally
                                        isRotating.current = false;
                                        // Clear the flag that prevents Send field updates after rotation - do this immediately
                                        isFromAmountSetToZeroByGetFocus.current = false;
                                        console.log('🔍 SwapForm: Cleared isFromAmountSetToZeroByGetFocus flag immediately after rotation');
                                        // Ensure typing flags are cleared
                                        setIsUserTypingToAmount(false);
                                        userFinishedTypingToAmount.current = false;
                                        // Focus states are already properly set during rotation - no need to reset
                                        // Preserve whether this rotation came from defaults
                                        // Only mark as user-entered if it's actually a user-entered value, not a calculated one
                                        hasUserEnteredCustomValue.current = !rotatedFromDefaults && !isTransferredValueCalculated;
                                        isFromAmountDefault.current = rotatedFromDefaults;
                                        console.log('🔄 SwapForm: Final reset of typing flags after rotation (rotatedFromDefaults:', rotatedFromDefaults, ')');
                                        
                                        // Clear the rotation flag after a longer delay to prevent clearing calculated values on focus
                                        setTimeout(() => { 
                                            justCompletedRotation.current = false; 
                                            isInRotation.current = false; // Clear rotation flag
                                            // Clear the flag that prevents Send field updates after rotation
                                            isFromAmountSetToZeroByGetFocus.current = false;
                                            console.log('🔍 SwapForm: Cleared justCompletedRotation flag after rotation');
                                            console.log('🔍 SwapForm: Cleared isFromAmountSetToZeroByGetFocus flag after rotation');
                                        }, 1000);
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
                        <div className='h-[1px] w-full bg-[rgba(0,122,255,0.22)]'></div>
                    </div>
                    <div className='pr-[15px] pl-[15px] flex flex-row items-center justify-between'>
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
                                    className='p-[2.5px] rounded-[15px] border-[1px] border-[rgba(0,122,255,0.22)] cursor-pointer'
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
                    <div data-custom-keyboard className='pr-[15px] pl-[15px] flex flex-row items-center gap-[5px] my-[5px]'>
                        <CustomInput
                            key="to-amount-input"
                            ref={toAmountRef}
                            value={getAmount('to', toAmount)}
                            onChange={handleToAmountChange}
                            className='w-full text-[#007AFF] text-[33px]'
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
                            className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[rgba(0,122,255,0.22)] rounded-[15px] cursor-pointer select-none'
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
                            {defaultTokensLoading || !defaultTon ? (
                                // Loading state with invisible placeholders that reserve space
                                <>
                                    <div 
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            opacity: 0,
                                        }}
                                    />
                                    <div 
                                        style={{
                                            width: '60px',
                                            height: '16px',
                                            opacity: 0,
                                        }}
                                    />
                                </>
                            ) : toTokenImageLoaded ? (
                                <>
                                    <Image
                                        src={selectedToToken?.image_url || defaultTon?.image_url}
                                        alt={selectedToToken?.symbol || defaultTon?.symbol}
                                        width="20"
                                        height="20"
                                        priority
                                        onLoadingComplete={() => setToTokenImageLoaded(true)}
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
                                    <span className='text-[#007AFF]'>
                                        {selectedToToken?.symbol || defaultTon?.symbol}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            maxWidth: '20px',
                                            maxHeight: '20px',
                                            display: 'block',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                        }}
                                    />
                                    <Image
                                        src={selectedToToken?.image_url || defaultTon?.image_url}
                                        alt={selectedToToken?.symbol || defaultTon?.symbol}
                                        width="20"
                                        height="20"
                                        priority
                                        onLoadingComplete={() => setToTokenImageLoaded(true)}
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
                                </>
                            )}
                            <MdKeyboardArrowRight 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    color: 'rgba(0, 122, 255, 0.55)',
                                }}
                            />
                        </div>
                    </div>
                    <div className='pr-[15px] pl-[15px] pb-[15px] flex flex-row justify-between items-center'>
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
                            {walletAddress ? (
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'display 0.2s ease'
                                }}>
                                    <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                                    <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>
                                        {getTokenBalance(selectedToToken || defaultTon)} {selectedToToken?.symbol || defaultTon?.symbol}
                                    </span> 
                                </div>
                            ) : (
                                // Transparent placeholder to preserve layout on mobile
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    opacity: 0
                                }}>
                                    <IoWalletSharp style={{ height: '20px', width: '20px' }} />
                                    <span className='whitespace-nowrap' style={{ minWidth: '80px' }}>
                                        &nbsp;
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className='flex flex-row w-full justify-end text-nowrap' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                    <div className='h-[1px]'
                        style={{
                            backgroundColor: 'rgba(0, 122, 255, 0.22)'
                        }}
                    ></div>
                    <SwapButton
                        className='m-[15px]'
                        shouldBeCompact={shouldBeCompact}
                        error={combinedError}
                        toAmount={getAmount('to', toAmount)}
                        toTokenSymbol={selectedToToken?.symbol || 'TON'}
                        fromToken={selectedFromToken}
                        toToken={selectedToToken}
                        fromAmount={fromAmount}
                        onSwapResult={(result) => {
                            console.log('🔄 Swap result received:', result);
                            if (result.success) {
                                // Handle successful swap
                                console.log('✅ Swap completed successfully!');
                                toast({
                                    title: "Swap Successful!",
                                    description: `Successfully swapped ${fromAmount} ${selectedFromToken?.symbol} to ${toAmount} ${selectedToToken?.symbol}`,
                                });
                            } else {
                                // Handle swap error
                                console.error('❌ Swap failed:', result.error);
                                toast({
                                    title: "Swap Failed",
                                    description: result.error || "An error occurred during the swap",
                                    variant: "destructive",
                                });
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}