import React, { useState, useEffect } from 'react';

/**
 * RecentProject Interface
 * Represents a single recent project entry with metadata
 * @property id - Unique identifier for the project
 * @property projectName - Name of the project
 * @property savedAt - ISO timestamp of when the project was last saved/accessed
 */
interface RecentProject {
  id: string;
  projectName: string;
  savedAt: string;
}

/**
 * RecentProjectsProps Interface
 * Props for the RecentProjects component
 * @property projectName - Current active project name
 * @property router - Next.js router instance for navigation
 */
interface RecentProjectsProps {
  projectName: string;
  router: any;
}

/**
 * RecentProjects Component
 * 
 * Displays and manages a list of recently accessed projects.
 * - Loads recent projects from localStorage on mount
 * - Automatically adds/updates the current project when projectName changes
 * - Maintains a list of up to 10 most recent projects
 * - Allows users to click on a project to navigate to it
 * 
 * Features:
 * - Auto-saves current project to recent list
 * - Shows project name and last saved date
 * - Highlights the most recent project
 * - Shows empty state when no projects exist
 */
export const RecentProjects: React.FC<RecentProjectsProps> = ({
  projectName,
  router
}) => {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  /**
   * Load recent projects from localStorage on component mount
   * Parses stored JSON data and updates component state
   */
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

  /**
   * Update recent projects list when the current project changes
   * - Moves existing project to top if it already exists in the list
   * - Adds new project to the top of the list if it doesn't exist
   * - Maintains a maximum of 10 recent projects
   * - Persists changes to localStorage
   */
  useEffect(() => {
    if (projectName) {
      try {
        const stored = localStorage.getItem('srs-recent-projects');
        const projects: RecentProject[] = stored ? JSON.parse(stored) : [];

        // Check if project already exists in the list
        const existingIndex = projects.findIndex(p => p.projectName === projectName);

        if (existingIndex > -1) {
          // Move existing project to top by removing and re-adding with updated timestamp
          const [existing] = projects.splice(existingIndex, 1);
          existing.savedAt = new Date().toISOString();
          projects.unshift(existing);
        } else {
          // Add new project to the top of the list
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

  /**
   * Handle project selection
   * - Loads the selected project data from localStorage
   * - Based on requirements: load based on project data id, set SRS result in localStorage, and redirect to SRS result page
   * - Currently redirects to /new-srs if project differs from current
   */
  const handleProjectClick = (project: RecentProject) => {
    try {
      // TODO: Load project based on project data id
      // TODO: Set the SRS result in localStorage
      // TODO: Redirect to SRS result page
      
      const generatedData = localStorage.getItem('srs-recent-projects');
      if (generatedData) {
        const data = JSON.parse(generatedData);
        if (data.projectName !== project.projectName) {
          // Project changed, navigate to new project
          router.push('/new-srs');
        }
      }
    } catch (error) {
      console.error('Failed to handle project click:', error);
    }
  };

  return (
    <>
      {/* Section Header */}
      <div className="mb-4 mt-2">
        <h2 className="px-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
          Recent Projects
        </h2>
      </div>

      {/* Recent Projects List or Empty State */}
      {recentProjects.length > 0 ? (
        recentProjects.map((project, index) => (
          <button
            key={project.id}
            onClick={() => handleProjectClick(project)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left ${
              index === 0 ? 'bg-slate-100 dark:bg-slate-800' : ''
            }`}
            title={`Last saved: ${new Date(project.savedAt).toLocaleString()}`}
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
    </>
  );
};

export default RecentProjects;

