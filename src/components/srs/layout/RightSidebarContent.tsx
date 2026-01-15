import React from 'react';

interface RightSidebarContentProps {
  onClose: () => void;
}

export const RightSidebarContent: React.FC<RightSidebarContentProps> = ({ onClose }) => {
  return (
    <>
      <div className="h-14 lg:h-16 flex items-center justify-between px-3 lg:px-5 border-b border-[#e7e9f3] dark:border-[#2a2e3b] bg-slate-50/50 dark:bg-[#1a1d2d]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">description</span>
          <h2 className="font-bold text-sm lg:text-base text-slate-900 dark:text-white">Document Info</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 lg:p-5 space-y-4 lg:space-y-6">
        {/* Completeness */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completeness</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">100%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 w-full rounded-full"></div>
          </div>
        </div>

        {/* Document Stats */}
        <div className="bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-100 dark:border-slate-800 p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-bold text-slate-900 dark:text-white mb-2 lg:mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-base lg:text-lg">checklist</span> Document Stats
          </h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-slate-600 dark:text-slate-300">Sections</span>
              <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">
                6
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-slate-600 dark:text-slate-300">Requirements</span>
              <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">
                24
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-slate-600 dark:text-slate-300">User Roles</span>
              <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">
                3
              </span>
            </div>
          </div>
        </div>

        {/* Document Actions */}
        <div>
          <h3 className="text-xs lg:text-sm font-bold text-slate-900 dark:text-white mb-2 lg:mb-3">Document Actions</h3>
          <div className="space-y-1 lg:space-y-2">
            <button className="w-full flex items-center gap-2 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg bg-slate-50 dark:bg-[#202434] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium text-xs lg:text-sm border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-base lg:text-lg">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg bg-slate-50 dark:bg-[#202434] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium text-xs lg:text-sm border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-base lg:text-lg">add_comment</span>
              <span className="hidden sm:inline">Comments</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg bg-slate-50 dark:bg-[#202434] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium text-xs lg:text-sm border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-base lg:text-lg">history</span>
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        </div>

        {/* Generated timestamp */}
        <div className="pt-3 lg:pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Generated</h3>
          <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </>
  );
};

export default RightSidebarContent;

