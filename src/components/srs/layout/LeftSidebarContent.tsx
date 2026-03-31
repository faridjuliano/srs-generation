import React from 'react';
import { RecentProjects } from './RecentProjects';

interface LeftSidebarContentProps {
  projectName: string;
  router: any;
}

export const LeftSidebarContent: React.FC<LeftSidebarContentProps> = ({
  projectName,
  router
}) => {

  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined">description</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">SRS Manager</h1>
        </div>
      </div>
      <div className="px-4 mb-2">
        <button
          onClick={() => router.push('/new-srs')}
          className="w-full flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            add_circle
          </span>
          <span className="text-sm font-bold">New SRS Project</span>
        </button>
      </div>
      <div className="flex flex-col gap-1 px-4 py-2 flex-1 overflow-y-auto">
        {/*<RecentProjects projectName={projectName} router={router} />*/}
        <div className="my-2 border-t border-slate-200 dark:border-slate-800"></div>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-sm font-medium">Documentation</span>
        </a>
      </div>
      <div className="p-4 border-t border-[#e7e9f3] dark:border-[#2a2e3b]">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Alex Morgan</span>
            <span className="text-xs text-slate-500">Lead Architect</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftSidebarContent;

