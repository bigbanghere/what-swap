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
    hasUserEnteredCustomValue: boolean;
    isUserTypingToAmount?: boolean;
    userInputRef?: string | null;
    isRestoringDefaults?: boolean;
    isFromAmountFocused?: boolean;
    isToAmountFocused?: boolean;
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
    calculationInProgress: boolean;
    lastCalculationTimestamp: number;
}

interface InputSourceTracking {
    fromAmount: InputSource;
    toAmount: InputSource;
    fromToken: InputSource;
    toToken: InputSource;
    lastUserAction: 'from' | 'to' | null;
    lastUserActionTimestamp: number;
}

export function useSwapCalculation({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    hasUserEnteredCustomValue,
    isUserTypingToAmount = false,
    userInputRef = null,
    isRestoringDefaults = false,
    isFromAmountFocused = false,
    isToAmountFocused = false
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
        debounceTimer: null,
        calculationInProgress: false,
        lastCalculationTimestamp: 0
    });

    const inputSourceTracking = useRef<InputSourceTracking>({
        fromAmount: 'initial',
        toAmount: 'initial',
        fromToken: 'initial',
        toToken: 'initial',
        lastUserAction: null,
        lastUserActionTimestamp: 0
    });

    // Legacy refs for backward compatibility
    const calculationInProgress = useRef(false);
    const lastCalculationRef = useRef<string>('');
    const currentInputValues = useRef<{fromAmount: string, toAmount: string, fromToken: any, toToken: any} | null>(null);
    const routingApi = useRef(new RoutingApi());
    const lastValuesRef = useRef<{fromAmount: string, toAmount: string}>({ fromAmount: '', toAmount: '' });
    const executeCalculationRef = useRef<((calculationType: CalculationType) => Promise<void>) | null>(null);

    // Action-based calculation system
    type ActionType = 
        | 'USER_INPUT_FROM'      // User typed in Send field
        | 'USER_INPUT_TO'        // User typed in Get field  
        | 'TOKEN_CHANGE_FROM'    // User changed Send token
        | 'TOKEN_CHANGE_TO'      // User changed Get token
        | 'NONE';                // No action needed

    interface ActionContext {
        actionType: ActionType;
        fromAmount: string;
        toAmount: string;
        fromToken: any;
        toToken: any;
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

    // Update input source tracking when values change
    const updateInputSourceTracking = useCallback(() => {
        // Track user input when fields are focused
        // Track user input source
        inputSourceTracking.current.fromAmount = 'user';
        inputSourceTracking.current.toAmount = 'user';
        
        // Don't reset calculation results - preserve them
        // The executeCalculation function will set these to 'calculation' when needed
    }, []);

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
            
            // If this change matches the last calculation result and it's recent (< 500ms), skip
            if (timeSinceCalculation < 500) {
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

        // Focus changes should NEVER trigger calculations - only value changes should
        // Check if focus just changed and skip calculations (but only if we have previous state)
        // BUT allow calculations if amounts are changing (user is typing)
        const hasPreviousState = previous.fromAmount !== '' || previous.toAmount !== '' || previous.fromToken || previous.toToken;
        const amountsChanged = fromAmount !== previous.fromAmount || toAmount !== previous.toAmount;
        const focusJustChanged = hasPreviousState && (
            (isFromAmountFocused !== previous.isFromAmountFocused) || 
            (isToAmountFocused !== previous.isToAmountFocused)
        );
        
        // Additional check: if focus just changed and we're not in the middle of user input
        const isUserActivelyTyping = userInputRef === 'from' || userInputRef === 'to';
        
        // Special case: if focus just changed AND no amounts changed, skip calculations
        // This prevents focus-only changes from triggering calculations, but allows user input
        if (focusJustChanged && !amountsChanged) {
            console.log('🎯 Skipping action detection - focus just changed (no amount changes)', {
                fromFocusChanged: isFromAmountFocused !== previous.isFromAmountFocused,
                toFocusChanged: isToAmountFocused !== previous.isToAmountFocused,
                currentFocus: { from: isFromAmountFocused, to: isToAmountFocused },
                previousFocus: { from: previous.isFromAmountFocused, to: previous.isToAmountFocused },
                hasPreviousState,
                amountsChanged,
                isUserActivelyTyping,
                userInputRef
            });
            return 'NONE';
        }

        // Check for amount changes - use source tracking instead of timing
        if (fromAmount !== previous.fromAmount && toAmount !== previous.toAmount) {
            // Both amounts changed - use source tracking to determine if this is user input
            const now = Date.now();
            const timeSinceLastUserAction = now - inputSourceTracking.current.lastUserActionTimestamp;
            const timeSinceLastCalculation = now - calculationState.current.lastCalculationTimestamp;
            
            // If we're currently calculating, skip to avoid infinite loops
            if (calculationState.current.calculationInProgress) {
                console.log('🎯 Both amounts changed - calculation in progress, skipping');
                return 'NONE';
            }
            
            // If user action was recent (< 100ms), prioritize user input
            if (timeSinceLastUserAction < 100 && inputSourceTracking.current.lastUserAction) {
                console.log('🎯 Both amounts changed - recent user action detected:', inputSourceTracking.current.lastUserAction);
                return inputSourceTracking.current.lastUserAction === 'to' ? 'USER_INPUT_TO' : 'USER_INPUT_FROM';
            }
            
            // If user is actively typing, prioritize user input
            if (isUserTypingToAmount) {
                console.log('🎯 Both amounts changed - user actively typing TO field, treating as USER_INPUT_TO');
                return 'USER_INPUT_TO';
            }
            
            // If calculation was recent (< 200ms), likely from calculation result
            if (timeSinceLastCalculation < 200) {
                console.log('🎯 Both amounts changed - recent calculation detected, skipping');
                return 'NONE';
            }
            
            // Default to treating as user input if we can't determine the source
            console.log('🎯 Both amounts changed - treating as user input (fallback)');
            return 'USER_INPUT_FROM';
            
        } else if (fromAmount !== previous.fromAmount) {
            // Only fromAmount changed - check if it's user input or calculation result
            if (inputSourceTracking.current.fromAmount === 'calculation') {
                console.log('🎯 fromAmount changed - skipping (calculation result)');
                return 'NONE';
            }
            console.log('🎯 fromAmount changed - treating as user input');
            // Update input source tracking to mark this as user input
            updateInputSourceTracking();
            return 'USER_INPUT_FROM';
        } else if (toAmount !== previous.toAmount) {
            // Only toAmount changed - check if it's user input or calculation result
            if (inputSourceTracking.current.toAmount === 'calculation') {
                console.log('🎯 toAmount changed - skipping (calculation result)');
                return 'NONE';
            }
            console.log('🎯 toAmount changed - treating as user input');
            // Update input source tracking to mark this as user input
            updateInputSourceTracking();
            return 'USER_INPUT_TO';
        }

        // Update previous state for next comparison
        previousStateRef.current = current;
        
        return 'NONE';
    }, [fromAmount, toAmount, fromToken, toToken, isUserTypingToAmount, isFromAmountFocused, isToAmountFocused, userInputRef, updateInputSourceTracking]);

    // Debouncing system for rapid typing
    const debouncedCalculation = useCallback((calculationType: CalculationType, executeCalculation: () => void) => {
        const state = calculationState.current;
        
        // Clear existing timer
        if (state.debounceTimer) {
            clearTimeout(state.debounceTimer);
        }
        
        // For rapid typing, debounce by 500ms to prevent cursor position issues
        // For token changes and initial load, execute immediately
        const shouldDebounce = true && 
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
    }, []);

    // Helper functions for tracking user actions and calculation state
    const trackUserAction = useCallback((actionType: 'from' | 'to') => {
        const now = Date.now();
        inputSourceTracking.current.lastUserAction = actionType;
        inputSourceTracking.current.lastUserActionTimestamp = now;
        console.log('🎯 Tracked user action:', actionType, 'at', now);
    }, []);

    const startCalculation = useCallback((calculationType: CalculationType) => {
        const now = Date.now();
        calculationState.current.calculationInProgress = true;
        calculationState.current.lastCalculationTimestamp = now;
        calculationState.current.lastCalculationType = calculationType;
        console.log('🔄 Started calculation:', calculationType, 'at', now);
    }, []);

    const endCalculation = useCallback(() => {
        calculationState.current.calculationInProgress = false;
        console.log('✅ Ended calculation at', Date.now());
    }, []);

    // Handle specific actions with strict algorithms
    const handleAction = useCallback((actionType: ActionType) => {
        console.log('🎯 Handling action:', actionType);
        
        switch (actionType) {
            case 'USER_INPUT_FROM':
                // User typed in Send field - perform FORWARD calculation or clear Get field
                trackUserAction('from');
                if (fromAmount && parseFloat(fromAmount) > 0 && toToken && executeCalculationRef.current) {
                    console.log('🔄 USER_INPUT_FROM: Performing forward calculation');
                    // Use debounced calculation to handle rapid typing
                    debouncedCalculation('FORWARD', () => executeCalculationRef.current!('FORWARD'));
                } else if (!fromAmount || fromAmount.trim() === '') {
                    // Send field was cleared - clear the Get field as well
                    console.log('🔄 USER_INPUT_FROM: Send field cleared, clearing Get field');
                    setResult({ outputAmount: null, calcKey: null, isLoading: false, error: null });
                }
                break;

            case 'USER_INPUT_TO':
                // User typed in Get field - perform REVERSE calculation or clear Send field
                trackUserAction('to');
                if (toAmount && parseFloat(toAmount) > 0 && fromToken && executeCalculationRef.current) {
                    console.log('🔄 USER_INPUT_TO: Performing reverse calculation');
                    // Use debounced calculation to handle rapid typing
                    debouncedCalculation('REVERSE', () => executeCalculationRef.current!('REVERSE'));
                } else if (!toAmount || toAmount.trim() === '') {
                    // Get field was cleared - clear the Send field as well
                    console.log('🔄 USER_INPUT_TO: Get field cleared, clearing Send field');
                    setResult({ outputAmount: null, calcKey: null, isLoading: false, error: null });
                }
                break;

            case 'TOKEN_CHANGE_FROM':
                // User selected token from Send section - prioritize focused field, then preserve Send field value
                if (isFromAmountFocused && fromAmount && parseFloat(fromAmount) > 0 && executeCalculationRef.current) {
                    // Send field is focused and has value - perform forward calculation to update Get field
                    console.log('🔄 TOKEN_CHANGE_FROM: Send section token selected, Send field focused with value - performing forward calculation');
                    executeCalculationRef.current('FORWARD');
                } else if (isToAmountFocused && toAmount && parseFloat(toAmount) > 0 && executeCalculationRef.current) {
                    // Get field is focused and has value - perform reverse calculation to update Send field
                    console.log('🔄 TOKEN_CHANGE_FROM: Send section token selected, Get field focused with value - performing reverse calculation');
                    executeCalculationRef.current('REVERSE');
                } else if (fromAmount && parseFloat(fromAmount) > 0 && executeCalculationRef.current) {
                    // Send field has value (not focused) - perform forward calculation to update Get field
                    console.log('🔄 TOKEN_CHANGE_FROM: Send section token selected, Send field has value - performing forward calculation');
                    executeCalculationRef.current('FORWARD');
                } else if (toAmount && parseFloat(toAmount) > 0 && executeCalculationRef.current) {
                    // Get field has value (not focused) - perform reverse calculation to update Send field
                    console.log('🔄 TOKEN_CHANGE_FROM: Send section token selected, Get field has value - performing reverse calculation');
                    executeCalculationRef.current('REVERSE');
                }
                break;

            case 'TOKEN_CHANGE_TO':
                // User selected token from Get section - prioritize focused field, then preserve Get field value
                if (isToAmountFocused && toAmount && parseFloat(toAmount) > 0 && executeCalculationRef.current) {
                    // Get field is focused and has value - perform reverse calculation to update Send field
                    console.log('🔄 TOKEN_CHANGE_TO: Get section token selected, Get field focused with value - performing reverse calculation');
                    executeCalculationRef.current('REVERSE');
                } else if (isFromAmountFocused && fromAmount && parseFloat(fromAmount) > 0 && executeCalculationRef.current) {
                    // Send field is focused and has value - perform forward calculation to update Get field
                    console.log('🔄 TOKEN_CHANGE_TO: Get section token selected, Send field focused with value - performing forward calculation');
                    executeCalculationRef.current('FORWARD');
                } else if (toAmount && parseFloat(toAmount) > 0 && executeCalculationRef.current) {
                    // Get field has value (not focused) - perform reverse calculation to update Send field
                    console.log('🔄 TOKEN_CHANGE_TO: Get section token selected, Get field has value - performing reverse calculation');
                    executeCalculationRef.current('REVERSE');
                } else if (fromAmount && parseFloat(fromAmount) > 0 && executeCalculationRef.current) {
                    // Send field has value (not focused) - perform forward calculation to update Get field
                    console.log('🔄 TOKEN_CHANGE_TO: Get section token selected, Send field has value - performing forward calculation');
                    executeCalculationRef.current('FORWARD');
                }
                break;


            case 'NONE':
                // No action detected - no calculation needed
                console.log('🔄 NONE: No calculation needed');
                break;
        }
    }, [fromAmount, toAmount, fromToken, toToken, isFromAmountFocused, isToAmountFocused, debouncedCalculation, trackUserAction]);

    // Track calculation results to prevent loops
    const trackCalculationResult = useCallback((calculationType: CalculationType, resultAmount: string, actualFromAmount?: string, actualToAmount?: string) => {
        // Calculate the expected state after the calculation
        let expectedFromAmount = actualFromAmount || fromAmount;
        let expectedToAmount = actualToAmount || toAmount;
        
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
            fromAmount: parseFloat(fromAmount || '0'),
            toAmount: parseFloat(toAmount || '0'),
            hasFromToken: !!fromToken,
            hasToToken: !!toToken,
            userInputRef,
            isUserTypingToAmount,
            inputSourceTracking: inputSourceTracking.current
        });

        // Priority 1: User is actively typing in Send field
        if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0) {
            console.log('🎯 Priority 1: User typing in Send field - FORWARD calculation');
            return 'FORWARD';
        }
        
        // Priority 2: User is actively typing in Get field  
        if (toAmount && fromToken && toToken && parseFloat(toAmount) > 0 && isUserTypingToAmount) {
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
            inputSourceTracking.current.fromAmount === 'initial') {
            console.log('🎯 Priority 4: Initial load with Send field - FORWARD calculation');
            return 'FORWARD';
        }
        
        console.log('🎯 No calculation needed');
        return null;
    }, [fromAmount, toAmount, fromToken, toToken, isUserTypingToAmount, userInputRef]);

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
            toAmountChanged
        });
        
        // Skip if already calculating the same type
        if (state.isCalculating && state.lastCalculationType === calculationType) {
            console.log('⏭️ Skipping calculation - same type already in progress', calculationType);
            return true;
        }
        
        // Skip if this is a reverse calculation triggered by fromAmount change
        // This happens when a reverse calculation updates fromAmount, triggering another reverse calculation
        if (calculationType === 'REVERSE' && state.lastCalculationType === 'REVERSE' && fromAmountChanged && !toAmountChanged) {
            console.log('⏭️ Skipping calculation - fromAmount change from previous reverse calculation');
            return true;
        }
        
        // Update last values
        lastValuesRef.current = { fromAmount, toAmount };
        
        return false;
    }, [fromAmount, toAmount]);




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
    const executeCalculation = useCallback(async (calculationType: CalculationType, overrideAmount?: string) => {
        const state = calculationState.current;
        
        // Mark as calculating and track calculation state
        state.isCalculating = true;
        state.lastCalculationType = calculationType;
        startCalculation(calculationType);
        
        // Determine calculation parameters
        let inputToken, outputToken, amount, isReverse;
        
        if (calculationType === 'FORWARD') {
            inputToken = fromToken;
            outputToken = toToken;
            amount = overrideAmount || fromAmount;
            isReverse = false;
            state.lastUserInput = 'from';
        } else if (calculationType === 'REVERSE') {
            inputToken = fromToken;
            outputToken = toToken;
            amount = overrideAmount || toAmount;
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
                    trackCalculationResult(calculationType, result.amount.toString(), amount, isReverse ? toAmount : amount);
                    
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
            endCalculation();
        }
    }, [fromToken, toToken, fromAmount, toAmount, calculateSwap, trackCalculationResult, startCalculation, endCalculation]);

    // Assign executeCalculation to ref for use in handleAction
    executeCalculationRef.current = executeCalculation;

    // Action-based calculation manager - replaces all reactive useEffect hooks
    useEffect(() => {
        console.log('🎯 Action-based calculation manager triggered', {
            fromAmount,
            toAmount,
            fromToken: fromToken?.symbol,
            toToken: toToken?.symbol,
            isRestoringDefaults
        });

        // Skip processing if we're restoring defaults to prevent interference
        if (isRestoringDefaults) {
            console.log('🎯 Skipping action-based calculation - restoring defaults');
            return;
        }
        
        
        

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
        isUserTypingToAmount,
        isRestoringDefaults,
        isFromAmountFocused,
        isToAmountFocused,
        detectAction,
        handleAction
    ]);

    return {
        ...result,
        trackCalculationResult,
        executeCalculation,
        updateInputSourceTracking
    };
}