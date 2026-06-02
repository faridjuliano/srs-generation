// Local auth storage utilities for authentication

export interface SessionUser {
  email: string;
  fName: string;
  lName: string;
}

/**
 * Get the current auth token from localStorage (client-side only)
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Check if user is authenticated (has valid session token)
 */
export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

/**
 * Parse JWT payload (client-side only, for display)
 * Note: This does NOT validate the signature - only extracts data
 * Real validation happens server-side
 */
export function parseJWTPayload(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(atob(parts[1]));
    return decoded as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Get current user from localStorage (client-side)
 */
export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as SessionUser;
    } catch {
      // fall through to token parsing
    }
  }

  const token = getSessionToken();
  if (!token) return null;
  return parseJWTPayload(token);
}

