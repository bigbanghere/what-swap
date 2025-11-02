"use client";

import { useState, useRef, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { useUserTokensCache } from '@/hooks/use-user-tokens-cache';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Wallet Assistant Chatbot Component
 * 
 * Features:
 * - Wallet-aware chat
 * - Balance analysis
 * - Swap recommendations
 * - Earning strategies
 */
export function WalletChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your wallet assistant. I can help you:\n- Check your wallet balance\n- Analyze your holdings\n- Suggest swap opportunities\n- Recommend earning strategies\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const walletAddress = useTonAddress();
  const { userTokens, tonBalance } = useUserTokensCache(walletAddress);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare context
      const context = walletAddress ? {
        walletAddress,
        tonBalance: tonBalance?.balanceFormatted || '0',
        userTokens: userTokens?.map(token => ({
          symbol: token.jetton.symbol,
          balance: token.balance,
          address: token.jetton.address,
          price: token.jetton.market_stats?.price_usd,
        })) || [],
      } : undefined;

      // Call chatbot API
      const response = await fetch('/api/chatbot/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          walletAddress,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Handle actionable items (optional - can trigger UI actions)
      if (data.actionable) {
        console.log('Actionable intent:', data.actionable);
        // You can add UI actions here, e.g., prefill swap form
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or connect your wallet for better assistance.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '💰 My Balance', message: 'Show my wallet balance' },
    { label: '📊 Analyze Portfolio', message: 'Analyze my portfolio' },
    { label: '🔄 Suggest Swaps', message: 'Suggest swap opportunities' },
    { label: '🚀 Earning Ideas', message: 'How can I earn more?' },
  ];

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Wallet Assistant</h3>
          {walletAddress && (
            <span className="ml-auto text-xs text-muted-foreground">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </span>
          )}
        </div>
        {!walletAddress && (
          <p className="text-xs text-muted-foreground mt-1">
            Connect wallet for personalized help
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.message)}
                className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your wallet, swaps, or earning..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

