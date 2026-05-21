import { JsonRenderer } from '@/components/srs-results-2/JsonRenderer';
import type { JsonValue } from '@/lib/srsTypes';

type SectionCardProps = {
  title: string;
  kind: 'fr' | 'nfr' | 'default';
  value: JsonValue;
  isOpen: boolean;
  onToggle: () => void;
};

export function SectionCard({ title, kind, value, isOpen, onToggle }: SectionCardProps) {
  return (
    <section className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <h3 className="flex items-center gap-2 text-base lg:text-lg font-bold text-slate-900 dark:text-white">
          {title}
          {kind === 'fr' && (
            <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              FR
            </span>
          )}
          {kind === 'nfr' && (
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
            >
              NFR
            </span>
          )}
        </h3>
        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 text-sm">
          <JsonRenderer
            value={value}
            keyPrefix={title}
            depth={0}
            path={[title]}
            onEdit={undefined}
          />
        </div>
      )}
    </section>
  );
}

