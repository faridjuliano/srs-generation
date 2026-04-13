"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Sidebar from '@/components/srs/Sidebar';
import MermaidDiagram from '@/components/srs/MermaidDiagram';
import { JsonRenderer } from '@/components/srs-results-2/JsonRenderer';
import { useJsonEditor } from '@/hooks/useJsonEditor';
import {
  getProjectName,
  sectionOrder,
  looksLikeMermaid,
  toLabel
} from '@/lib/srsUtils';
import type { JsonValue } from '@/lib/srsTypes';

export default function SRSResults2Page() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    payload,
    isEditing,
    setIsEditing,
    loading,
    error,
    validating,
    handleContentEdit,
    handleDiagramEdit,
    revalidateWithBackend
  } = useJsonEditor();

  const content = payload?.content ?? null;
  const validation = payload?.validation ?? null;
  const diagrams = payload?.diagrams ?? null;
  const projectName = getProjectName(content);

  const orderedSections = useMemo(() => {
    if (!content) return [] as Array<[string, JsonValue]>;
    return Object.entries(content).sort(([a], [b]) => sectionOrder(a, b));
  }, [content]);

  const handleFinishEditing = async () => {
    setIsEditing(false);
    await revalidateWithBackend();
  };


  if (loading) {
	return (
	  <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
		<div className="text-center">
		  <div className="mb-4">
			<span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
		  </div>
		  <p className="text-slate-600 dark:text-slate-400">Loading SRS result...</p>
		</div>
	  </div>
	);
  }

  if (error) {
	return (
	  <div className="min-h-screen bg-background-light dark:bg-background-dark p-3 lg:p-8">
		<div className="max-w-5xl mx-auto bg-white dark:bg-[#1a1d2d] border border-red-200 dark:border-red-800 rounded-xl p-6">
		  <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
		  <button
			onClick={() => router.push('/new-srs-2')}
			className="mt-4 px-4 py-2 rounded-lg bg-primary text-white"
		  >
			Go to New SRS 2
		  </button>
		</div>
	  </div>
	);
  }

  return (
	<div className="flex h-screen w-full overflow-hidden flex-col lg:flex-row">
	  <button
		onClick={() => setIsSidebarOpen(!isSidebarOpen)}
		className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#161926] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
	  >
		<span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
		  {isSidebarOpen ? 'close' : 'menu'}
		</span>
	  </button>

	  <Sidebar
		isOpen={isSidebarOpen}
		onClose={() => setIsSidebarOpen(false)}
		projectName={projectName}
		router={router}
		position="left"
	  >
		<div className="p-6">
		  <div className="flex items-center gap-3">
			<div className="size-8 rounded bg-primary flex items-center justify-center text-white">
			  <span className="material-symbols-outlined">description</span>
			</div>
			<h1 className="text-lg font-bold tracking-tight">SRS Manager</h1>
		  </div>
		</div>
		<div className="px-4 mb-2">
		  <Link href="/new-srs-2" className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
			<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
			<span className="text-sm font-bold">New SRS Project</span>
		  </Link>
		</div>
	  </Sidebar>

	  <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative w-full">
		<header className="h-14 lg:h-16 flex items-center justify-between px-3 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10 gap-2">
	  <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-14 lg:ml-0 flex-1 truncate">
		<a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
		<span className="mx-1 lg:mx-2 hidden sm:inline">/</span>
		<span className="text-slate-900 dark:text-white font-medium truncate text-xs lg:text-sm">{projectName}</span>
		<span className="mx-1 lg:mx-2 hidden md:inline">/</span>
		<span className="text-slate-900 dark:text-white font-medium hidden md:inline text-xs lg:text-sm">Generated SRS</span>
	  </nav>
	  <div className="flex items-center gap-3 flex-shrink-0">
		<button
		  type="button"
		  onClick={() => {
			if (isEditing) {
			  handleFinishEditing();
			} else {
			  setIsEditing(true);
			}
		  }}
		  disabled={validating}
		  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
			isEditing
			  ? 'bg-primary text-white border-primary hover:bg-blue-700 disabled:opacity-50'
			  : 'bg-white dark:bg-transparent text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
		  }`}
		>
		  {validating && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
		  {isEditing ? 'Done Editing' : 'Edit'}
		</button>
		<Link href="/new-srs-2" className="text-sm text-primary hover:underline">Generate again</Link>
	  </div>
		</header>

		<div className="flex-1 overflow-y-auto p-3 lg:p-8 scroll-smooth">
		  <div className="max-w-5xl mx-auto flex flex-col gap-3 lg:gap-6">
			<div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
			  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Document Summary</h2>
			  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{projectName}</p>
			</div>

			{validation && (
			  <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				  <div>
					<h3 className="text-sm font-semibold text-slate-900 dark:text-white">SRS Validation Result</h3>
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
					  {validation.passed ? 'Passed with no blocking errors.' : 'Needs fixes before finalizing.'}
					</p>
				  </div>
				  <div className="flex items-center gap-2 text-xs">
					<span className={`px-2 py-1 rounded-full font-medium ${validation.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
					  {validation.passed ? 'Passed' : 'Failed'}
					</span>
					<span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Score: {validation.qualityScore}</span>
					<span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Errors: {validation.errorCount}</span>
					<span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Warnings: {validation.warningCount}</span>
				  </div>
				</div>

				{validation.issues.length > 0 && (
				  <div className="mt-4 space-y-2 max-h-64 overflow-auto pr-1">
					{validation.issues.map((issue, index) => (
					  <div key={`${issue.code}-${index}`} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
						<p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{issue.code}</p>
						<p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{issue.message}</p>
						{issue.path && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Path: {issue.path}</p>}
						{issue.suggestion && <p className="text-xs text-slate-500 dark:text-slate-400">Suggestion: {issue.suggestion}</p>}
					  </div>
					))}
				  </div>
				)}
			  </div>
			)}

			{diagrams && (
			  <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6 space-y-4">
				<h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">Diagrams</h3>
				{Object.entries(diagrams).map(([diagramName, diagramValue]) => (
				  <section key={diagramName}>
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">{diagramName}</p>
					{typeof diagramValue === 'string' && looksLikeMermaid(diagramValue) ? (
					  isEditing ? (
						<div className="space-y-3">
						  <textarea
							value={diagramValue}
							onChange={(event) => handleDiagramEdit([diagramName], event.target.value)}
							rows={8}
							className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202434] px-2 py-1 text-sm text-slate-700 dark:text-slate-200"
						  />
						  <MermaidDiagram code={diagramValue} />
						</div>
					  ) : (
						<MermaidDiagram code={diagramValue} />
					  )
					) : typeof diagramValue === 'string' ? (
					  isEditing ? (
						<textarea
						  value={diagramValue}
						  onChange={(event) => handleDiagramEdit([diagramName], event.target.value)}
						  rows={6}
						  className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202434] px-2 py-1 text-sm text-slate-700 dark:text-slate-200"
						/>
					  ) : (
						<pre className="text-xs lg:text-sm whitespace-pre-wrap rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3 text-slate-700 dark:text-slate-200 overflow-auto">
						  {diagramValue}
						</pre>
					  )
					) : (
					  <div className="text-sm">
                        <JsonRenderer
                          value={diagramValue}
                          keyPrefix={`diagram-${diagramName}`}
                          depth={0}
                          path={[diagramName]}
                          onEdit={isEditing ? handleDiagramEdit : undefined}
                        />
                      </div>
					)}
				  </section>
				))}
			  </div>
			)}

			<div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-3 lg:p-8 overflow-x-hidden">
			  <div className="space-y-4 lg:space-y-6">
				{orderedSections.map(([sectionName, sectionValue]) => (
				  <section key={sectionName}>
					<h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-3">{toLabel(sectionName)}</h3>
					<div className="text-sm">
                      <JsonRenderer
                        value={sectionValue}
                        keyPrefix={sectionName}
                        depth={0}
                        path={[sectionName]}
                        onEdit={isEditing ? handleContentEdit : undefined}
                      />
                    </div>
				  </section>
				))}
			  </div>
			</div>
		  </div>
		</div>
	  </main>
	</div>
  );
}



