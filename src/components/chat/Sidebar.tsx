interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className="flex flex-col w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h1 className="text-lg font-bold tracking-tight">Chat Manager</h1>
        </div>
      </div>

      <div className="px-4 mb-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
        >
          <span className="text-sm font-bold">+ New Chat</span>
        </button>
      </div>

      <div className="flex flex-col gap-1 px-4 py-2 flex-1 overflow-y-auto">
        <div className="mb-4 mt-2">
          <h2 className="px-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Recent Chats
          </h2>
        </div>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          href="#"
        >
          <span className="text-sm font-medium">General Discussion</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          href="#"
        >
          <span className="text-sm font-medium">Code Review</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          href="#"
        >
          <span className="text-sm font-medium">Documentation</span>
        </a>
        <div className="my-2 border-t border-slate-200 dark:border-slate-800"></div>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          href="#"
        >
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>

      <div className="p-4 border-t border-[#e7e9f3] dark:border-[#2a2e3b]">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">User</span>
            <span className="text-xs text-slate-500">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

