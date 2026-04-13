"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

type MermaidDiagramProps = {
  code: string;
  className?: string;
};

export default function MermaidDiagram({ code, className }: MermaidDiagramProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default'
    });

    const render = async () => {
      if (!hostRef.current) return;
      const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;

      try {
        setError(null);
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to render Mermaid diagram.');
          if (hostRef.current) {
            hostRef.current.innerHTML = '';
          }
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-red-600 dark:text-red-400">Diagram render failed: {error}</p>
        <pre className="text-xs lg:text-sm whitespace-pre-wrap rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-3 text-slate-700 dark:text-slate-200 overflow-auto">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={className ?? 'overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-3'}
    />
  );
}

