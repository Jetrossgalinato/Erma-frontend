# Sidebar API Endpoints Documentation

This document describes the FastAPI endpoints used by the Sidebar component.

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Required Endpoints for Sidebar Component

## API Endpoints

### 1. Get Sidebar Counts

**Endpoint:** `GET /api/sidebar/counts`

**Description:** Fetches all counts for sidebar menu items in a single request for optimal performance.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "equipments": 150,
  "facilities": 25,
  "supplies": 320,
  "requests": 45,
  "equipment_logs": 45,
  "facility_logs": 32,
  "supply_logs": 28,
  "users": 8
}
```

**Field Descriptions:**

- `equipments` (integer): Total count of equipment records
- `facilities` (integer): Total count of facility records
- `supplies` (integer): Total count of supply records
- `requests` (integer): Combined count of all request types (borrowing + booking + acquiring)
- `equipment_logs` (integer): Total count of equipment transaction logs
- `facility_logs` (integer): Total count of facility transaction logs
- `supply_logs` (integer): Total count of supply transaction logs
- `users` (integer): Count of users **excluding the current authenticated user**

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

**Implementation Notes:**

This endpoint should efficiently fetch all counts in a single database query or use parallel queries to minimize response time.

**IMPORTANT:** The `users` count must exclude the current authenticated user. Extract the user ID from the JWT token and exclude it from the count.

Example SQL:

```sql
-- Get current user ID from JWT token
current_user_id = extract_user_id_from_token(jwt_token)

SELECT
  (SELECT COUNT(*) FROM equipments) as equipments,
  (SELECT COUNT(*) FROM facilities) as facilities,
  (SELECT COUNT(*) FROM supplies) as supplies,
  (SELECT COUNT(*) FROM borrowing) + (SELECT COUNT(*) FROM booking) + (SELECT COUNT(*) FROM acquiring) as requests,
  (SELECT COUNT(*) FROM equipment_logs) as equipment_logs,
  (SELECT COUNT(*) FROM facility_logs) as facility_logs,
  (SELECT COUNT(*) FROM supply_logs) as supply_logs,
  (SELECT COUNT(*) FROM account_requests WHERE id != current_user_id) as users;
```

---

### 2. Get User Role

**Endpoint:** `GET /api/users/me/role`

**Description:** Fetches the current authenticated user's approved account role to determine sidebar menu visibility (e.g., Staff users should not see Requests and User Management sections).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "approved_acc_role": "Admin"
}
```

**Possible role values:**

- `"Admin"` - Full access to all menu items
- `"Staff"` - Limited access (hide Requests & User Management)
- `"Faculty"` - Full access to all menu items
- `null` - No role assigned yet

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

**Implementation Notes:**

Extract the user ID from the JWT token and query the `account_requests` table:

```sql
SELECT approved_acc_role
FROM account_requests
WHERE user_id = :user_id;
```

---

## Database Schema Requirements

### account_requests table

```sql
CREATE TABLE account_requests (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  department VARCHAR,
  role VARCHAR,
  approved_acc_role VARCHAR CHECK (approved_acc_role IN ('Admin', 'Staff', 'Faculty')),
  is_employee BOOLEAN DEFAULT FALSE,
  is_intern BOOLEAN,
  is_supervisor BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Request tables

```sql
CREATE TABLE borrowing (
  id SERIAL PRIMARY KEY,
  -- other fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  -- other fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE acquiring (
  id SERIAL PRIMARY KEY,
  -- other fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Log tables

```sql
CREATE TABLE equipment_logs (
  id SERIAL PRIMARY KEY,
  log_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE facility_logs (
  id SERIAL PRIMARY KEY,
  log_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE supply_logs (
  id SERIAL PRIMARY KEY,
  log_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Frontend Implementation Notes

### State Management

- Uses Zustand `authStore` for authentication state
- Single state object for all counts to minimize re-renders
- Auto-refresh every 30 seconds to keep counts up-to-date

### Key Features

1. **Single API Call:** Fetches all counts in one request for better performance
2. **Role-Based Menu:** Hides sections based on user role (Staff users don't see Requests & User Management)
3. **Real-time Updates:** Refreshes counts every 30 seconds
4. **Optimized Rendering:** Uses single counts object to minimize state updates

### Helper Functions

Located in `/src/components/utils/sidebarHelpers.ts`:

- `fetchSidebarCounts()` - Get all sidebar counts
- `fetchUserRole()` - Get user's approved account role

### Menu Visibility Logic

```typescript
const isStaff = approvedAccRole === "Staff";

// Hide these sections for Staff users:
// - Requests
// - User Management
```

---

## Performance Optimization

### Backend Recommendations

1. **Database Indexing:**

   - Index on `account_requests.user_id` for fast user role lookup
   - Ensure primary keys are indexed (usually automatic)

2. **Caching:**

   - Consider caching sidebar counts for 10-30 seconds
   - Invalidate cache when data changes
   - Use Redis or similar for distributed caching

3. **Query Optimization:**
   - Use a single query with subqueries for all counts
   - Alternatively, use parallel queries if supported by ORM
   - Avoid N+1 queries

### Frontend Optimizations

1. **Auto-refresh Interval:**

   - Currently set to 30 seconds
   - Adjustable based on data change frequency
   - Cancels on component unmount to prevent memory leaks

2. **Loading States:**

   - Shows `null` count during initial load
   - Keeps previous counts on refresh to avoid UI flicker

3. **Error Handling:**
   - Gracefully handles API errors
   - Maintains previous counts on error
   - Logs errors for debugging

---

## Testing the Endpoints

### Example curl requests:

**Get sidebar counts:**

```bash
curl -X GET "http://localhost:8000/sidebar/counts" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

**Get user role:**

```bash
curl -X GET "http://localhost:8000/users/me/role" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

---

## Migration from Supabase

### Changes Made

1. ✅ Removed `@supabase/auth-helpers-nextjs` dependency
2. ✅ Replaced Supabase auth with Zustand `authStore`
3. ✅ Consolidated 8 separate Supabase queries into 1 FastAPI endpoint
4. ✅ Removed Supabase real-time subscriptions
5. ✅ Added 30-second auto-refresh instead of real-time updates
6. ✅ Simplified state management (1 counts object vs 8 separate states)
7. ✅ Created helper functions for API calls

### Breaking Changes

- Real-time updates replaced with 30-second polling
- Authentication now uses `authToken` from localStorage
- All counts fetched in single request instead of separate queries

### Performance Improvements

- **Reduced API calls:** 8 requests → 1 request on mount
- **Reduced state updates:** 8 state objects → 1 state object
- **Better error handling:** Graceful degradation on API errors
- **Cleaner code:** ~400 lines → ~150 lines

---

## Frontend Integration Summary

### Sidebar Component Migration Complete

The Sidebar component (`/src/components/Sidebar.tsx`) has been successfully refactored to:

- ✅ Remove all Supabase dependencies
- ✅ Use Zustand authStore for authentication
- ✅ Use FastAPI endpoints via helper functions
- ✅ Consolidate all counts into single API call
- ✅ Add auto-refresh every 30 seconds
- ✅ Implement role-based menu visibility
- ✅ Reduce code complexity significantly

### Required Backend Endpoints Summary

**2 Required Endpoints:**

1. `GET /sidebar/counts` - Fetch all sidebar counts
2. `GET /users/me/role` - Fetch user's account role

**Benefits:**

- **Performance:** 88% reduction in API calls (8 → 1)
- **Maintainability:** Single source of truth for counts
- **Scalability:** Easy to add new counts
- **User Experience:** Faster initial load, consistent updates

All TypeScript errors resolved! ✅
