"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import FrNfrAutoFixSuggestions from '@/components/fr-nfr/FrNfrAutoFixSuggestions';
import FrNfrChatSidebar from '@/components/fr-nfr/FrNfrChatSidebar';
import FrNfrValidationSummary from '@/components/fr-nfr/FrNfrValidationSummary';
import { JsonRenderer } from '@/components/srs-results-2/JsonRenderer';
import { exportJsonSectionsToDocx } from '@/lib/docxExport';
import type { NfNfrDetailedStoredPayload } from '@/lib/nfNfrDetailedTypes';
import { sectionOrder, toLabel, updateJsonAtPath } from '@/lib/srsUtils';
import type { JsonPath, JsonValue } from '@/lib/srsTypes';

function getProjectNameFromContent(content: Record<string, unknown> | null): string {
  if (!content) return 'SRS Document';
  const maybeName = content.projectName;
  return typeof maybeName === 'string' && maybeName.trim().length > 0 ? maybeName : 'SRS Document';
}

export default function FrNfrDetailedResultPage() {
  const router = useRouter();
  const params = useParams<{ userId: string; projectId: string }>();
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const userId = params.userId;
  const projectId = params.projectId;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [payload, setPayload] = useState<NfNfrDetailedStoredPayload | null>(null);

  const content = payload?.content ?? null;
  const validation = payload?.validation ?? null;
  const autoFixSuggestions = payload?.autoFixSuggestions ?? [];
  const hasContent = content !== null;

  const projectName = getProjectNameFromContent(content);

  const orderedEntries = useMemo(() => {
    if (!content) return [] as Array<[string, JsonValue]>;
    return Object.entries(content as Record<string, JsonValue>).sort(([a], [b]) => sectionOrder(a, b));
  }, [content]);

  useEffect(() => {
    if (!content) return;
    setOpenSection(prev => {
      if (prev && orderedEntries.some(([sectionName]) => sectionName === prev)) return prev;
      return orderedEntries[0]?.[0] ?? null;
    });
  }, [content, orderedEntries]);

  useEffect(() => {
    let isCancelled = false;

    const fetchProject = async () => {
      if (!userId || !projectId) {
        setFetchError('Missing userId or projectId in URL.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(
          `${backendBaseUrl}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(projectId)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const data = (await response.json().catch(() => null)) as unknown;
        if (!response.ok) {
          const errorRecord =
            data && typeof data === 'object' && !Array.isArray(data)
              ? (data as Record<string, unknown>)
              : null;
          const message =
            errorRecord && typeof errorRecord.error === 'string'
              ? errorRecord.error
              : 'Failed to load project details.';
          if (!isCancelled) {
            setPayload(null);
            setFetchError(message);
          }
          return;
        }

        const rootRecord =
          data && typeof data === 'object' && !Array.isArray(data)
            ? (data as Record<string, unknown>)
            : null;
        const rawPayload =
          rootRecord?.data && typeof rootRecord.data === 'object' && !Array.isArray(rootRecord.data)
            ? (rootRecord.data as Record<string, unknown>)
            : rootRecord;

        if (!rawPayload) {
          if (!isCancelled) {
            setPayload(null);
            setFetchError('Project response did not include a valid content payload.');
          }
          return;
        }

        if (!isCancelled) {
          console.log(rawPayload, "rawPayloadrawPayload")
          setPayload(rawPayload.generatedSrs as NfNfrDetailedStoredPayload);
        }
      } catch (error) {
        if (!isCancelled) {
          setPayload(null);
          setFetchError(error instanceof Error ? error.message : 'Failed to load project details.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProject();

    return () => {
      isCancelled = true;
    };
  }, [backendBaseUrl, projectId, userId]);

  const handleUpdate = (path: JsonPath, value: JsonValue) => {
    setPayload(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: updateJsonAtPath(prev.content as JsonValue, path, value) as Record<string, unknown>
      };
    });
  };

  const handleChatContentUpdate = (updatedContent: Record<string, unknown>) => {
    setPayload(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        content: updatedContent
      };
    });
  };

  const handleExportDocx = async () => {
    if (!content) return;

    try {
      setExportStatus('exporting');
      const date = new Date().toISOString().split('T')[0];
      const projectNameForFile = (projectName || 'Detailed_FR_NFR_Document')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
      const filename = `${projectNameForFile || 'detailed_fr_nfr_document'}_${date}.docx`;

      await exportJsonSectionsToDocx({
        filename,
        title: projectName,
        subtitle: 'Detailed FR/NFR Export',
        sections: orderedEntries.map(([sectionName, sectionValue]) => ({
          title: toLabel(sectionName),
          value: sectionValue
        }))
      });

      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      setExportStatus('idle');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to export DOCX: ${errorMessage}\n\nPlease try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-sm text-slate-600 dark:text-slate-300">Loading project result...</p>
      </div>
    );
  }

  if (!payload) {
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
            <Link href="/new-fr-nfr-detailed" className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
              <span className="text-sm font-bold">Generate Functional and Non-Functional requirement</span>
            </Link>
          </div>
        </aside>

        <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
            <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
              <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
              <span className="mx-2 hidden sm:inline">/</span>
              <span className="text-slate-900 dark:text-white font-medium">Result</span>
            </nav>
            <Link href="/new-fr-nfr-detailed" className="text-sm text-primary hover:underline">
              Generate again
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-6">
              <p className="text-slate-700 dark:text-slate-300">{fetchError ?? 'No detailed FR/NFR result found.'}</p>
              <button
                onClick={() => router.push('/new-fr-nfr-detailed')}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white"
              >
                Go to Generator
              </button>
            </div>
          </div>
        </main>

        <FrNfrChatSidebar
          isOpen={true}
          onClose={() => {}}
          content={undefined}
          onContentUpdate={handleChatContentUpdate}
        />
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
          <Link href="/new-fr-nfr-detailed" className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            <span className="text-sm font-bold">Generate Functional and Non-Functional requirement</span>
          </Link>
        </div>
      </aside>

      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
            <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
            <span className="mx-2 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium">Result</span>
          </nav>
          <div className="flex items-center gap-2 lg:gap-3">
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
            <button
              type="button"
              onClick={() => void handleExportDocx()}
              disabled={!content || exportStatus === 'exporting'}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">
                {exportStatus === 'exporting' ? 'progress_activity' : 'download'}
              </span>
              <span>{exportStatus === 'exporting' ? 'Exporting...' : 'Export DOCX'}</span>
            </button>
            <Link href="/new-fr-nfr-detailed" className="text-sm text-primary hover:underline">
              Generate again
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
            <FrNfrValidationSummary validation={validation} />
            <FrNfrAutoFixSuggestions autoFixSuggestions={autoFixSuggestions} />

            {hasContent ? (
              orderedEntries.map(([sectionName, sectionValue]) => (
                <section
                  key={sectionName}
                  className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(prev => (prev === sectionName ? null : sectionName))}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">
                      {toLabel(sectionName)}
                    </h3>
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                      {openSection === sectionName ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {openSection === sectionName && (
                    <div className="mt-3 text-sm">
                      <JsonRenderer
                        value={sectionValue}
                        keyPrefix={sectionName}
                        depth={0}
                        path={[sectionName]}
                        onEdit={isEditing ? handleUpdate : undefined}
                      />
                    </div>
                  )}
                </section>
              ))
            ) : (
              <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
                <p className="text-slate-700 dark:text-slate-300">No content object was returned in the payload.</p>
              </section>
            )}
          </div>
        </div>
      </main>

      <FrNfrChatSidebar
        isOpen={true}
        onClose={() => {}}
        content={content ?? undefined}
        onContentUpdate={handleChatContentUpdate}
      />
    </div>
  );
}


