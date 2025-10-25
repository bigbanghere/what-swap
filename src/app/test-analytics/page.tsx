"use client";

import { useEffect, useState } from 'react';
import { TelegramAnalytics } from '@/lib/telegram-analytics';

export default function TestAnalyticsPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Testing Telegram Analytics initialization...');
    
    try {
      // Test if TelegramAnalytics is available and has the required methods
      if (TelegramAnalytics && typeof TelegramAnalytics.init === 'function' && typeof TelegramAnalytics.registerInvoice === 'function') {
        addLog('✅ Telegram Analytics module is available and properly imported');
        addLog('✅ Analytics methods: init() and registerInvoice() are available');
        setIsInitialized(true);
      } else {
        addLog('❌ Telegram Analytics module not properly imported');
        addLog(`Available methods: ${Object.keys(TelegramAnalytics || {})}`);
      }
    } catch (error) {
      addLog(`❌ Error checking analytics: ${error}`);
    }
  }, []);

  const testInvoiceRegistration = () => {
    try {
      // Test registerInvoice method with proper invoice payload structure
      TelegramAnalytics.registerInvoice({
        slug: 'test-invoice',
        title: 'Test Invoice for Analytics',
        description: 'Test invoice for analytics tracking',
        payload: 'test-payload-123',
        currency: 'TON',
        prices: [
          {
            label: 'Test Item',
            amount: 1000000000 // 1 TON in nanoTON
          }
        ]
      });
      addLog('✅ Invoice registration test completed');
    } catch (error) {
      addLog(`❌ Invoice registration failed: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Telegram Analytics Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <p className={isInitialized ? 'text-green-600' : 'text-red-600'}>
          {isInitialized ? '✅ Analytics Initialized' : '❌ Analytics Not Initialized'}
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
        <button
          onClick={testInvoiceRegistration}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Invoice Registration
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
