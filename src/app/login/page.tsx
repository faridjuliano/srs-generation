"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth token already exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/new-fr-nfr-detailed');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError((data && data.error) || 'Login failed');
        setLoading(false);
        return;
      }
      console.log('Login response data:', data.data);
      let token = data.data.token;
      let user = data.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (token) {
        // Also set as a cookie for middleware to read
        document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // successful login — redirect to intended page or home
      setLoading(false);
      router.push('/new-fr-nfr-detailed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#0f1724] rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Login</h1>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Email</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" type="email" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Password</label>
            <input required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" type="password" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="inline-flex items-center px-3 py-1.5 rounded bg-primary text-white">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <a className="text-sm text-slate-600 hover:underline" href="/register">Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
