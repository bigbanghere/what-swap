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

// New interfaces for robust calculation strategy
type CalculationType = 'FORWARD' | 'REVERSE' | null;
type InputSource = 'user' | 'calculation' | 'initial';
type UserInputType = 'from' | 'to' | null;

interface CalculationState {
    isCalculating: boolean;
    lastCalculationType: CalculationType;
    lastUserInput: UserInputType;
    activeCalculations: Set<string>;
    debounceTimer: NodeJS.Timeout | null;
}

interface InputSourceTracking {
    fromAmount: InputSource;
    toAmount: InputSource;
    fromToken: InputSource;
    toToken: InputSource;
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

    // New robust calculation state management
    const calculationState = useRef<CalculationState>({
        isCalculating: false,
        lastCalculationType: null,
        lastUserInput: null,
        activeCalculations: new Set(),
        debounceTimer: null
    });

    const inputSourceTracking = useRef<InputSourceTracking>({
        fromAmount: 'initial',
        toAmount: 'initial',
        fromToken: 'initial',
        toToken: 'initial'
    });

    // Legacy refs for backward compatibility
    const calculationInProgress = useRef(false);
    const lastCalculationRef = useRef<string>('');
    const currentInputValues = useRef<{fromAmount: string, toAmount: string, fromToken: any, toToken: any} | null>(null);
    const routingApi = useRef(new RoutingApi());
    const lastValuesRef = useRef<{fromAmount: string, toAmount: string}>({ fromAmount: '', toAmount: '' });

    // Action-based calculation system
    type ActionType = 
        | 'USER_INPUT_FROM'      // User typed in Send field
        | 'USER_INPUT_TO'        // User typed in Get field  
        | 'TOKEN_CHANGE_FROM'    // User changed Send token
        | 'TOKEN_CHANGE_TO'      // User changed Get token
        | 'FOCUS_CHANGE'         // User focused different field
        | 'NONE';                // No action needed

    interface ActionContext {
        actionType: ActionType;
        fromAmount: string;
        toAmount: string;
        fromToken: any;
        toToken: any;
        isFromAmountFocused: boolean;
        isToAmountFocused: boolean;
        previousFromAmount: string;
        previousToAmount: string;
        previousFromToken: any;
        previousToToken: any;
    }

    // Track previous state to detect changes
    const previousStateRef = useRef({
        fromAmount: '',
        toAmount: '',
        fromToken: null as any,
        toToken: null as any,
        isFromAmountFocused: false,
        isToAmountFocused: false
    });

    // Track calculation results to prevent loops
    const lastCalculationResult = useRef<{
        fromAmount: string;
        toAmount: string;
        fromToken: any;
        toToken: any;
        calculationType: CalculationType | null;
        timestamp: number;
    } | null>(null);

    // Detect what action was performed
    const detectAction = useCallback((): ActionType => {
        const current = {
            fromAmount,
            toAmount,
            fromToken,
            toToken,
            isFromAmountFocused,
            isToAmountFocused
        };
        const previous = previousStateRef.current;

        // Check if this change is from a recent calculation result
        if (lastCalculationResult.current) {
            const result = lastCalculationResult.current;
            const timeSinceCalculation = Date.now() - result.timestamp;
            
            // If this change matches the last calculation result and it's recent (< 200ms), skip
            if (timeSinceCalculation < 200) {
                // Check if the current state matches what we expect after the calculation
                const isFromCalculation = (
                    (result.calculationType === 'FORWARD' && 
                     fromAmount === result.fromAmount && 
                     toAmount === result.toAmount) ||
                    (result.calculationType === 'REVERSE' && 
                     fromAmount === result.fromAmount && 
                     toAmount === result.toAmount)
                );
                
                if (isFromCalculation) {
                    console.log('🎯 Skipping action detection - change from recent calculation result', {
                        calculationType: result.calculationType,
                        timeSinceCalculation,
                        currentState: { fromAmount, toAmount },
                        resultState: { fromAmount: result.fromAmount, toAmount: result.toAmount }
                    });
                    return 'NONE';
                }
            }
        }

        // Check for token changes first (highest priority)
        if (fromToken?.address !== previous.fromToken?.address) {
            return 'TOKEN_CHANGE_FROM';
        }
        if (toToken?.address !== previous.toToken?.address) {
            return 'TOKEN_CHANGE_TO';
        }

        // Check for amount changes - prioritize based on focus state
        if (fromAmount !== previous.fromAmount && toAmount !== previous.toAmount) {
            // Both amounts changed - prioritize based on which field is focused
            if (isFromAmountFocused) {
                return 'USER_INPUT_FROM';
            } else if (isToAmountFocused) {
                return 'USER_INPUT_TO';
            } else {
                // Neither focused - check which changed more recently (use previous state)
                // If toAmount was empty before and now has value, it's likely user input
                if (previous.toAmount === '' && toAmount !== '') {
                    return 'USER_INPUT_TO';
                } else {
                    return 'USER_INPUT_FROM';
                }
            }
        } else if (fromAmount !== previous.fromAmount) {
            return 'USER_INPUT_FROM';
        } else if (toAmount !== previous.toAmount) {
            return 'USER_INPUT_TO';
        }

        // Check for focus changes
        if (isFromAmountFocused !== previous.isFromAmountFocused || 
            isToAmountFocused !== previous.isToAmountFocused) {
            return 'FOCUS_CHANGE';
        }

        return 'NONE';
    }, [fromAmount, toAmount, fromToken, toToken, isFromAmountFocused, isToAmountFocused]);

    // Handle specific actions with strict algorithms
    const handleAction = useCallback((actionType: ActionType) => {
        console.log('🎯 Handling action:', actionType);
        
        switch (actionType) {
            case 'USER_INPUT_FROM':
                // User typed in Send field - perform FORWARD calculation
                if (fromAmount && parseFloat(fromAmount) > 0 && toToken) {
                    console.log('🔄 USER_INPUT_FROM: Performing forward calculation');
                    executeCalculation('FORWARD');
                }
                break;

            case 'USER_INPUT_TO':
                // User typed in Get field - perform REVERSE calculation
                if (toAmount && parseFloat(toAmount) > 0 && fromToken) {
                    console.log('🔄 USER_INPUT_TO: Performing reverse calculation');
                    executeCalculation('REVERSE');
                }
                break;

            case 'TOKEN_CHANGE_FROM':
                // User changed Send token - recalculate based on current amounts
                if (toAmount && parseFloat(toAmount) > 0) {
                    console.log('🔄 TOKEN_CHANGE_FROM: Performing reverse calculation');
                    executeCalculation('REVERSE');
                } else if (fromAmount && parseFloat(fromAmount) > 0) {
                    console.log('🔄 TOKEN_CHANGE_FROM: Performing forward calculation');
                    executeCalculation('FORWARD');
                }
                break;

            case 'TOKEN_CHANGE_TO':
                // User changed Get token - recalculate based on current amounts
                if (fromAmount && parseFloat(fromAmount) > 0) {
                    console.log('🔄 TOKEN_CHANGE_TO: Performing forward calculation');
                    executeCalculation('FORWARD');
                } else if (toAmount && parseFloat(toAmount) > 0) {
                    console.log('🔄 TOKEN_CHANGE_TO: Performing reverse calculation');
                    executeCalculation('REVERSE');
                }
                break;

            case 'FOCUS_CHANGE':
                // User focused different field - no calculation needed
                console.log('🔄 FOCUS_CHANGE: No calculation needed');
                break;

            case 'NONE':
                // No action detected - no calculation needed
                console.log('🔄 NONE: No calculation needed');
                break;
        }
    }, [fromAmount, toAmount, fromToken, toToken]);

    // Track calculation results to prevent loops
    const trackCalculationResult = useCallback((calculationType: CalculationType, resultAmount: string) => {
        // Calculate the expected state after the calculation
        let expectedFromAmount = fromAmount;
        let expectedToAmount = toAmount;
        
        if (calculationType === 'FORWARD') {
            // Forward calculation: fromAmount stays the same, toAmount gets updated
            expectedToAmount = resultAmount;
        } else if (calculationType === 'REVERSE') {
            // Reverse calculation: toAmount stays the same, fromAmount gets updated
            expectedFromAmount = resultAmount;
        }
        
        lastCalculationResult.current = {
            fromAmount: expectedFromAmount,
            toAmount: expectedToAmount,
            fromToken,
            toToken,
            calculationType,
            timestamp: Date.now()
        };
        console.log('📝 Tracked calculation result:', lastCalculationResult.current);
    }, [fromAmount, toAmount, fromToken, toToken]);

    // Check if the current input values match what we're trying to calculate
    const isCurrentCalculation = useCallback((inputToken: any, outputToken: any, amount: string, isReverseCalculation: boolean) => {
        if (!currentInputValues.current) return true; // If no current values stored, allow the calculation

        const current = currentInputValues.current;
        const expectedFromAmount = isReverseCalculation ? '' : amount;
        const expectedToAmount = isReverseCalculation ? amount : '';
        const expectedFromToken = isReverseCalculation ? outputToken : inputToken;
        const expectedToToken = isReverseCalculation ? inputToken : outputToken;

        return (
            current.fromAmount === expectedFromAmount &&
            current.toAmount === expectedToAmount &&
            current.fromToken?.address === expectedFromToken?.address &&
            current.toToken?.address === expectedToToken?.address
        );
    }, []);

    // Smart calculation type determination logic
    const determineCalculationType = useCallback((): CalculationType => {
        console.log('🎯 Determining calculation type', {
            isFromAmountFocused,
            isToAmountFocused,
            fromAmount: parseFloat(fromAmount || '0'),
            toAmount: parseFloat(toAmount || '0'),
            hasFromToken: !!fromToken,
            hasToToken: !!toToken,
            userInputRef,
            isUserTypingToAmount,
            inputSourceTracking: inputSourceTracking.current
        });

        // Priority 1: User is actively typing in Send field
        if (isFromAmountFocused && fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0) {
            console.log('🎯 Priority 1: User typing in Send field - FORWARD calculation');
            return 'FORWARD';
        }
        
        // Priority 2: User is actively typing in Get field  
        if (isToAmountFocused && toAmount && fromToken && toToken && parseFloat(toAmount) > 0 && isUserTypingToAmount) {
            console.log('🎯 Priority 2: User typing in Get field - REVERSE calculation');
            return 'REVERSE';
        }
        
        // Priority 3: Token changes with existing values
        if (userInputRef === 'to' && toAmount && fromToken && toToken && parseFloat(toAmount) > 0) {
            console.log('🎯 Priority 3: Token change with Get field value - REVERSE calculation');
            return 'REVERSE';
        }
        
        // Priority 4: Initial load with Send field value
        if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0 && 
            inputSourceTracking.current.fromAmount === 'initial' && 
            !isFromAmountFocused && !isToAmountFocused) {
            console.log('🎯 Priority 4: Initial load with Send field - FORWARD calculation');
            return 'FORWARD';
        }
        
        console.log('🎯 No calculation needed');
        return null;
    }, [isFromAmountFocused, isToAmountFocused, fromAmount, toAmount, fromToken, toToken]);

    // Check if calculation should be skipped due to debouncing or duplicates
    const shouldSkipCalculation = useCallback((calculationType: CalculationType): boolean => {
        const state = calculationState.current;
        
        const fromAmountChanged = lastValuesRef.current.fromAmount !== fromAmount;
        const toAmountChanged = lastValuesRef.current.toAmount !== toAmount;
        
        console.log('🔍 shouldSkipCalculation check:', {
            calculationType,
            isCalculating: state.isCalculating,
            lastCalculationType: state.lastCalculationType,
            fromAmountChanged,
            toAmountChanged,
            isToAmountFocused
        });
        
        // Skip if already calculating the same type
        if (state.isCalculating && state.lastCalculationType === calculationType) {
            console.log('⏭️ Skipping calculation - same type already in progress', calculationType);
            return true;
        }
        
        // Skip if this is a reverse calculation triggered by fromAmount change while Get field is focused
        // This happens when a reverse calculation updates fromAmount, triggering another reverse calculation
        if (calculationType === 'REVERSE' && isToAmountFocused && state.lastCalculationType === 'REVERSE' && fromAmountChanged && !toAmountChanged) {
            console.log('⏭️ Skipping calculation - fromAmount change from previous reverse calculation');
            return true;
        }
        
        // Update last values
        lastValuesRef.current = { fromAmount, toAmount };
        
        return false;
    }, [fromAmount, toAmount, isToAmountFocused]);

    // Update input source tracking when values change
    const updateInputSourceTracking = useCallback(() => {
        // Track user input when fields are focused
        if (isFromAmountFocused) {
            inputSourceTracking.current.fromAmount = 'user';
        }
        if (isToAmountFocused) {
            inputSourceTracking.current.toAmount = 'user';
        }
        
        // Don't reset calculation results - preserve them
        // The executeCalculation function will set these to 'calculation' when needed
    }, [isFromAmountFocused, isToAmountFocused]);

    // Debouncing system for rapid typing
    const debouncedCalculation = useCallback((calculationType: CalculationType, executeCalculation: () => void) => {
        const state = calculationState.current;
        
        // Clear existing timer
        if (state.debounceTimer) {
            clearTimeout(state.debounceTimer);
        }
        
        // For rapid typing, debounce by 300ms
        // For token changes and initial load, execute immediately
        const shouldDebounce = (isFromAmountFocused || isToAmountFocused) && 
                              (calculationType === 'FORWARD' || calculationType === 'REVERSE');
        
        if (shouldDebounce) {
            console.log('⏱️ Debouncing calculation for rapid typing', calculationType);
            state.debounceTimer = setTimeout(() => {
                console.log('⏱️ Debounce timer expired, executing calculation', calculationType);
                executeCalculation();
                state.debounceTimer = null;
            }, 300);
        } else {
            console.log('⚡ Executing calculation immediately (no debounce)', calculationType);
            executeCalculation();
        }
    }, [isFromAmountFocused, isToAmountFocused]);


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

        // Store the current input values for this calculation
        currentInputValues.current = {
            fromAmount: isReverseCalculation ? '' : amount,
            toAmount: isReverseCalculation ? amount : '',
            fromToken: isReverseCalculation ? outputToken : inputToken,
            toToken: isReverseCalculation ? inputToken : outputToken
        };

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
                    // Check if this calculation is still current (user hasn't changed inputs)
                    if (!isCurrentCalculation(inputToken, outputToken, amount, isReverseCalculation)) {
                        console.log('⚠️ Ignoring outdated calculation result - inputs have changed');
                        return null;
                    }
                    
                    // The API already returns the value in the correct units, no conversion needed
                    const formattedAmount = resultAmount.toFixed(6);
                    console.log('✅ Swap calculation result:', formattedAmount);
                    return { amount: formattedAmount, key: calculationKey } as const;
                } else if (resultAmount === 0) {
                    // Check if this calculation is still current (user hasn't changed inputs)
                    if (!isCurrentCalculation(inputToken, outputToken, amount, isReverseCalculation)) {
                        console.log('⚠️ Ignoring outdated error result - inputs have changed');
                        return null;
                    }
                    
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
            
            // Check if this calculation is still current (user hasn't changed inputs)
            if (!isCurrentCalculation(inputToken, outputToken, amount, isReverseCalculation)) {
                console.log('⚠️ Ignoring outdated error result - inputs have changed');
                return null;
            }
            
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
    }, [convertToApiTokenAddress, isCurrentCalculation]);

    // Execute calculation with proper state management
    const executeCalculation = useCallback(async (calculationType: CalculationType) => {
        const state = calculationState.current;
        
        // Mark as calculating
        state.isCalculating = true;
        state.lastCalculationType = calculationType;
        
        // Determine calculation parameters
        let inputToken, outputToken, amount, isReverse;
        
        if (calculationType === 'FORWARD') {
            inputToken = fromToken;
            outputToken = toToken;
            amount = fromAmount;
            isReverse = false;
            state.lastUserInput = 'from';
        } else if (calculationType === 'REVERSE') {
            inputToken = fromToken;
            outputToken = toToken;
            amount = toAmount;
            isReverse = true;
            state.lastUserInput = 'to';
        } else {
            return;
        }
        
        console.log('🚀 Executing calculation', {
            type: calculationType,
            inputToken: inputToken?.symbol,
            outputToken: outputToken?.symbol,
            amount,
            isReverse
        });
        
        try {
            const result = await calculateSwap(inputToken, outputToken, amount, isReverse);
            if (result) {
                console.log('✅ Calculation completed successfully', result);
                
                // Set the result with proper key validation
                const expectedKey = `${inputToken.address}-${outputToken.address}-${amount}-${isReverse ? 'reverse' : 'forward'}`;
                if (result.key === expectedKey) {
                    console.log('✅ Setting calculation result', result.amount);
                    
                    // Track this calculation result to prevent loops
                    trackCalculationResult(calculationType, result.amount.toString());
                    
                    setResult(prev => ({ ...prev, outputAmount: result.amount, calcKey: result.key }));
                    
                    // Update input source tracking to indicate this value came from calculation
                    if (isReverse) {
                        inputSourceTracking.current.fromAmount = 'calculation';
                    } else {
                        inputSourceTracking.current.toAmount = 'calculation';
                    }
                } else {
                    console.log('⚠️ Ignoring stale result. expected:', expectedKey, 'got:', result.key);
                }
            }
        } catch (error) {
            console.error('❌ Calculation failed', error);
        } finally {
            state.isCalculating = false;
        }
    }, [fromToken, toToken, fromAmount, toAmount, calculateSwap]);

    // Action-based calculation manager - replaces all reactive useEffect hooks
    useEffect(() => {
        console.log('🎯 Action-based calculation manager triggered', {
            fromAmount,
            toAmount,
            fromToken: fromToken?.symbol,
            toToken: toToken?.symbol,
            isFromAmountFocused,
            isToAmountFocused
        });

        // Detect what action was performed
        const actionType = detectAction();
        
        if (actionType === 'NONE') {
            console.log('🎯 No action detected - skipping');
            return;
        }

        // Handle the specific action
        handleAction(actionType);

        // Update previous state for next comparison
        previousStateRef.current = {
            fromAmount,
            toAmount,
            fromToken,
            toToken,
            isFromAmountFocused,
            isToAmountFocused
        };

    }, [
        fromAmount, 
        toAmount, 
        fromToken, 
        toToken,
        isFromAmountFocused, 
        isToAmountFocused,
        detectAction,
        handleAction
    ]);

    return {
        ...result,
        trackCalculationResult
    };
}