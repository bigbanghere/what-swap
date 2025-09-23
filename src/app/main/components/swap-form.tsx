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

export function SwapForm() {
    const router = useRouter();
    const walletAddress = useTonAddress();
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>('1');
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
        if (needsToDefault && defaultUsdt && (!selectedToToken || !selectedToToken.symbol)) {
            console.log('🔄 SwapForm: Setting default to token (USDT) from API - no token in localStorage');
            setSelectedToToken({
                symbol: defaultUsdt.symbol,
                name: defaultUsdt.name,
                image_url: defaultUsdt.image_url,
                address: defaultUsdt.address
            });
        }
        
    }, [selectedFromToken, selectedToToken, defaultUsdt, defaultTon, defaultTokensLoading]); // Include dependencies but logic prevents infinite loops

    // Function to get prioritized tokens for shortcuts (exclude TON and USDT)
    const getPrioritizedTokens = useCallback((excludeToken: any) => {
        if (!allTokens || allTokens.length === 0) {
            return [];
        }

        // Find TON and USDT tokens from the cache to exclude them
        const tonToken = allTokens.find(token => 
            token.symbol === 'TON' && token.verification === 'WHITELISTED'
        );
        const usdtToken = allTokens.find(token => 
            token.symbol === 'USDT' && token.verification === 'WHITELISTED'
        );

        // Filter out the excluded token, TON, and USDT
        const filteredTokens = allTokens.filter(token => 
            token.address !== excludeToken?.address &&
            token.address !== tonToken?.address &&
            token.address !== usdtToken?.address
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
            .slice(0, 4);

        return sortedTokens.map(token => ({
            symbol: token.symbol,
            image_url: token.image_url,
            address: token.address,
            name: token.name,
            decimals: token.decimals,
            verification: token.verification
        }));
    }, [allTokens]);

    // Function to get top 4 tokens excluding the fromToken
    const getTop4TokensExcludingFrom = useCallback(() => {
        if (!allTokens || allTokens.length === 0) {
            // Return empty array if no tokens are loaded
            return [];
        }

        // Use prioritized tokens (USDT and TON get priority)
        const prioritizedTokens = getPrioritizedTokens(selectedFromToken);
        
        // Return up to 4 tokens
        return prioritizedTokens.slice(0, 4);
    }, [allTokens, selectedFromToken, getPrioritizedTokens]);

    // Function to get top 4 tokens excluding the toToken
    const getTop4TokensExcludingTo = useCallback(() => {
        if (!allTokens || allTokens.length === 0) {
            // Return empty array if no tokens are loaded
            return [];
        }

        // Use prioritized tokens (USDT and TON get priority)
        const prioritizedTokens = getPrioritizedTokens(selectedToToken);
        
        // Return up to 4 tokens
        return prioritizedTokens.slice(0, 4);
    }, [allTokens, selectedToToken, getPrioritizedTokens]);

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
        
        // Clear default value when focusing
        if (isFocused && fromAmount === '1') {
            setFromAmount('');
        }
        // Reset to default value when unfocusing and empty
        else if (!isFocused && fromAmount === '') {
            setFromAmount('1');
        }
    }, [setInputFocused, fromAmount, isToAmountFocused]);

    const handleFromAmountChange = useCallback((value: string) => {
        setFromAmount(value);
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
        
        // Clear default value when focusing
        if (isFocused && toAmount === '1') {
            setToAmount('');
        }
        // Reset to default value when unfocusing and empty
        else if (!isFocused && toAmount === '') {
            setToAmount('1');
        }
    }, [setInputFocused, toAmount, isFromAmountFocused]);

    const handleToAmountChange = useCallback((value: string) => {
        setToAmount(value);
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
                            {getTop4TokensExcludingFrom().map((token, index) => (
                                <div
                                    key={`from-token-${index}-${token.symbol}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🎯 SwapForm: Small token icon clicked for fromToken:', token.symbol);
                                        
                                        // Update the selected from token
                                        setSelectedFromToken(token);
                                        
                                        // Store in localStorage
                                        localStorage.setItem('selectedFromToken', JSON.stringify(token));
                                        
                                        // Dispatch custom event for immediate update
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                            detail: { token, type: 'from' } 
                                        }));
                                        
                                        console.log('✅ SwapForm: Updated fromToken from small icon:', token.symbol);
                                    }}
                                    className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF] hover:bg-blue-50 transition-colors cursor-pointer'
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
                            className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[#1ABCFF] rounded-[15px] hover:bg-blue-50 transition-colors cursor-pointer select-none'
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
                            $1
                        </div>
                        {walletAddress ? <div className='flex flex-row gap-[5px]'>
                            <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                            <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>1111.00 {selectedFromToken?.symbol || defaultUsdt?.symbol}</span>
                        </div> : null}
                        <div className='flex flex-row w-full justify-end' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-[5px] mt-[5px] mb-[5px]'>
                        <div className='h-[1px] w-full bg-[#1ABCFF]'></div>
                        <div className='w-[30px] h-[30px] flex items-center justify-center'>
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
                            {getTop4TokensExcludingTo().map((token, index) => (
                                <div
                                    key={`to-token-${index}-${token.symbol}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🎯 SwapForm: Small token icon clicked for toToken:', token.symbol);
                                        
                                        // Update the selected to token
                                        setSelectedToToken(token);
                                        
                                        // Store in localStorage
                                        localStorage.setItem('selectedToToken', JSON.stringify(token));
                                        
                                        // Dispatch custom event for immediate update
                                        window.dispatchEvent(new CustomEvent('tokenSelected', { 
                                            detail: { token, type: 'to' } 
                                        }));
                                        
                                        console.log('✅ SwapForm: Updated toToken from small icon:', token.symbol);
                                    }}
                                    className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF] hover:bg-blue-50 transition-colors cursor-pointer'
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
                            className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[#1ABCFF] rounded-[15px] hover:bg-blue-50 transition-colors cursor-pointer select-none'
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
                            $1
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
                                <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>576.00 TON</span> 
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