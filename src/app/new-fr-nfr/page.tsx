"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FrNfrGenerateResponse, FrNfrStoredPayload } from '@/lib/frNfrTypes';

export default function NewFrNfrPage() {
  const router = useRouter();
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const [projectName, setProjectName] = useState('Inventory Management System');
  const [projectVision, setProjectVision] = useState('A web application for tracking stock levels and low inventory alerts.');
  const [validatorConfig, setValidatorConfig] = useState<'rule-based' | 'gemini' | 'no-validation'>('rule-based');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
	if (!projectName.trim()) {
	  setError('Project name is required.');
	  return;
	}

	if (!projectVision.trim()) {
	  setError('Project vision is required.');
	  return;
	}

	setIsGenerating(true);
	setError(null);

	try {
	  const response = await fetch(`${backendBaseUrl}/api/srs/generate-fr-nfr`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projectName, projectVision, validatorConfig })
	  });

	  const data = (await response.json()) as FrNfrGenerateResponse;

	  if (!response.ok || !data.success || !data.content) {
		setError(data.error || 'Failed to generate FR/NFR content.');
		return;
	  }

	  const storedPayload: FrNfrStoredPayload = {
		success: data.success,
		content: data.content,
		validation: data.validation,
		autoFixSuggestions: data.autoFixSuggestions
	  };
	  sessionStorage.setItem('fr-nfr-generated', JSON.stringify(storedPayload));
	  router.push('/fr-nfr-results');
	} catch (err) {
	  setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
	} finally {
	  setIsGenerating(false);
	}
  };

  return (
	<div className="flex h-screen w-full overflow-hidden">
	  <aside className="hidden lg:flex flex-col w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0">
		<div className="p-6">
		  <div className="flex items-center gap-3">
			<div className="size-8 rounded bg-primary flex items-center justify-center text-white">
			  <span className="material-symbols-outlined">description</span>
			</div>
			<h1 className="text-lg font-bold tracking-tight">SRS Manager</h1>
		  </div>
		</div>
		<div className="px-4">
		  <Link
			href="/new-fr-nfr"
			className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
		  >
			<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
			<span className="text-sm font-bold">Generate FR/NFR</span>
		  </Link>
		</div>
	  </aside>

	  <main className="flex flex-col flex-1 min-w-0 bg-background-light dark:bg-background-dark">
		<header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b]">
		  <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 truncate">
			<span className="text-slate-900 dark:text-white font-medium text-xs lg:text-sm">FR/NFR Generator</span>
		  </nav>
		</header>

		<div className="flex-1 overflow-y-auto p-4 lg:p-8">
		  <div className="max-w-4xl mx-auto bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-8">
			<div className="mb-6">
			  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Generate FR & NFR</h2>
			  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
				Prompt Ai Model (gemini) to generate Functional Requirements and Non-Functional Requirements using the ISO/IEC/IEEE 29148:2018 srs standard.
			  </p>
			</div>

			<div className="space-y-5">
			  <div>
				<label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Project Name</label>
				<input
				  type="text"
				  value={projectName}
				  onChange={(e) => setProjectName(e.target.value)}
				  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
				/>
			  </div>

			  <div>
				<label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Project Vision</label>
				<textarea
				  value={projectVision}
				  onChange={(e) => setProjectVision(e.target.value)}
				  rows={7}
				  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
				/>
				<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
				  The backend will generate FR and NFR only from this project description.
				</p>
			  </div>

				  <div>
					<label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Validator Configuration</label>
					<select
					  value={validatorConfig}
					  onChange={(e) => setValidatorConfig(e.target.value as 'rule-based' | 'gemini' | 'no-validation')}
					  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
					>
					  <option value="rule-based">Rule-based Mechanism</option>
					  <option value="gemini">Gemini LLM</option>
            <option value="no-validation">No Validation</option>
					</select>
					<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						Choose how the backend validator should evaluate generated requirements.
					</p>
				  </div>

			  {error && (
				<div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
				  {error}
				</div>
			  )}

			  <div className="flex justify-end pt-2">
				<button
				  type="button"
				  onClick={handleGenerate}
				  disabled={isGenerating}
				  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  {isGenerating && <span className="material-symbols-outlined animate-spin text-base">refresh</span>}
				  {isGenerating ? 'Generating...' : 'Generate FR/NFR'}
				</button>
			  </div>
			</div>
		  </div>
		</div>
	  </main>
	</div>
  );
}

