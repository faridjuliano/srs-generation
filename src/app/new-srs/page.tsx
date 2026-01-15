"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSRSPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [projectVision, setProjectVision] = useState('');
  const [srsStandard, setSrsStandard] = useState('IEEE 830-1998 (Recommended)');
  const [toneDetail, setToneDetail] = useState('Technical & Formal');
  const [outputLanguage, setOutputLanguage] = useState('English (US)');
  const [autoDetectActors, setAutoDetectActors] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnalysisPanelOpen, setIsAnalysisPanelOpen] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const formData = {
        projectName,
        projectVision,
        srsStandard,
        toneDetail,
        outputLanguage,
        autoDetectActors,
        uploadedFiles,
      };

      console.log('Generating SRS document with Gemini API...', formData);

      // Call the SRS generation API
      const response = await fetch('/api/srs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate SRS document');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('SRS generation failed');
      }

      // Navigate to results page with generated content
      const generatedData = {
        ...formData,
        generatedContent: result.content,
      };

      // Store generated data in localStorage
      localStorage.setItem('srs-generated', JSON.stringify(generatedData));

      // Also update the draft with the generated content
      localStorage.setItem('srs-draft', JSON.stringify({
        ...formData,
        savedAt: new Date().toISOString(),
      }));

      // Navigate to results page
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
            <span className="text-sm font-bold">New SRS Project</span>
          </button>
        </div>
        <div className="flex flex-col gap-1 px-4 py-2 flex-1 overflow-y-auto">
          <div className="mb-4 mt-2">
            <h2 className="px-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Recent Projects</h2>
          </div>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined text-slate-400">folder</span>
            <span className="text-sm font-medium">Alpha CRM</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined text-slate-400">folder</span>
            <span className="text-sm font-medium">Payment Gateway</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined text-slate-400">folder</span>
            <span className="text-sm font-medium">Logistics v3.0</span>
          </a>
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
            <button
              onClick={() => setIsAnalysisPanelOpen(!isAnalysisPanelOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">analytics</span>
            </button>
            <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
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
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202434] text-sm p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
                      placeholder="e.g. Enterprise Inventory Management System"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <label className="block text-sm font-bold text-slate-900 dark:text-white">Project Vision & Core Requirements</label>
                      <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1 self-start sm:self-auto">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span> Use AI Templates
                      </button>
                    </div>
                    <div className="relative group">
                      <textarea
                        className="w-full h-48 lg:h-64 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] text-sm p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white leading-relaxed resize-y"
                        placeholder="Describe your software in natural language. For example:
'We need a web-based inventory system for a mid-sized retail chain.
Users should include Administrators, Store Managers, and Warehouse Staff.
The system must handle real-time stock updates across 20 locations.
It needs to integrate with Shopify API for online orders.
Security is critical, requiring 2FA for all admin actions.'"
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
                          <option>IEEE 830-1998 (Recommended)</option>
                          <option>ISO/IEC/IEEE 29148:2018</option>
                          <option>Agile User Stories Format</option>
                          <option>Custom Enterprise Template</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tone & Detail</label>
                        <select
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d2d] text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                          value={toneDetail}
                          onChange={(e) => setToneDetail(e.target.value)}
                        >
                          <option>Technical & Formal</option>
                          <option>Business-Oriented</option>
                          <option>Concise / High-Level</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output Language</label>
                        <select
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d2d] text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                          value={outputLanguage}
                          onChange={(e) => setOutputLanguage(e.target.value)}
                        >
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>German</option>
                        </select>
                      </div>
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-detect Actors</span>
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                            checked={autoDetectActors}
                            onChange={(e) => setAutoDetectActors(e.target.checked)}
                          />
                        </div>
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

      {/* Right Sidebar - Analysis Panel */}
      <aside className={`w-80 h-full bg-white dark:bg-[#161926] border-l border-[#e7e9f3] dark:border-[#2a2e3b] flex flex-col flex-shrink-0 z-20 transition-all duration-300 shadow-xl fixed lg:static inset-y-0 right-0 transform ${isAnalysisPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsAnalysisPanelOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="h-16 flex items-center justify-between px-5 border-b border-[#e7e9f3] dark:border-[#2a2e3b] bg-slate-50/50 dark:bg-[#1a1d2d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h2 className="font-bold text-slate-900 dark:text-white">Input Analysis</h2>
          </div>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-1">Ready</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Clarity</span>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">Medium</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 w-[45%] rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Add more details about user roles to improve analysis quality.</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>radar</span> Detected Items
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">User Roles</span>
                <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Functional Reqs</span>
                <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Key Constraints</span>
                <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">2</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Real-time Suggestions</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px' }}>lightbulb</span>
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Ambiguity Check</p>
                  <p className="text-xs text-slate-500 mt-1">Try to specify &quot;real-time&quot; latency (e.g., &lt;200ms) for better technical specs.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-white dark:bg-[#1a1d2d] rounded-lg border border-slate-200 dark:border-slate-700 opacity-60">
                <span className="material-symbols-outlined text-slate-400 mt-0.5" style={{ fontSize: '18px' }}>security</span>
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Security Gap</p>
                  <p className="text-xs text-slate-500 mt-1">No mention of data encryption standards found yet.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Templates</h3>
            <div className="flex flex-wrap gap-2">
              <button className="text-xs bg-white dark:bg-[#202434] hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors">E-Commerce</button>
              <button className="text-xs bg-white dark:bg-[#202434] hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors">SaaS Platform</button>
              <button className="text-xs bg-white dark:bg-[#202434] hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors">Mobile App</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for analysis panel on mobile */}
      {isAnalysisPanelOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsAnalysisPanelOpen(false)}
        />
      )}
    </div>
  );
}

