'use client';

import Link from "next/link";
import { useState } from "react";

interface RecentProject {
  id: string;
  projectName: string;
  savedAt: string;
  status?: 'Completed' | 'In Progress';
}

export default function Home() {
  const [recentProjects] = useState<RecentProject[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem('srs-recent-projects');
      if (stored) {
        const projects = JSON.parse(stored) as RecentProject[];
        // Add mock status for display
        const projectsWithStatus: RecentProject[] = projects.map((p, idx) => ({
          ...p,
          status: idx % 2 === 0 ? 'Completed' : 'In Progress'
        }));
        return projectsWithStatus.slice(0, 3);
      }
    } catch (error) {
      console.error('Failed to load recent projects:', error);
    }
    return [];
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome back, Alex 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your AI-powered workspace for generating structured Software Requirements Specifications. Pick up where you left off or start something new.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* New SRS Project Card */}
          <Link href="/new-srs" className="group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 text-white h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">New SRS Project</h3>
              <p className="text-blue-100">
                Start from scratch with AI-assisted requirement extraction
              </p>
            </div>
          </Link>

          {/* Recent Projects Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">history</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Recent Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Resume or review your previously generated SRS documents.
            </p>
          </div>

          {/* Browse Templates Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">folder_open</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Browse Templates</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pick a pre-built template for your domain and get started faster
            </p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View all
            </Link>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 px-0 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-gray-400">description</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{project.projectName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.savedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'Completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No recent projects yet. Create a new one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
