# Sidebar Counts API Endpoint Documentation

## Issue

The Equipment Logs count in the sidebar is showing "0" even though there are logs in the database.

## Root Cause

The frontend is calling `/api/sidebar/counts` which should return all sidebar counts including monitoring logs counts, but the backend endpoint may not be returning the correct data for `equipment_logs`, `facility_logs`, and `supply_logs`.

## Required Backend Implementation

### Endpoint Specification

**GET** `/api/sidebar/counts`

**Headers:**

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response Format:**

```json
{
  "equipments": 150,
  "facilities": 25,
  "supplies": 300,
  "requests": 12,
  "equipment_logs": 2,
  "facility_logs": 5,
  "supply_logs": 8,
  "users": 45
}
```

**Response Type (TypeScript):**

```typescript
interface SidebarCounts {
  equipments: number;
  facilities: number;
  supplies: number;
  requests: number;
  equipment_logs: number; // Total count from equipment_logs table
  facility_logs: number; // Total count from facility_logs table
  supply_logs: number; // Total count from supply_logs table
  users: number;
}
```

### Backend Implementation Example (FastAPI)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

router = APIRouter()

class SidebarCountsResponse(BaseModel):
    equipments: int
    facilities: int
    supplies: int
    requests: int
    equipment_logs: int
    facility_logs: int
    supply_logs: int
    users: int

@router.get("/api/sidebar/counts", response_model=SidebarCountsResponse)
async def get_sidebar_counts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all sidebar counts in a single request for better performance.
    This reduces the number of API calls from 8 to 1.
    """
    try:
        # Get all counts in parallel/single query
        equipments_count = db.query(Equipment).count()
        facilities_count = db.query(Facility).count()
        supplies_count = db.query(Supply).count()

        # Requests - pending/in-progress requests
        requests_count = db.query(Request).filter(
            Request.status.in_(['pending', 'in-progress'])
        ).count()

        # Transaction logs - IMPORTANT: These should be total counts
        equipment_logs_count = db.query(EquipmentLog).count()
        facility_logs_count = db.query(FacilityLog).count()
        supply_logs_count = db.query(SupplyLog).count()

        # Users - all active users or pending approval
        users_count = db.query(User).filter(
            User.is_active == True
        ).count()

        return SidebarCountsResponse(
            equipments=equipments_count,
            facilities=facilities_count,
            supplies=supplies_count,
            requests=requests_count,
            equipment_logs=equipment_logs_count,
            facility_logs=facility_logs_count,
            supply_logs=supply_logs_count,
            users=users_count
        )

    except Exception as e:
        print(f"Error fetching sidebar counts: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch sidebar counts"
        )
```

### SQL Query Examples

If implementing directly with SQL queries:

```sql
-- Get all counts in one query using subqueries
SELECT
    (SELECT COUNT(*) FROM equipments) as equipments,
    (SELECT COUNT(*) FROM facilities) as facilities,
    (SELECT COUNT(*) FROM supplies) as supplies,
    (SELECT COUNT(*) FROM requests
     WHERE status IN ('pending', 'in-progress')) as requests,
    (SELECT COUNT(*) FROM equipment_logs) as equipment_logs,
    (SELECT COUNT(*) FROM facility_logs) as facility_logs,
    (SELECT COUNT(*) FROM supply_logs) as supply_logs,
    (SELECT COUNT(*) FROM users WHERE is_active = true) as users;
```

### Database Tables Expected

The endpoint expects these tables to exist:

1. **equipments** - All equipment records
2. **facilities** - All facility records
3. **supplies** - All supply records
4. **requests** - All borrowing/booking/acquiring requests
5. **equipment_logs** - Transaction logs for equipment (NEW)
6. **facility_logs** - Transaction logs for facilities (NEW)
7. **supply_logs** - Transaction logs for supplies (NEW)
8. **users** - All user accounts

### Important Notes

1. **equipment_logs, facility_logs, supply_logs** should return the **TOTAL COUNT** of all logs in the database, not filtered by date or user.

2. The frontend refreshes these counts every **30 seconds** (see Sidebar.tsx line 177).

3. The counts are displayed next to each menu item in the sidebar.

4. If any table doesn't exist yet, return `0` for that count instead of throwing an error.

5. Consider adding database indexes on frequently counted columns:
   ```sql
   CREATE INDEX idx_requests_status ON requests(status);
   CREATE INDEX idx_users_is_active ON users(is_active);
   ```

### Error Handling

If the endpoint fails, the frontend will:

1. Log the error to console
2. Keep showing the previous counts
3. Continue to retry every 30 seconds

**Error Response Format:**

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Testing Checklist

Once implemented, verify:

- [ ] Equipment Logs count matches total records in equipment_logs table
- [ ] Facility Logs count matches total records in facility_logs table
- [ ] Supply Logs count matches total records in supply_logs table
- [ ] Counts update in real-time (within 30 seconds) when new records are added
- [ ] No authentication errors for authorized users
- [ ] Endpoint returns 401 for unauthorized requests
- [ ] Response time is under 500ms (since it's called every 30 seconds)

### Current Status

✅ **Frontend**: Properly implemented and calling the endpoint
⚠️ **Backend**: Endpoint exists but may not be returning correct counts for logs
🔧 **Fix Required**: Update backend to return proper `equipment_logs`, `facility_logs`, and `supply_logs` counts

### Quick Fix Command (Backend)

If you have the endpoint but it's returning 0 for logs, make sure your backend is querying the actual log tables:

```python
# Check if you're returning hardcoded 0s
equipment_logs_count = db.query(EquipmentLog).count()  # Should query actual table
# NOT:
equipment_logs_count = 0  # ❌ Wrong - this is hardcoded
```
