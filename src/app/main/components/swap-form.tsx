"use client";

import Image from 'next/image';
import React, { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { IoWalletSharp } from 'react-icons/io5';
import { useTonAddress } from "@tonconnect/ui-react";
import { CustomTonConnectButton } from "./full-tc-button";
import { CustomInput } from "./custom-input";

export function SwapForm() {
    const walletAddress = useTonAddress();
    const { colors } = useTheme();
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>('1');
    const [isFromAmountFocused, setIsFromAmountFocused] = useState<boolean>(false);
    const [isToAmountFocused, setIsToAmountFocused] = useState<boolean>(false);
    const fromAmountRef = useRef<{ blur: () => void; focus: () => void }>(null);
    const toAmountRef = useRef<{ blur: () => void; focus: () => void }>(null);
    const { shouldBeCompact, setInputFocused } = useKeyboardDetection();
    const t = useTranslations('translations');

    const handleFocusChange = useCallback((isFocused: boolean) => {
        console.log('🟦 FROM input focus change:', isFocused);
        console.log('🟦 Current toAmount focused state:', isToAmountFocused);
        console.log('🟦 toAmountRef.current:', toAmountRef.current);
        
        setIsFromAmountFocused(isFocused);
        // Unfocus the other input when this one is focused
        if (isFocused) {
            console.log('🟦 FROM input focused - attempting to blur TO input');
            setIsToAmountFocused(false);
            // Blur the other input in the DOM
            if (toAmountRef.current) {
                console.log('🟦 Calling toAmountRef.current.blur()');
                toAmountRef.current.blur();
            } else {
                console.log('🟦 toAmountRef.current is null!');
            }
        }
        setInputFocused(isFocused || isToAmountFocused);
        
        // Clear default value when focusing
        if (isFocused && fromAmount === '1') {
            setFromAmount('');
        }
        // Reset to default value when unfocusing and empty
        else if (!isFocused && fromAmount === '') {
            setFromAmount('1');
        }
    }, [setInputFocused, fromAmount, isToAmountFocused]);

    const handleFromAmountChange = useCallback((value: string) => {
        setFromAmount(value);
    }, []);

    const handleToAmountFocusChange = useCallback((isFocused: boolean) => {
        console.log('🟨 TO input focus change:', isFocused);
        console.log('🟨 Current fromAmount focused state:', isFromAmountFocused);
        console.log('🟨 fromAmountRef.current:', fromAmountRef.current);
        
        setIsToAmountFocused(isFocused);
        // Unfocus the other input when this one is focused
        if (isFocused) {
            console.log('🟨 TO input focused - attempting to blur FROM input');
            setIsFromAmountFocused(false);
            // Blur the other input in the DOM
            if (fromAmountRef.current) {
                console.log('🟨 Calling fromAmountRef.current.blur()');
                fromAmountRef.current.blur();
            } else {
                console.log('🟨 fromAmountRef.current is null!');
            }
        }
        setInputFocused(isFocused || isFromAmountFocused);
        
        // Clear default value when focusing
        if (isFocused && toAmount === '1') {
            setToAmount('');
        }
        // Reset to default value when unfocusing and empty
        else if (!isFocused && toAmount === '') {
            setToAmount('1');
        }
    }, [setInputFocused, toAmount, isFromAmountFocused]);

    const handleToAmountChange = useCallback((value: string) => {
        setToAmount(value);
    }, []);

    return (
        <div 
            className={`w-full relative z-10 flex flex-col items-center justify-center mx-auto 
                ${shouldBeCompact ? '' : 'mb-[22px]'}
            `}
            style={{
                maxWidth: '460px',
                padding: shouldBeCompact ? '0' : '20px'
            }}
        >
            {/* Title - only visible in expanded mode */}
            <span 
                className="text-[33px] mb-[20px] text-center"
                style={{
                    display: shouldBeCompact ? 'none' : 'block'
                }}
            >
                {t('swap_tokens')}
            </span>
            
            {/* Main form container */}
            <div 
                style={{ 
                    border: shouldBeCompact ? '' : '1px solid rgba(26, 188, 255, 1)', 
                    borderRadius: '15px', 
                    backgroundColor: colors.background,
                }}
                className="w-full"
            >
                <div className='z-20 w-full p-[15px] flex flex-col'>
                    <div className='flex flex-row items-center justify-between'>
                        <div className='flex flex-row w-full items-center gap-[5px]'>
                            {shouldBeCompact && (
                                <div style={{ width: '25px', height: '20px', overflow: 'hidden', transition: 'width 0.2s ease' }}>
                                    <Image
                                        src="/logo_sign.svg"
                                        alt="sign"
                                        width="25"
                                        height="20"
                                        style={{
                                            width: '25px !important',
                                            height: '20px !important',
                                            minWidth: '25px',
                                            minHeight: '20px',
                                            maxWidth: '25px',
                                            maxHeight: '20px',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            )}
                            {t('send')}
                        </div>
                        {walletAddress ? <div className='text-[#1ABCFF]'>
                            {t('max')}
                        </div> : null}
                        <div className='w-full flex justify-end gap-[5px]'>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/ston.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/not.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/ces.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/duck.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div data-custom-keyboard className='flex flex-row items-center gap-[5px] my-[5px]'>
                        <CustomInput
                            key="from-amount-input"
                            ref={fromAmountRef}
                            value={fromAmount}
                            onChange={handleFromAmountChange}
                            className='w-full text-[#1ABCFF] text-[33px]'
                            type='number'
                            placeholder='0'
                            onFocusChange={handleFocusChange}
                        />
                        <div className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[#1ABCFF] rounded-[15px]'>
                            <Image
                                src="/usdt.svg"
                                alt="sign"
                                width="20"
                                height="20"
                                style={{
                                    width: '20px !important',
                                    height: '20px !important',
                                    minWidth: '20px',
                                    minHeight: '20px',
                                    maxWidth: '20px',
                                    maxHeight: '20px',
                                    display: 'block',
                                }}
                            />
                            <span className='text-[#1ABCFF]'>
                                USDT
                            </span>
                            <MdKeyboardArrowRight 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#1ABCFF',
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center'>
                        <div className='w-full' style={{ opacity: 0.66 }}>
                            $1
                        </div>
                        {walletAddress ? <div className='flex flex-row gap-[5px]'>
                            <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                            <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>1111.00 USDT</span>
                        </div> : null}
                        <div className='flex flex-row w-full justify-end' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-[5px] mt-[5px] mb-[5px]'>
                        <div className='h-[1px] w-full bg-[#1ABCFF]'></div>
                        <div className='w-[30px] h-[30px] flex items-center justify-center'>
                            <Image
                                src="/rotate.svg"
                                alt="Rotate"
                                width="30"
                                height="30"
                                style={{
                                    width: '30px !important',
                                    height: '30px !important',
                                    minWidth: '30px',
                                    minHeight: '30px',
                                    maxWidth: '30px',
                                    maxHeight: '30px',
                                    display: 'block',
                                }}
                            />
                        </div>
                        <div className='h-[1px] w-full bg-[#1ABCFF]'></div>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        {t('get')}
                        <div className='w-full flex justify-end gap-[5px]'>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/ston.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/not.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/ces.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <div 
                                className='p-[2.5px] rounded-[15px] border-[1px] border-[#1ABCFF]'
                            >
                                <Image
                                    src="/duck.svg"
                                    alt="arrow"
                                    width="15"
                                    height="15"
                                    style={{
                                        width: '15px !important',
                                        height: '15px !important',
                                        minWidth: '15px',
                                        minHeight: '15px',
                                        maxWidth: '15px',
                                        maxHeight: '15px',
                                        display: 'block',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div data-custom-keyboard className='flex flex-row items-center gap-[5px] my-[5px]'>
                        <CustomInput
                            key="to-amount-input"
                            ref={toAmountRef}
                            value={toAmount}
                            onChange={handleToAmountChange}
                            className='w-full text-[#1ABCFF] text-[33px]'
                            type='number'
                            placeholder='0'
                            onFocusChange={handleToAmountFocusChange}
                        />
                        <div className='flex flex-row items-center gap-[5px] p-[5px] border-[1px] border-[#1ABCFF] rounded-[15px]'>
                            <Image
                                src="/usdt.svg"
                                alt="sign"
                                width="20"
                                height="20"
                                style={{
                                    width: '20px !important',
                                    height: '20px !important',
                                    minWidth: '20px',
                                    minHeight: '20px',
                                    maxWidth: '20px',
                                    maxHeight: '20px',
                                    display: 'block',
                                }}
                            />
                            <span className='text-[#1ABCFF]'>
                                USDT
                            </span>
                            <MdKeyboardArrowRight 
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#1ABCFF',
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center'>
                        <div className='w-full' style={{ opacity: 0.66 }}>
                            $1
                        </div>
                        <div className='flex flex-row gap-[5px]'>
                            <div style={{ 
                                display: (!walletAddress && shouldBeCompact) ? 'block' : 'none',
                                transition: 'display 0.2s ease',
                                zIndex: 1002,
                                position: 'relative',
                                pointerEvents: 'auto'
                            }}>
                                <CustomTonConnectButton />
                            </div>
                            <div style={{ 
                                display: walletAddress ? 'flex' : 'none',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'display 0.2s ease'
                            }}>
                                <IoWalletSharp style={{ height: '20px', width: '20px', opacity: 0.66 }} />
                                <span className='whitespace-nowrap' style={{ opacity: 0.66 }}>576.00 TON</span> 
                            </div>
                        </div>
                        <div className='flex flex-row w-full justify-end' style={{ opacity: 0.66 }}>
                            On TON
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}