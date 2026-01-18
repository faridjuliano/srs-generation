interface ChatHeaderProps {
  useRag: boolean;
  onUseRagChange: (v: boolean) => void;
}

export function ChatHeader({ useRag, onUseRagChange }: ChatHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
      <nav className="hidden md:flex text-sm text-slate-500 dark:text-slate-400">
        <a className="hover:text-primary" href="#">
          Chat
        </a>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-medium">Conversation</span>
      </nav>
      <h1 className="md:hidden text-lg font-bold text-slate-900 dark:text-white">Chat</h1>
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <label htmlFor="useRag" className="text-slate-600 dark:text-slate-400 hidden sm:inline">Use Dataset</label>
          <label htmlFor="useRag" className="text-slate-600 dark:text-slate-400 sm:hidden">Dataset</label>
          <input
            id="useRag"
            type="checkbox"
            checked={useRag}
            onChange={(e) => onUseRagChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
        </div>
      </div>
    </header>
  );
}
