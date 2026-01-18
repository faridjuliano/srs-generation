"use client";

import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageArea } from '@/components/chat/MessageArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatInfoPanel } from '@/components/chat/ChatInfoPanel';
import { useChat } from '@/hooks/useChat';

export default function ChatPage() {
  const {
    messages,
    input,
    loading,
    error,
    useRag,
    setInput,
    setUseRag,
    sendMessage,
    resetChat,
  } = useChat();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-[#0d101b] dark:text-white transition-colors duration-200">
      <Sidebar onNewChat={resetChat} className="hidden md:block" />

      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <ChatHeader useRag={useRag} onUseRagChange={setUseRag} />
        <MessageArea
          messages={messages}
          isLoading={loading}
          error={error}
        />
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          isLoading={loading}
          onKeyDown={handleKeyDown}
        />
      </main>

      <ChatInfoPanel messageCount={messages.length} isLoading={loading} className="hidden lg:block" />
    </div>
  );
}
