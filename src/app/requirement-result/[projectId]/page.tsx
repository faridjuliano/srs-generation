"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import FrNfrChatSidebar from '@/components/fr-nfr/FrNfrChatSidebar';
import { Sidebar } from '@/components/fr-nfr/ResultSidebar';
import { ResultHeader } from '@/components/fr-nfr/ResultHeader';
import { SectionCard } from '@/components/fr-nfr/SectionCard';
import RequirementSmellSection from '@/components/fr-nfr/RequirementSmellSection';
import FrNfrValidationSummary from '@/components/fr-nfr/FrNfrValidationSummary';
import Modal from '@/components/shared/Modal';
import type { NfNfrDetailedStoredPayload } from '@/lib/nfNfrDetailedTypes';
import { sectionOrder, toLabel } from '@/lib/srsUtils';
import type { JsonValue } from '@/lib/srsTypes';
import {getCurrentUser} from "@/lib/auth";

type DisplaySection = {
  key: string;
  title: string;
  value: JsonValue;
  kind: 'fr' | 'nfr' | 'default';
};

const TOP_SECTION_ORDER = [
  'assumptions',
  'constraints',
  'features',
  'functionalRequirements',
  'nonFunctionalRequirements'
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getProjectNameFromContent(content: Record<string, unknown> | null): string {
  if (!content) return 'SRS Document';
  const maybeName = content.projectName;
  return typeof maybeName === 'string' && maybeName.trim().length > 0 ? maybeName : 'SRS Document';
}

export default function FrNfrDetailedResultPage() {
  const getUserInfo = getCurrentUser();
  const userId = getUserInfo?.userId;

  const router = useRouter();
  const params = useParams<{ projectId: string }>();

  // const userId = params.userId;
  const projectId = params.projectId;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [payload, setPayload] = useState<NfNfrDetailedStoredPayload | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; title?: string; message?: string }>({
    isOpen: false
  });

  const showModal = (title: string, message: string) => {
    setModal({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false });
  };

  const content = payload?.content ?? null;
  const validation = payload?.validation ?? null;
  const predictionItems = payload?.prediction ?? [];
  const hasContent = content !== null;

  const projectName = getProjectNameFromContent(content);

  const orderedEntries = useMemo(() => {
    if (!isRecord(content)) return [] as DisplaySection[];

    const contentRecord = content as Record<string, JsonValue>;
    const sections: DisplaySection[] = [];

    TOP_SECTION_ORDER.forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(contentRecord, key)) return;

      sections.push({
        key,
        title: key === 'functionalRequirements'
          ? 'Functional Requirements'
          : key === 'nonFunctionalRequirements'
            ? 'Non-Functional Requirements'
            : toLabel(key),
        value: contentRecord[key],
        kind: key === 'functionalRequirements' ? 'fr' : key === 'nonFunctionalRequirements' ? 'nfr' : 'default'
      });
    });

    Object.entries(contentRecord)
      .filter(([key]) => key !== 'projectName' && !TOP_SECTION_ORDER.includes(key as (typeof TOP_SECTION_ORDER)[number]))
      .sort(([a], [b]) => sectionOrder(a, b))
      .forEach(([key, value]) => {
        sections.push({
          key,
          title: toLabel(key),
          value,
          kind: 'default'
        });
      });

    return sections;
  }, [content]);

  useEffect(() => {
    if (!content) return;
    setOpenSection(prev => {
      if (prev && orderedEntries.some(section => section.key === prev)) return prev;
      return orderedEntries[0]?.key ?? null;
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
          `/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(projectId)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const data = (await response.json().catch(() => null)) as unknown;
        if (!response.ok) {
          const errorRecord = isRecord(data) ? data : null;
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

        const rootRecord = isRecord(data) ? data : null;
        const rawPayload =
          rootRecord?.data && isRecord(rootRecord.data)
            ? (rootRecord.data as Record<string, unknown>)
            : rootRecord;

        if (!rawPayload) {
          if (!isCancelled) {
            setPayload(null);
            setFetchError('Project response did not include a valid content payload.');
          }
          return;
        }

        const generatedSrs = rawPayload.generatedSrs;
        const generatedSrsRecord = isRecord(generatedSrs) ? generatedSrs : rawPayload;

        if (!isCancelled) {
          setPayload(generatedSrsRecord as NfNfrDetailedStoredPayload);
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
  }, [projectId, userId]);

  const handleChatContentUpdate = (updatedContent: Record<string, unknown>) => {
    setPayload(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedContent
      };
    });
  };

  const handleExportSrs = async () => {
    if (!content) return;

    try {
      setExportStatus('exporting');
      const response = await fetch('/api/export/srs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName,
          generatedSrs: {
            content
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        setExportStatus('idle');
        showModal('Export failed', errorText || 'Failed to export SRS.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "srs-document.docx";
      link.click();
      window.URL.revokeObjectURL(url);

      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      setExportStatus('idle');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showModal('Export error', `Failed to export SRS: ${errorMessage}\n\nPlease try again.`);
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
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
          <ResultHeader
            onExport={() => {}}
            isExporting={false}
            canExport={false}
            onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
            isSidebarOpen={isSidebarOpen}
            onChatToggle={() => setIsChatOpen(prev => !prev)}
            isChatOpen={isChatOpen}
          />
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-6">
              <p className="text-slate-700 dark:text-slate-300">{fetchError ?? 'No detailed FR/NFR result found.'}</p>
              <button
                onClick={() => router.push('/new-requirement')}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white"
              >
                Go to Generator
              </button>
            </div>
          </div>
        </main>

      <FrNfrChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        content={undefined}
        onContentUpdate={handleChatContentUpdate}
        userId={userId}
        projectId={projectId}
      />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <ResultHeader
          onExport={handleExportSrs}
          isExporting={exportStatus === 'exporting'}
          canExport={!!content}
          onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
          isSidebarOpen={isSidebarOpen}
          onChatToggle={() => setIsChatOpen(prev => !prev)}
          isChatOpen={isChatOpen}
        />
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
            <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Name</h2>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{projectName}</p>
            </section>

            <FrNfrValidationSummary validation={validation} />
            <RequirementSmellSection predictionItems={predictionItems} />

            {hasContent ? (
              orderedEntries.map(section => (
                <SectionCard
                  key={section.key}
                  title={section.title}
                  kind={section.kind}
                  value={section.value}
                  isOpen={openSection === section.key}
                  onToggle={() => setOpenSection(prev => (prev === section.key ? null : section.key))}
                />
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
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        content={content ?? undefined}
        onContentUpdate={handleChatContentUpdate}
        userId={userId}
        projectId={projectId}
      />
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        primaryLabel="OK"
        onPrimary={closeModal}
        onClose={closeModal}
      />
    </div>
  );
}



