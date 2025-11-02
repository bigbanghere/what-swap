'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTonAddress } from '@tonconnect/ui-react';
import { useUserTokensCache } from '@/hooks/use-user-tokens-cache';
import { useTheme } from '@/core/theme';
import { Page } from '@/components/Page';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * AI Assistant Page
 * Uses Hugging Face Spaces with free GPU
 */
export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your AI wallet assistant powered by Hugging Face.\n\nI can help you:\n💰 Check wallet balance & analyze holdings\n📊 Analyze blockchain data & portfolio\n🔄 Suggest optimal swap opportunities\n🚀 Recommend earning strategies\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { colors } = useTheme();

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
      // Prepare wallet context
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

      // Call chatbot API (uses Hugging Face)
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
    <Page back={true}>
      <div 
        className="flex flex-col h-screen"
        style={{ backgroundColor: colors.background, color: colors.text }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex items-center gap-3"
          style={{ borderColor: colors.border || 'rgba(255, 255, 255, 0.1)' }}
        >
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <MessageSquare className="w-5 h-5" style={{ color: colors.primary }} />
            <h1 className="text-lg font-semibold">AI Assistant</h1>
          </div>
          {walletAddress && (
            <div 
              className="px-3 py-1 rounded-full text-xs"
              style={{ backgroundColor: colors.cardBackground }}
            >
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </div>
          )}
        </div>

        {!walletAddress && (
          <div 
            className="mx-4 mt-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: colors.cardBackground, opacity: 0.8 }}
          >
            💡 Connect your wallet for personalized assistance with your holdings!
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'rounded-br-sm'
                    : 'rounded-bl-sm'
                }`}
                style={{
                  backgroundColor: msg.role === 'user' 
                    ? colors.primary 
                    : colors.cardBackground,
                  color: msg.role === 'user' ? '#fff' : colors.text,
                }}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
                <span 
                  className="text-xs mt-2 block opacity-70"
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div 
                className="rounded-lg px-4 py-3 rounded-bl-sm"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions (only show on first message) */}
        {messages.length === 1 && (
          <div 
            className="px-4 pt-2 pb-20 border-t"
            style={{ borderColor: colors.border || 'rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-xs mb-2 opacity-70">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.message)}
                  className="text-xs px-3 py-2 rounded-full transition-all hover:scale-105"
                  style={{ backgroundColor: colors.cardBackground }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div 
          className="p-4 border-t pb-20"
          style={{ 
            borderColor: colors.border || 'rgba(255, 255, 255, 0.1)',
            backgroundColor: colors.background,
          }}
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your wallet, swaps, or earning..."
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: colors.cardBackground,
                color: colors.text,
                border: `1px solid ${colors.border || 'rgba(255, 255, 255, 0.1)'}`,
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{
                backgroundColor: colors.primary,
                color: '#fff',
                minWidth: '48px',
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </Page>
  );
}

