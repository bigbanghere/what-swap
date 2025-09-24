"use client";

import { useState } from 'react';
import { RoutingApi } from '@swap-coffee/sdk';

export default function TestSDKPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testSDK = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🧪 Testing swap.coffee SDK directly...');
      
      // Create routing API instance
      const routingApi = new RoutingApi({
        baseUrl: 'https://backend.swap.coffee',
      });

      // Test parameters
      const inputToken = {
        blockchain: "ton" as const,
        address: "native" // TON native token
      };

      const outputToken = {
        blockchain: "ton" as const,
        address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe" // USDT
      };

      const inputAmount = 1; // 1 TON

      console.log('🧪 Test parameters:', {
        inputToken,
        outputToken,
        inputAmount
      });

      // Call the API
      const route = await routingApi.buildRoute({
        input_token: inputToken,
        output_token: outputToken,
        input_amount: inputAmount,
      });

      console.log('🧪 SDK Response:', route);

      if (route.data && route.data.output_amount) {
        const outputAmount = route.data.output_amount;
        const formattedAmount = (outputAmount / Math.pow(10, 9)).toFixed(6);
        setResult(`✅ Success! 1 TON = ${formattedAmount} USDT`);
      } else {
        setResult('❌ No output amount in response');
      }

    } catch (error: any) {
      console.error('🧪 SDK Test Error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Swap.coffee SDK Test</h1>
      
      <button 
        onClick={testSDK} 
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
        {loading ? 'Testing...' : 'Test SDK'}
      </button>

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
        <p>This test will:</p>
        <ul>
          <li>Create a RoutingApi instance</li>
          <li>Test swapping 1 TON to USDT</li>
          <li>Show the output amount or any errors</li>
        </ul>
      </div>
    </div>
  );
}
