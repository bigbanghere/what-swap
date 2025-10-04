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
    const calculateSwap = useCallback(async (inputToken: any, outputToken: any, amount: string, isReverseCalculation: boolean = false) => {
        if (!inputToken || !outputToken || !amount || parseFloat(amount) <= 0) {
            return null;
        }

        // Create a unique key for this calculation
        const calculationKey = `${inputToken.address}-${outputToken.address}-${amount}-${isReverseCalculation ? 'reverse' : 'forward'}`;
        
        // Prevent duplicate calculations of the SAME key while that same calculation is in flight
        if (calculationInProgress.current && lastCalculationRef.current === calculationKey) {
            console.log('🔄 Swap calculation: Skipping duplicate calculation', calculationKey);
            return null;
        }

        console.log('🔄 Swap calculation: Starting new calculation', {
            calculationKey,
            inputToken: inputToken.symbol,
            outputToken: outputToken.symbol,
            amount,
            isReverseCalculation
        });

        calculationInProgress.current = true;
        lastCalculationRef.current = calculationKey;

        try {
            setResult(prev => ({ ...prev, isLoading: true, error: null }));

            const assetIn = convertToApiTokenAddress(inputToken);
            const assetOut = convertToApiTokenAddress(outputToken);
            const amountValue = parseFloat(amount);

            console.log('🔄 Swap calculation: Using API for calculation', {
                from: assetIn,
                to: assetOut,
                amount: amountValue,
                inputToken: inputToken.symbol,
                outputToken: outputToken.symbol,
                isReverseCalculation,
                fullInputToken: inputToken,
                fullOutputToken: outputToken,
                apiCall: isReverseCalculation ? {
                    input_token: assetIn,
                    output_token: assetOut,
                    output_amount: amountValue
                } : {
                    input_token: assetIn,
                    output_token: assetOut,
                    input_amount: amountValue
                },
                question: isReverseCalculation ? 
                    `How much ${inputToken.symbol} needed to get ${amountValue} ${outputToken.symbol}?` :
                    `How much ${outputToken.symbol} do I get for ${amountValue} ${inputToken.symbol}?`
            });

            // Use SDK directly to build route with appropriate parameter
            const route = await routingApi.current.buildRoute(
                isReverseCalculation ? {
                    input_token: assetIn,
                    output_token: assetOut,
                    output_amount: amountValue,
                } : {
                    input_token: assetIn,
                    output_token: assetOut,
                    input_amount: amountValue,
                }
            );

            console.log('🔄 Swap calculation: API response received', {
                hasData: !!route.data,
                inputAmount: route.data?.input_amount,
                outputAmount: route.data?.output_amount,
                routeData: route.data
            });

            if (route.data) {
                // For reverse calculations, we want the input_amount (how much to send)
                // For forward calculations, we want the output_amount (how much to receive)
                const resultAmount = isReverseCalculation ? route.data.input_amount : route.data.output_amount;

                if (resultAmount && resultAmount > 0) {
                    // The API already returns the value in the correct units, no conversion needed
                    const formattedAmount = resultAmount.toFixed(6);
                    console.log('✅ Swap calculation result:', formattedAmount);
                    return { amount: formattedAmount, key: calculationKey } as const;
                } else if (resultAmount === 0) {
                    // API returned 0, which indicates no liquidity pools available
                    console.warn('⚠️ API returned 0 - no liquidity pools available for this amount');
                    setResult(prev => ({ 
                        ...prev, 
                        error: 'No liquidity pools available for this amount',
                        outputAmount: null,
                        calcKey: calculationKey
                    }));
                    return null;
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
        console.log('🔄 Swap calculation: Dependencies changed, clearing stale result', {
            fromAmount,
            toAmount,
            fromTokenAddress: fromToken?.address,
            toTokenAddress: toToken?.address,
            isFromAmountFocused,
            isToAmountFocused,
            isUserTypingToAmount,
            userInputRef
        });
        setResult(prev => ({ ...prev, outputAmount: null, calcKey: null }));
        // also reset duplicate suppression so next calc isn't skipped
        lastCalculationRef.current = '';
    }, [fromAmount, toAmount, fromToken?.address, toToken?.address, isFromAmountFocused, isToAmountFocused, isUserTypingToAmount, userInputRef]);

    // Calculate when fromAmount changes (forward calculation: fromAmount -> toAmount)
    useEffect(() => {
        console.log('🔄 Swap calculation: Forward calculation effect triggered', {
            fromAmount,
            fromToken: fromToken?.symbol,
            toToken: toToken?.symbol,
            fromTokenAddress: fromToken?.address,
            toTokenAddress: toToken?.address,
            parseFloatFromAmount: fromAmount ? parseFloat(fromAmount) : 0,
            userInputRef,
            shouldCalculate: fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0 && userInputRef !== 'to'
        });
        
        if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0 && userInputRef !== 'to') {
            console.log('🔄 Swap calculation: fromAmount changed (forward), calculating...', {
                fromAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                isFromAmountFocused,
                isToAmountFocused
            });
            calculateSwap(fromToken, toToken, fromAmount, false).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${fromAmount}-forward`;
                    if (payload.key === expectedKey) {
                        console.log('✅ Swap calculation: got forward output amount', payload.amount);
                        setResult(prev => ({ ...prev, outputAmount: payload.amount, calcKey: payload.key }));
                    } else {
                        console.log('⚠️ Ignoring stale forward result. expected:', expectedKey, 'got:', payload.key);
                    }
                }
            });
        } else {
            console.log('⚠️ Swap calculation: Not calculating - missing requirements', {
                hasFromAmount: !!fromAmount,
                hasFromToken: !!fromToken,
                hasToToken: !!toToken,
                fromAmountValid: fromAmount ? parseFloat(fromAmount) > 0 : false,
                userInputRefNotTo: userInputRef !== 'to'
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
            calculateSwap(fromToken, toToken, toAmount, true).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${toAmount}-reverse`;
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
            calculateSwap(fromToken, toToken, fromAmount, false).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${fromAmount}-forward`;
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

    // Handle token changes - trigger reverse calculation when fromToken changes and we have toAmount
    useEffect(() => {
        if (fromToken && toToken && toAmount && parseFloat(toAmount) > 0 && userInputRef === 'to') {
            console.log('🔄 Swap calculation: fromToken changed, triggering reverse calculation', {
                toAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                userInputRef
            });
            calculateSwap(fromToken, toToken, toAmount, true).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${toAmount}-reverse`;
                    if (payload.key === expectedKey) {
                        console.log('✅ Swap calculation: got reverse output amount for token change', payload.amount);
                        setResult(prev => ({ ...prev, outputAmount: payload.amount, calcKey: payload.key }));
                    } else {
                        console.log('⚠️ Ignoring stale token change result. expected:', expectedKey, 'got:', payload.key);
                    }
                }
            });
        }
    }, [fromToken?.address, calculateSwap, toAmount, toToken?.address, userInputRef]);

    // Handle toToken changes - trigger reverse calculation when toToken changes and we have toAmount
    useEffect(() => {
        if (fromToken && toToken && toAmount && parseFloat(toAmount) > 0 && userInputRef === 'to') {
            console.log('🔄 Swap calculation: toToken changed, triggering reverse calculation', {
                toAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                userInputRef
            });
            calculateSwap(fromToken, toToken, toAmount, true).then(payload => {
                if (payload) {
                    const expectedKey = `${fromToken.address}-${toToken.address}-${toAmount}-reverse`;
                    if (payload.key === expectedKey) {
                        console.log('✅ Swap calculation: got reverse output amount for toToken change', payload.amount);
                        setResult(prev => ({ ...prev, outputAmount: payload.amount, calcKey: payload.key }));
                    } else {
                        console.log('⚠️ Ignoring stale toToken change result. expected:', expectedKey, 'got:', payload.key);
                    }
                }
            });
        }
    }, [toToken?.address, calculateSwap, toAmount, fromToken?.address, userInputRef]);

    return result;
}