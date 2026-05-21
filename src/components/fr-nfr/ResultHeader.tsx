type ResultHeaderProps = {
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
  onChatToggle?: () => void;
  isChatOpen?: boolean;
};

export function ResultHeader({
  onExport,
  isExporting,
  canExport,
  onSidebarToggle,
  isSidebarOpen,
  onChatToggle,
  isChatOpen
}: ResultHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
            title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <span className="material-symbols-outlined text-base">
              {isSidebarOpen ? 'close' : 'menu'}
            </span>
          </button>
        )}
        <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 min-w-0">
          <a className="hover:text-primary hidden sm:inline" href="#">
            Projects
          </a>
          <span className="mx-2 hidden sm:inline">/</span>
          <span className="text-slate-900 dark:text-white font-medium truncate">Result</span>
        </nav>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <button
          type="button"
          onClick={onExport}
          disabled={!canExport || isExporting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">
            {isExporting ? 'progress_activity' : 'download'}
          </span>
          <span>{isExporting ? 'Exporting...' : 'Export SRS'}</span>
        </button>
        {onChatToggle && (
          <button
            type="button"
            onClick={onChatToggle}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            title={isChatOpen ? 'Close chat' : 'Open chat'}
          >
            <span className="material-symbols-outlined text-base">smart_toy</span>
            <span>{isChatOpen ? 'Chat Open' : 'Open Chat'}</span>
          </button>
        )}
      </div>
    </header>
  );
}

