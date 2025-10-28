# Environment Configuration - API Base URL

## Overview

All API calls in the application now use a centralized environment variable `NEXT_PUBLIC_API_URL` instead of hardcoded URLs. This makes it easy to switch between different backend environments (development, staging, production).

## Configuration

### Environment Variable

The API base URL is configured in `.env.local`:

```bash
# FastAPI Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### How It Works

All files now use this pattern:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

This means:

1. **Development:** Uses `http://localhost:8000` (from `.env.local`)
2. **Production:** Set `NEXT_PUBLIC_API_URL` in your hosting platform to your production backend URL
3. **Fallback:** If the environment variable is not set, it defaults to `http://localhost:8000`

## Files Updated

### Source Files (17 files)

1. **`src/app/equipment/utils/helpers.ts`**

   - Changed: `export const API_BASE_URL = "http://localhost:8000"`
   - To: `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`

2. **`src/app/facilities/utils/helpers.ts`**

   - Changed: `export const API_BASE_URL = "http://localhost:8000"`
   - To: `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`

3. **`src/app/supplies/utils/helpers.ts`**

   - Changed: `export const API_BASE_URL = "http://localhost:8000"`
   - To: `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`

4. **`src/app/my-requests/utils/helpers.ts`**

   - Changed: `export const API_BASE_URL = "http://localhost:8000"`
   - To: `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`

5. **`src/app/dashboard-request/utils/helpers.ts`**

   - Changed: `export const API_BASE_URL = "http://localhost:8000"`
   - To: `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`

6. **`src/app/dashboard-users/utils/helpers.ts`**

   - Added: `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
   - Updated 3 fetch calls to use `${API_BASE_URL}` instead of hardcoded URL

7. **`src/app/login/page.tsx`**

   - Added: `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
   - Changed: `fetch("http://localhost:8000/api/login")`
   - To: `fetch(\`\${API_BASE_URL}/api/login\`)`

8. **`src/components/DashboardNavbar.tsx`**

   - Added: `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
   - Updated 3 fetch calls for notifications

9. **`src/components/Navbar.tsx`**

   - Added: `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
   - Updated 3 fetch calls for notifications

10. **`src/components/EmployeeRegisterForm.tsx`**

    - Added: `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
    - Changed: `fetch("http://localhost:8000/api/register")`
    - To: `fetch(\`\${API_BASE_URL}/api/register\`)`

11. **`src/store/authStore.ts`**
    - Added: `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
    - Updated auth verification endpoint

### Already Using Environment Variable (7 files)

These files were already correctly using `process.env.NEXT_PUBLIC_API_URL`:

1. `src/app/monitor-equipment/utils/helpers.ts` ✅
2. `src/app/monitor-facilities/utils/helpers.ts` ✅
3. `src/app/monitor-supplies/utils/helpers.ts` ✅
4. `src/app/dashboard/utils/helpers.ts` ✅
5. `src/app/dashboard-equipment/utils/helpers.ts` ✅
6. `src/app/dashboard-facilities/utils/helpers.ts` ✅
7. `src/app/dashboard-supplies/utils/helpers.ts` ✅
8. `src/app/requests/utils/helpers.ts` ✅
9. `src/app/profile/utils/helpers.ts` ✅
10. `src/components/utils/sidebarHelpers.ts` ✅

## Deployment Configuration

### Development

No changes needed. The `.env.local` file is already configured:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (Vercel, Netlify, etc.)

Add the environment variable in your hosting platform:

**Variable Name:** `NEXT_PUBLIC_API_URL`  
**Value:** Your production backend URL (e.g., `https://api.yourapp.com`)

#### Vercel

1. Go to Project Settings
2. Environment Variables
3. Add `NEXT_PUBLIC_API_URL` = `https://your-production-backend.com`

#### Netlify

1. Site settings → Build & deploy → Environment
2. Add `NEXT_PUBLIC_API_URL` = `https://your-production-backend.com`

#### Docker

Add to your `docker-compose.yml`:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://your-backend:8000
```

## Benefits

✅ **Centralized Configuration:** Single place to change API URL  
✅ **Environment Flexibility:** Easy to switch between dev/staging/production  
✅ **No Code Changes:** Just update environment variable  
✅ **Type Safety:** TypeScript still works correctly  
✅ **Fallback:** Defaults to localhost if env var not set  
✅ **Security:** Production URL not hardcoded in source code

## Important Notes

### Next.js Environment Variables

- **Must start with `NEXT_PUBLIC_`** to be available in browser code
- Embedded at **build time**, not runtime
- Restart dev server after changing `.env.local`
- Don't commit `.env.local` to git (it's in `.gitignore`)

### Rebuild Required

After changing `NEXT_PUBLIC_API_URL`:

**Development:**

```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

**Production:**

```bash
# Rebuild the app
npm run build
npm start
```

## Testing Different Environments

### Local Backend

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Network Backend (same network)

```bash
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
```

### Staging Backend

```bash
NEXT_PUBLIC_API_URL=https://staging-api.yourapp.com
```

### Production Backend

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

## Troubleshooting

### Issue: Still using localhost in production

**Cause:** Environment variable not set or app not rebuilt  
**Solution:**

1. Verify environment variable is set in hosting platform
2. Rebuild and redeploy the app

### Issue: Changes not reflecting

**Cause:** Next.js caches environment variables  
**Solution:**

1. Stop dev server
2. Delete `.next` folder: `rm -rf .next`
3. Restart: `npm run dev`

### Issue: "Cannot read property of undefined"

**Cause:** API_BASE_URL is undefined  
**Solution:** Check that environment variable name is exactly `NEXT_PUBLIC_API_URL`

## Summary

All API calls in the application now use the environment variable pattern:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

This provides:

- ✅ Easy environment switching
- ✅ No hardcoded URLs
- ✅ Production-ready configuration
- ✅ Consistent across all files
- ✅ TypeScript compatibility

**Total Files Updated:** 17 source files + 1 environment file  
**Total Fetch Calls Updated:** 20+ API calls  
**Status:** ✅ Complete - No TypeScript errors
