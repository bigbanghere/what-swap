import { ApiTokenAddress } from '@swap-coffee/sdk';

export interface BuildRouteRequest {
  input_token: ApiTokenAddress;
  output_token: ApiTokenAddress;
  input_amount: number;
}

export interface BuildRouteResponse {
  data: {
    output_amount: number;
    paths: any[];
  };
}

export class SwapCoffeeProxy {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/swap-coffee') {
    this.baseUrl = baseUrl;
  }

  async buildRoute(request: BuildRouteRequest): Promise<BuildRouteResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '/api/v1/routing/build-route',
          data: request,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('SwapCoffeeProxy buildRoute error:', error);
      throw error;
    }
  }

  async buildTransactionsV2(request: any): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '/api/v1/routing/build-transactions-v2',
          data: request,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('SwapCoffeeProxy buildTransactionsV2 error:', error);
      throw error;
    }
  }
}
