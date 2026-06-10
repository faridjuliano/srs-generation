"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if auth token already exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/new-requirement');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fName, lName, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError((data && data.error) || 'Registration failed');
        setLoading(false);
        return;
      }

      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      if (data?.token) {
        // Also set as a cookie for middleware to read
        document.cookie = `token=${encodeURIComponent(data.token)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

       // Registration successful — JWT was automatically set by API route
       setSuccess(true);
       setLoading(false);
       
       // Redirect to new-requirement after short delay (auto-logged in via JWT cookie)
       setTimeout(() => router.push('/new-requirement'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#0f1724] rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Register to SRS Generator</h1>
         {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
         {success && <div className="text-sm text-green-600 mb-2">Registered successfully — redirecting...</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Email</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" type="email" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300">First name</label>
            <input required value={fName} onChange={e => setFName(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Last name</label>
            <input required value={lName} onChange={e => setLName(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Password</label>
            <input required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" type="password" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="inline-flex items-center px-3 py-1.5 rounded bg-primary text-white">
              {loading ? 'Registering…' : 'Register'}
            </button>
            <a className="text-sm text-slate-600 hover:underline" href="/login">Already have an account?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
