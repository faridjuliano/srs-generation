import React, { useState, useEffect } from 'react';

interface RecentProject {
  id: string;
  projectName: string;
  savedAt: string;
}

interface LeftSidebarContentProps {
  projectName: string;
  router: any;
}

export const LeftSidebarContent: React.FC<LeftSidebarContentProps> = ({
  projectName,
  router
}) => {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  // Load recent projects from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('srs-recent-projects');
      if (stored) {
        const projects = JSON.parse(stored) as RecentProject[];
        setRecentProjects(projects);
      }
    } catch (error) {
      console.error('Failed to load recent projects:', error);
    }
  }, []);

  // Add current project to recent projects when projectName changes
  useEffect(() => {
    if (projectName) {
      try {
        const stored = localStorage.getItem('srs-recent-projects');
        const projects: RecentProject[] = stored ? JSON.parse(stored) : [];

        // Check if project already exists
        const existingIndex = projects.findIndex(p => p.projectName === projectName);

        if (existingIndex > -1) {
          // Move to top by removing and re-adding
          const [existing] = projects.splice(existingIndex, 1);
          existing.savedAt = new Date().toISOString();
          projects.unshift(existing);
        } else {
          // Add new project
          projects.unshift({
            id: Date.now().toString(),
            projectName,
            savedAt: new Date().toISOString()
          });
        }

        // Keep only the last 10 projects
        const limitedProjects = projects.slice(0, 10);
        localStorage.setItem('srs-recent-projects', JSON.stringify(limitedProjects));
        setRecentProjects(limitedProjects);
      } catch (error) {
        console.error('Failed to update recent projects:', error);
      }
    }
  }, [projectName]);

  const handleProjectClick = (project: RecentProject) => {
    // Store the selected project in localStorage for the results page
    const generatedData = localStorage.getItem('srs-recent-projects');
    if (generatedData) {
      const data = JSON.parse(generatedData);
      // data.find(p => p.id === project.id).selected = true;
      if (data.projectName !== project.projectName) {
        // Project changed, navigate to new project
        router.push('/new-srs');
      }
    }
  };

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
        <div className="mb-4 mt-2">
          <h2 className="px-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Recent Projects
          </h2>
        </div>
        {recentProjects.length > 0 ? (
          recentProjects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left ${
                index === 0 ? 'bg-slate-100 dark:bg-slate-800' : ''
              }`}
            >
              <span className="material-symbols-outlined text-slate-400">folder</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{project.projectName}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(project.savedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))
        ) : (
          <p className="px-3 py-2.5 text-xs text-slate-400 dark:text-slate-500">
            No recent projects. Create a new one to get started!
          </p>
        )}
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

