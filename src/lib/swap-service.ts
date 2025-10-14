"use client";

import { ApiTokenAddress, RoutingApi, waitForRouteResults } from '@swap-coffee/sdk';
import { useTonConnectUI } from '@tonconnect/ui-react';

export interface SwapParams {
  fromToken: any;
  toToken: any;
  fromAmount: string;
  toAmount: string;
  slippage?: number;
}

export interface SwapResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  routeId?: string;
}

export class SwapService {
  private routingApi: RoutingApi;

  constructor() {
    this.routingApi = new RoutingApi();
  }

  // Convert token to ApiTokenAddress format
  private convertToApiTokenAddress(token: any): ApiTokenAddress {
    if (!token) {
      throw new Error('Token is required');
    }

    // Handle native TON
    if (token.symbol === 'TON' || token.address === 'native') {
      return {
        blockchain: "ton",
        address: "native"
      };
    }

    // Handle other tokens
    return {
      blockchain: "ton",
      address: token.address
    };
  }

  // Execute a swap transaction
  async executeSwap(
    params: SwapParams,
    tonConnectUI: any,
    walletAddress: string
  ): Promise<SwapResult> {
    try {
      console.log('🔄 Starting swap execution:', params);

      const { fromToken, toToken, fromAmount, toAmount, slippage = 0.1 } = params;

      // Convert tokens to API format
      const assetIn = this.convertToApiTokenAddress(fromToken);
      const assetOut = this.convertToApiTokenAddress(toToken);
      const inputAmount = parseFloat(fromAmount);

      console.log('🔄 Building route for swap:', {
        from: assetIn,
        to: assetOut,
        amount: inputAmount
      });

      // Build the route
      const route = await this.routingApi.buildRoute({
        input_token: assetIn,
        output_token: assetOut,
        input_amount: inputAmount,
      });

      if (!route.data) {
        throw new Error('No route found for this swap');
      }

      console.log('🔄 Route built successfully:', route.data);

      // Build transactions
      const transactions = await this.routingApi.buildTransactionsV2({
        sender_address: walletAddress,
        slippage: slippage,
        paths: route.data.paths,
      });

      if (!transactions.data || !transactions.data.transactions) {
        throw new Error('Failed to build transactions');
      }

      console.log('🔄 Transactions built successfully:', transactions.data.transactions);

      // Prepare messages for TonConnect
      const messages = transactions.data.transactions.map((transaction: any) => ({
        address: transaction.address,
        amount: transaction.value,
        payload: transaction.cell,
      }));

      console.log('🔄 Sending transaction to wallet:', messages);

      // Send transaction through TonConnect
      const result = await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        messages: messages,
      });

      console.log('✅ Transaction sent successfully:', result);

      // Wait for route results
      if (transactions.data.route_id) {
        console.log('🔄 Waiting for route results...');
        const routeResults = await waitForRouteResults(
          transactions.data.route_id,
          this.routingApi
        );
        console.log('✅ Route results:', routeResults);
      }

      return {
        success: true,
        transactionHash: result,
        routeId: transactions.data.route_id
      };

    } catch (error) {
      console.error('❌ Swap execution failed:', error);
      
      let errorMessage = 'Swap failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Validate swap parameters
  validateSwapParams(params: SwapParams): { valid: boolean; error?: string } {
    const { fromToken, toToken, fromAmount, toAmount } = params;

    if (!fromToken) {
      return { valid: false, error: 'From token is required' };
    }

    if (!toToken) {
      return { valid: false, error: 'To token is required' };
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return { valid: false, error: 'Invalid from amount' };
    }

    if (!toAmount || parseFloat(toAmount) <= 0) {
      return { valid: false, error: 'Invalid to amount' };
    }

    if (fromToken.address === toToken.address) {
      return { valid: false, error: 'Cannot swap token to itself' };
    }

    return { valid: true };
  }
}

// Export a singleton instance
export const swapService = new SwapService();
