"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateSRSFromTemplate } from '@/lib/srsTemplateGenerator';
import Link from "next/link";
import AnalysisDrawer from '@/components/new-srs/AnalysisDrawer';

interface RecentProject {
  id: string;
  projectName: string;
  savedAt: string;
}

export default function NewSRSPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [projectVision, setProjectVision] = useState('');
  const [srsStandard, setSrsStandard] = useState('IEEE 830-1998');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleOpenRecentProject = (project: RecentProject) => {
    // Navigate to the project's SRS results page
    const generatedData = localStorage.getItem('srs-generated');
    if (generatedData) {
      const data = JSON.parse(generatedData);
      if (data.projectName === project.projectName) {
        // Same project, go to results
        router.push('/srs-results');
      } else {
        // Different project - user can load it by clicking, but we should maintain their current context
        router.push('/srs-results');
      }
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      if (!authorName.trim()) {
        setError('Author name is required');
        setIsGenerating(false);
        return;
      }

      const formData = {
        projectName,
        authorName,
        projectVision,
        srsStandard,
        uploadedFiles,
      };

      console.log('Generating SRS document...', formData);

      let generatedContent = null;

      // Try API first
      try {
        const response = await fetch('/api/srs/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.content) {
            generatedContent = result.content;
            console.log('SRS generated from API');
          }
        } else {
          const errorData = await response.json();
          console.warn('API error:', errorData.error);
        }
      } catch (apiError) {
        console.warn('API call failed, using template generator:', apiError);
      }

      // If API failed, use template generator
      if (!generatedContent) {
        console.log('Using template generator as fallback');
        generatedContent = generateSRSFromTemplate({
          projectName: projectName || 'Unnamed Project',
          authorName: authorName || 'Unknown Author',
          projectVision: projectVision || 'No vision provided',
          srsStandard: srsStandard || 'IEEE 830-1998',
          uploadedFiles: uploadedFiles || []
        });
      }

      // Store generated data
      const generatedData = {
        ...formData,
        generatedContent: generatedContent,
      };

      localStorage.setItem('srs-generated', JSON.stringify(generatedData));

      // Update recent projects
      try {
        const stored = localStorage.getItem('srs-recent-projects');
        const projects: RecentProject[] = stored ? JSON.parse(stored) : [];

        const existingIndex = projects.findIndex(p => p.projectName === projectName);

        if (existingIndex > -1) {
          const [existing] = projects.splice(existingIndex, 1);
          existing.savedAt = new Date().toISOString();
          projects.unshift(existing);
        } else {
          projects.unshift({
            id: Date.now().toString(),
            projectName,
            savedAt: new Date().toISOString()
          });
        }

        const limitedProjects = projects.slice(0, 10);
        localStorage.setItem('srs-recent-projects', JSON.stringify(limitedProjects));
        setRecentProjects(limitedProjects);
      } catch (storageError) {
        console.error('Failed to update recent projects:', storageError);
      }

      // Save draft
      localStorage.setItem('srs-draft', JSON.stringify({
        ...formData,
        savedAt: new Date().toISOString(),
      }));

      // Navigate to results
      router.push('/srs-results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating the SRS document';
      setError(errorMessage);
      console.error('Error generating SRS:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...');
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const charCount = projectVision.length;

  const getPromptPlaceholder = () => {
    const basePrompt = "Describe your software in natural language. For example:";

    if (srsStandard === 'ISO/IEC/IEEE 29148:2018') {
      return `${basePrompt}
'Our company needs a cloud-based project management platform.
Primary users: Project Managers, Team Leads, and Developers.
Key capabilities: Real-time collaboration, task tracking, time logging, and resource allocation.
Must integrate with Jira and Slack APIs for seamless workflow.
Performance: Should support 500+ concurrent users with <100ms response times.
Security: AES-256 encryption, OAuth 2.0 authentication, and ISO 27001 compliance.
The system must maintain 99.9% uptime and provide automated backup and disaster recovery.'`;
    } else {
      // IEEE 830-1998 format
      return `${basePrompt}
'We need a web-based inventory system for a mid-sized retail chain.
Users should include Administrators, Store Managers, and Warehouse Staff.
The system must handle real-time stock updates across 20 locations.
It needs to integrate with Shopify API for online orders.
Security is critical, requiring 2FA for all admin actions.'`;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#161926] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
          {isSidebarOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`flex flex-col w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined">description</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">SRS Manager</h1>
          </div>
        </div>
        <div className="px-4 mb-2">
          <button className="w-full flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            <Link href={"/new-srs"} className="text-sm font-bold">New SRS Project</Link>
            {/*<Link to="/new-srs" className="text-sm font-bold">New SRS Project</Link>*/}
          </button>
        </div>
        <div className="flex flex-col gap-1 px-4 py-2 flex-1 overflow-y-auto">
          <div className="mb-4 mt-2">
            <h2 className="px-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Recent Projects</h2>
          </div>
          {recentProjects.length > 0 ? (
            recentProjects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => handleOpenRecentProject(project)}
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
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
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
      </aside>

      {/* Main Content */}
      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
            <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
            <span className="mx-2 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium">New SRS Generation</span>
          </nav>
          <div className="flex items-center gap-3 lg:gap-6">
            {/*<AnalysisDrawer />*/}
            {/*<button className="relative p-2 text-slate-500 hover:text-primary transition-colors">*/}
            {/*  <span className="material-symbols-outlined">notifications</span>*/}
            {/*</button>*/}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 lg:gap-6">
            <div className="flex flex-col gap-2 mb-2">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Start New Analysis</h1>
              <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
                Provide your project vision, unstructured notes, or legacy documents. Our NLP engine will extract requirements, identify actors, and propose a structured SRS document.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-8">
              <div className="grid grid-cols-12 gap-4 lg:gap-8">
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Project Name</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50  dark:bg-[#202434] text-sm p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
                      placeholder="e.g. Enterprise Inventory Management System"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                      Author Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] text-sm p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
                      placeholder="e.g. John Doe"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <label className="block text-sm font-bold text-slate-900 dark:text-white">Project Vision & Core Requirements</label>
                    </div>
                    <div className="relative group">
                      <textarea
                        className="w-full h-48 lg:h-64 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] text-sm p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white leading-relaxed resize-y"
                        placeholder={getPromptPlaceholder()}
                        value={projectVision}
                        onChange={(e) => setProjectVision(e.target.value)}
                        maxLength={5000}
                      ></textarea>
                      <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">
                        {charCount} / 5000 characters
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Supporting Documents</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 lg:p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#202434] transition-all cursor-pointer group">
                      <div className="size-10 lg:size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">cloud_upload</span>
                      </div>
                      <p className="text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-300">
                        <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1 px-2">Meeting transcripts, existing spec sheets, or emails (PDF, DOCX, TXT)</p>
                    </div>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="mt-3 flex items-center justify-between p-3 bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>picture_as_pdf</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file}</p>
                            <p className="text-xs text-slate-500">2.4 MB • Uploaded just now</p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveFile(index)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                  <div className="bg-slate-50 dark:bg-[#202434] rounded-xl p-4 lg:p-5 border border-slate-100 dark:border-slate-800 h-full">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">tune</span> Configuration
                    </h3>
                    <div className="space-y-4 lg:space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SRS Standard</label>
                        <select
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d2d] text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                          value={srsStandard}
                          onChange={(e) => setSrsStandard(e.target.value)}
                        >
                          <option>IEEE 830-1998</option>
                          <option>ISO/IEC/IEEE 29148:2018</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 flex-shrink-0">error</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error generating SRS</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={isGenerating}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-sm px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  Save as Draft
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 order-1 sm:order-2">
                  <span className="text-xs text-slate-400 text-center sm:text-left">{isGenerating ? 'Generating...' : 'Estimated processing time: ~45s'}</span>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary w-full sm:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined icon-fill">auto_awesome</span>
                        Generate SRS Document
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
