interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  provider: 'openai' | 'gemini';
}

export function ChatInput({
  input,
  onInputChange,
  onSendMessage,
  isLoading,
  onKeyDown,
  provider,
}: ChatInputProps) {
  return (
    <div className="px-8 py-6 bg-white dark:bg-[#161926] border-t border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex items-end gap-4">
          <input
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#202434] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Using {provider === 'openai' ? 'OpenAI' : 'Gemini'} with rules & verification</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}

