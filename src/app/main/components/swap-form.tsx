"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

export function SwapForm() {
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>('1');
    const { shouldBeCompact } = useKeyboardDetection();
    const t = useTranslations('translations');

    return (
        <div className='m-[15px] flex flex-col'>
            <div
                style={{
                    color: colors.text,
                }}
            >Swap form</div>
            <div>Swap form</div>
            <div>Swap form</div>
        </div>
    );
}
