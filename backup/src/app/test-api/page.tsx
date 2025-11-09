"use client";

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testDirectAPI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🧪 Testing direct API call to swap.coffee...');
      
      const requestBody = {
        input_token: {
          blockchain: "ton",
          address: "native"
        },
        output_token: {
          blockchain: "ton", 
          address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe" // USDT token from the app
        },
        input_amount: 5 // 5 TON as in your reference
      };

      console.log('🧪 Request body:', requestBody);

      const response = await fetch('https://backend.swap.coffee/api/v1/routing/build-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🧪 Response data:', data);

      if (data.data && data.data.output_amount) {
        const outputAmount = data.data.output_amount;
        const formattedAmount = outputAmount.toFixed(6);
        setResult(`✅ Success! 5 TON = ${formattedAmount} USDT`);
      } else {
        setResult('❌ No output amount in response');
      }

    } catch (error: any) {
      console.error('🧪 API Test Error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testOurProxy = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🧪 Testing our proxy API...');
      
      const requestBody = {
        endpoint: '/api/v1/routing/build-route',
        data: {
          input_token: {
            blockchain: "ton",
            address: "native"
          },
          output_token: {
            blockchain: "ton", 
            address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe" // USDT token from the app
          },
          input_amount: 5 // 5 TON as in your reference
        }
      };

      console.log('🧪 Proxy request body:', requestBody);

      const response = await fetch('/api/swap-coffee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🧪 Proxy response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🧪 Proxy response data:', data);

      if (data.data && data.data.output_amount) {
        const outputAmount = data.data.output_amount;
        const formattedAmount = outputAmount.toFixed(6);
        setResult(`✅ Proxy Success! 5 TON = ${formattedAmount} USDT`);
      } else {
        setResult('❌ No output amount in proxy response');
      }

    } catch (error: any) {
      console.error('🧪 Proxy Test Error:', error);
      setError(`Proxy Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Swap.coffee API Test</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testDirectAPI} 
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
          {loading ? 'Testing...' : 'Test Direct API'}
        </button>

        <button 
          onClick={testOurProxy} 
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
          {loading ? 'Testing...' : 'Test Our Proxy'}
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
        <p>This test will:</p>
        <ul>
          <li><strong>Direct API:</strong> Call swap.coffee API directly (may fail due to CORS)</li>
          <li><strong>Our Proxy:</strong> Call our Next.js API proxy</li>
          <li>Test swapping 1 TON to USDT</li>
          <li>Show the output amount or any errors</li>
        </ul>
      </div>
    </div>
  );
}
