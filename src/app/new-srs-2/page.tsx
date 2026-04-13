"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSRS2Page() {
  const router = useRouter();
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // Prefilled defaults follow the payload you requested.
  const [projectName, setProjectName] = useState('Inventory Management System');
  const [authorName, setAuthorName] = useState('AI Generator');
  const [projectVision, setProjectVision] = useState('A web app to track warehouse stock in real time.');
  const [srsStandard, setSrsStandard] = useState('ISO/IEC/IEEE 29148:2018');
  const uploadedFiles: string[] = [];
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleGenerate = async () => {
	try {
	  setIsGenerating(true);
	  setError(null);

	  if (!projectName.trim()) {
		setError('Project name is required');
		setIsGenerating(false);
		return;
	  }

	  if (!authorName.trim()) {
		setError('Author name is required');
		setIsGenerating(false);
		return;
	  }

	  if (!projectVision.trim()) {
		setError('Project vision is required');
		setIsGenerating(false);
		return;
	  }

	  const payload = {
		projectName,
		authorName,
		projectVision,
		srsStandard,
		uploadedFiles,
	  };

	  const response = await fetch(`${backendBaseUrl}/api/srs/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	  });

	  if (!response.ok) {
		let apiMessage = 'Failed to generate SRS from API';
		try {
		  const errorData = await response.json();
		  if (typeof errorData?.error === 'string' && errorData.error.trim().length > 0) {
			apiMessage = errorData.error;
		  }
		} catch {
		  // Keep fallback message when body is not JSON.
		}
		throw new Error(apiMessage);
	  }

	  const result = await response.json();
	  const apiGeneratedContent = result?.content ?? result?.document ?? null;
	  if (!result?.success || !apiGeneratedContent) {
		throw new Error('API returned success=false or empty SRS content');
	  }

	  const storedPayload = {
		success: true,
		content: apiGeneratedContent,
		diagrams: result.diagrams ?? null,
		validation: result.validation ?? result.validationResult ?? null,
	  };

	  sessionStorage.setItem('srs-generated-v2', JSON.stringify(storedPayload));
	  // Keep legacy key for compatibility with older result views.
	  sessionStorage.setItem(
		'srs-generated',
		JSON.stringify({
		  ...payload,
		  generatedContent: apiGeneratedContent,
		  validation: result.validation ?? result.validationResult ?? null,
		  validationResult: result.validationResult ?? result.validation ?? null,
		})
	  );

	  router.push('/srs-results-2');
	} catch (err) {
	  const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating the SRS document';
	  setError(errorMessage);
	} finally {
	  setIsGenerating(false);
	}
  };

  const charCount = projectVision.length;

  return (
	<div className="flex h-screen w-full overflow-hidden">
	  <button
		onClick={() => setIsSidebarOpen(!isSidebarOpen)}
		className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#161926] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
	  >
		<span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
		  {isSidebarOpen ? 'close' : 'menu'}
		</span>
	  </button>

	  {isSidebarOpen && (
		<div
		  className="lg:hidden fixed inset-0 bg-black/50 z-30"
		  onClick={() => setIsSidebarOpen(false)}
		/>
	  )}

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
			<Link href="/new-srs-2" className="text-sm font-bold">New SRS Project</Link>
		  </button>
		</div>
	  </aside>

	  <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
		<header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
		  <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
			<a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
			<span className="mx-2 hidden sm:inline">/</span>
			<span className="text-slate-900 dark:text-white font-medium">New SRS Generation (Backend)</span>
		  </nav>
		</header>

		<div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
		  <div className="max-w-5xl mx-auto flex flex-col gap-4 lg:gap-6">
			<div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-8">
			  <div className="grid grid-cols-12 gap-4 lg:gap-8">
				<div className="col-span-12 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
				  <div>
					<label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Project Name</label>
					<input
					  type="text"
					  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] text-sm p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
					  value={projectName}
					  onChange={(e) => setProjectName(e.target.value)}
					/>
				  </div>

				  <div>
					<label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Author Name</label>
					<input
					  type="text"
					  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] text-sm p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
					  value={authorName}
					  onChange={(e) => setAuthorName(e.target.value)}
					/>
				  </div>

				  <div>
					<label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Project Vision</label>
					<textarea
					  className="w-full h-56 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] text-sm p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white leading-relaxed resize-y"
					  value={projectVision}
					  onChange={(e) => setProjectVision(e.target.value)}
					  maxLength={5000}
					/>
					<div className="mt-1 text-xs text-slate-400">{charCount} / 5000 characters</div>
				  </div>
				</div>

				<div className="col-span-12 lg:col-span-4 flex flex-col gap-4 lg:gap-6">
				  <div className="bg-slate-50 dark:bg-[#202434] rounded-xl p-4 lg:p-5 border border-slate-100 dark:border-slate-800 h-full">
					<h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
					  <span className="material-symbols-outlined text-slate-400">tune</span> Configuration
					</h3>
					<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SRS Standard</label>
					<select
					  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d2d] text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
					  value={srsStandard}
					  onChange={(e) => setSrsStandard(e.target.value)}
					>
					  <option>ISO/IEC/IEEE 29148:2018</option>
					</select>
				  </div>
				</div>
			  </div>

			  {error && (
				<div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
				  <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error generating SRS</p>
				  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
				</div>
			  )}

			  <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
				<button
				  onClick={handleGenerate}
				  disabled={isGenerating}
				  className="bg-primary hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  {isGenerating ? 'Generating...' : 'Generate SRS Document'}
				</button>
			  </div>
			</div>
		  </div>
		</div>
	  </main>
	</div>
  );
}


