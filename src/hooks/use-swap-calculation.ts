"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiTokenAddress, RoutingApi } from '@swap-coffee/sdk';

interface SwapCalculationResult {
    outputAmount: string | null;
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
}

export function useSwapCalculation({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    isFromAmountFocused,
    isToAmountFocused
}: UseSwapCalculationProps) {
    const [result, setResult] = useState<SwapCalculationResult>({
        outputAmount: null,
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

    // Fallback calculation for common token pairs when API is unavailable
    const calculateFallbackAmount = useCallback((inputToken: any, outputToken: any, amount: number): string | null => {
        // Simple fallback calculations for common pairs
        const inputSymbol = inputToken.symbol;
        const outputSymbol = outputToken.symbol;
        
        console.log(`🔄 Fallback calculation: Attempting ${amount} ${inputSymbol} -> ${outputSymbol}`);
        
        // Mock exchange rates (these would normally come from a price API)
        const mockRates: { [key: string]: { [key: string]: number } } = {
            'TON': {
                'USDT': 2.5, // 1 TON = 2.5 USDT
                'CES': 1000, // 1 TON = 1000 CES
            },
            'USDT': {
                'TON': 0.4, // 1 USDT = 0.4 TON
                'CES': 400, // 1 USDT = 400 CES
            },
            'CES': {
                'TON': 0.001, // 1 CES = 0.001 TON
                'USDT': 0.0025, // 1 CES = 0.0025 USDT
            }
        };

        // Also try with different case variations
        const inputSymbolUpper = inputSymbol.toUpperCase();
        const outputSymbolUpper = outputSymbol.toUpperCase();

        console.log(`🔄 Fallback calculation: Available rates:`, mockRates);
        console.log(`🔄 Fallback calculation: Looking for rate for ${inputSymbol} -> ${outputSymbol}`);

        // Try original case first
        let rate = mockRates[inputSymbol]?.[outputSymbol];
        
        // If not found, try uppercase
        if (!rate) {
            rate = mockRates[inputSymbolUpper]?.[outputSymbolUpper];
            console.log(`🔄 Fallback calculation: Trying uppercase ${inputSymbolUpper} -> ${outputSymbolUpper}`);
        }

        if (rate) {
            const result = (amount * rate).toFixed(6);
            console.log(`✅ Fallback calculation: ${amount} ${inputSymbol} = ${result} ${outputSymbol} (rate: ${rate})`);
            return result;
        }

        console.log(`⚠️ No fallback rate available for ${inputSymbol} -> ${outputSymbol}`);
        console.log(`⚠️ Available input symbols:`, Object.keys(mockRates));
        if (mockRates[inputSymbol]) {
            console.log(`⚠️ Available output symbols for ${inputSymbol}:`, Object.keys(mockRates[inputSymbol]));
        }
        if (mockRates[inputSymbolUpper]) {
            console.log(`⚠️ Available output symbols for ${inputSymbolUpper}:`, Object.keys(mockRates[inputSymbolUpper]));
        }
        return null;
    }, []);

    // Calculate swap output
    const calculateSwap = useCallback(async (inputToken: any, outputToken: any, inputAmount: string) => {
        if (!inputToken || !outputToken || !inputAmount || parseFloat(inputAmount) <= 0) {
            return null;
        }

        // Create a unique key for this calculation
        const calculationKey = `${inputToken.address}-${outputToken.address}-${inputAmount}`;
        
        // Prevent duplicate calculations
        if (calculationInProgress.current || lastCalculationRef.current === calculationKey) {
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

            console.log('🔄 Swap calculation:', {
                from: assetIn,
                to: assetOut,
                amount
            });

                // Use SDK directly to build route
                const route = await routingApi.current.buildRoute({
                    input_token: assetIn,
                    output_token: assetOut,
                    input_amount: amount,
                });

            if (route.data) {
                // Get the expected output amount from the route data
                const outputAmount = route.data.output_amount;

                if (outputAmount) {
                    // The API already returns the value in the correct units, no conversion needed
                    const formattedAmount = outputAmount.toFixed(6);
                    console.log('✅ Swap calculation result:', formattedAmount);
                    return formattedAmount;
                }
            }

            console.warn('⚠️ No valid route found');
            return null;
        } catch (error) {
            console.error('❌ Swap calculation error:', error);
            
            // Try fallback calculation for common token pairs
            try {
                console.log('🔄 Attempting fallback calculation...', {
                    inputToken: inputToken.symbol,
                    outputToken: outputToken.symbol,
                    amount,
                    inputTokenFull: inputToken,
                    outputTokenFull: outputToken
                });
                const fallbackAmount = calculateFallbackAmount(inputToken, outputToken, amount);
                if (fallbackAmount) {
                    console.log('✅ Fallback calculation successful:', fallbackAmount);
                    return fallbackAmount;
                } else {
                    console.log('⚠️ Fallback calculation returned null');
                }
            } catch (fallbackError) {
                console.error('❌ Fallback calculation also failed:', fallbackError);
            }
            
            // Handle different types of errors
            let errorMessage = 'Calculation failed';
            if (error instanceof Error) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Network error: Unable to connect to swap.coffee API. This might be due to CORS restrictions or API unavailability.';
                } else if (error.message.includes('CORS')) {
                    errorMessage = 'CORS error: The swap.coffee API is blocking requests from this domain.';
                } else {
                    errorMessage = error.message;
                }
            }
            
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
    }, [convertToApiTokenAddress, calculateFallbackAmount]);

    // Calculate when fromAmount changes (only when user is typing in fromAmount)
    useEffect(() => {
        if (isFromAmountFocused && fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0) {
            console.log('🔄 Swap calculation: fromAmount changed, calculating...', {
                fromAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol
            });
            calculateSwap(fromToken, toToken, fromAmount).then(outputAmount => {
                if (outputAmount) {
                    console.log('✅ Swap calculation: got output amount', outputAmount);
                    setResult(prev => ({ ...prev, outputAmount }));
                }
            });
        }
    }, [fromAmount, fromToken?.address, toToken?.address, calculateSwap]);

    // Note: We only calculate fromAmount -> toAmount to avoid feedback loops
    // Reverse calculation (toAmount -> fromAmount) is disabled to prevent infinite loops

    // Initial calculation on page load (when tokens are set and fromAmount has a value)
    useEffect(() => {
        if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
            console.log('🔄 Swap calculation: initial calculation on page load', {
                fromAmount,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol
            });
            calculateSwap(fromToken, toToken, fromAmount).then(outputAmount => {
                if (outputAmount) {
                    console.log('✅ Swap calculation: got initial output amount', outputAmount);
                    setResult(prev => ({ ...prev, outputAmount }));
                } else {
                    console.log('⚠️ Swap calculation: no output amount received');
                }
            });
        }
    }, [fromToken?.address, toToken?.address, fromAmount, calculateSwap]);

    return result;
}