interface ChatInfoPanelProps {
  messageCount: number;
  provider: 'openai' | 'gemini';
  isLoading: boolean;
}

export function ChatInfoPanel({ messageCount, provider, isLoading }: ChatInfoPanelProps) {
  return (
    <aside className="w-80 h-full bg-white dark:bg-[#161926] border-l border-[#e7e9f3] dark:border-[#2a2e3b] flex flex-col flex-shrink-0 z-20 transition-all duration-300 shadow-xl">
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#e7e9f3] dark:border-[#2a2e3b] bg-slate-50/50 dark:bg-[#1a1d2d]">
        <div className="flex items-center gap-2">
          <span>📊</span>
          <h2 className="font-bold text-slate-900 dark:text-white">Chat Info</h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-1">Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Count</span>
            <span className="text-lg font-bold text-primary">{messageCount}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[30%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-100 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            ⚙️ Configuration
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">Provider</span>
              <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white capitalize">
                {provider}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">Status</span>
              <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">
                {isLoading ? 'Processing' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Features</h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <span className="mt-0.5">✨</span>
              <div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Input Rules</p>
                <p className="text-xs text-slate-500 mt-1">Automatic secret detection and input sanitization.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-white dark:bg-[#1a1d2d] rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="mt-0.5">🛡️</span>
              <div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Output Verification</p>
                <p className="text-xs text-slate-500 mt-1">Response validation and content filtering.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

