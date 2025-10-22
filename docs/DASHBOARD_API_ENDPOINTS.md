# Dashboard API Endpoints - FastAPI Backend Implementation Guide

This document provides comprehensive specifications for implementing the FastAPI endpoints required by the dashboard page.

---

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## **1. GET /api/dashboard/stats - Get Dashboard Statistics**

**Endpoint:** `GET /api/dashboard/stats`

**Description:** Retrieves comprehensive dashboard statistics including user counts, equipment counts, facility counts, supply counts, and borrowing statistics.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
{
  "total_users": 150,
  "pending_requests": 25,
  "total_equipment": 500,
  "active_facilities": 12,
  "total_supplies": 300,
  "borrowed_last_7_days": 45,
  "borrowed_today": 8,
  "total_equipment_categories": 15
}
```

**Response Fields:**

- `total_users` (integer): Total number of registered users in the system
- `pending_requests` (integer): Number of pending account requests, borrowing requests, and booking requests
- `total_equipment` (integer): Total number of equipment items in the system
- `active_facilities` (integer): Number of facilities that are currently active/available
- `total_supplies` (integer): Total number of supply items in the system
- `borrowed_last_7_days` (integer): Number of equipment items borrowed in the last 7 days
- `borrowed_today` (integer): Number of equipment items borrowed today
- `total_equipment_categories` (integer): Number of distinct equipment categories

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

**Response (500 Internal Server Error):**

```json
{
  "detail": "Failed to fetch dashboard statistics"
}
```

---

## **2. GET /api/dashboard/equipment/by-person-liable - Equipment Count Per Person Liable**

**Endpoint:** `GET /api/dashboard/equipment/by-person-liable`

**Description:** Retrieves the count of equipment items grouped by person liable (custodian).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
[
  {
    "person_liable": "John Doe",
    "equipment_count": 25
  },
  {
    "person_liable": "Jane Smith",
    "equipment_count": 18
  },
  {
    "person_liable": "Bob Johnson",
    "equipment_count": 32
  }
]
```

**Response Fields:**

- Array of objects containing:
  - `person_liable` (string): Name of the person responsible for the equipment
  - `equipment_count` (integer): Number of equipment items assigned to this person

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **3. GET /api/dashboard/equipment/by-category - Equipment Count By Category**

**Endpoint:** `GET /api/dashboard/equipment/by-category`

**Description:** Retrieves the count of equipment items grouped by category.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
[
  {
    "category": "Computers",
    "count": 120
  },
  {
    "category": "Projectors",
    "count": 45
  },
  {
    "category": "Audio Equipment",
    "count": 30
  }
]
```

**Response Fields:**

- Array of objects containing:
  - `category` (string): Equipment category name
  - `count` (integer): Number of equipment items in this category

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **4. GET /api/dashboard/equipment/by-status - Equipment Count By Status**

**Endpoint:** `GET /api/dashboard/equipment/by-status`

**Description:** Retrieves the count of equipment items grouped by their current status.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
[
  {
    "status": "Available",
    "count": 350
  },
  {
    "status": "Borrowed",
    "count": 80
  },
  {
    "status": "Under Maintenance",
    "count": 45
  },
  {
    "status": "Damaged",
    "count": 25
  }
]
```

**Response Fields:**

- Array of objects containing:
  - `status` (string): Equipment status (Available, Borrowed, Under Maintenance, Damaged, etc.)
  - `count` (integer): Number of equipment items with this status

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **5. GET /api/dashboard/equipment/by-facility - Equipment Count Per Facility**

**Endpoint:** `GET /api/dashboard/equipment/by-facility`

**Description:** Retrieves the count of equipment items grouped by facility location.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
[
  {
    "facility_name": "Computer Laboratory 1",
    "equipment_count": 45
  },
  {
    "facility_name": "Conference Room A",
    "equipment_count": 12
  },
  {
    "facility_name": "Multimedia Room",
    "equipment_count": 28
  }
]
```

**Response Fields:**

- Array of objects containing:
  - `facility_name` (string): Name of the facility
  - `equipment_count` (integer): Number of equipment items located in this facility

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **6. GET /api/dashboard/equipment/availability - Equipment Availability Statistics**

**Endpoint:** `GET /api/dashboard/equipment/availability`

**Description:** Retrieves equipment availability statistics with counts and percentages.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
[
  {
    "status": "Available",
    "count": 350,
    "percentage": 70
  },
  {
    "status": "In Use",
    "count": 100,
    "percentage": 20
  },
  {
    "status": "Unavailable",
    "count": 50,
    "percentage": 10
  }
]
```

**Response Fields:**

- Array of objects containing:
  - `status` (string): Availability status
  - `count` (integer): Number of equipment items with this availability status
  - `percentage` (number): Percentage of total equipment with this status

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## Database Schema Requirements

### Users/Account Requests

```sql
-- For total_users count
SELECT COUNT(*) FROM account_requests WHERE status = 'Approved';

-- For pending_requests count
SELECT COUNT(*) FROM account_requests WHERE status = 'Pending';
```

### Equipment

```sql
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    person_liable VARCHAR(255),
    facility_id INTEGER REFERENCES facilities(id),
    condition VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For total_equipment count
SELECT COUNT(*) FROM equipment;

-- For total_equipment_categories count
SELECT COUNT(DISTINCT category) FROM equipment;

-- For equipment by category
SELECT category, COUNT(*) as count
FROM equipment
GROUP BY category
ORDER BY count DESC;

-- For equipment by status
SELECT status, COUNT(*) as count
FROM equipment
GROUP BY status;

-- For equipment by person liable
SELECT person_liable, COUNT(*) as equipment_count
FROM equipment
WHERE person_liable IS NOT NULL
GROUP BY person_liable
ORDER BY equipment_count DESC;

-- For equipment by facility
SELECT f.name as facility_name, COUNT(e.id) as equipment_count
FROM facilities f
LEFT JOIN equipment e ON f.id = e.facility_id
GROUP BY f.id, f.name
ORDER BY equipment_count DESC;
```

### Borrowing Requests

```sql
CREATE TABLE borrowing_requests (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id),
    borrower_id INTEGER REFERENCES account_requests(id),
    status VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For borrowed_today count
SELECT COUNT(*) FROM borrowing_requests
WHERE DATE(start_date) = CURRENT_DATE
AND status = 'Approved';

-- For borrowed_last_7_days count
SELECT COUNT(*) FROM borrowing_requests
WHERE start_date >= CURRENT_DATE - INTERVAL '7 days'
AND status = 'Approved';
```

### Facilities

```sql
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    capacity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For active_facilities count
SELECT COUNT(*) FROM facilities WHERE status = 'Active';
```

### Supplies

```sql
CREATE TABLE supplies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For total_supplies count
SELECT COUNT(*) FROM supplies;
```

---

## Implementation Notes

### 1. Dashboard Statistics Endpoint

The `/api/dashboard/stats` endpoint should execute multiple queries efficiently:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Total users (approved accounts)
        total_users = db.query(AccountRequest).filter(
            AccountRequest.status == 'Approved'
        ).count()

        # Pending requests (all types)
        pending_account_requests = db.query(AccountRequest).filter(
            AccountRequest.status == 'Pending'
        ).count()

        pending_borrowing_requests = db.query(BorrowingRequest).filter(
            BorrowingRequest.status == 'Pending'
        ).count()

        pending_booking_requests = db.query(BookingRequest).filter(
            BookingRequest.status == 'Pending'
        ).count()

        pending_requests = (
            pending_account_requests +
            pending_borrowing_requests +
            pending_booking_requests
        )

        # Equipment statistics
        total_equipment = db.query(Equipment).count()
        total_equipment_categories = db.query(Equipment.category).distinct().count()

        # Facilities statistics
        active_facilities = db.query(Facility).filter(
            Facility.status == 'Active'
        ).count()

        # Supplies statistics
        total_supplies = db.query(Supply).count()

        # Borrowing statistics
        today = date.today()
        seven_days_ago = today - timedelta(days=7)

        borrowed_today = db.query(BorrowingRequest).filter(
            func.date(BorrowingRequest.start_date) == today,
            BorrowingRequest.status == 'Approved'
        ).count()

        borrowed_last_7_days = db.query(BorrowingRequest).filter(
            BorrowingRequest.start_date >= seven_days_ago,
            BorrowingRequest.status == 'Approved'
        ).count()

        return {
            "total_users": total_users,
            "pending_requests": pending_requests,
            "total_equipment": total_equipment,
            "active_facilities": active_facilities,
            "total_supplies": total_supplies,
            "borrowed_last_7_days": borrowed_last_7_days,
            "borrowed_today": borrowed_today,
            "total_equipment_categories": total_equipment_categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 2. Equipment Grouping Endpoints

For better performance, use database aggregation:

```python
# By category
@router.get("/api/dashboard/equipment/by-category")
async def get_equipment_by_category(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    results = db.query(
        Equipment.category,
        func.count(Equipment.id).label('count')
    ).group_by(Equipment.category).order_by(func.count(Equipment.id).desc()).all()

    return [{"category": r.category, "count": r.count} for r in results]

# By status
@router.get("/api/dashboard/equipment/by-status")
async def get_equipment_by_status(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    results = db.query(
        Equipment.status,
        func.count(Equipment.id).label('count')
    ).group_by(Equipment.status).all()

    return [{"status": r.status, "count": r.count} for r in results]
```

### 3. Performance Optimization

- Use database indexes on frequently queried columns:
  - `equipment.category`
  - `equipment.status`
  - `equipment.person_liable`
  - `borrowing_requests.start_date`
  - `borrowing_requests.status`
- Consider caching dashboard statistics with a short TTL (5-10 minutes)
- Use database views for complex aggregations
- Implement query result caching with Redis

### 4. Security Considerations

- Validate JWT tokens for all endpoints
- Implement role-based access (only admins should access dashboard)
- Rate limit dashboard endpoints to prevent abuse
- Log all dashboard access for auditing

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "detail": "Error message here",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-02-20T10:30:00Z"
}
```

Common error codes:

- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: User doesn't have dashboard access
- `INTERNAL_ERROR`: Database or server error
- `INVALID_REQUEST`: Malformed request

---

## Testing the Endpoints

### Test Dashboard Statistics

```bash
curl -X GET "http://localhost:8000/api/dashboard/stats" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

### Test Equipment by Category

```bash
curl -X GET "http://localhost:8000/api/dashboard/equipment/by-category" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

### Test Equipment by Status

```bash
curl -X GET "http://localhost:8000/api/dashboard/equipment/by-status" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

---

## Frontend Integration

The dashboard page is now fully refactored to:

- ✅ Use FastAPI endpoints instead of Supabase RPC
- ✅ Integrate with Zustand state management (authStore)
- ✅ Use component-based architecture (5 components created)
- ✅ Centralize all API calls in utils/helpers.ts
- ✅ Provide proper error handling and loading states
- ✅ Follow best practices for React and TypeScript

**File Structure:**

```
src/app/dashboard/
├── page.tsx (main dashboard component)
├── components/
│   ├── DashboardHeader.tsx
│   ├── StatsGrid.tsx
│   ├── ChartsSection.tsx
│   ├── LoadingState.tsx
│   └── ErrorMessage.tsx
└── utils/
    └── helpers.ts (API functions and utilities)
```

---

## Additional Considerations

### 1. Real-time Updates

Consider implementing WebSocket/SSE for real-time dashboard updates:

```python
@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await websocket.accept()
    while True:
        stats = await get_dashboard_stats_realtime()
        await websocket.send_json(stats)
        await asyncio.sleep(30)  # Update every 30 seconds
```

### 2. Export Functionality

Add endpoint to export dashboard data:

```python
@router.get("/api/dashboard/export")
async def export_dashboard_data(
    format: str = "csv",  # csv, json, excel
    current_user: dict = Depends(get_current_user)
):
    # Generate and return export file
    pass
```

### 3. Custom Date Ranges

Allow filtering by custom date ranges:

```python
@router.get("/api/dashboard/stats")
async def get_dashboard_stats(
    start_date: date = None,
    end_date: date = None,
    current_user: dict = Depends(get_current_user)
):
    # Filter statistics by date range
    pass
```

### 4. Dashboard Widgets

Implement customizable dashboard widgets that users can enable/disable:

```python
@router.get("/api/dashboard/widgets/{widget_id}")
async def get_widget_data(
    widget_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Return specific widget data
    pass
```

---

## Migration from Supabase RPC

The dashboard previously used Supabase RPC function `get_dashboard_counts`. The FastAPI implementation provides the same functionality with better performance and maintainability:

**Old (Supabase RPC):**

```javascript
const { data, error } = await supabase.rpc("get_dashboard_counts");
```

**New (FastAPI):**

```typescript
const stats = await fetchDashboardStats();
```

Benefits of FastAPI approach:

- Better type safety with TypeScript
- Centralized error handling
- Easier to test and maintain
- More flexible for future enhancements
- Better performance with proper caching
- Clearer separation of concerns
