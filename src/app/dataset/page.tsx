"use client";

import { useState } from 'react';

export default function DatasetPage() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; text: string; source?: string }[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const ingest = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setStatus('Ingesting...');
    try {
      const res = await fetch('/api/dataset/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source: source || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Ingest failed');
      setStatus(`Ingested ${data.chunks} chunks`);
      setText('');
    } catch (e: any) {
      setStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStatus('Searching...');
    try {
      const res = await fetch('/api/dataset/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 5 }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results || []);
      setStatus(`Found ${data.results?.length || 0} results`);
    } catch (e: any) {
      setStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    setStatus('Clearing store...');
    try {
      const res = await fetch('/api/dataset/clear', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Clear failed');
      setResults([]);
      setStatus('Cleared');
    } catch (e: any) {
      setStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#0d101b] dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dataset Manager (RAG)</h1>

        <div className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Ingest Text</h2>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Optional source label (e.g., Project Spec v1)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-[#202434] p-2 text-sm"
            />
            <textarea
              placeholder="Paste text to index..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] p-3 h-40 text-sm"
            />
            <div className="flex gap-3">
              <button onClick={ingest} disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50">Ingest</button>
              <button onClick={clear} disabled={loading} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700">Clear Store</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Search</h2>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-[#202434] p-2 text-sm"
            />
            <button onClick={search} disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg w-fit disabled:opacity-50">Search</button>
          </div>

          {status && <p className="text-sm text-slate-500 mt-4">{status}</p>}

          {results.length > 0 && (
            <div className="mt-6 space-y-4">
              {results.map((r, i) => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434]">
                  <div className="text-xs text-slate-500 mb-1">#{i + 1} {r.source ? `| ${r.source}` : ''}</div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

