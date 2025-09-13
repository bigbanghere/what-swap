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

    if (!shouldBeCompact) {
        return (
            <SwapForm />
        );
    }

    return (
        <div 
            className="flex-1 flex flex-col items-center justify-center relative"
            style={{ backgroundColor: 'rgba(26, 188, 255, 0.22)' }}
        >
            {/* Decorative overlay */}
            <Image
                src={isDark ? '/decor_dark.svg' : '/decor_light.svg'}
                alt="Decorative pattern"
                width={1012}
                height={952}
                className="absolute inset-0 w-full h-full pointer-events-none"
            />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                {t('swap_tokens')}
                <div 
                    style={{ 
                        border: '1px solid rgba(26, 188, 255, 1)', 
                        borderRadius: '15px', 
                        backgroundColor: colors.background,
                    }}
                    className="w-full max-w-[420px]"
                >
                    <SwapForm />
                </div>
            </div>
        </div>
    );
}
