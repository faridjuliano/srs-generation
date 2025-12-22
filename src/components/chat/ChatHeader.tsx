interface ChatHeaderProps {
  provider: 'openai' | 'gemini';
  onProviderChange: (provider: 'openai' | 'gemini') => void;
}

export function ChatHeader({ provider, onProviderChange }: ChatHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
      <nav className="flex text-sm text-slate-500 dark:text-slate-400">
        <a className="hover:text-primary" href="#">
          Chat
        </a>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-medium">Conversation</span>
      </nav>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="provider" className="text-slate-600 dark:text-slate-400">
            Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => onProviderChange(e.target.value as 'openai' | 'gemini')}
            className="rounded-lg border border-slate-300 bg-white dark:bg-[#202434] dark:border-slate-700 px-3 py-1.5 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
      </div>
    </header>
  );
}

