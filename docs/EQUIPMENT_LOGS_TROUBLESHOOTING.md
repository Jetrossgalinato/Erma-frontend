# Equipment Logs Sidebar Count - Troubleshooting Guide

## Problem

The Equipment Logs count in the sidebar is showing "0" even though there are 2 logs visible on the monitor-equipment page.

## Diagnosis Steps

### Step 1: Check Console Logs

Open the browser console (F12) and look for these logs:

```
Sidebar counts received: { equipments: X, facilities: Y, ..., equipment_logs: 0, ... }
Equipment logs count: 0
```

### Step 2: Verify Backend Response

The issue is likely one of these:

#### Scenario A: Backend returns 0 for equipment_logs

**Console shows:**

```
Equipment logs count: 0
```

**Solution:** Backend needs to query the `equipment_logs` table properly.

#### Scenario B: Backend field name mismatch

**Console shows:**

```
Equipment logs count: undefined
```

**Solution:** Backend is returning a different field name (e.g., `equipmentLogs` instead of `equipment_logs`).

#### Scenario C: Backend endpoint not found

**Console shows:**

```
Error fetching sidebar counts: Failed to fetch sidebar counts
```

**Solution:** Backend `/api/sidebar/counts` endpoint doesn't exist or has wrong path.

## Solutions

### Solution 1: Fix Backend Query (Most Likely)

Your backend `/api/sidebar/counts` endpoint is probably returning hardcoded 0 or not querying the table.

**Check your backend code:**

```python
# ❌ WRONG - Hardcoded
def get_sidebar_counts():
    return {
        "equipments": db.query(Equipment).count(),
        "equipment_logs": 0,  # ❌ This is the problem!
    }

# ✅ CORRECT - Query actual table
def get_sidebar_counts():
    return {
        "equipments": db.query(Equipment).count(),
        "equipment_logs": db.query(EquipmentLog).count(),  # ✅ Query the table
    }
```

### Solution 2: Fix Field Name Mismatch

If your backend is using camelCase instead of snake_case:

**Backend Change:**

```python
# Change from:
"equipmentLogs": count  # ❌ camelCase

# To:
"equipment_logs": count  # ✅ snake_case
```

**OR Frontend Change (less preferred):**

```typescript
// In sidebarHelpers.ts, transform the response
export async function fetchSidebarCounts(): Promise<SidebarCounts> {
  const response = await fetch(`${API_BASE_URL}/api/sidebar/counts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  // Transform camelCase to snake_case if needed
  return {
    equipments: data.equipments,
    facilities: data.facilities,
    supplies: data.supplies,
    requests: data.requests,
    equipment_logs: data.equipmentLogs || data.equipment_logs || 0,
    facility_logs: data.facilityLogs || data.facility_logs || 0,
    supply_logs: data.supplyLogs || data.supply_logs || 0,
    users: data.users,
  };
}
```

### Solution 3: Verify Database Table

Make sure the `equipment_logs` table exists and has data:

```sql
-- Check if table exists
SELECT COUNT(*) FROM equipment_logs;

-- Should return: 2 (based on your screenshot)
```

If table doesn't exist, you need to create it first (see MONITOR_EQUIPMENT_IMPLEMENTATION.md).

### Solution 4: Check Backend Endpoint Path

Verify the endpoint is correctly registered:

```python
# FastAPI
@app.get("/api/sidebar/counts")  # ✅ Correct path
# NOT:
@app.get("/sidebar/counts")      # ❌ Missing /api
```

## Quick Test

### Test Backend Directly

Use curl or Postman to test the endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/sidebar/counts
```

**Expected Response:**

```json
{
  "equipments": 1,
  "facilities": 1,
  "supplies": 1,
  "requests": 3,
  "equipment_logs": 2, // ← Should be 2, not 0
  "facility_logs": 0,
  "supply_logs": 0,
  "users": 1
}
```

### Test Frontend Directly

In browser console, run:

```javascript
// Get token
const token = localStorage.getItem("authToken");

// Test endpoint
fetch("http://localhost:8000/api/sidebar/counts", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then((data) => console.log("API Response:", data));
```

## Expected Backend Implementation

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

@router.get("/api/sidebar/counts")
async def get_sidebar_counts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all sidebar counts"""

    # Query all tables
    equipments = db.query(Equipment).count()
    facilities = db.query(Facility).count()
    supplies = db.query(Supply).count()
    requests = db.query(Request).filter(
        Request.status.in_(['pending', 'in-progress'])
    ).count()

    # IMPORTANT: These should return actual counts from log tables
    equipment_logs = db.query(EquipmentLog).count()  # Should return 2
    facility_logs = db.query(FacilityLog).count()
    supply_logs = db.query(SupplyLog).count()

    users = db.query(User).count()

    return {
        "equipments": equipments,
        "facilities": facilities,
        "supplies": supplies,
        "requests": requests,
        "equipment_logs": equipment_logs,  # ← Check this line
        "facility_logs": facility_logs,
        "supply_logs": supply_logs,
        "users": users
    }
```

## Verification Checklist

After fixing the backend:

1. **Refresh the page** (or wait 30 seconds for auto-refresh)
2. **Check console logs**:
   - Should show: `Equipment logs count: 2`
3. **Check sidebar**:
   - Equipment Logs should show badge with "2"
4. **Add a new log**:
   - Badge should update to "3" within 30 seconds

## Files Modified

- ✅ `/src/components/Sidebar.tsx` - Added debug logging
- 📝 `/docs/SIDEBAR_COUNTS_API_ENDPOINT.md` - Backend API spec
- 📝 `/docs/EQUIPMENT_LOGS_TROUBLESHOOTING.md` - This file

## Next Steps

1. **Open browser console** (F12)
2. **Look at the logged data** to see what's being returned
3. **Share the console output** if you need more help
4. **Fix the backend** based on what the logs show

## Common Console Outputs

### ✅ Working Correctly

```
Sidebar counts received: {..., equipment_logs: 2, ...}
Equipment logs count: 2
```

### ❌ Backend returning 0

```
Sidebar counts received: {..., equipment_logs: 0, ...}
Equipment logs count: 0
```

**Fix:** Update backend to query `equipment_logs` table

### ❌ Field name mismatch

```
Sidebar counts received: {..., equipmentLogs: 2, ...}
Equipment logs count: undefined
```

**Fix:** Change backend to use `equipment_logs` (snake_case)

### ❌ Endpoint not found

```
Error fetching sidebar counts: Failed to fetch sidebar counts
Network error or 404
```

**Fix:** Check backend endpoint path and CORS settings
