"use client";

import { useEffect, useId, useState } from 'react';

interface DetectedItem {
  label: string;
  value: string;
}

interface Suggestion {
  icon: string;
  title: string;
  description: string;
  variant?: 'info' | 'muted';
}

interface AnalysisDrawerProps {
  clarityLabel?: string;
  clarityScoreTitle?: string;
  clarityProgress?: number;
  detectedItems?: DetectedItem[];
  suggestions?: Suggestion[];
  quickTemplates?: string[];
  triggerClassName?: string;
}

const defaultDetectedItems: DetectedItem[] = [
  { label: 'User Roles', value: '3' },
  { label: 'Functional Reqs', value: '12' },
  { label: 'Key Constraints', value: '2' }
];

const defaultSuggestions: Suggestion[] = [
  {
    icon: 'lightbulb',
    title: 'Ambiguity Check',
    description: 'Try to specify "real-time" latency (e.g., <200ms) for better technical specs.',
    variant: 'info'
  },
  {
    icon: 'security',
    title: 'Security Gap',
    description: 'No mention of data encryption standards found yet.',
    variant: 'muted'
  }
];

const defaultTemplates = ['E-Commerce', 'SaaS Platform', 'Mobile App'];

export default function AnalysisDrawer({
  clarityLabel = 'Input Clarity',
  clarityScoreTitle = 'Medium',
  clarityProgress = 45,
  detectedItems = defaultDetectedItems,
  suggestions = defaultSuggestions,
  quickTemplates = defaultTemplates,
  triggerClassName = 'lg:hidden p-2 text-slate-500 hover:text-primary transition-colors'
}: AnalysisDrawerProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryList | MediaQueryListEvent) => {
      const matches = event.matches;
      setIsDesktop(matches);
      if (matches) {
        setIsOpen(true);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const progressWidth = Math.min(100, Math.max(0, clarityProgress));

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={isOpen}
        aria-controls={drawerId}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="material-symbols-outlined">analytics</span>
      </button>

      <aside
        id={drawerId}
        role="complementary"
        aria-label="Input analysis drawer"
        className={`w-80 h-full bg-white dark:bg-[#161926] border-l border-[#e7e9f3] dark:border-[#2a2e3b] flex flex-col flex-shrink-0 z-20 shadow-xl fixed lg:static inset-y-0 right-0 transition-transform duration-300 ease-out ${
          isDesktop || isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Close analysis drawer"
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{clarityLabel}</span>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{clarityScoreTitle}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${progressWidth}%` }}
                aria-hidden="true"
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add more details about user roles to improve analysis quality.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>
                radar
              </span>
              Detected Items
            </h3>
            <div className="space-y-3">
              {detectedItems.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Real-time Suggestions</h3>
            <div className="space-y-3">
              {suggestions.map(suggestion => (
                <div
                  key={suggestion.title}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                    suggestion.variant === 'info'
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                      : 'bg-white dark:bg-[#1a1d2d] border-slate-200 dark:border-slate-700 opacity-80'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px' }}>
                    {suggestion.icon}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{suggestion.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{suggestion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Templates</h3>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map(template => (
                <button
                  key={template}
                  type="button"
                  className="text-xs bg-white dark:bg-[#202434] hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

