"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Sidebar from '@/components/srs/Sidebar';
import MermaidDiagram from '@/components/srs/MermaidDiagram';
import type { ValidationResult } from '@/lib/srsValidator';

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type ApiSrsPayload = {
  success: boolean;
  content: JsonObject;
  diagrams?: JsonObject;
  validation?: ValidationResult;
};

type LegacyStoredPayload = {
  generatedContent?: JsonObject;
  validation?: ValidationResult;
  validationResult?: ValidationResult;
};

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asValidation(value: unknown): ValidationResult | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.passed !== 'boolean') return null;
  if (typeof data.errorCount !== 'number') return null;
  if (typeof data.warningCount !== 'number') return null;
  if (typeof data.qualityScore !== 'number') return null;
  if (!Array.isArray(data.issues)) return null;
  return {
	passed: data.passed,
	errorCount: data.errorCount,
	warningCount: data.warningCount,
	qualityScore: data.qualityScore,
	issues: data.issues
  } as ValidationResult;
}

function normalizeStoredPayload(raw: unknown): ApiSrsPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const payload = raw as Partial<ApiSrsPayload>;
  if (typeof payload.success === 'boolean' && isObject(payload.content)) {
	return {
	  success: payload.success,
	  content: payload.content,
	  diagrams: isObject(payload.diagrams) ? payload.diagrams : undefined,
	  validation: asValidation(payload.validation) ?? undefined
	};
  }

  const legacy = raw as LegacyStoredPayload;
  if (isObject(legacy.generatedContent)) {
	return {
	  success: true,
	  content: legacy.generatedContent,
	  validation: asValidation(legacy.validation ?? legacy.validationResult) ?? undefined
	};
  }

  return null;
}

function sectionOrder(a: string, b: string): number {
  const priority: Record<string, number> = {
	documentControl: -3,
	revisionHistory: -2,
	tableOfContents: -1
  };

  const pa = priority[a];
  const pb = priority[b];
  if (pa !== undefined || pb !== undefined) {
	return (pa ?? Number.MAX_SAFE_INTEGER) - (pb ?? Number.MAX_SAFE_INTEGER);
  }

  const na = Number.parseInt(a, 10);
  const nb = Number.parseInt(b, 10);
  const hasNa = Number.isFinite(na);
  const hasNb = Number.isFinite(nb);
  if (hasNa && hasNb) return na - nb;
  if (hasNa) return -1;
  if (hasNb) return 1;
  return a.localeCompare(b);
}

function renderJson(value: JsonValue, keyPrefix: string): ReactNode {
  if (value === null) return <span className="text-slate-400">null</span>;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
	return <span className="text-slate-700 dark:text-slate-200">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
	if (value.length === 0) return <span className="text-slate-400">[]</span>;
	return (
	  <ul className="list-disc ml-5 space-y-1">
		{value.map((item, index) => (
		  <li key={`${keyPrefix}-arr-${index}`} className="text-sm text-slate-700 dark:text-slate-200">
			{renderJson(item, `${keyPrefix}-${index}`)}
		  </li>
		))}
	  </ul>
	);
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return <span className="text-slate-400">{'{}'}</span>;

  return (
	<div className="space-y-3">
	  {entries.map(([k, v]) => (
		<div key={`${keyPrefix}-${k}`}>
		  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{k}</p>
		  <div className="mt-1 text-sm">{renderJson(v, `${keyPrefix}-${k}`)}</div>
		</div>
	  ))}
	</div>
  );
}

function getProjectName(content: JsonObject | null): string {
  if (!content) return 'SRS Document';
  const docControl = content.documentControl;
  if (!isObject(docControl)) return 'SRS Document';
  return typeof docControl.projectName === 'string' && docControl.projectName.trim().length > 0
	? docControl.projectName
	: 'SRS Document';
}

function looksLikeMermaid(definition: string): boolean {
  const normalized = definition.trim();
  return [
	'sequenceDiagram',
	'erDiagram',
	'classDiagram',
	'stateDiagram',
	'flowchart',
	'graph '
  ].some(prefix => normalized.startsWith(prefix));
}

export default function SRSResults2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [payload, setPayload] = useState<ApiSrsPayload | null>(null);

  useEffect(() => {
	try {
	  const raw = sessionStorage.getItem('srs-generated-v2') ?? sessionStorage.getItem('srs-generated');
	  if (!raw) {
		setError('No generated SRS found. Please generate from New SRS 2 page.');
		return;
	  }

	  const parsed = JSON.parse(raw) as unknown;
	  const normalized = normalizeStoredPayload(parsed);
	  if (!normalized) {
		setError('Generated SRS payload is missing or invalid.');
		return;
	  }

	  setPayload(normalized);
	} catch (e) {
	  setError(e instanceof Error ? e.message : 'Failed to load generated SRS payload.');
	} finally {
	  setLoading(false);
	}
  }, []);

  const content = payload?.content ?? null;
  const validation = payload?.validation ?? null;
  const diagrams = payload?.diagrams ?? null;
  const projectName = getProjectName(content);

  const orderedSections = useMemo(() => {
	if (!content) return [] as Array<[string, JsonValue]>;
	return Object.entries(content).sort(([a], [b]) => sectionOrder(a, b));
  }, [content]);

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
		  <Link href="/new-srs-2" className="text-sm text-primary hover:underline flex-shrink-0">Generate again</Link>
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
					  <MermaidDiagram code={diagramValue} />
					) : typeof diagramValue === 'string' ? (
					  <pre className="text-xs lg:text-sm whitespace-pre-wrap rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3 text-slate-700 dark:text-slate-200 overflow-auto">
						{diagramValue}
					  </pre>
					) : (
					  <div className="text-sm">{renderJson(diagramValue, `diagram-${diagramName}`)}</div>
					)}
				  </section>
				))}
			  </div>
			)}

			<div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-3 lg:p-8 overflow-x-hidden">
			  <div className="space-y-4 lg:space-y-6">
				{orderedSections.map(([sectionName, sectionValue]) => (
				  <section key={sectionName}>
					<h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-3">{sectionName}</h3>
					<div className="text-sm">{renderJson(sectionValue, sectionName)}</div>
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



