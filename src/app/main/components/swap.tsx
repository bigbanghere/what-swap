"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { SwapForm } from './swap-form';
import Image from 'next/image';

export function Swap() {
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>('1');
    const { shouldBeCompact } = useKeyboardDetection();
    const { isDark } = useTheme();
    const t = useTranslations('translations');


    if (shouldBeCompact) {
        return (
            <SwapForm />
        );
    }

    return (
        <div 
            className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: 'rgba(26, 188, 255, 0.22)' }}
        >
            {/* Decorative overlay */}
            <Image
                src={isDark ? '/decor_dark.svg' : '/decor_light.svg'}
                alt="Decorative pattern"
                width={1012}
                height={952}
                className="absolute pointer-events-none left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
                style={{ minWidth: '1012px', minHeight: '952px' }}
            />
            
            {/* Content */}
            <div className="w-full max-w-[460px] p-[20px] relative z-10 flex flex-col items-center justify-center mx-auto mb-[22px]">
                <span className="text-[33px] mb-[20px] text-center">
                    {t('swap_tokens')}
                </span>
                <div 
                    style={{ 
                        border: '1px solid rgba(26, 188, 255, 1)', 
                        borderRadius: '15px', 
                        backgroundColor: colors.background,
                    }}
                    className="w-full"
                >
                    <SwapForm />
                </div>
            </div>
        </div>
    );
}
