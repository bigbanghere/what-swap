"use client";

import { swapCoffeeApiClient } from './swap-coffee-api';

export interface TONBalance {
  balance: string; // Balance in nanoTON (raw units)
  balanceFormatted: string; // Balance in TON (human-readable)
  address: string;
}

export class TONBalanceService {
  private static cache = new Map<string, { balance: TONBalance; timestamp: number }>();
  private static readonly CACHE_DURATION = 30 * 1000; // 30 seconds cache

  static async getTONBalance(walletAddress: string): Promise<TONBalance> {
    // Check cache first
    const cached = this.cache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🔄 TONBalance: Using cached balance for', walletAddress);
      return cached.balance;
    }

    try {
      console.log('🔄 TONBalance: Fetching TON balance for', walletAddress);
      
      // Get balance from swap.coffee API
      const balanceNanoTON = await swapCoffeeApiClient.getTONBalance(walletAddress);
      
      // Convert from nanoTON to TON (1 TON = 1e9 nanoTON)
      // Use floating point division to preserve decimal places
      const balanceTON = (parseFloat(balanceNanoTON) / 1000000000).toString();
      
      // Format balance for display
      const balanceFormatted = this.formatTONBalance(balanceTON);

      const tonBalance: TONBalance = {
        balance: balanceNanoTON,
        balanceFormatted,
        address: walletAddress,
      };

      // Cache the result
      this.cache.set(walletAddress, {
        balance: tonBalance,
        timestamp: Date.now(),
      });

      console.log('✅ TONBalance: Fetched TON balance:', balanceFormatted, 'TON');
      return tonBalance;

    } catch (error) {
      console.error('❌ TONBalance: Failed to fetch TON balance:', error);
      
      // Return zero balance on error
      const zeroBalance: TONBalance = {
        balance: '0',
        balanceFormatted: '0',
        address: walletAddress,
      };

      return zeroBalance;
    }
  }

  private static formatTONBalance(balance: string): string {
    const numericBalance = parseFloat(balance);
    
    if (numericBalance === 0) {
      return '0';
    }
    
    // If it's a whole number, return without decimal places
    if (numericBalance % 1 === 0) {
      return numericBalance.toString();
    }
    
    // For decimal numbers, remove trailing zeros and limit to 6 decimal places
    return parseFloat(numericBalance.toFixed(6)).toString();
  }

  static clearCache(walletAddress?: string) {
    if (walletAddress) {
      this.cache.delete(walletAddress);
    } else {
      this.cache.clear();
    }
  }
}
