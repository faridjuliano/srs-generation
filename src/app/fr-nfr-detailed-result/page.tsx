"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import FrNfrAutoFixSuggestions from '@/components/fr-nfr/FrNfrAutoFixSuggestions';
import FrNfrChatSidebar from '@/components/fr-nfr/FrNfrChatSidebar';
import FrNfrValidationSummary from '@/components/fr-nfr/FrNfrValidationSummary';
import { JsonRenderer } from '@/components/srs-results-2/JsonRenderer';
import { exportJsonSectionsToDocx } from '@/lib/docxExport';
import type {
  FrNfrAutoFixSuggestion,
  FrNfrValidation,
  FrNfrValidationIssue
} from '@/lib/frNfrTypes';
import type { NfNfrDetailedStoredPayload } from '@/lib/nfNfrDetailedTypes';
import { sectionOrder, toLabel, updateJsonAtPath } from '@/lib/srsUtils';
import type { JsonPath, JsonValue } from '@/lib/srsTypes';

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeValidation(raw: unknown): FrNfrValidation | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const record = raw as Record<string, unknown>;
  const summary =
    record.summary && typeof record.summary === 'object' && !Array.isArray(record.summary)
      ? (record.summary as Record<string, unknown>)
      : null;

  const rawIssues = Array.isArray(record.issues) ? record.issues : [];
  const issues = rawIssues
    .map((issue): FrNfrValidationIssue | null => {
      if (!issue || typeof issue !== 'object' || Array.isArray(issue)) return null;
      const item = issue as Record<string, unknown>;

      const rawSeverity =
        (typeof item.severity === 'string' ? item.severity : undefined) ||
        (typeof item.level === 'string' ? item.level : undefined) ||
        (typeof item.type === 'string' ? item.type : undefined) ||
        'info';

      const severity: FrNfrValidationIssue['severity'] =
        rawSeverity.toLowerCase() === 'error'
          ? 'error'
          : rawSeverity.toLowerCase() === 'warning'
            ? 'warning'
            : 'info';

      const message =
        (typeof item.message === 'string' && item.message.trim().length > 0
          ? item.message
          : typeof item.description === 'string' && item.description.trim().length > 0
            ? item.description
            : null) ?? 'Issue details unavailable.';

      const path =
        typeof item.path === 'string'
          ? item.path
          : Array.isArray(item.path)
            ? item.path.filter(segment => typeof segment === 'string').join('.')
            : undefined;

      const normalized: FrNfrValidationIssue = {severity, message};
      const normalizedMutable = normalized as FrNfrValidationIssue & {
        requirementId?: string;
        requirementType?: string;
        category?: string;
        field?: string;
        details?: unknown;
        raw?: Record<string, unknown>;
      };

      if (typeof item.code === 'string') normalizedMutable.code = item.code;
      if (typeof item.requirementId === 'string') normalizedMutable.requirementId = item.requirementId;
      if (typeof item.requirementType === 'string') normalizedMutable.requirementType = item.requirementType;
      if (typeof item.category === 'string') normalizedMutable.category = item.category;
      if (typeof item.field === 'string') normalizedMutable.field = item.field;
      if ('details' in item) normalizedMutable.details = item.details;
      if (typeof path === 'string') normalizedMutable.path = path;
      if (typeof item.suggestion === 'string') normalizedMutable.suggestion = item.suggestion;
      normalizedMutable.raw = item;

      return normalized;
    })
    .filter((issue): issue is FrNfrValidationIssue => issue !== null);

  const fallbackErrors = issues.filter(issue => issue.severity === 'error').length;
  const fallbackWarnings = issues.filter(issue => issue.severity === 'warning').length;

  const errors = toNumber(summary?.errors) ?? toNumber(record.errorCount) ?? fallbackErrors;
  const warnings = toNumber(summary?.warnings) ?? toNumber(record.warningCount) ?? fallbackWarnings;

  const isValid =
    typeof record.isValid === 'boolean'
      ? record.isValid
      : typeof record.passed === 'boolean'
        ? record.passed
        : errors === 0;

  return {
    isValid,
    qualityScore: toNumber(record.qualityScore),
    totalRequirements: toNumber(summary?.totalRequirements),
    totalIssues: toNumber(summary?.totalIssues) ?? issues.length,
    errors,
    warnings,
    issues
  };
}

function normalizeAutoFixSuggestions(raw: unknown): FrNfrAutoFixSuggestion[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const record = item as Record<string, unknown>;
      const message =
        typeof record.message === 'string' && record.message.trim().length > 0
          ? record.message
          : 'No message provided.';
      const suggestion =
        typeof record.suggestion === 'string' && record.suggestion.trim().length > 0
          ? record.suggestion
          : 'No suggestion provided.';

      const normalized: FrNfrAutoFixSuggestion = {message, suggestion};
      if (typeof record.requirementId === 'string') normalized.requirementId = record.requirementId;
      if (typeof record.requirementType === 'string') normalized.requirementType = record.requirementType;
      if (typeof record.category === 'string') normalized.category = record.category;

      return normalized;
    })
    .filter((item): item is FrNfrAutoFixSuggestion => item !== null);
}

function loadPayload(): NfNfrDetailedStoredPayload | null {
  try {
    const raw = sessionStorage.getItem('nf-nfr-detailed-generated');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const record = parsed as Record<string, unknown>;
    const validation = normalizeValidation(record.validation);
    const autoFixSuggestions = normalizeAutoFixSuggestions(record.autoFixSuggestions);

    return {
      success: typeof record.success === 'boolean' ? record.success : false,
      content:
        record.content && typeof record.content === 'object' && !Array.isArray(record.content)
          ? (record.content as Record<string, unknown>)
          : undefined,
      validation: validation ?? undefined,
      autoFixSuggestions: autoFixSuggestions.length > 0 ? autoFixSuggestions : undefined
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

export default function FrNfrDetailedResultPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [payload, setPayload] = useState<NfNfrDetailedStoredPayload | null>(() => loadPayload());

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
    if (!payload) return;
    sessionStorage.setItem('nf-nfr-detailed-generated', JSON.stringify(payload));
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
      console.error('Failed to export DOCX:', error);
      setExportStatus('idle');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to export DOCX: ${errorMessage}\n\nPlease try again.`);
    }
  };

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
              <span className="text-sm font-bold">Generate Detailed NF/NFR</span>
            </Link>
          </div>
        </aside>

        <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
            <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
            <span className="mx-2 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium">Detailed Result</span>
          </nav>
          <div className="flex items-center gap-3">
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
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-6">
              <p className="text-slate-700 dark:text-slate-300">No detailed FR/NFR result found. Please generate it first.</p>
              <button
                onClick={() => router.push('/new-fr-nfr-detailed')}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white"
              >
                Go to Detailed Generator
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
            <span className="text-sm font-bold">Generate Detailed NF/NFR</span>
          </Link>
        </div>
      </aside>

      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-12 lg:ml-0">
            <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
            <span className="mx-2 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium">Detailed Result</span>
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
            <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Summary</h2>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mt-1">Project Name: {projectName}</p>
            </section>

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

