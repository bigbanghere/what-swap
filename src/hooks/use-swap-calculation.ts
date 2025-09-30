"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiTokenAddress, RoutingApi } from '@swap-coffee/sdk';

interface SwapCalculationResult {
    outputAmount: string | null;
    calcKey: string | null;
    isLoading: boolean;
    error: string | null;
}

interface UseSwapCalculationProps {
    fromToken: any;
    toToken: any;
    fromAmount: string;
    toAmount: string;
    isFromAmountFocused: boolean;
    isToAmountFocused: boolean;
    hasUserEnteredCustomValue: boolean;
    isUserTypingToAmount?: boolean;
    userInputRef?: string | null;
}

export function useSwapCalculation({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    isFromAmountFocused,
    isToAmountFocused,
    hasUserEnteredCustomValue,
    isUserTypingToAmount = false,
    userInputRef = null
}: UseSwapCalculationProps) {
    const [result, setResult] = useState<SwapCalculationResult>({
        outputAmount: null,
        calcKey: null,
        isLoading: false,
        error: null
    });

        const calculationInProgress = useRef(false);
        const lastCalculationRef = useRef<string>('');
        const routingApi = useRef(new RoutingApi());

    // Convert token to ApiTokenAddress format
    const convertToApiTokenAddress = useCallback((token: any): ApiTokenAddress => {
        if (!token) {
            throw new Error('Token is required');
        }

        // Handle native TON
        if (token.symbol === 'TON' || token.address === 'native') {
            return {
                blockchain: "ton",
                address: "native"
            };
        }

        // Handle other tokens
        return {
            blockchain: "ton",
            address: token.address
        };
    }, []);


    // Calculate swap output
    const calculateSwap = useCallback(async (inputToken: any, outputToken: any, inputAmount: string) => {
        if (!inputToken || !outputToken || !inputAmount || parseFloat(inputAmount) <= 0) {
            return null;
        }

        // Create a unique key for this calculation
        const calculationKey = `${inputToken.address}-${outputToken.address}-${inputAmount}`;
        
        // Prevent duplicate calculations of the SAME key while that same calculation is in flight
        if (calculationInProgress.current && lastCalculationRef.current === calculationKey) {
            console.log('🔄 Swap calculation: Skipping duplicate calculation', calculationKey);
            return null;
        }

        console.log('🔄 Swap calculation: Starting new calculation', {
            calculationKey,
            inputToken: inputToken.symbol,
            outputToken: outputToken.symbol,
            amount: inputAmount
        });

        calculationInProgress.current = true;
        lastCalculationRef.current = calculationKey;

        try {
            setResult(prev => ({ ...prev, isLoading: true, error: null }));

            const assetIn = convertToApiTokenAddress(inputToken);
            const assetOut = convertToApiTokenAddress(outputToken);
            const amount = parseFloat(inputAmount);

            console.log('🔄 Swap calculation: Using API for calculation', {
                from: assetIn,
                to: assetOut,
                amount,
                inputToken: inputToken.symbol,
                outputToken: outputToken.symbol,
                isReverseCalculation: userInputRef === 'to',
                fullInputToken: inputToken,
                fullOutputToken: outputToken,
                apiCall: {
                    input_token: assetIn,
                    output_token: assetOut,
                    input_amount: amount
                },
                question: userInputRef === 'to' ? 
                    `How much ${inputToken.symbol} needed to get ${amount} ${outputToken.symbol}?` :
                    `How much ${outputToken.symbol} do I get for ${amount} ${inputToken.symbol}?`
            });

            // Use SDK directly to build route
            const route = await routingApi.current.buildRoute({
                input_token: assetIn,
                output_token: assetOut,
                input_amount: amount,
            });

            console.log('🔄 Swap calculation: API response received', {
                hasData: !!route.data,
                outputAmount: route.data?.output_amount,
                routeData: route.data
            });

            if (route.data) {
                // Get the expected output amount from the route data
                const outputAmount = route.data.output_amount;

                if (outputAmount) {
                    // The API already returns the value in the correct units, no conversion needed
                    const formattedAmount = outputAmount.toFixed(6);
                    console.log('✅ Swap calculation result:', formattedAmount);
                    return { amount: formattedAmount, key: calculationKey } as const;
                }
            }

            console.warn('⚠️ No valid route found');
            return null;
        } catch (error) {
            console.error('❌ Swap calculation error:', error);
            
            // Handle different types of errors
            let errorMessage = 'Calculation failed';
            if (error instanceof Error) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Network error: Unable to connect to swap.coffee API. Please check your internet connection.';
                } else if (error.message.includes('CORS')) {
                    errorMessage = 'CORS error: The swap.coffee API is blocking requests from this domain.';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Failed to fetch: Unable to reach the swap.coffee API. Please check your internet connection.';
                } else {
                    errorMessage = `API Error: ${error.message}`;
                }
            }
            
            console.error('❌ Swap calculation failed, no fallback used:', errorMessage);
            setResult(prev => ({ 
                ...prev, 
                error: errorMessage
            }));
            return null;
        } finally {
            setResult(prev => ({ ...prev, isLoading: false }));
            calculationInProgress.current = false;
            // Clear the last calculation reference so we can retry if needed
            lastCalculationRef.current = '';
        }
    }, [convertToApiTokenAddress]);

    // Clear stale result whenever inputs or direction change to avoid applying outdated values
    useEffect(() => {
        setResult(prev => ({ ...prev, outputAmount: null, calcKey: null }));
        // also reset duplicate suppression so next calc isn't skipped
        lastCalculationRef.current = '';
    }, [fromAmount, toAmount, fromToken?.address, toToken?.address, isFromAmountFocused, isToAmountFocused, isUserTypingToAmount, userInputRef]);

    // Calculate when fromAmount changes (forward calculation: fromAmount -> toAmount)
    useEffect(() => {
        if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0 && userInputRef !== 'to') {
            console.log('🔄 Swap calculation: fromAmount changed (forward), calculating...', {
                fromAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                isFromAmountFocused,
                isToAmountFocused
            });
            calculateSwap(fromToken, toToken, fromAmount).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${fromAmount}`;
                    if (payload.key === expectedKey) {
                        console.log('✅ Swap calculation: got forward output amount', payload.amount);
                        setResult(prev => ({ ...prev, outputAmount: payload.amount, calcKey: payload.key }));
                    } else {
                        console.log('⚠️ Ignoring stale forward result. expected:', expectedKey, 'got:', payload.key);
                    }
                }
            });
        }
    }, [fromAmount, fromToken?.address, toToken?.address, calculateSwap, userInputRef]);

    // Calculate when toAmount changes (reverse calculation: toAmount -> fromAmount)
    // Only calculate when user is actively focused on toAmount field AND not during a forward calculation
    // Allow reverse calculation when user is actively typing in toAmount field
    // Also allow reverse calculation when triggered by rotation (userInputRef === 'to')
    useEffect(() => {
        if (toAmount && fromToken && toToken && parseFloat(toAmount) > 0 && !isFromAmountFocused && 
            ((isToAmountFocused && isUserTypingToAmount) || userInputRef === 'to')) {
            console.log('🔄 Swap calculation: toAmount changed (reverse), calculating...', {
                toAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                isToAmountFocused,
                isUserTypingToAmount,
                userInputRef
            });
            calculateSwap(toToken, fromToken, toAmount).then(payload => {
                if (payload) {
                    const expectedKey = `${toToken.address}-${fromToken.address}-${toAmount}`;
                    if (payload.key === expectedKey) {
                        console.log('✅ Swap calculation: got reverse output amount', payload.amount);
                        setResult(prev => ({ ...prev, outputAmount: payload.amount, calcKey: payload.key }));
                    } else {
                        console.log('⚠️ Ignoring stale reverse result. expected:', expectedKey, 'got:', payload.key);
                    }
                }
            });
        }
    }, [toAmount, fromToken?.address, toToken?.address, calculateSwap, isToAmountFocused, isFromAmountFocused, isUserTypingToAmount, userInputRef]);

    // Initial calculation when tokens are loaded and fromAmount has a value
    useEffect(() => {
        if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0 && userInputRef !== 'to') {
            console.log('🔄 Swap calculation: initial calculation when tokens loaded', {
                fromAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol
            });
            calculateSwap(fromToken, toToken, fromAmount).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${fromAmount}`;
                    if (payload.key === expectedKey) {
                        console.log('✅ Swap calculation: got initial output amount', payload.amount);
                        setResult(prev => ({ ...prev, outputAmount: payload.amount, calcKey: payload.key }));
                    } else {
                        console.log('⚠️ Ignoring stale initial result. expected:', expectedKey, 'got:', payload.key);
                    }
                }
            });
        }
    }, [fromToken?.address, toToken?.address, calculateSwap, fromAmount, userInputRef]);

    return result;
}