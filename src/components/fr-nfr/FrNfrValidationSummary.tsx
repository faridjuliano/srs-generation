"use client";

import Tooltip from '@/components/shared/Tooltip';
import type { FrNfrValidation, FrNfrValidationGroup, FrNfrValidationIssue } from '@/lib/frNfrTypes';
import { useState } from 'react';

type FrNfrValidationIssueDisplay = {
  severity: 'error' | 'warning' | 'info';
  code?: string;
  requirementId?: string;
  requirementType?: string;
  category?: string;
  field?: string;
  details?: unknown;
  message: string;
  path?: string;
  suggestion?: string;
  raw?: Record<string, unknown>;
};

type ValidationGroupDisplay = {
  key: string;
  title: string;
  data: FrNfrValidationGroup;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatScalar).join(', ');
  return '—';
}

function getScoreTone(score: number | null) {
  if (score === null) {
    return {
      card: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20',
      label: 'text-slate-500 dark:text-slate-400',
      value: 'text-slate-900 dark:text-white'
    };
  }

  if (score < 40) {
    return {
      card: 'border-rose-200 dark:border-rose-800/70 bg-rose-50 dark:bg-rose-900/20',
      label: 'text-rose-600 dark:text-rose-300',
      value: 'text-rose-700 dark:text-rose-300'
    };
  }

  if (score < 70) {
    return {
      card: 'border-amber-200 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-900/20',
      label: 'text-amber-600 dark:text-amber-300',
      value: 'text-amber-700 dark:text-amber-300'
    };
  }

  if (score < 90) {
    return {
      card: 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-900/20',
      label: 'text-emerald-600 dark:text-emerald-300',
      value: 'text-emerald-700 dark:text-emerald-300'
    };
  }

  return {
    card: 'border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-900/20',
    label: 'text-blue-600 dark:text-blue-300',
    value: 'text-blue-700 dark:text-blue-300'
  };
}

type FrNfrValidationSummaryProps = {
  validation: FrNfrValidation | null;
};

function normalizeGroupIssues(issues: FrNfrValidationIssue[] | undefined): FrNfrValidationIssueDisplay[] {
  return (issues ?? []).map(issue => issue as FrNfrValidationIssueDisplay);
}

function getGroupTone(score: number | null) {
  return getScoreTone(score);
}

export default function FrNfrValidationSummary({ validation }: FrNfrValidationSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isByTypeOpen, setIsByTypeOpen] = useState(true);
  const hasValidation = validation !== null;
  const displayValidation: FrNfrValidation =
    validation ?? {
      summary: {
        totalRequirements: 0,
        totalIssues: 0,
        errors: 0,
        warnings: 0
      },
      isValid: false,
      qualityScore: null,
      totalRequirements: null,
      totalIssues: 0,
      errors: 0,
      warnings: 0,
      issues: []
    };
  const scoreTone = getScoreTone(displayValidation.qualityScore);
  const validationGroups: ValidationGroupDisplay[] = displayValidation.byType
    ? [
        ...(displayValidation.byType.FR
          ? [{ key: 'FR', title: 'Functional Requirements', data: displayValidation.byType.FR }]
          : []),
        ...(displayValidation.byType.NFR
          ? [{ key: 'NFR', title: 'Non-Functional Requirements', data: displayValidation.byType.NFR }]
          : []),
        ...Object.entries(displayValidation.byType)
          .filter(([key]) => key !== 'FR' && key !== 'NFR')
          .map(([key, data]) => ({ key, title: key, data: data as FrNfrValidationGroup }))
      ]
    : [];
  

  return (
    <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6 space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Validation Summary</h2>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: !hasValidation ? '#e2e8f0' : displayValidation.isValid ? '#10b981' : '#e11d48',
              color: '#ffffff'
            }}
          >
            {!hasValidation ? 'Not validated' : displayValidation.isValid ? 'Valid' : 'Needs review'}
          </span>
        </div>
        <span className="material-symbols-outlined text-slate-500 dark:text-slate-300">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`rounded-lg border p-3 ${scoreTone.card}`}>
              <div className={`flex items-center gap-1 text-xs ${scoreTone.label}`}>
                <span>Overall Quality Score</span>
                <Tooltip
                  content={
                    <div className="space-y-1">
                      <p><strong>90–100</strong> → strong quality</p>
                      <p><strong>70–89</strong> → mostly good, some warnings</p>
                      <p><strong>40–69</strong> → needs attention</p>
                      <p><strong>0–39</strong> → poor quality / many issues</p>
                    </div>
                  }
                >
                  <button
                    type="button"
                    aria-label="Quality score range guide"
                    className="inline-flex size-4 items-center justify-center rounded-full border border-current text-[10px] font-bold leading-none opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    i
                  </button>
                </Tooltip>
              </div>
              <p className={`text-lg font-bold ${scoreTone.value}`}>{displayValidation.qualityScore ?? '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Requirements</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{displayValidation.summary.totalRequirements ?? '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Issues</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{displayValidation.summary.totalIssues}</p>
            </div>
            <div className="rounded-lg border border-rose-200 dark:border-rose-800/70 p-3">
              <p className="text-xs text-rose-600 dark:text-rose-300">Errors</p>
              <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{displayValidation.summary.errors}</p>
            </div>
            <div className="rounded-lg border border-amber-200 dark:border-amber-800/70 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-300">Warnings</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{displayValidation.summary.warnings}</p>
            </div>
          </div>

          {validationGroups.length > 0 && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <button
                type="button"
                onClick={() => setIsByTypeOpen(prev => !prev)}
                aria-expanded={isByTypeOpen}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Validation by Requirement Type</h3>
                </div>
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300">
                  {isByTypeOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {isByTypeOpen && (
                <div className="grid gap-3">
                  {validationGroups.map(group => {
                    const groupScore = group.data.qualityScore ?? null;
                    const groupTone = getGroupTone(groupScore);
                    const groupIssues = normalizeGroupIssues(group.data.issues);
                    const groupSummary = group.data.summary;

                    return (
                      <article key={group.key} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{group.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {groupSummary?.totalRequirements ?? '-'} requirements · {groupSummary?.totalIssues ?? groupIssues.length} issues
                            </p>
                          </div>
                          <div className={`rounded-lg border px-3 py-2 ${groupTone.card}`}>
                            <p className={`text-[11px] font-semibold uppercase tracking-wide ${groupTone.label}`}>Quality</p>
                            <p className={`text-sm font-bold ${groupTone.value}`}>{groupScore ?? '-'}</p>
                          </div>
                        </div>

                        {groupIssues.length === 0 ? (
                          <p className="text-sm text-slate-600 dark:text-slate-300">No issues reported for this group.</p>
                        ) : (
                          <div className="space-y-3">
                            {groupIssues.map((issue, index) => {
                              const displayIssue = issue as FrNfrValidationIssueDisplay;

                              return (
                                <article key={`${group.key}-${displayIssue.code ?? 'issue'}-${index}`} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                                  <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/*<span>{displayIssue.severity}</span>*/}
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                                          displayIssue.severity === 'error'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                            : displayIssue.severity === 'warning'
                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                      >
                                        {displayIssue.severity}
                                      </span>
                                      {displayIssue.requirementId && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                          {displayIssue.requirementId}
                                        </span>
                                      )}
                                      {displayIssue.requirementType && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 uppercase">
                                          {displayIssue.requirementType}
                                        </span>
                                      )}
                                      {displayIssue.category && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                          {displayIssue.category}
                                        </span>
                                      )}
                                    </div>

                                    {displayIssue.field && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Field: <span className="font-medium text-slate-700 dark:text-slate-300">{displayIssue.field}</span>
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">{displayIssue.message}</p>

                                  {(displayIssue.path || displayIssue.code || displayIssue.suggestion) && (
                                    <div className="mt-3 grid gap-2 text-sm">
                                      {displayIssue.code && (
                                        <div className="flex gap-2">
                                          <span className="w-24 text-slate-500 dark:text-slate-400">Code</span>
                                          <span className="text-slate-800 dark:text-slate-200">{displayIssue.code}</span>
                                        </div>
                                      )}
                                      {displayIssue.path && (
                                        <div className="flex gap-2">
                                          <span className="w-24 text-slate-500 dark:text-slate-400">Path</span>
                                          <span className="text-slate-800 dark:text-slate-200">{displayIssue.path}</span>
                                        </div>
                                      )}
                                      {displayIssue.suggestion && (
                                        <div className="flex gap-2">
                                          <span className="w-24 text-slate-500 dark:text-slate-400">Suggestion</span>
                                          <span className="text-slate-800 dark:text-slate-200">{displayIssue.suggestion}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {isRecord(displayIssue.details) ? (
                                    <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3">
                                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Details</h4>
                                      <dl className="mt-2 space-y-2">
                                        {Object.entries(displayIssue.details).map(([key, value]) => (
                                          <div key={key} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
                                            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                                              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                            </dt>
                                            <dd className="text-sm text-slate-800 dark:text-slate-200 break-words">
                                              {formatScalar(value)}
                                            </dd>
                                          </div>
                                        ))}
                                      </dl>
                                    </div>
                                  ) : displayIssue.details !== undefined ? (
                                    <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3">
                                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Details</h4>
                                      <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{formatScalar(displayIssue.details)}</p>
                                    </div>
                                  ) : null}
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/*<div className="space-y-3">*/}
          {/*  <div>*/}
          {/*    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Validation Issues</h3>*/}
          {/*  </div>*/}
          {/*  {issues.length === 0 ? (*/}
          {/*    <p className="text-sm text-slate-600 dark:text-slate-300">*/}
          {/*      {hasValidation ? 'No issues found.' : 'Validation data unavailable.'}*/}
          {/*    </p>*/}
          {/*  ) : (*/}
          {/*    <div className="space-y-3">*/}
          {/*      {issues.map((issue, index) => {*/}
          {/*        const displayIssue = issue as FrNfrValidationIssueDisplay;*/}

          {/*        return (*/}
          {/*          <article key={`${displayIssue.code ?? 'issue'}-${index}`} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">*/}
          {/*            <div className="flex items-start justify-between gap-3 flex-wrap">*/}
          {/*              <div className="flex items-center gap-2 flex-wrap">*/}
          {/*                <span*/}
          {/*                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${*/}
          {/*                    displayIssue.severity === 'error'*/}
          {/*                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'*/}
          {/*                      : displayIssue.severity === 'warning'*/}
          {/*                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'*/}
          {/*                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'*/}
          {/*                  }`}*/}
          {/*                >*/}
          {/*                  {displayIssue.severity}*/}
          {/*                </span>*/}
          {/*                {displayIssue.requirementId && (*/}
          {/*                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">*/}
          {/*                    {displayIssue.requirementId}*/}
          {/*                  </span>*/}
          {/*                )}*/}
          {/*                {displayIssue.requirementType && (*/}
          {/*                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 uppercase">*/}
          {/*                    {displayIssue.requirementType}*/}
          {/*                  </span>*/}
          {/*                )}*/}
          {/*                {displayIssue.category && (*/}
          {/*                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">*/}
          {/*                    {displayIssue.category}*/}
          {/*                  </span>*/}
          {/*                )}*/}
          {/*              </div>*/}

          {/*              {displayIssue.field && (*/}
          {/*                <span className="text-xs text-slate-500 dark:text-slate-400">*/}
          {/*                  Field: <span className="font-medium text-slate-700 dark:text-slate-300">{displayIssue.field}</span>*/}
          {/*                </span>*/}
          {/*              )}*/}
          {/*            </div>*/}

          {/*            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">{displayIssue.message}</p>*/}

          {/*            {(displayIssue.path || displayIssue.code || displayIssue.suggestion) && (*/}
          {/*              <div className="mt-3 grid gap-2 text-sm">*/}
          {/*                {displayIssue.code && (*/}
          {/*                  <div className="flex gap-2">*/}
          {/*                    <span className="w-24 text-slate-500 dark:text-slate-400">Code</span>*/}
          {/*                    <span className="text-slate-800 dark:text-slate-200">{displayIssue.code}</span>*/}
          {/*                  </div>*/}
          {/*                )}*/}
          {/*                {displayIssue.path && (*/}
          {/*                  <div className="flex gap-2">*/}
          {/*                    <span className="w-24 text-slate-500 dark:text-slate-400">Path</span>*/}
          {/*                    <span className="text-slate-800 dark:text-slate-200">{displayIssue.path}</span>*/}
          {/*                  </div>*/}
          {/*                )}*/}
          {/*                {displayIssue.suggestion && (*/}
          {/*                  <div className="flex gap-2">*/}
          {/*                    <span className="w-24 text-slate-500 dark:text-slate-400">Suggestion</span>*/}
          {/*                    <span className="text-slate-800 dark:text-slate-200">{displayIssue.suggestion}</span>*/}
          {/*                  </div>*/}
          {/*                )}*/}
          {/*              </div>*/}
          {/*            )}*/}

          {/*            {isRecord(displayIssue.details) ? (*/}
          {/*              <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3">*/}
          {/*                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Details</h4>*/}
          {/*                <dl className="mt-2 space-y-2">*/}
          {/*                  {Object.entries(displayIssue.details).map(([key, value]) => (*/}
          {/*                    <div key={key} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">*/}
          {/*                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">*/}
          {/*                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}*/}
          {/*                      </dt>*/}
          {/*                      <dd className="text-sm text-slate-800 dark:text-slate-200 break-words">*/}
          {/*                        {formatScalar(value)}*/}
          {/*                      </dd>*/}
          {/*                    </div>*/}
          {/*                  ))}*/}
          {/*                </dl>*/}
          {/*              </div>*/}
          {/*            ) : displayIssue.details !== undefined ? (*/}
          {/*              <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3">*/}
          {/*                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Details</h4>*/}
          {/*                <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{formatScalar(displayIssue.details)}</p>*/}
          {/*              </div>*/}
          {/*            ) : null}*/}
          {/*          </article>*/}
          {/*        );*/}
          {/*      })}*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}

        </>
      )}
    </section>
  );
}

