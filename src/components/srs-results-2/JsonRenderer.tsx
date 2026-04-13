/**
 * Recursive JSON renderer component with optional edit mode
 */

import { type ReactNode } from 'react';
import type { JsonValue, JsonPath } from '@/lib/srsTypes';
import {
  toLabel,
  normalizePriority,
  getPriorityBadgeClass,
  isFrNfrPriorityPath
} from '@/lib/srsUtils';

interface JsonRendererProps {
  value: JsonValue;
  keyPrefix: string;
  depth?: number;
  path?: JsonPath;
  onEdit?: (path: JsonPath, value: JsonValue) => void;
}

export function JsonRenderer({
  value,
  keyPrefix,
  depth = 0,
  path = [],
  onEdit
}: JsonRendererProps): ReactNode {
  const isEditable = Boolean(onEdit);

  if (value === null) {
    if (!isEditable) {
      return <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">Not set</span>;
    }
    return (
      <input
        value=""
        placeholder="Not set"
        onChange={(event) => onEdit?.(path, event.target.value)}
        className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202434] px-2 py-1 text-sm text-slate-700 dark:text-slate-200"
      />
    );
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    if (typeof value === 'string' && isFrNfrPriorityPath(keyPrefix)) {
      const priority = normalizePriority(value);
      if (priority) {
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeClass(priority)}`}>
            {toLabel(priority)}
          </span>
        );
      }
    }

    if (!isEditable) {
      return <span className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{String(value)}</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={value}
            onChange={(event) => onEdit?.(path, event.target.checked)}
            className="size-4"
          />
          {value ? 'True' : 'False'}
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(event) => onEdit?.(path, Number(event.target.value))}
          className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202434] px-2 py-1 text-sm text-slate-700 dark:text-slate-200"
        />
      );
    }

    return (
      <textarea
        value={value}
        onChange={(event) => onEdit?.(path, event.target.value)}
        rows={Math.min(6, Math.max(2, value.split('\n').length))}
        className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202434] px-2 py-1 text-sm text-slate-700 dark:text-slate-200 resize-y"
      />
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">No items</span>;
    }

    const primitiveArray = value.every(
      item => item === null || typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    );

    if (primitiveArray) {
      if (!isEditable) {
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span key={`${keyPrefix}-chip-${index}`} className="px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {item === null ? 'Not set' : String(item)}
              </span>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={`${keyPrefix}-primitive-${index}`} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-12 lg:col-span-3 text-xs text-slate-500 dark:text-slate-400">Item {index + 1}</span>
              <div className="col-span-12 lg:col-span-9">
                <JsonRenderer
                  value={item}
                  keyPrefix={`${keyPrefix}-${index}`}
                  depth={depth + 1}
                  path={[...path, index]}
                  onEdit={onEdit}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={`${keyPrefix}-arr-${index}`} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Item {index + 1}</p>
            <JsonRenderer
              value={item}
              keyPrefix={`${keyPrefix}-${index}`}
              depth={depth + 1}
              path={[...path, index]}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">No details</span>;
  }

  const nestedContainerClass = depth === 0
    ? 'space-y-3'
    : 'space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/20 p-3';

  return (
    <div className={nestedContainerClass}>
      {entries.map(([k, v]) => (
        <div key={`${keyPrefix}-${k}`} className="grid grid-cols-12 gap-2 lg:gap-4 py-1">
          <p className="col-span-12 lg:col-span-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:pt-1">
            {toLabel(k)}
          </p>
          <div className="col-span-12 lg:col-span-8 text-sm">
            <JsonRenderer
              value={v}
              keyPrefix={`${keyPrefix}-${k}`}
              depth={depth + 1}
              path={[...path, k]}
              onEdit={onEdit}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

