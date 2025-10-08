"use client";

import React from 'react';

interface SwapButtonProps {
  error?: string | null;
  shouldBeCompact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SwapButton({ 
  error, 
  shouldBeCompact = false, 
  onClick,
  disabled = false,
  className = "",
  children
}: SwapButtonProps) {
  const isDisabled = Boolean(disabled || (error && error.includes('No liquidity pools')));
  
  return (
    <button
      className={`w-full rounded-[] font-semibold transition-all duration-200 shadow-lg text-[18px] ${
        !shouldBeCompact ? 'h-[60px]' : 'h-[40px]'
      } ${className}`}
      style={{ 
        backgroundColor: '#007AFF',
        color: "#FFFFFF",
        opacity: isDisabled ? 0.66 : 1,
      }}
      onClick={onClick}
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
      {children || (error && error.includes('No liquidity pools') ? 'No pools' : 'Swap')}
    </button>
  );
}
