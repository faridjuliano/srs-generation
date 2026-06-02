'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionToken, getCurrentUser, type SessionUser } from '@/lib/auth';

/**
 * Hook to check authentication and redirect if not logged in
 * Use this in components that require authentication
 */
export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    
    if (!token) {
      // No session, redirect to login
      router.push('/login');
      return;
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);
    setAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  return { isLoading, user, authenticated };
}

/**
 * Hook to manage logout
 */
export function useLogout() {
  const router = useRouter();

  return async () => {
    // Clear the cookie by calling an API (optional, for cleanup on backend)
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed:', e);
    }

    // Clear local session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    // Redirect to login
    router.push('/login');
  };
}

