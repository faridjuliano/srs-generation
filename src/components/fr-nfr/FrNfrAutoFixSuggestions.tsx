"use client";

import { useState } from 'react';
import type { FrNfrAutoFixSuggestion } from '@/lib/frNfrTypes';

type FrNfrAutoFixSuggestionsProps = {
  autoFixSuggestions: FrNfrAutoFixSuggestion[];
};

export default function FrNfrAutoFixSuggestions({ autoFixSuggestions }: FrNfrAutoFixSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6 space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fix Suggestions</h2>
        <span className="cursor-pointer material-symbols-outlined text-slate-500 dark:text-slate-300">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        autoFixSuggestions.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">No auto-fix suggestions returned.</p>
        ) : (
          <div className="space-y-3">
            {autoFixSuggestions.map((item, index) => (
              <article
                key={`${item.requirementId ?? 'fix'}-${index}`}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {item.requirementId && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {item.requirementId}
                    </span>
                  )}
                  {item.requirementType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">
                      {item.requirementType}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.category}</span>
                  )}
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 mt-2">{item.message}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.suggestion}</p>
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}

