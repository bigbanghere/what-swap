"use client";

import React from 'react';
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

interface SwapButtonProps {
  error?: string | null;
  shouldBeCompact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  toAmount?: string;
  toTokenSymbol?: string;
}

export function SwapButton({ 
  error, 
  shouldBeCompact = false, 
  onClick,
  disabled = false,
  className = "",
  children,
  toAmount,
  toTokenSymbol = 'TON'
}: SwapButtonProps) {
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  
  const isWalletConnected = Boolean(walletAddress);
  const isDisabled = Boolean(disabled || (error && error.includes('No liquidity pools')));
  
  const handleClick = () => {
    if (!isWalletConnected) {
      // Open wallet connection modal
      tonConnectUI.openModal();
    } else if (onClick) {
      // Execute swap functionality
      onClick();
    }
  };
  
  const getButtonText = () => {
    if (children) return children;
    
    if (!isWalletConnected) {
      return 'Connect wallet';
    }
    
    if (error && error.includes('No liquidity pools')) {
      return 'No pools';
    }
    
    if (toAmount && toAmount !== '') {
      return `Get ${toAmount} ${toTokenSymbol}`;
    }
    
    return 'Swap';
  };
  
  return (
    <button
      className={`rounded-[15px] font-semibold transition-all duration-200 shadow-lg text-[14px] ${
        !shouldBeCompact ? 'h-[50px]' : 'h-[50px]'
      } ${className}`}
      style={{ 
        backgroundColor: '#007AFF',
        color: "#FFFFFF",
        opacity: isDisabled ? 0.66 : 1,
      }}
      onClick={handleClick}
      disabled={isDisabled}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = '0.8';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#007AFF';
        e.currentTarget.style.opacity = isDisabled ? '0.66' : '1';
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = '0.8';
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#007AFF';
        e.currentTarget.style.opacity = isDisabled ? '0.66' : '1';
      }}
    >
      {getButtonText()}
    </button>
  );
}
