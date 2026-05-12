"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Message } from '@/lib/types';

interface FrNfrChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  content?: Record<string, unknown>;
  onContentUpdate?: (updated: Record<string, unknown>) => void;
  userId?: string;
  projectId?: string;
}

export default function FrNfrChatSidebar({
  isOpen,
  onClose,
  content,
  onContentUpdate,
  userId,
  projectId
}: FrNfrChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sidebarId = useId();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const body = {
        userId,
        projectId,
        instruction: input,
        validationModel: 'rule-based'
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/srs/reprompt-fr-nfr-v2/${userId}/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || 'Failed to reprompt FR/NFR content.';
        setError(message);
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${message}` }]);
        return;
      }

      const data = await response.json();
      const updatedContent = data.content || data.updatedContent || data.updatedSRS || data.fixedContent;

      const assistantText =
        data.message?.content ||
        data.message ||
        data.response ||
        (updatedContent ? 'FR/NFR content has been updated from your prompt.' : 'I could not generate an update.');

      setMessages(prev => [...prev, { role: 'assistant', content: String(assistantText) }]);

      if (updatedContent && onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <>
      <aside
        id={sidebarId}
        role="complementary"
        aria-label="FR/NFR reprompt chat"
        className={`w-80 h-full bg-white dark:bg-[#161926] border-l border-[#e7e9f3] dark:border-[#2a2e3b] flex flex-col flex-shrink-0 z-20 shadow-xl fixed lg:static inset-y-0 right-0 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-[#e7e9f3] dark:border-[#2a2e3b] bg-slate-50/50 dark:bg-[#1a1d2d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <h2 className="font-bold text-slate-900 dark:text-white">FR/NFR Assistant</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">smart_toy</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Reprompt FR/NFR</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Ask for changes only in functional and non-functional requirements.</p>
              <div className="text-left text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"Add 2 security NFRs for MFA and session timeout"</li>
                  <li>"Improve FR wording to be more testable"</li>
                  <li>"Increase traceability between FR and features"</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

              <div ref={endRef} />
            </>
          )}
        </div>

        <div className="border-t border-[#e7e9f3] dark:border-[#2a2e3b] bg-white dark:bg-[#161926] p-4 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Prompt FR/NFR updates..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#202434] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              onClick={() => void handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      </aside>

      {/*Overlay removed - chat is always open*/}
    </>
  );
}


