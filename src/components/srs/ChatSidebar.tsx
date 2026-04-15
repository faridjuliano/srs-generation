"use client";

import { useEffect, useId, useRef, useState } from 'react';
import type { Message } from '@/lib/types';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  srsContent?: Record<string, unknown>;
  formData?: Record<string, unknown>;
  onSRSUpdate?: (updatedContent: Record<string, unknown>) => void;
}

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  srsContent,
  formData,
  onSRSUpdate
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarId = useId();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // New backend contract: send current SRS content + user instruction.
      const requestBody = {
        content: srsContent ?? {},
        instruction: input,
        history: [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content
        })),
        formData: formData ?? {}
      };

      // Send to SRS-aware chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        setError('Failed to send message');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log(data, "datadatadatadatadata")

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        // content: data.message?.content || data.response || data.message || data.result || 'I could not generate a response.'
        content: 'Regenerated SRS content received. The SRS document has been updated based on your instruction.'
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If there's a regenerated SRS, update the parent component
      const updatedContent = data.updatedSRS || data.content || data.updatedContent || data.fixedContent;
      if (updatedContent && onSRSUpdate) {
        onSRSUpdate(updatedContent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <aside
        id={sidebarId}
        role="complementary"
        aria-label="AI Assistant chat drawer"
        className={`w-80 h-full bg-white dark:bg-[#161926] border-l border-[#e7e9f3] dark:border-[#2a2e3b] flex flex-col flex-shrink-0 z-20 shadow-xl fixed lg:static inset-y-0 right-0 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#e7e9f3] dark:border-[#2a2e3b] bg-slate-50/50 dark:bg-[#1a1d2d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <h2 className="font-bold text-slate-900 dark:text-white">AI Assistant</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Close chat"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">
                smart_toy
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                AI Assistant
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                Ask me to edit or regenerate any part of your SRS document
              </p>
              <div className="text-left text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <p>💡 Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"Make functional requirements more detailed"</li>
                  <li>"Improve security requirements"</li>
                  <li>"Add more user characteristics"</li>
                  <li>"Regenerate the introduction"</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-[#202434] text-slate-900 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-[#202434] px-3 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#e7e9f3] dark:border-[#2a2e3b] bg-white dark:bg-[#161926] p-4 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#202434] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}


