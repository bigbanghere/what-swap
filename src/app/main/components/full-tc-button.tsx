"use client";

import { useState } from "react";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { IoLogOutSharp, IoChevronDownSharp, IoWalletSharp, IoCopySharp, IoCheckmarkSharp } from "react-icons/io5";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/main/components/popover";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from '@/core/theme';
import { useTranslations } from "next-intl";
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

export function CustomTonConnectButton() {
  const { shouldBeCompact } = useKeyboardDetection();
  const t = useTranslations('translations');
  const walletAddress = useTonAddress();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { colors, isDark } = useTheme();

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setIsCopied(true);
        toast({ title: "Address copied to clipboard" });
        
        // Remove focus from the button
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        
        // Reset the icon after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  const handleDisconnect = () => {
    tonConnectUI.disconnect();
    setIsOpen(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}..${address.slice(-4)}`;
  };

  if (!walletAddress) {
    if (!shouldBeCompact) {
      return (
        <div className="flex flex-row items-center gap-[5px] h-[40px] px-[15px] rounded-[15px]"
          onClick={() => tonConnectUI.openModal()}
          style={{
            backgroundColor: "#1ABCFF",
            color: colors.text,
          }}
        >
          <IoWalletSharp />
          {t('connect')}
        </div>
      );
    }
    return (
      <div
        className="flex flex-row items-center gap-[5px]"
        style={{
          color: "#1ABCFF",
        }}
        onClick={() => tonConnectUI.openModal()}
      >
        <IoWalletSharp />
        {t('connect')}
      </div>
    );
  }

    if (shouldBeCompact) {
      return (
        <div
          onClick={() => tonConnectUI.openModal()}
        >
          WC
          <IoWalletSharp />
          {t('connect')}
        </div>
      );
    }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex flex-row items-center gap-[5px] h-[40px] px-[15px] rounded-[15px]"
          style={{
            backgroundColor: "#1ABCFF",
            color: colors.text,
          }}
        >
          <IoWalletSharp className="" />
          <span className="">
            {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : ''}
          </span>
          <IoChevronDownSharp className={`!w-[16px] !h-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </PopoverTrigger>
      <PopoverContent 
         className="border w-fit py-[12px]" 
         sideOffset={6}
         style={{
           backgroundColor: colors.secondaryBackground,
           color: colors.text,
           borderColor: colors.divider,
         }}
         align="end">
        <div className="pl-[16px] space-y-[10px]">
            <div
              className="text-[14px] mr-[16px] !h-[20px] w-full justify-start gap-2 transition-colors focus:outline-none focus:ring-0 focus:border-0"
              onClick={handleCopyAddress}
              onBlur={(e) => e.currentTarget.blur()}
            >
            {formatAddress(walletAddress)}
            {isCopied ? (
              <IoCheckmarkSharp 
                className="ml-[2px] !w-[16px] !h-[16px]"
                style={{
                  color: colors.success,
                }}
              />
            ) : (
              <IoCopySharp 
                className="ml-[2px] !w-[16px] !h-[16px]"
                style={{
                  color: colors.segmentedUnselectedText,
                }}
              />
            )}
          </div>
          <div 
            className="border-t"
            style={{
              borderColor: colors.divider,
            }}
          />
            <div
              className="text-[14px] !h-[20px] w-full justify-start gap-2 transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
              onClick={handleDisconnect}
              onBlur={(e) => e.currentTarget.blur()}
            >
            WF
            {t('disconnect')}
            <IoLogOutSharp 
              className="ml-[2px] !w-[20px] !h-[20px]"
              style={{
                color: colors.segmentedUnselectedText,
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
