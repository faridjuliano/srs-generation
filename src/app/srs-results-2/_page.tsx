"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ValidationResult } from '@/lib/srsValidator';

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type StoredSRSData = {
  projectName?: string;
  srsStandard?: string;
  generatedContent?: JsonObject;
  validation?: ValidationResult;
  validationResult?: ValidationResult;
};

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sectionOrder(a: string, b: string): number {
  const priority: Record<string, number> = {
	documentControl: -3,
	revisionHistory: -2,
	tableOfContents: -1,
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

function renderJson(value: JsonValue, keyPrefix: string): React.ReactNode {
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

export default function SRSResults2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StoredSRSData | null>(null);

  useEffect(() => {
	try {
	  const raw = sessionStorage.getItem('srs-generated');
	  if (!raw) {
		setError('No generated SRS found. Please generate from New SRS 2 page.');
		return;
	  }

	  const parsed = JSON.parse(raw) as StoredSRSData;
	  if (!parsed.generatedContent || !isObject(parsed.generatedContent)) {
		setError('Generated SRS content is missing or invalid.');
		return;
	  }

	  setData(parsed);
	} catch (e) {
	  setError(e instanceof Error ? e.message : 'Failed to load generated SRS data.');
	} finally {
	  setLoading(false);
	}
  }, []);

  const content = data?.generatedContent;
  const validation = data?.validation ?? data?.validationResult ?? null;

  const orderedSections = useMemo(() => {
	if (!content) return [] as Array<[string, JsonValue]>;
	return Object.entries(content).sort(([a], [b]) => sectionOrder(a, b));
  }, [content]);

  if (loading) {
	return (
	  <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
		<p className="text-slate-600 dark:text-slate-400">Loading SRS result...</p>
	  </div>
	);
  }

  if (error) {
	return (
	  <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
		<div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1d2d] border border-red-200 dark:border-red-800 rounded-xl p-6">
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
	<div className="flex h-screen w-full overflow-hidden">
	  <aside className="hidden lg:flex flex-col w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b]">
		<div className="p-6">
		  <div className="flex items-center gap-3">
			<div className="size-8 rounded bg-primary flex items-center justify-center text-white">
			  <span className="material-symbols-outlined">description</span>
			</div>
			<h1 className="text-lg font-bold tracking-tight">SRS Manager</h1>
		  </div>
		</div>
		<div className="px-4">
		  <Link href="/new-srs-2" className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
			<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
			<span className="text-sm font-bold">New SRS Project</span>
		  </Link>
		</div>
	  </aside>

	  <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
		<header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b]">
		  <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400">
			<span className="text-slate-900 dark:text-white font-medium">SRS Results 2</span>
		  </nav>
		  <Link href="/new-srs-2" className="text-sm text-primary hover:underline">Generate again</Link>
		</header>

		<div className="flex-1 overflow-y-auto p-4 lg:p-8">
		  <div className="max-w-5xl mx-auto space-y-4 lg:space-y-6">
			<div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
			  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Document Summary</h2>
			  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
				{(content?.documentControl && isObject(content.documentControl) && typeof content.documentControl.projectName === 'string')
				  ? content.documentControl.projectName
				  : data?.projectName || 'Generated SRS'}
			  </p>
			</div>

			{validation && (
			  <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
				<div className="flex flex-wrap items-center gap-2">
				  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${validation.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
					{validation.passed ? 'Passed' : 'Failed'}
				  </span>
				  <span className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Score: {validation.qualityScore}</span>
				  <span className="px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Errors: {validation.errorCount}</span>
				  <span className="px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Warnings: {validation.warningCount}</span>
				</div>

				{validation.issues.length > 0 && (
				  <div className="mt-4 space-y-2">
					{validation.issues.map((issue, index) => (
					  <div key={`${issue.code}-${index}`} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
						<p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{issue.code}</p>
						<p className="text-sm text-slate-700 dark:text-slate-300">{issue.message}</p>
						{issue.path && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Path: {issue.path}</p>}
						{issue.suggestion && <p className="text-xs text-slate-500 dark:text-slate-400">Suggestion: {issue.suggestion}</p>}
					  </div>
					))}
				  </div>
				)}
			  </div>
			)}

			{orderedSections.map(([sectionName, sectionValue]) => (
			  <section
				key={sectionName}
				className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6"
			  >
				<h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-3">{sectionName}</h3>
				<div className="text-sm">
				  {renderJson(sectionValue, sectionName)}
				</div>
			  </section>
			))}
		  </div>
		</div>
	  </main>
	</div>
  );
}


