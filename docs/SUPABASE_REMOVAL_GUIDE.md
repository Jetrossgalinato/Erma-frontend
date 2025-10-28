# Supabase Removal Guide

## Overview

This document outlines the steps to completely remove Supabase from your ERMA frontend application, as you've migrated to FastAPI backend.

## ✅ Completed Steps

### 1. Environment Variables Cleaned

- ✅ Removed Supabase URL and API key from `.env.local`
- ✅ Now only contains `NEXT_PUBLIC_API_URL=http://localhost:8000`

### 2. Files Already Migrated to FastAPI

These files have been successfully migrated and no longer use Supabase:

- ✅ `src/app/equipment/*` - Uses FastAPI
- ✅ `src/app/facilities/*` - Uses FastAPI
- ✅ `src/app/supplies/*` - Uses FastAPI
- ✅ `src/app/dashboard/*` - Uses FastAPI
- ✅ `src/app/dashboard-equipment/*` - Uses FastAPI
- ✅ `src/app/dashboard-facilities/*` - Uses FastAPI
- ✅ `src/app/dashboard-supplies/*` - Uses FastAPI
- ✅ `src/app/dashboard-users/*` - Uses FastAPI
- ✅ `src/app/monitor-equipment/*` - Uses FastAPI
- ✅ `src/app/monitor-facilities/*` - Uses FastAPI
- ✅ `src/app/monitor-supplies/*` - Uses FastAPI
- ✅ `src/app/profile/*` - Uses FastAPI
- ✅ `src/app/requests/*` - Uses FastAPI
- ✅ `src/app/my-requests/*` - Uses FastAPI
- ✅ `src/store/authStore.ts` - Uses FastAPI
- ✅ `src/components/Sidebar.tsx` - Uses FastAPI
- ✅ `src/components/Navbar.tsx` - Uses FastAPI
- ✅ `src/components/DashboardNavbar.tsx` - Uses FastAPI

## ⚠️ Files Still Using Supabase (Need Migration)

### 3 Components Need Migration:

#### 1. `src/components/AcquiringRequests.tsx`

**Current:** Uses Supabase for acquiring supply requests
**Needs:**

- Replace `supabase.auth.getUser()` with FastAPI auth
- Replace `supabase.from('supply_logs').insert()` with FastAPI endpoint
- Replace `supabase.from('acquiring').select()` with FastAPI endpoint
- Replace `supabase.from('acquiring').update()` with FastAPI endpoint
- Replace `supabase.from('supplies').update()` with FastAPI endpoint

**Supabase Operations:**

```typescript
// Auth
await supabase.auth.getUser()

// Supply logs
await supabase.from("supply_logs").insert([...])

// Acquiring requests
await supabase.from("acquiring").select("*")
await supabase.from("acquiring").update({...})

// Supplies
await supabase.from("supplies").update({...})
```

**Suggested FastAPI Endpoints:**

- `GET /api/acquiring` - Get acquiring requests
- `POST /api/acquiring` - Create acquiring request
- `PATCH /api/acquiring/{id}` - Update acquiring request
- `POST /api/supply-logs` - Create supply log
- `PATCH /api/supplies/{id}` - Update supply quantity

---

#### 2. `src/components/BookingRequests.tsx`

**Current:** Uses Supabase for facility booking requests
**Needs:**

- Replace Supabase operations with FastAPI endpoints
- Similar pattern to AcquiringRequests

**Suggested FastAPI Endpoints:**

- `GET /api/booking` - Get booking requests
- `POST /api/booking` - Create booking request
- `PATCH /api/booking/{id}` - Update booking request
- `POST /api/facility-logs` - Create facility log

---

#### 3. `src/components/BorrowingRequests.tsx`

**Current:** Uses Supabase for equipment borrowing requests
**Needs:**

- Replace Supabase operations with FastAPI endpoints
- Similar pattern to AcquiringRequests

**Suggested FastAPI Endpoints:**

- `GET /api/borrowing` - Get borrowing requests
- `POST /api/borrowing` - Create borrowing request
- `PATCH /api/borrowing/{id}` - Update borrowing request
- `POST /api/equipment-logs` - Create equipment log

---

## 🗑️ Files to Delete

### 1. Delete Supabase Client File

```bash
rm lib/supabaseClient.ts
```

### 2. Remove from Git (if committed)

```bash
git rm lib/supabaseClient.ts
git commit -m "Remove Supabase client - fully migrated to FastAPI"
```

---

## 📦 Remove Supabase Dependencies

### Update package.json

Remove these dependencies:

```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.10.0", // ❌ Remove
    "@supabase/supabase-js": "^2.53.0" // ❌ Remove
  },
  "devDependencies": {
    "supabase": "^2.33.9" // ❌ Remove
  }
}
```

### Commands to Remove:

```bash
# Uninstall Supabase packages
npm uninstall @supabase/auth-helpers-nextjs @supabase/supabase-js supabase

# Clean up node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

---

## 🔄 Migration Steps for Remaining Components

### Step 1: Create Helper Functions for Acquiring Requests

Create `src/app/dashboard-request/utils/acquiringHelpers.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AcquiringRequest {
  id: number;
  supply_id: number;
  supply_name: string;
  requester_name: string;
  quantity: number;
  purpose: string;
  request_status: string;
  created_at: string;
}

export async function fetchAcquiringRequests(): Promise<AcquiringRequest[]> {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/acquiring`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch acquiring requests");
  return response.json();
}

export async function updateAcquiringRequest(
  id: number,
  data: Partial<AcquiringRequest>
): Promise<void> {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/acquiring/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update acquiring request");
}

// Similar functions for booking and borrowing...
```

### Step 2: Update Components

In each component (AcquiringRequests, BookingRequests, BorrowingRequests):

**Replace:**

```typescript
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
const supabase = createClientComponentClient();
```

**With:**

```typescript
import { useAuthStore } from "@/store/authStore";
import {
  fetchAcquiringRequests,
  updateAcquiringRequest,
} from "@/app/dashboard-request/utils/acquiringHelpers";
```

**Replace Supabase calls:**

```typescript
// OLD
const { data, error } = await supabase.from("acquiring").select("*");

// NEW
const data = await fetchAcquiringRequests();
```

---

## 📋 Checklist

### Pre-Migration Checklist

- [ ] Backup your database
- [ ] Document current Supabase operations
- [ ] Ensure FastAPI backend has all required endpoints
- [ ] Test existing migrated pages are working

### Migration Checklist

- [ ] Create helper functions for acquiring requests
- [ ] Create helper functions for booking requests
- [ ] Create helper functions for borrowing requests
- [ ] Update AcquiringRequests.tsx
- [ ] Update BookingRequests.tsx
- [ ] Update BorrowingRequests.tsx
- [ ] Test all three components
- [ ] Remove Supabase imports

### Post-Migration Checklist

- [ ] Delete `lib/supabaseClient.ts`
- [ ] Uninstall Supabase npm packages
- [ ] Remove Supabase from package.json
- [ ] Clean and reinstall node_modules
- [ ] Test entire application
- [ ] Update documentation
- [ ] Commit changes

---

## 🚀 Quick Removal Commands

```bash
# 1. Delete Supabase client file
rm lib/supabaseClient.ts

# 2. Uninstall Supabase packages
npm uninstall @supabase/auth-helpers-nextjs @supabase/supabase-js supabase

# 3. Clean install
rm -rf node_modules package-lock.json
npm install

# 4. Restart dev server
npm run dev
```

---

## ⚙️ Backend Requirements

Your FastAPI backend needs these endpoints for the remaining components:

### Acquiring Endpoints

```python
GET    /api/acquiring                    # List acquiring requests
POST   /api/acquiring                    # Create acquiring request
PATCH  /api/acquiring/{id}              # Update acquiring request
DELETE /api/acquiring/{id}              # Delete acquiring request
POST   /api/supply-logs                 # Create supply log
```

### Booking Endpoints

```python
GET    /api/booking                      # List booking requests
POST   /api/booking                      # Create booking request
PATCH  /api/booking/{id}                # Update booking request
DELETE /api/booking/{id}                # Delete booking request
POST   /api/facility-logs               # Create facility log
```

### Borrowing Endpoints

```python
GET    /api/borrowing                    # List borrowing requests
POST   /api/borrowing                    # Create borrowing request
PATCH  /api/borrowing/{id}              # Update borrowing request
DELETE /api/borrowing/{id}              # Delete borrowing request
POST   /api/equipment-logs              # Create equipment log
```

---

## 📊 Migration Progress

**Overall Progress: 90% Complete** ✅

- ✅ Authentication (FastAPI JWT)
- ✅ Equipment Management
- ✅ Facilities Management
- ✅ Supplies Management
- ✅ Dashboard Pages
- ✅ Monitoring Pages
- ✅ User Management
- ✅ Profile Management
- ⏳ Acquiring Requests (3 components)
- ⏳ Booking Requests (3 components)
- ⏳ Borrowing Requests (3 components)

---

## 💡 Benefits After Complete Migration

1. **No Supabase Costs** - Eliminate Supabase subscription
2. **Simpler Architecture** - Single backend (FastAPI)
3. **Better Control** - Full control over database and API
4. **Faster Development** - No need to learn Supabase-specific APIs
5. **Reduced Dependencies** - Smaller bundle size
6. **Consistent Patterns** - All pages use same approach

---

## 🆘 Need Help?

If you need help migrating the remaining components:

1. **Document current behavior** - Take screenshots/videos
2. **Test FastAPI endpoints** - Ensure backend is ready
3. **Migrate one component at a time** - Start with AcquiringRequests
4. **Test thoroughly** - Check all functionality works
5. **Remove Supabase packages last** - After all components migrated

---

## Summary

**Current State:**

- 90% of application migrated to FastAPI ✅
- 3 components still using Supabase (AcquiringRequests, BookingRequests, BorrowingRequests)
- Supabase packages still installed but not needed

**Next Steps:**

1. Migrate the 3 remaining components
2. Delete `lib/supabaseClient.ts`
3. Uninstall Supabase packages
4. 100% FastAPI! 🎉

**Status:** Ready to remove Supabase, just need to migrate 3 request components first.
