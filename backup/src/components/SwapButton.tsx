"use client";

import React from 'react';
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useTranslations } from 'next-intl';
import { useSwapExecution } from '@/hooks/use-swap-execution';

interface SwapButtonProps {
  error?: string | null;
  shouldBeCompact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  toAmount?: string;
  toTokenSymbol?: string;
  // Swap execution props
  fromToken?: any;
  toToken?: any;
  fromAmount?: string;
  onSwapResult?: (result: any) => void;
}

export function SwapButton({ 
  error, 
  shouldBeCompact = false, 
  onClick,
  disabled = false,
  className = "",
  children,
  toAmount,
  toTokenSymbol = 'TON',
  fromToken,
  toToken,
  fromAmount,
  onSwapResult
}: SwapButtonProps) {
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const t = useTranslations('translations');
  const { isExecuting, executeSwap } = useSwapExecution();
  
  const isWalletConnected = Boolean(walletAddress);
  const isDisabled = Boolean(disabled || isExecuting || (error && error.includes('No liquidity pools')));
  const isEmptyAmount = !toAmount || toAmount === '' || parseFloat(toAmount) === 0;
  
  const handleClick = async () => {
    if (!isWalletConnected) {
      // Open wallet connection modal
      tonConnectUI.openModal();
    } else if (onClick) {
      // Execute custom onClick handler if provided
      onClick();
    } else if (fromToken && toToken && fromAmount && toAmount) {
      // Execute swap if all required parameters are provided
      try {
        console.log('🚀 Executing swap from SwapButton');
        const result = await executeSwap({
          fromToken,
          toToken,
          fromAmount,
          toAmount
        });
        
        console.log('✅ Swap result:', result);
        
        // Call the result callback if provided
        if (onSwapResult) {
          onSwapResult(result);
        }
      } catch (error) {
        console.error('❌ Swap execution error:', error);
        
        if (onSwapResult) {
          onSwapResult({ success: false, error: 'Swap execution failed' });
        }
      }
    }
  };
  
  const getButtonText = () => {
    if (children) return children;
    
    if (isExecuting) {
      return t('swapping') || 'Swapping...';
    }
    
    if (!isWalletConnected) {
      return t('connect_wallet');
    }
    
    if (error && error.includes('No liquidity pools')) {
      return t('no_pools');
    }
    
    if (toAmount && toAmount !== '' && parseFloat(toAmount) > 0) {
      return `${t('get')} ${toAmount} ${toTokenSymbol}`;
    }
    
    return t('enter_amount');
  };
  
  return (
    <button
      className={`rounded-[15px] font-semibold transition-all duration-200 shadow-lg text-[14px] ${
        !shouldBeCompact ? 'h-[50px]' : 'h-[50px]'
      } ${className}`}
      style={{ 
        backgroundColor: '#007AFF',
        color: "#FFFFFF",
        opacity: isDisabled ? 0.66 : (!isWalletConnected ? 1 : (isEmptyAmount ? 0.44 : 1)),
      }}
      onClick={handleClick}
      disabled={isDisabled}
      onMouseEnter={(e) => {
        if (!isDisabled && !isEmptyAmount) {
          e.currentTarget.style.opacity = '0.8';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#007AFF';
        e.currentTarget.style.opacity = isDisabled ? '0.66' : (!isWalletConnected ? '1' : (isEmptyAmount ? '0.44' : '1'));
      }}
      onMouseDown={(e) => {
        if (!isDisabled && !isEmptyAmount) {
          e.currentTarget.style.opacity = '0.8';
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#007AFF';
        e.currentTarget.style.opacity = isDisabled ? '0.66' : (!isWalletConnected ? '1' : (isEmptyAmount ? '0.44' : '1'));
      }}
    >
      {getButtonText()}
    </button>
  );
}
