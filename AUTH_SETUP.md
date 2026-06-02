# JWT Session Storage & Authentication Implementation

This document describes the JWT session storage implementation for the SRS Generation project.

## Overview

The authentication system uses JWT tokens stored in httpOnly cookies for secure session management. Here's what's been implemented:

### Key Features

1. **JWT from Backend**: Tokens are extracted from your backend's authentication API responses and stored securely
2. **HttpOnly Cookies**: Cookies are marked `httpOnly` to prevent XSS attacks
3. **Automatic Redirects**: Unauthenticated users are automatically redirected to `/login` when accessing protected pages
4. **Post-Login Redirect**: Users are redirected to their intended page after login (if they were redirected from a protected route)
5. **Logout API**: A logout endpoint clears the session cookie

## Architecture

### Files Created

#### 1. **`src/lib/auth.ts`**
Core authentication utilities:
- `getSessionToken()`: Get JWT from cookies (client-side)
- `getCurrentUser()`: Extract user info from JWT payload
- `isAuthenticated()`: Check if user has valid session
- `clearSession()`: Remove session cookie
- `parseJWTPayload()`: Parse JWT without validation (for client-side display only)

#### 2. **`src/hooks/useAuth.ts`**
React hooks for authentication:
- `useAuth()`: Hook to require authentication and redirect to login if not authenticated
- `useLogout()`: Hook to logout and cleanup

#### 3. **`src/middleware.ts`**
Next.js middleware for route protection:
- Protects routes (e.g., `/new-srs`, `/srs-results`, etc.)
- Automatically redirects to `/login` if no session
- Includes redirect parameter so users go to intended page after login
- Redirects authenticated users away from login/register pages

#### 4. **`src/app/api/auth/login/route.ts`**
Login endpoint:
- Proxies to backend login API
- Extracts JWT from response (checks `token`, `jwt`, or `access_token`)
- Sets JWT as httpOnly cookie
- Returns backend response to client

#### 5. **`src/app/api/auth/register/route.ts`**
Register endpoint (same logic as login):
- Proxies to backend register API
- Extracts JWT from response
- Sets httpOnly cookie
- Auto-logs in user after registration

#### 6. **`src/app/api/auth/logout/route.ts`**
Logout endpoint:
- Clears the session cookie
- Can be called before redirecting to login

#### 7. **`src/app/login/page.tsx`**
Updated login page:
- Wrapped with Suspense boundary for `useSearchParams()`
- Handles redirect parameter from middleware
- Redirects to intended page after successful login
- Shows error messages from backend

## How It Works

### Authentication Flow

```
User visits protected page (no JWT)
    ↓
Middleware intercepts request
    ↓
Middleware redirects to `/login?redirect=/intended-page`
    ↓
User enters credentials
    ↓
Frontend POST /api/auth/login
    ↓
Backend /api/auth/login (your backend)
    ↓
Backend returns { user, token: "jwt_value" }
    ↓
Frontend extracts JWT and sets httpOnly cookie
    ↓
Frontend redirects to /intended-page
    ↓
User can now access protected page
```

### Protected Routes

The middleware currently protects these routes:
- `/new-srs`
- `/new-srs-2`
- `/new-fr-nfr`
- `/new-fr-nfr-detailed`
- `/srs-results`
- `/srs-results-2`
- `/fr-nfr-results`
- `/fr-nfr-detailed-result`

You can add more routes by updating the `protectedRoutes` array in `src/middleware.ts`.

## Usage in Components

### Example 1: Require Authentication

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { isLoading, user, authenticated } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.fName}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### Example 2: Logout Button

```typescript
'use client';

import { useLogout } from '@/hooks/useAuth';

export default function LogoutButton() {
  const logout = useLogout();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

### Example 3: Check Authentication (Client-Side)

```typescript
'use client';

import { getSessionToken, getCurrentUser } from '@/lib/auth';

export default function Header() {
  const token = getSessionToken();
  const user = getCurrentUser();

  if (!token) {
    return <a href="/login">Login</a>;
  }

  return (
    <div>
      <p>Hello, {user?.fName}</p>
      <a href="/logout">Logout</a>
    </div>
  );
}
```

## Backend Requirements

Your backend API needs to:

1. **Accept POST requests** to `/api/auth/login` and `/api/auth/register`
2. **Return JWT in response** as one of:
   - `{ ..., token: "jwt_value" }`
   - `{ ..., jwt: "jwt_value" }`
   - `{ ..., access_token: "jwt_value" }`
3. **Include user data** in JWT payload:
   ```json
   {
     "email": "user@example.com",
     "fName": "John",
     "lName": "Doe"
   }
   ```

Example backend response:
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "fName": "John",
    "lName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Optional (used in production)
NODE_ENV=production
```

## Security Features

✅ **HttpOnly Cookies**: JWT cannot be accessed via JavaScript (prevents XSS attacks)
✅ **SameSite Cookie**: Prevents CSRF attacks
✅ **Secure Flag in Production**: Cookies only sent over HTTPS
✅ **7-Day Expiration**: Session expires after 7 days
✅ **Server-Side Validation**: Middleware validates session on every request

## Customization

### Change Session Expiration

Edit `src/app/api/auth/login/route.ts`:
```typescript
maxAge: 60 * 60 * 24 * 7, // Change 7 to desired days
```

### Add More Protected Routes

Edit `src/middleware.ts`:
```typescript
const protectedRoutes = [
  '/new-srs',
  '/your-new-route', // Add here
];
```

### Customize Cookie Name

Search for `__session` in:
- `src/middleware.ts`
- `src/lib/auth.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/logout/route.ts`

Replace with your preferred cookie name.

### Change Default Login Redirect

In `src/app/login/page.tsx`:
```typescript
const redirect = searchParams.get('redirect') || '/'; // Change '/' to desired default
```

## Troubleshooting

### Issue: "useSearchParams should be wrapped in Suspense boundary"

**Solution**: Already fixed in login page. For other pages, wrap component with:
```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormComponent />
    </Suspense>
  );
}
```

### Issue: Users get redirected to login immediately after registration

**Solution**: Make sure your backend returns the JWT token in the response from `/api/auth/register`.

### Issue: Cookie not being set

**Check**:
1. Backend returns token in one of: `token`, `jwt`, or `access_token` fields
2. In development: http is okay (secure flag disabled)
3. In production: HTTPS is required for secure cookies

### Issue: Users get logged out after page refresh

**This is normal** if:
- Session expires (default 7 days)
- Browser clears cookies
- Going from HTTPS to HTTP site (in production)

To debug: Check browser DevTools → Applications → Cookies → `__session`

## Testing

To test the authentication system:

```bash
# 1. Make sure backend is running at http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# 2. Start dev server
npm run dev

# 3. Visit http://localhost:3000/login
# 4. Try registered user credentials
# 5. You should be logged in and redirected to home
# 6. Try accessing /new-srs - should work if logged in
# 7. Log out and try /new-srs - should redirect to login
```

## Migration Notes

If you had an existing authentication system:

1. **Remove** old session/auth logic from pages
2. **Update** any existing login/register components to use new API endpoints
3. **Add** `useAuth()` hook to protected page components
4. **Test** the middleware redirects work as expected

## Next Steps

1. Ensure backend returns JWT in response
2. Update `/api/auth/login` response mapping if your backend returns token with different field name
3. Test the complete flow: login → redirect → access protected page → logout
4. Customize protected routes list as needed
5. Add user profile/settings page (optional)

## Support

For issues or questions:
1. Check middleware.ts for route protection logic
2. Check browser DevTools Console for client-side errors
3. Check backend logs for API errors
4. Verify `NEXT_PUBLIC_BACKEND_URL` is correct

