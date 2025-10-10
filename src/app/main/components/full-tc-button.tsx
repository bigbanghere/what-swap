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
        <div 
          data-custom-keyboard
          className="flex flex-row items-center gap-[5px] h-[40px] px-[15px] rounded-[] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            tonConnectUI.openModal();
          }}
          style={{
            backgroundColor: "",
            color: "#FFFFFF",
            zIndex: 1001,
            position: 'relative'
          }}
        >
          <IoWalletSharp />
          {t('connect')}
        </div>
      );
    }
    return (
      <div
        data-custom-keyboard
        className="flex flex-row items-center gap-[5px] cursor-pointer"
        style={{
          color: "#007AFF",
          zIndex: 1001,
          position: 'relative'
        }}
        onClick={(e) => {
          e.stopPropagation();
          tonConnectUI.openModal();
        }}
      >
        <IoWalletSharp />
        {t('connect')}
      </div>
    );
  }

    if (shouldBeCompact) {
      return (
        <div
          data-custom-keyboard
          className="cursor-pointer"
          style={{
            zIndex: 1001,
            position: 'relative'
          }}
          onClick={(e) => {
            e.stopPropagation();
            tonConnectUI.openModal();
          }}
        >
          <IoWalletSharp />
          {t('connect')}
        </div>
      );
    }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          data-custom-keyboard
          className="flex flex-row items-center gap-[5px] h-[40px] px-[15px] rounded-[15px]"
          style={{
            border: `1px solid rgba(0, 122, 255, 0.22)`,
            color: `1px solid rgba(0, 122, 255, 1)`,
            zIndex: 1001,
            position: 'relative'
          }}
        >
          <IoWalletSharp 
            className="" 
            style={{
              color: 'rgba(0, 122, 255, 0.44)',
            }}
          />
          <span 
            className=""
            style={{
              color: "rgba(0, 122, 255, 1)",
            }}
          >
            {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : ''}
          </span>
          <IoChevronDownSharp 
            className={`!w-[16px] !h-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{
              color: 'rgba(0, 122, 255, 0.22)',
            }}
          />
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
              className="flex flex-row items-center mr-[16px] !h-[20px] w-full justify-start gap-2 transition-colors focus:outline-none focus:ring-0 focus:border-0"
              onClick={handleCopyAddress}
              onBlur={(e) => e.currentTarget.blur()}
            >
            {t('copy_address')}
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
              className="flex flex-row items-center text-[14px] !h-[20px] w-full justify-start gap-2 transition-colors focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
              onClick={handleDisconnect}
              onBlur={(e) => e.currentTarget.blur()}
            >
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
