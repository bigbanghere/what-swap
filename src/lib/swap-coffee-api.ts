// Swap.coffee API client for token data
export interface Jetton {
  created_at: string;
  address: string;
  total_supply: string;
  name: string;
  symbol: string;
  decimals: number;
  mintable: boolean;
  verification: 'BLACKLISTED' | 'UNKNOWN' | 'COMMUNITY' | 'WHITELISTED';
  contract_interface: string;
  image_url: string;
  market_stats?: {
    holders_count: number;
    price_usd: number;
    price_change_5m: number;
    price_change_1h: number;
    price_change_6h: number;
    price_change_24h: number;
    volume_usd_24h: number;
    tvl_usd: number;
    fdmc: number;
    trust_score: number;
  };
  labels: Array<{
    label: string;
    label_id: number;
    created_at: string;
    expires_at: string;
  }>;
}

export interface JettonsResponse {
  data: Jetton[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

export interface JettonsParams {
  search?: string;
  verification?: string[];
  label_id?: number;
  page?: number;
  size?: number;
}

class SwapCoffeeApiClient {
  private baseURL = 'https://tokens.swap.coffee/api/v3';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v.toString()));
          } else {
            url.searchParams.append(key, value.toString());
          }
        }
      });
    }

    console.log(`🔗 Final API URL: ${url.toString()}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getJettons(params: JettonsParams = {}): Promise<Jetton[]> {
    const {
      search,
      verification,
      label_id,
      page = 1,
      size = 100, // Changed back to 100 for proper API pagination
    } = params;

    const queryParams: Record<string, any> = {
      page,
      size,
    };

    if (search) {
      queryParams.search = search;
    }

    if (verification && verification.length > 0) {
      queryParams.verification = verification;
    }

    if (label_id) {
      queryParams.label_id = label_id;
    }

    return this.request<Jetton[]>('/jettons', queryParams);
  }

  async getJettonsPaginated(params: JettonsParams = {}): Promise<JettonsResponse> {
    const { page = 1, size = 100 } = params; // Changed back to 100 for proper API pagination
    
    console.log(`🌐 API Request: Fetching page ${page} with size ${size}`, params);
    
    const jettons = await this.getJettons(params);
    
    console.log(`✅ API Response: Received ${jettons.length} tokens from Swap Coffee API`);
    
    return {
      data: jettons,
      total: jettons.length,
      page,
      size,
      hasMore: jettons.length === size, // If we got exactly the requested size, there might be more
    };
  }

  async getJettonByAddress(address: string): Promise<Jetton> {
    console.log(`🌐 API Request: Fetching jetton by address ${address}`);
    
    const jetton = await this.request<Jetton>(`/jettons/${address}`);
    
    console.log(`✅ API Response: Received jetton data for ${jetton.symbol} (${jetton.name})`);
    
    return jetton;
  }
}

export const swapCoffeeApiClient = new SwapCoffeeApiClient();

