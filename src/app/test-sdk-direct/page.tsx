"use client";

import { useState } from 'react';
import { ApiTokenAddress, RoutingApi } from "@swap-coffee/sdk";

export default function TestSDKDirectPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testSDKDirect = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🧪 Testing swap.coffee SDK directly (exact format from reference)...');
      
      // Create routing API instance exactly like in your reference
      const routingApi = new RoutingApi();

      // Use the exact format from your reference
      const assetIn: ApiTokenAddress = {
        blockchain: "ton",
        address: "native" // stands for TON
      };
      
      const assetOut: ApiTokenAddress = {
        blockchain: "ton",
        address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe" // USDT from the app
      };

      const input_amount = 5; // 5 TON as in your reference

      console.log('🧪 SDK Test parameters:', {
        assetIn,
        assetOut,
        input_amount
      });

      // Build route exactly like in your reference
      const route = await routingApi.buildRoute({
        input_token: assetIn,
        output_token: assetOut,
        input_amount: input_amount,
      });

      console.log('🧪 SDK Response:', route);

      if (route.data && route.data.output_amount) {
        const outputAmount = route.data.output_amount;
        const formattedAmount = outputAmount.toFixed(6);
        setResult(`✅ SDK Success! 5 TON = ${formattedAmount} CES`);
      } else {
        setResult('❌ No output amount in SDK response');
      }

    } catch (error: any) {
      console.error('🧪 SDK Direct Test Error:', error);
      setError(`SDK Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithCES = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🧪 Testing with CES token from your reference...');
      
      const routingApi = new RoutingApi();

      const assetIn: ApiTokenAddress = {
        blockchain: "ton",
        address: "native"
      };
      
      const assetOut: ApiTokenAddress = {
        blockchain: "ton",
        address: "EQCl0S4xvoeGeFGijTzicSA8j6GiiugmJW5zxQbZTUntre-1" // CES from your reference
      };

      const input_amount = 5;

      console.log('🧪 CES Test parameters:', {
        assetIn,
        assetOut,
        input_amount
      });

      const route = await routingApi.buildRoute({
        input_token: assetIn,
        output_token: assetOut,
        input_amount: input_amount,
      });

      console.log('🧪 CES Response:', route);

      if (route.data && route.data.output_amount) {
        const outputAmount = route.data.output_amount;
        const formattedAmount = outputAmount.toFixed(6);
        setResult(`✅ CES Success! 5 TON = ${formattedAmount} CES`);
      } else {
        setResult('❌ No output amount in CES response');
      }

    } catch (error: any) {
      console.error('🧪 CES Test Error:', error);
      setError(`CES Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Swap.coffee SDK Direct Test</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={testSDKDirect} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test TON→USDT (SDK)'}
        </button>

        <button 
          onClick={testWithCES} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test TON→CES (SDK)'}
        </button>
      </div>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          <strong>Result:</strong> {result}
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>This test uses the SDK exactly like your reference code:</p>
        <ul>
          <li><strong>TON→USDT:</strong> Uses the USDT address from the app</li>
          <li><strong>TON→CES:</strong> Uses the CES address from your reference</li>
          <li>Both tests use the exact same format as your reference</li>
        </ul>
      </div>
    </div>
  );
}
