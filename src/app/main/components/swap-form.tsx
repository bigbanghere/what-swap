"use client";

import Image from 'next/image';
import React, { useState, useCallback, useRef, useEffect } from 'react';
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

export function SwapForm() {
    const router = useRouter();
    const walletAddress = useTonAddress();
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>(''); // Start empty, will be calculated
    const [isFromAmountFocused, setIsFromAmountFocused] = useState<boolean>(false);
    const [isToAmountFocused, setIsToAmountFocused] = useState<boolean>(false);
    const [selectedFromToken, setSelectedFromToken] = useState<any>(null);
    const [selectedToToken, setSelectedToToken] = useState<any>(null);
    const fromAmountRef = useRef<{ blur: () => void; focus: () => void; canAddMoreCharacters: (key: string) => boolean }>(null);
    const toAmountRef = useRef<{ blur: () => void; focus: () => void; canAddMoreCharacters: (key: string) => boolean }>(null);
    const { shouldBeCompact, setInputFocused } = useKeyboardDetection();
    const t = useTranslations('translations');
    const { setCanAddMoreCharacters } = useValidation();
    const { usdt: defaultUsdt, ton: defaultTon, isLoading: defaultTokensLoading } = useDefaultTokens();
    const { allTokens } = useTokensCache();

    // Track user input vs programmatic updates
    const userInputRef = useRef<'from' | 'to' | null>(null);
    const lastCalculatedAmount = useRef<string | null>(null);
    const isToAmountCalculated = useRef(false); // Track if toAmount is a calculated value
    const hasUserEnteredCustomValue = useRef(false); // Track if user has entered a custom value
    const isUserTypingToAmount = useRef(false); // Track when user is typing in toAmount field
    const isFromAmountDefault = useRef(true); // Track if fromAmount has the default value (1)

    // Swap calculation hook
    const { outputAmount: calculatedOutputAmount, isLoading: isCalculating, error: calculationError } = useSwapCalculation({
        fromToken: selectedFromToken,
        toToken: selectedToToken,
        fromAmount,
        toAmount,
        isFromAmountFocused,
        isToAmountFocused,
        hasUserEnteredCustomValue: hasUserEnteredCustomValue.current,
        isUserTypingToAmount: isUserTypingToAmount.current
    });

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
        
        // Get full token data with market stats
        const fullToken = getFullTokenData(token);
        
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
    }, [getFullTokenData]);

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
            
            // Clear any existing tokens from localStorage on page refresh
            localStorage.removeItem('selectedFromToken');
            localStorage.removeItem('selectedToToken');
            console.log('🧹 SwapForm: Cleared localStorage tokens on page refresh');
            
            // Clear session flags on page refresh
            sessionStorage.removeItem('inAssetSelection');
            sessionStorage.removeItem('fromTokensPage');
            sessionStorage.removeItem('swapFormProcessed'); // Clear the processed flag so it can be processed again
            console.log('🧹 SwapForm: Cleared session flags on page refresh');
        }
        

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

        // Listen for custom events (for same-tab updates)
        const handleTokenSelect = (e: CustomEvent) => {
            console.log('🔄 SwapForm: Custom token selection event received', e);
            console.log('🔄 SwapForm: Event detail:', e.detail);
            console.log('🔄 SwapForm: Event detail type:', e.detail?.type);
            console.log('🔄 SwapForm: Event detail token:', e.detail?.token);
            
            // Only process real tokens (with address), not test tokens
            if (e.detail?.token?.address && e.detail?.token?.symbol) {
                if (e.detail?.type === 'from' && e.detail?.token) {
                    console.log('✅ SwapForm: Updating selectedFromToken from custom event');
                    console.log('✅ SwapForm: New token:', e.detail.token.symbol, e.detail.token.name);
                    setSelectedFromToken(e.detail.token);
                    console.log('✅ SwapForm: Updated selectedFromToken from custom event');
                }
                if (e.detail?.type === 'to' && e.detail?.token) {
                    console.log('✅ SwapForm: Updating selectedToToken from custom event');
                    console.log('✅ SwapForm: New token:', e.detail.token.symbol, e.detail.token.name);
                    setSelectedToToken(e.detail.token);
                    console.log('✅ SwapForm: Updated selectedToToken from custom event');
                }
            } else {
                console.log('⚠️ SwapForm: Ignoring invalid event (missing address or symbol)');
            }
        };

        // Set up event listeners immediately
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('tokenSelected', handleTokenSelect as EventListener);

        console.log('🔧 SwapForm: Event listeners added');

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tokenSelected', handleTokenSelect as EventListener);
        };
    }, []); // Empty dependency array - only run on mount

    // Debug: Log when selectedFromToken or selectedToToken changes
    useEffect(() => {
        console.log('🔄 SwapForm: selectedFromToken changed:', selectedFromToken);
    }, [selectedFromToken]);

    useEffect(() => {
        console.log('🔄 SwapForm: selectedToToken changed:', selectedToToken);
    }, [selectedToToken]);

    // Update amounts when we get a calculated output amount
    useEffect(() => {
        console.log('🔄 SwapForm: calculatedOutputAmount changed:', {
            calculatedOutputAmount,
            isFromAmountFocused,
            isToAmountFocused,
            isCalculating,
            userInputRef: userInputRef.current,
            fromAmount,
            toAmount,
            isUserTypingToAmount: isUserTypingToAmount.current
        });
        
        if (calculatedOutputAmount && calculatedOutputAmount !== lastCalculatedAmount.current) {
            lastCalculatedAmount.current = calculatedOutputAmount;
            
            console.log('🔄 SwapForm: Calculation effect condition check:', {
                isFromAmountFocused,
                isToAmountFocused,
                userInputRef: userInputRef.current,
                isUserTypingToAmount: isUserTypingToAmount.current,
                shouldUpdateToAmount: isFromAmountFocused && !isToAmountFocused && !isUserTypingToAmount.current,
                shouldUpdateFromAmount: isToAmountFocused && !isFromAmountFocused && userInputRef.current === 'to'
            });
            
            // Don't interfere when get field is empty and we want to show 0 in send field
            if (fromAmount === '0' && toAmount === '' && isToAmountFocused) {
                console.log('🔄 SwapForm: Main calculation - skipping update when showing 0 in send field for empty get field');
            }
            // Don't interfere when send field is empty and focused - we want to show 0 in get field
            else if (isFromAmountFocused && !isToAmountFocused && (fromAmount === '' || fromAmount === '0' || parseFloat(fromAmount) === 0)) {
                console.log('🔄 SwapForm: Main calculation - skipping update when send field is empty/focused, should show 0 in get field');
            }
            // Always update toAmount when we have a calculated value and user is focused on fromAmount
            // BUT NOT when user is actively typing in toAmount OR when user has finished typing in toAmount AND is not typing in fromAmount (to preserve user input)
            else if (isFromAmountFocused && !isToAmountFocused && !isUserTypingToAmount.current && !(userFinishedTypingToAmount.current && userInputRef.current !== 'from')) {
                    console.log('🔄 SwapForm: Updating toAmount with calculated value:', calculatedOutputAmount, 'userInputRef:', userInputRef.current);
                    setToAmount(calculatedOutputAmount);
                    isToAmountCalculated.current = true; // Mark as calculated
                    userInputRef.current = null; // Reset after update
            }
            // Update fromAmount when user is typing in toAmount (reverse calculation)
            // Allow reverse calculation when user is actively typing in toAmount field
            else if (isToAmountFocused && !isFromAmountFocused && userInputRef.current === 'to') {
                    console.log('🔄 SwapForm: Updating fromAmount with calculated value (reverse):', calculatedOutputAmount);
                    setFromAmount(calculatedOutputAmount);
                    userInputRef.current = null; // Reset after update
                }
            // Special case: Update toAmount when restoring default values (neither field focused, fromAmount is '1', toAmount is empty, and userInputRef is 'from')
            else if (!isFromAmountFocused && !isToAmountFocused && fromAmount === '1' && toAmount === '' && userInputRef.current === 'from') {
                console.log('🔄 SwapForm: Updating toAmount with calculated value (restoring defaults):', calculatedOutputAmount);
                setToAmount(calculatedOutputAmount);
                isToAmountCalculated.current = true; // Mark as calculated
                userInputRef.current = null; // Reset after update
            }
            // Special case: Update toAmount when user has finished typing in send field and neither field is focused
            else if (!isFromAmountFocused && !isToAmountFocused && userInputRef.current === 'from' && fromAmount && parseFloat(fromAmount) > 0) {
                console.log('🔄 SwapForm: Updating toAmount with calculated value (after user input):', calculatedOutputAmount);
                setToAmount(calculatedOutputAmount);
                isToAmountCalculated.current = true; // Mark as calculated
                userInputRef.current = null; // Reset after update
            }
            else {
                console.log('🔄 SwapForm: No update condition met, skipping update');
            }
        }
    }, [calculatedOutputAmount, isFromAmountFocused, isToAmountFocused, isCalculating, fromAmount, toAmount]);

    // Additional effect to ensure calculated values are preserved
    useEffect(() => {
        // Don't interfere when get field is empty and we want to show 0 in send field
        if (fromAmount === '0' && toAmount === '' && isToAmountFocused) {
            console.log('🔄 SwapForm: Additional effect - skipping update when showing 0 in send field for empty get field');
            return;
        }
        
        // Don't interfere when send field is empty and focused - we want to show 0 in get field
        if (isFromAmountFocused && !isToAmountFocused && (fromAmount === '' || fromAmount === '0' || parseFloat(fromAmount) === 0)) {
            console.log('🔄 SwapForm: Additional effect - skipping update when send field is empty/focused, should show 0 in get field');
            return;
        }
        
        if (calculatedOutputAmount && parseFloat(calculatedOutputAmount) > 0 && userInputRef.current === 'from' && !isUserTypingToAmount.current && !(userFinishedTypingToAmount.current && userInputRef.current !== 'from')) {
            console.log('🔄 SwapForm: Ensuring calculated value is set:', calculatedOutputAmount);
            setToAmount(calculatedOutputAmount);
            isToAmountCalculated.current = true;
        }
    }, [calculatedOutputAmount, fromAmount, toAmount, isToAmountFocused, isFromAmountFocused]);

    // Fallback effect to ensure toAmount is updated when user types in fromAmount
    useEffect(() => {
        // Don't interfere when user is actively typing in toAmount field
        if (isUserTypingToAmount.current) {
            return;
        }
        
        // Don't interfere when get field is empty and we want to show 0 in send field
        if (fromAmount === '0' && toAmount === '' && isToAmountFocused) {
            console.log('🔄 SwapForm: Fallback - skipping update when showing 0 in send field for empty get field');
            return;
        }
        
        // Don't interfere when send field is empty and focused - we want to show 0 in get field
        if (isFromAmountFocused && !isToAmountFocused && (fromAmount === '' || fromAmount === '0' || parseFloat(fromAmount) === 0)) {
            console.log('🔄 SwapForm: Fallback - skipping update when send field is empty/focused, should show 0 in get field');
            return;
        }
        
        if (calculatedOutputAmount && parseFloat(calculatedOutputAmount) > 0 && fromAmount && parseFloat(fromAmount) > 0 && !isToAmountFocused && !isUserTypingToAmount.current && !(userFinishedTypingToAmount.current && userInputRef.current !== 'from')) {
            console.log('🔄 SwapForm: Fallback - updating toAmount with calculated value:', calculatedOutputAmount);
            setToAmount(calculatedOutputAmount);
            isToAmountCalculated.current = true;
        }
    }, [calculatedOutputAmount, fromAmount, toAmount, isToAmountFocused, isFromAmountFocused]);

    // Handle zero/empty inputs - show 0 in opposite field when focusing empty field
    useEffect(() => {
        console.log('🔄 SwapForm: Zero handling effect triggered:', {
            fromAmount,
            toAmount,
            isFromAmountFocused,
            isToAmountFocused,
            isCalculating,
            isUserTyping: isUserTyping.current,
            hasUserEnteredCustomValue: hasUserEnteredCustomValue.current
        });
        
        // Don't interfere during calculations
        if (isCalculating) {
            console.log('🔄 SwapForm: Skipping zero handling - calculation in progress');
            return;
        }
        
        // Don't interfere when user is actively typing
        if (isUserTyping.current) {
            console.log('🔄 SwapForm: Skipping zero handling - user is typing');
            return;
        }
        
        // Don't interfere if user has entered a custom value
        if (hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Skipping zero handling - user has entered custom value');
            return;
        }
        
        // Don't interfere when we're in the process of restoring default behavior
        // (when fromAmount is being set to '1' and toAmount is empty)
        if (fromAmount === '1' && toAmount === '' && isToAmountFocused) {
            console.log('🔄 SwapForm: Skipping zero handling - restoring default behavior');
            return;
        }
        
        // Don't interfere when get field is empty and we want to show 0 in send field
        // But only if we're not in the process of setting it to 0
        if (fromAmount === '0' && toAmount === '' && isToAmountFocused && !isUserTypingToAmount.current) {
            console.log('🔄 SwapForm: Skipping zero handling - showing 0 in send field for empty get field');
            return;
        }
        
        // When user is focused on fromAmount and it's empty or 0
        if (isFromAmountFocused && !isToAmountFocused) {
            // Show 0 in get field when send field is empty/zero
            if (fromAmount === '' || fromAmount === '0' || parseFloat(fromAmount) === 0) {
                console.log('🔄 SwapForm: fromAmount is empty/zero while focused, setting toAmount to 0');
                setToAmount('0');
                // Reset the custom value flag to ensure zero handling works
                hasUserEnteredCustomValue.current = false;
            }
        }
        // When user is focused on toAmount and it's empty or 0
        else if (isToAmountFocused && !isFromAmountFocused) {
            // Show 0 in send field when get field is empty/zero
            if (toAmount === '' || toAmount === '0' || parseFloat(toAmount) === 0) {
                console.log('🔄 SwapForm: toAmount is empty/zero while focused, setting fromAmount to 0');
                setFromAmount('0');
            }
        }
    }, [fromAmount, toAmount, isFromAmountFocused, isToAmountFocused, isCalculating]);

    // Track when user is actively typing to prevent zero handling from interfering
    const isUserTyping = useRef(false);
    const lastFromAmount = useRef<string>('');
    const lastToAmount = useRef<string>('');
    const userFinishedTypingToAmount = useRef(false); // Track when user has finished typing in toAmount field
    
    useEffect(() => {
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
        // Detect when user starts typing a valid number in toAmount
        if (userInputRef.current === 'to' && toAmount && parseFloat(toAmount) > 0) {
            isUserTypingToAmount.current = true;
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
            isUserTypingToAmount.current = false;
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
                isUserTypingToAmount.current = false;
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
        if (needsFromDefault && defaultTon && (!selectedFromToken || !selectedFromToken.symbol)) {
            console.log('🔄 SwapForm: Setting default from token (TON) from API - no token in localStorage');
            setSelectedFromToken({
                symbol: defaultTon.symbol,
                name: defaultTon.name,
                image_url: defaultTon.image_url,
                address: defaultTon.address
            });
        }
        if (needsToDefault && (!selectedToToken || !selectedToToken.symbol)) {
            // Smart default: if fromToken is USDT, set TON as toToken, otherwise set USDT
            const isFromTokenUsdt = selectedFromToken && selectedFromToken.symbol === 'USDT';
            const defaultToToken = isFromTokenUsdt ? defaultTon : defaultUsdt;
            
            if (defaultToToken) {
                console.log(`🔄 SwapForm: Setting default to token (${defaultToToken.symbol}) from API - no token in localStorage`);
                setSelectedToToken({
                    symbol: defaultToToken.symbol,
                    name: defaultToToken.name,
                    image_url: defaultToToken.image_url,
                    address: defaultToToken.address
                });
            }
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
        
        setIsFromAmountFocused(isFocused);
        // Unfocus the other input when this one is focused
        if (isFocused) {
            console.log('🟦 FROM input focused - attempting to blur TO input');
            setIsToAmountFocused(false);
            // Blur the other input in the DOM
            if (toAmountRef.current) {
                console.log('🟦 Calling toAmountRef.current.blur()');
                toAmountRef.current.blur();
            } else {
                console.log('🟦 toAmountRef.current is null!');
            }
        }
        setInputFocused(isFocused || isToAmountFocused);
        
        // Send field mechanics: Only clear if it's the default value (1) AND not a user-entered value
        if (isFocused && fromAmount === '1' && isFromAmountDefault.current && !hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Clearing fromAmount default value (1) on focus for user input');
            setFromAmount('');
            isFromAmountDefault.current = false; // Mark as no longer default
        }
        // Send field mechanics: Reset to default value (1) when unfocusing and empty
        else if (!isFocused && fromAmount === '') {
            console.log('🔄 SwapForm: Restoring fromAmount default value (1) on unfocus');
            setFromAmount('1');
            // Reset the custom value flag since we're back to default
            hasUserEnteredCustomValue.current = false;
            // Mark as default value so it can be cleared on focus
            isFromAmountDefault.current = true;
            // Trigger calculation when setting default value
            userInputRef.current = 'from';
        }
    }, [setInputFocused, fromAmount, isToAmountFocused]);

    const handleFromAmountChange = useCallback((value: string) => {
        console.log('🔄 SwapForm: fromAmount changed to:', value);
        userInputRef.current = 'from';
        setFromAmount(value);
        userFinishedTypingToAmount.current = false; // Reset finished typing flag when user starts typing in fromAmount
        
        // If user completely erases the field (empty string), just leave it empty
        // The restoration to default (1) will happen in handleFocusChange when unfocusing
        if (value === '') {
            console.log('🔄 SwapForm: User completely erased fromAmount, leaving empty for now');
            // Don't immediately restore to default - let it stay empty
            // The restoration will happen on unfocus in handleFocusChange
            // Reset the custom value flag to allow zero handling to work
            hasUserEnteredCustomValue.current = false;
        } else {
            // Mark as no longer default when user types
            isFromAmountDefault.current = false;
            // Only mark as custom value when user enters a non-empty value
            hasUserEnteredCustomValue.current = true;
        }
    }, []);

    const handleToAmountFocusChange = useCallback((isFocused: boolean) => {
        console.log('🟨 TO input focus change:', isFocused);
        console.log('🟨 Current fromAmount focused state:', isFromAmountFocused);
        console.log('🟨 fromAmountRef.current:', fromAmountRef.current);
        
        setIsToAmountFocused(isFocused);
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
        
        // Get field mechanics: Clear calculated value on focus and set send field to 0
        // Only clear if it's a calculated value AND user hasn't entered a custom value
        if (isFocused && isToAmountCalculated.current && !isUserTyping.current && !isUserTypingToAmount.current && !hasUserEnteredCustomValue.current) {
            console.log('🔄 SwapForm: Clearing toAmount calculated value on focus for user input');
            setToAmount('');
            setFromAmount('0'); // Set send field to 0 when focusing get field with calculated value
            isToAmountCalculated.current = false;
            // Reset the custom value flag to allow zero handling to work
            hasUserEnteredCustomValue.current = false;
        }
        // Also clear if the get field has a value but user hasn't entered custom value (for initial calculated values)
        else if (isFocused && toAmount && parseFloat(toAmount) > 0 && !isUserTyping.current && !isUserTypingToAmount.current && !hasUserEnteredCustomValue.current && !isToAmountCalculated.current) {
            console.log('🔄 SwapForm: Clearing toAmount initial calculated value on focus for user input');
            setToAmount('');
            setFromAmount('0'); // Set send field to 0 when focusing get field with calculated value
            isToAmountCalculated.current = false;
            // Reset the custom value flag to allow zero handling to work
            hasUserEnteredCustomValue.current = false;
        }
        // Get field mechanics: Restore default values when unfocusing and empty
        else if (!isFocused && toAmount === '') {
            console.log('🔄 SwapForm: Restoring default values on unfocus (get field empty)');
            // Reset the finished typing flag to allow calculations
            userFinishedTypingToAmount.current = false;
            // Set send field to default value (1) when get field is empty and unfocused
                setFromAmount('1');
            // Reset the custom value flag since we're back to default
            hasUserEnteredCustomValue.current = false;
            // Mark that toAmount will be calculated (so it can be cleared on focus)
            isToAmountCalculated.current = true;
            // Mark that fromAmount is default value (so it can be cleared on focus)
            isFromAmountDefault.current = true;
            // Trigger calculation by setting userInputRef to 'from' - this will trigger the calculation effect
            userInputRef.current = 'from';
        }
        // Reset the finished typing flag when unfocusing toAmount field (regardless of content)
        else if (!isFocused) {
            console.log('🔄 SwapForm: Resetting finished typing flag on toAmount unfocus');
            userFinishedTypingToAmount.current = false;
        }
    }, [setInputFocused, isFromAmountFocused, toAmount]);

    const handleToAmountChange = useCallback((value: string) => {
        userInputRef.current = 'to';
        setToAmount(value);
        isToAmountCalculated.current = false; // Reset calculated flag when user types
        userFinishedTypingToAmount.current = false; // Reset finished typing flag when user starts typing again
        
        // If user completely erases the field (empty string), show 0 in send field
        if (value === '') {
            console.log('🔄 SwapForm: User completely erased toAmount, setting send field to 0');
            // Set send field to 0 when get field is empty
            setFromAmount('0');
            // Don't set hasUserEnteredCustomValue to true here - we want zero handling to work
        } else {
            // Only mark as custom value when user enters a non-empty value
            hasUserEnteredCustomValue.current = true;
        }
    }, []);

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
                    <div className='flex flex-row items-center justify-between'>
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
                                            
                                            // Store swapped tokens in localStorage
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
                                        } else {
                                            // Normal selection - just update the from token
                                            setSelectedFromToken(token);
                                            
                                            // Store in localStorage
                                            localStorage.setItem('selectedFromToken', JSON.stringify(token));
                                            
                                            // Dispatch custom event for immediate update
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token, type: 'from' } 
                                            }));
                                            
                                            console.log('✅ SwapForm: Updated fromToken from small icon:', token.symbol);
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
                        />
                        <div 
                            key={`from-token-${selectedFromToken?.address || 'default'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🎯 SwapForm: Token selection clicked!');
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
                            {(() => {
                                const currentToken = selectedFromToken || defaultUsdt;
                                console.log('🔍 SwapForm: FromToken USD calculation:', {
                                    currentToken: currentToken?.symbol,
                                    fromAmount,
                                    hasMarketStats: !!currentToken?.market_stats?.price_usd,
                                    price: currentToken?.market_stats?.price_usd
                                });
                                const usdValue = calculateUSDValue(fromAmount, currentToken);
                                const formattedValue = formatUSDValue(usdValue);
                                return formattedValue || '$0';
                            })()}
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
                                    
                                    // Swap the tokens
                                    setSelectedFromToken(currentToToken);
                                    setSelectedToToken(currentFromToken);
                                    
                                    // Swap the values between fields
                                    setFromAmount(currentToAmount);
                                    setToAmount(currentFromAmount);
                                    
                                    // Update flags to reflect the state
                                    // If the new fromAmount is '1', mark it as default
                                    if (currentToAmount === '1') {
                                        isFromAmountDefault.current = true;
                                        hasUserEnteredCustomValue.current = false;
                                    } else {
                                        isFromAmountDefault.current = false;
                                        hasUserEnteredCustomValue.current = true;
                                    }
                                    
                                    // Mark that toAmount will be calculated
                                    isToAmountCalculated.current = true;
                                    
                                    // Trigger recalculation from the fromAmount field
                                    userInputRef.current = 'from';
                                    
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
                                    console.log('✅ SwapForm: New toToken:', currentFromToken.symbol, 'New toAmount:', currentFromAmount, '(will trigger recalculation)');
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
                                            
                                            // Store swapped tokens in localStorage
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
                                        } else {
                                            // Normal selection - just update the to token
                                            setSelectedToToken(token);
                                            
                                            // Store in localStorage
                                            localStorage.setItem('selectedToToken', JSON.stringify(token));
                                            
                                            // Dispatch custom event for immediate update
                                            window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                                detail: { token, type: 'to' } 
                                            }));
                                            
                                            console.log('✅ SwapForm: Updated toToken from small icon:', token.symbol);
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
                        />
                        <div 
                            key={`to-token-${selectedToToken?.address || 'default'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🎯 SwapForm: To token selection clicked');
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
                            {calculationError ? (
                                <span style={{ color: '#ff6b6b' }}>
                                    {calculationError}
                                </span>
                            ) : isCalculating ? (
                                <span style={{ color: '#1ABCFF' }}>
                                    Calculating...
                                </span>
                            ) : (
                                (() => {
                                    const currentToken = selectedToToken || defaultTon;
                                    console.log('🔍 SwapForm: ToToken USD calculation:', {
                                        currentToken: currentToken?.symbol,
                                        toAmount,
                                        hasMarketStats: !!currentToken?.market_stats?.price_usd,
                                        price: currentToken?.market_stats?.price_usd
                                    });
                                    const usdValue = calculateUSDValue(toAmount, currentToken);
                                    const formattedValue = formatUSDValue(usdValue);
                                    return formattedValue || '$0';
                                })()
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
                        <div className='flex flex-row w-full justify-end' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}