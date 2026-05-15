"use client";

import { useMemo, useState } from 'react';
import type { NfNfrDetailedPrediction } from '@/lib/nfNfrDetailedTypes';

type PredictionGroupKey = 'fr' | 'nfr' | 'other';

type PredictionGroup = {
  key: PredictionGroupKey;
  title: string;
  items: NfNfrDetailedPrediction[];
};

type RequirementSmellSectionProps = {
  predictionItems: NfNfrDetailedPrediction[];
};

function groupPredictions(predictions: NfNfrDetailedPrediction[]): PredictionGroup[] {
  const groups: Record<PredictionGroupKey, NfNfrDetailedPrediction[]> = {
    fr: [],
    nfr: [],
    other: []
  };

  predictions.forEach(item => {
    const predictionId = typeof item.id === 'string' ? item.id.toLowerCase() : '';
    if (predictionId.startsWith('fr-')) {
      groups.fr.push(item);
      return;
    }
    if (predictionId.startsWith('nfr-')) {
      groups.nfr.push(item);
      return;
    }
    groups.other.push(item);
  });

  return [
    { key: 'fr', title: 'Functional Requirements', items: groups.fr },
    { key: 'nfr', title: 'Non-Functional Requirements', items: groups.nfr },
    { key: 'other', title: 'Other Predictions', items: groups.other }
  ];
}

export default function RequirementSmellSection({ predictionItems }: RequirementSmellSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const groupedPredictions = useMemo(() => groupPredictions(predictionItems), [predictionItems]);
  const hasPredictions = predictionItems.length > 0;

  if (!hasPredictions) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6 space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Requirement Smell</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Requirement smell predictions using machine learning models.
          </p>
        </div>
        <span className="material-symbols-outlined text-slate-500 dark:text-slate-300">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <>
          {hasPredictions ? (
            <div className="space-y-4">
              {groupedPredictions
                .filter(group => group.items.length > 0)
                .map(group => (
                  <div key={group.key} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{group.title}</h3>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {group.items.length} item{group.items.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item, index) => {
                        const confidence = typeof item.confidence === 'number' ? Math.round(item.confidence * 100) : null;
                        const smellBoolean =
                          item.smell_boolean === true || item.smell_boolean === 1
                            ? 'Yes'
                            : item.smell_boolean === false || item.smell_boolean === 0
                              ? 'No'
                              : 'N/A';

                        return (
                          <div
                            key={`${group.key}-${item.id ?? index}`}
                            className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/20 p-3"
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="inline-flex rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {item.id ?? `Prediction ${index + 1}`}
                              </span>
                              {confidence !== null && (
                                <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                                  Confidence {confidence}%
                                </span>
                              )}
                              <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                Smell: {smellBoolean}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                              {item.statement ?? 'No statement provided.'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No prediction data returned.</p>
          )}
        </>
      )}
    </section>
  );
}

