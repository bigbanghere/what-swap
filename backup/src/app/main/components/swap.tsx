"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { SwapForm } from './swap-form';
import Image from 'next/image';

export function Swap({ onErrorChange, onSwapDataChange }: { onErrorChange?: (error: string | null) => void; onSwapDataChange?: (data: { toAmount: string; toTokenSymbol: string }) => void }) {
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>('1');
    const { shouldBeCompact } = useKeyboardDetection();
    const { isDark } = useTheme();
    const t = useTranslations('translations');

    return (
        <div 
            className={`flex flex-col items-center justify-center relative overflow-hidden 
                ${!shouldBeCompact ? 'flex-1' : ''}
            `}
            style={{ 
                backgroundColor: shouldBeCompact ? 'transparent' : 'rgba(0, 122, 255, 0.11)',
                transition: 'background-color 0.2s ease'
            }}
        >
            {/* Decorative overlay - only visible when not compact */}
            <div
                style={{
                    display: shouldBeCompact ? 'none' : 'block',
                    transition: 'display 0.2s ease'
                }}
            >
                <Image
                    src={isDark ? '/decor_dark.svg' : '/decor_light.svg'}
                    alt="Decorative pattern"
                    width={4818}
                    height={2606}
                    className="absolute pointer-events-none left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
                    style={{ 
                        minWidth: '8096px', 
                        minHeight: '7616px',
                        border: '' // 1px solid rgba(0, 122, 255, 0.22)
                    }}
                />
            </div>
            
            {/* Single SwapForm instance with internal layout switching */}
            <SwapForm onErrorChange={onErrorChange} onSwapDataChange={onSwapDataChange} />
        </div>
    );
}
