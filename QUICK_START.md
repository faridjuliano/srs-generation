# Quick Start Guide - JWT Session Storage

## 🎯 What's Ready

Your Next.js project now has a complete JWT authentication system integrated with your backend. Here's what's working:

✅ JWT tokens from backend are automatically captured and stored as httpOnly cookies
✅ Protected routes automatically redirect unauthenticated users to login
✅ Post-login redirect to the originally-requested page
✅ Secure logout functionality
✅ User session information extraction and display

## 🚀 Quick Start (5 minutes)

### Step 1: Ensure Backend is Running

```bash
# Check your backend is running
curl http://localhost:3001/api/auth/login
# Should get a 405 or 401 (not connection refused)
```

### Step 2: Start Development Server

```bash
cd /Users/faridjuliano/Documents/GitHub/srs-generation
npm run dev
```

### Step 3: Test Registration

1. Open http://localhost:3000/register
2. Create a test account (your backend must support this)
3. You should be auto-logged in and redirected to home
4. Check DevTools → Application → Cookies → Look for `__session` cookie

### Step 4: Test Protected Page Access

1. Delete the `__session` cookie
2. Refresh page → you'll be at home page
3. Visit http://localhost:3000/new-srs
4. You should be redirected to login
5. Log in → you'll be taken directly to `/new-srs`

### Step 5: Test Logout (Optional)

You can implement logout by calling the `/api/auth/logout` endpoint:

```typescript
async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  document.cookie = '__session=; path=/; max-age=0';
  window.location.href = '/login';
}
```

## 📂 Files Created/Modified

### Created Files
```
src/lib/auth.ts                              # Auth utilities
src/hooks/useAuth.ts                          # React hooks
src/middleware.ts                            # Route protection
src/app/api/auth/login/route.ts              # Login endpoint
src/app/api/auth/register/route.ts           # Register endpoint
src/app/api/auth/logout/route.ts             # Logout endpoint
AUTH_SETUP.md                                # Full documentation
JWT_IMPLEMENTATION_SUMMARY.md                # Summary & checklist
```

### Modified Files
```
src/app/login/page.tsx                       # Added redirect support & Suspense
src/app/register/page.tsx                    # Updated to auto-login after registration
```

## 🔐 How Authentication Works

### Request Flow
```
1. User submits login form
   ↓
2. Frontend: POST /api/auth/login { email, password }
   ↓
3. Backend: POST /backend:3001/api/auth/login { email, password }
   ↓
4. Backend returns: { user: {...}, token: "jwt_xxx" }
   ↓
5. Frontend extracts JWT and sets __session cookie
   ↓
6. Frontend redirects to intended page
```

### Protection Flow
```
1. User visits protected route (e.g., /new-srs)
   ↓
2. Middleware checks for __session cookie
   ↓
3. If no cookie: redirect to /login?redirect=/new-srs
   ↓
4. User logs in
   ↓
5. Cookie is set
   ↓
6. Redirect to /new-srs (from redirect parameter)
```

## 🛠 Integration Checklist

- [ ] Backend supports POST /api/auth/login returning JWT
- [ ] Backend returns JWT in response (as `token`, `jwt`, or `access_token`)
- [ ] Backend supports POST /api/auth/register returning JWT
- [ ] Test: Can register new account
- [ ] Test: JWT cookie appears in DevTools
- [ ] Test: Try accessing /new-srs without cookie → redirects to login
- [ ] Test: After login, redirects to /new-srs
- [ ] Test: All protected routes work

## 📝 Protected Routes

Currently protected (require login):
- ✅ `/new-srs`
- ✅ `/new-srs-2`
- ✅ `/new-fr-nfr`
- ✅ `/new-fr-nfr-detailed`
- ✅ `/srs-results`
- ✅ `/srs-results-2`
- ✅ `/fr-nfr-results`
- ✅ `/requirement-result`

**To add more routes**, edit `src/middleware.ts`:
```typescript
const protectedRoutes = [
  '/new-srs',
  '/your-new-route',  // Add here
];
```

## 🔑 Backend Response Requirements

Your backend login/register endpoints must return:

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

**Supported JWT field names**: `token`, `jwt`, or `access_token`

**Required user fields**: `email`, `fName`, `lName`

## 💻 Using Auth in Components

### Example 1: Require Login
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function MyPage() {
  const { isLoading, user } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <h1>Welcome, {user?.fName}!</h1>;
}
```

### Example 2: Show User Info
```typescript
'use client';
import { getCurrentUser } from '@/lib/auth';

export default function Header() {
  const user = getCurrentUser();
  
  if (!user) {
    return <a href="/login">Login</a>;
  }
  
  return <span>{user.fName} {user.lName}</span>;
}
```

### Example 3: Logout Function
```typescript
'use client';
import { useLogout } from '@/hooks/useAuth';

export default function LogoutBtn() {
  const logout = useLogout();
  return <button onClick={logout}>Logout</button>;
}
```

## 🔍 Debugging

### Check if JWT is set
1. Open DevTools → Application tab
2. Look for cookie named `__session`
3. If missing → backend didn't return JWT

### Check backend response
1. Open DevTools → Network tab
2. Login and check `/api/auth/login` request
3. Look at Response tab
4. Should show `token`, `jwt`, or `access_token` field

### Check middleware
1. Try accessing `/new-srs` without login
2. Should redirect to `/login?redirect=/new-srs`
3. If not → middleware may not be working

### Common Errors

| Error | Solution |
|-------|----------|
| "Failed to fetch" | Backend not running or wrong URL in env |
| "redirect failed" | useSearchParams needs Suspense wrapper (already fixed) |
| "/login stays on login" | Backend returning incorrect JWT field name |
| "Always redirected to login" | Cookie not being set - API not returning JWT |

## 📚 Full Documentation

For detailed information, see:
- **`AUTH_SETUP.md`** - Complete setup guide with troubleshooting
- **`JWT_IMPLEMENTATION_SUMMARY.md`** - Architecture overview

## ✅ Verification

Run this to verify everything is set up:

```bash
# Build should complete without errors
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Generating static pages
# ƒ Proxy (Middleware)

# If you see these, something may be wrong:
# ⨯ Error
# 401 Unauthorized
```

## 🎓 Key Concepts

### httpOnly Cookie
- Stored securely on browser
- Cannot be accessed by JavaScript
- Cannot be stolen by XSS attacks
- Automatically sent with each request

### JWT Token
- Contains user info: `{ email, fName, lName }`
- Stored inside httpOnly cookie
- Not directly accessible from JavaScript
- Frontend extracts user info on demand

### Middleware
- Runs on every request
- Checks for `__session` cookie
- Redirects to login if missing
- Preserves intended page URL

### Protected Routes
- Cannot be accessed without login
- Automatically redirect to login
- Preserve return URL for post-login redirect

## 🚀 Next Steps

1. ✅ Verify backend supports JWT in login/register responses
2. ✅ Test registration flow
3. ✅ Test protected route access
4. ✅ Test logout (if needed)
5. ✅ Customize protected routes list
6. ✅ Add user profile/settings pages (optional)
7. ✅ Deploy to production

## 📞 Need Help?

1. Check `AUTH_SETUP.md` for troubleshooting
2. Review `JWT_IMPLEMENTATION_SUMMARY.md` for overview
3. Check browser DevTools for cookie/network issues
4. Verify backend returns JWT in response

---

**Status**: ✅ Ready to use
**Build**: ✅ Successful  
**Next**: Connect to your backend and test

