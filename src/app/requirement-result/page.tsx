"use client";

import Link from 'next/link';

export default function FrNfrDetailedResultFallbackPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-6">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Result URL Updated</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Open results using the parameterized route: <code>/requirement-result/:userId/:projectId</code>.
        </p>
        <Link
          href="/new-requirement"
          className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Detailed Generator
        </Link>
      </div>
    </div>
  );
}

