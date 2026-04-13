/**
 * Utility functions for SRS processing and display
 */

import type { JsonValue, JsonObject, JsonPath, ApiSrsPayload } from './srsTypes';

export function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function toLabel(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

export function normalizePriority(value: string): 'high' | 'medium' | 'low' | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  if (normalized === 'low') return 'low';
  return null;
}

export function getPriorityBadgeClass(priority: 'high' | 'medium' | 'low'): string {
  if (priority === 'high') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  }
  if (priority === 'medium') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  }
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
}

export function isFrNfrPriorityPath(keyPrefix: string): boolean {
  const path = keyPrefix.toLowerCase();
  const inRequirementSections =
    path.includes('4functionalrequirements') ||
    path.includes('5nonfunctionalrequirements') ||
    path.includes('functionalrequirements') ||
    path.includes('nonfunctionalrequirements');
  return inRequirementSections && path.endsWith('-priority');
}

export function updateJsonAtPath(root: JsonValue, path: JsonPath, nextValue: JsonValue): JsonValue {
  if (path.length === 0) return nextValue;

  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const index = typeof head === 'number' ? head : Number.parseInt(String(head), 10);
    if (!Number.isInteger(index) || index < 0 || index >= root.length) return root;
    const cloned = [...root];
    cloned[index] = updateJsonAtPath(cloned[index], rest, nextValue);
    return cloned;
  }

  if (isObject(root)) {
    const key = String(head);
    const current = root[key];
    if (current === undefined) return root;
    return {
      ...root,
      [key]: updateJsonAtPath(current, rest, nextValue)
    };
  }

  return root;
}

export function normalizeStoredPayload(raw: unknown): ApiSrsPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const payload = raw as Partial<ApiSrsPayload>;
  if (typeof payload.success === 'boolean' && isObject(payload.content)) {
    return {
      success: payload.success,
      content: payload.content,
      diagrams: isObject(payload.diagrams) ? payload.diagrams : undefined,
      validation: payload.validation
    };
  }

  const legacy = raw as any;
  if (isObject(legacy.generatedContent)) {
    return {
      success: true,
      content: legacy.generatedContent,
      validation: legacy.validation ?? legacy.validationResult
    };
  }

  return null;
}

export function sectionOrder(a: string, b: string): number {
  const priority: Record<string, number> = {
    documentControl: -3,
    revisionHistory: -2,
    tableOfContents: -1
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

export function looksLikeMermaid(definition: string): boolean {
  const normalized = definition.trim();
  return [
    'sequenceDiagram',
    'erDiagram',
    'classDiagram',
    'stateDiagram',
    'flowchart',
    'graph '
  ].some(prefix => normalized.startsWith(prefix));
}

export function getProjectName(content: JsonObject | null): string {
  if (!content) return 'SRS Document';
  const docControl = content.documentControl;
  if (!isObject(docControl)) return 'SRS Document';
  return typeof docControl.projectName === 'string' && docControl.projectName.trim().length > 0
    ? docControl.projectName
    : 'SRS Document';
}

