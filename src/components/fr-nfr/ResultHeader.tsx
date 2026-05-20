type ResultHeaderProps = {
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
};

export function ResultHeader({ onExport, isExporting, canExport }: ResultHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
      <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
        <a className="hover:text-primary hidden sm:inline" href="#">
          Projects
        </a>
        <span className="mx-2 hidden sm:inline">/</span>
        <span className="text-slate-900 dark:text-white font-medium">Result</span>
      </nav>
      <div className="flex items-center gap-2 lg:gap-3">
        <button
          type="button"
          onClick={onExport}
          disabled={!canExport || isExporting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">
            {isExporting ? 'progress_activity' : 'download'}
          </span>
          <span>{isExporting ? 'Exporting...' : 'Export SRS'}</span>
        </button>
      </div>
    </header>
  );
}

