"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import FrNfrChatSidebar from '@/components/fr-nfr/FrNfrChatSidebar';
import { JsonRenderer } from '@/components/srs-results-2/JsonRenderer';
import { sectionOrder, toLabel, updateJsonAtPath } from '@/lib/srsUtils';
import type { JsonPath, JsonValue } from '@/lib/srsTypes';

type FrNfrStoredPayload = {
  success: boolean;
  content: Record<string, unknown>;
};

function loadPayload(): FrNfrStoredPayload | null {
  try {
    const raw = sessionStorage.getItem('fr-nfr-generated');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    if (record.success !== true || !record.content || typeof record.content !== 'object' || Array.isArray(record.content)) return null;
    return {
      success: true,
      content: record.content as Record<string, unknown>
    };
  } catch {
    return null;
  }
}

function getProjectNameFromContent(content: Record<string, unknown> | null): string {
  if (!content) return 'SRS Document';
  const maybeName = content.projectName;
  return typeof maybeName === 'string' && maybeName.trim().length > 0 ? maybeName : 'SRS Document';
}

export default function FrNfrResultsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [payload, setPayload] = useState<FrNfrStoredPayload | null>(() => loadPayload());
  const content = payload?.content ?? null;

  const projectName = getProjectNameFromContent(content);

  const orderedEntries = useMemo(() => {
    if (!content) return [] as Array<[string, JsonValue]>;
    return Object.entries(content as Record<string, JsonValue>).sort(([a], [b]) => sectionOrder(a, b));
  }, [content]);

  useEffect(() => {
    if (!payload) return;
    sessionStorage.setItem('fr-nfr-generated', JSON.stringify(payload));
  }, [payload]);

  const handleUpdate = (path: JsonPath, value: JsonValue) => {
    setPayload(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: updateJsonAtPath(prev.content as JsonValue, path, value) as Record<string, unknown>
      };
    });
  };

  const handleChatContentUpdate = (updated: Record<string, unknown>) => {
    setPayload(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: updated
      };
    });
  };

  if (!payload || !content) {
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
            <Link href="/new-fr-nfr" className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
              <span className="text-sm font-bold">Generate FR/NFR</span>
            </Link>
          </div>
        </aside>

        <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
            <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
              <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
              <span className="mx-2 hidden sm:inline">/</span>
              <span className="text-slate-900 dark:text-white font-medium">FR/NFR Results</span>
            </nav>
            <Link href="/new-fr-nfr" className="text-sm text-primary hover:underline">
              Generate again
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-6">
              <p className="text-slate-700 dark:text-slate-300">No FR/NFR result found. Please generate it first.</p>
              <button
                onClick={() => router.push('/new-fr-nfr')}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white"
              >
                Go to FR/NFR Generator
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <Link href="/new-fr-nfr" className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            <span className="text-sm font-bold">Generate FR/NFR</span>
          </Link>
        </div>
      </aside>

      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
            <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
            <span className="mx-2 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium">FR/NFR Results</span>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="p-2 text-slate-500 hover:text-primary transition-colors"
              title="Open FR/NFR reprompt chat"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isEditing
                  ? 'bg-primary text-white border-primary hover:bg-blue-700'
                  : 'bg-white dark:bg-transparent text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isEditing ? 'Done Editing' : 'Edit'}
            </button>
            <Link href="/new-fr-nfr" className="text-sm text-primary hover:underline">
              Generate again
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
            <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Summary</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{projectName}</p>
            </section>

            {orderedEntries.map(([sectionName, sectionValue]) => (
              <section
                key={sectionName}
                className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6"
              >
                <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {toLabel(sectionName)}
                </h3>
                <div className="text-sm">
                  <JsonRenderer
                    value={sectionValue}
                    keyPrefix={sectionName}
                    depth={0}
                    path={[sectionName]}
                    onEdit={isEditing ? handleUpdate : undefined}
                  />
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <FrNfrChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        content={content ?? undefined}
        onContentUpdate={handleChatContentUpdate}
      />
    </div>
  );
}


