# Monitor Supplies - Backend Implementation Guide

## Overview

This document specifies the FastAPI backend endpoints required for the monitor-supplies page functionality. The frontend has been fully implemented with Zustand state management and expects these API responses.

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints require JWT Bearer token authentication:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. GET /api/supplies/logs

Retrieve paginated supply transaction logs.

**Query Parameters:**

- `page` (integer, required): Page number (1-indexed)
- `limit` (integer, required): Items per page (typically 10)

**Success Response (200 OK):**

```json
{
  "logs": [
    {
      "id": 1,
      "log_message": "User admin@example.com added supply 'Ballpen' to inventory with quantity 100",
      "created_at": "2025-01-24T15:30:00.000Z"
    },
    {
      "id": 2,
      "log_message": "User john@example.com updated supply 'Notebook' quantity from 50 to 75",
      "created_at": "2025-01-24T14:15:00.000Z"
    }
  ],
  "total_count": 125,
  "page": 1,
  "limit": 10,
  "total_pages": 13
}
```

**Error Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "detail": "Internal server error message"
}
```

## Database Schema

### supply_logs table

```sql
CREATE TABLE supply_logs (
    id SERIAL PRIMARY KEY,
    log_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id),
    supply_id INTEGER REFERENCES supplies(id),
    action_type VARCHAR(50), -- 'add', 'update', 'delete', 'acquire', 'restock'
    metadata JSONB -- Additional context like old/new values, quantities
);

CREATE INDEX idx_supply_logs_created_at ON supply_logs(created_at DESC);
CREATE INDEX idx_supply_logs_user_id ON supply_logs(user_id);
CREATE INDEX idx_supply_logs_supply_id ON supply_logs(supply_id);
```

## FastAPI Implementation Example

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/api/supplies", tags=["supplies"])

class SupplyLog(BaseModel):
    id: int
    log_message: str
    created_at: datetime

    class Config:
        from_attributes = True

class SupplyLogsResponse(BaseModel):
    logs: List[SupplyLog]
    total_count: int
    page: int
    limit: int
    total_pages: int

@router.get("/logs", response_model=SupplyLogsResponse)
async def get_supply_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve paginated supply transaction logs.

    Logs should be ordered by created_at descending (newest first).
    """
    try:
        # Calculate offset for pagination
        offset = (page - 1) * limit

        # Get total count
        total_count = db.query(SupplyLogModel).count()

        # Get paginated logs
        logs = db.query(SupplyLogModel)\
            .order_by(SupplyLogModel.created_at.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()

        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit

        return SupplyLogsResponse(
            logs=logs,
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Log Message Format Examples

Supply logs should provide clear, human-readable descriptions of what happened:

### Add Supply

```
"User admin@example.com added supply 'Ballpen (Blue)' to inventory with quantity 100"
```

### Update Supply

```
"User john@example.com updated supply 'Notebook (A4)' quantity from 50 to 75"
"User maria@example.com updated supply 'Whiteboard Marker' price from $2.50 to $3.00"
```

### Delete Supply

```
"User admin@example.com deleted supply 'Old Projector Remote' from inventory"
```

### Acquire/Request Supply

```
"User teacher@example.com requested 25 units of 'Bond Paper (Long)'"
"Approved acquisition of 10 units of 'Glue Stick' for user student@example.com"
```

### Restock Supply

```
"User admin@example.com restocked 'Stapler Wire' with 200 units (previous: 50)"
```

### Status Change

```
"Supply 'Printer Ink (Black)' status changed from 'Available' to 'Low Stock' (quantity: 5)"
```

## Sidebar Count Integration

The `/api/sidebar/counts` endpoint must also return supply_logs count:

```json
{
  "equipment_logs": 45,
  "facility_logs": 23,
  "supply_logs": 67 // Add this field
}
```

**Implementation:**

```python
@router.get("/sidebar/counts")
async def get_sidebar_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipment_count = db.query(EquipmentLogModel).count()
    facility_count = db.query(FacilityLogModel).count()
    supply_count = db.query(SupplyLogModel).count()

    return {
        "equipment_logs": equipment_count,
        "facility_logs": facility_count,
        "supply_logs": supply_count
    }
```

## Testing Checklist

- [ ] GET /api/supplies/logs returns correct structure
- [ ] Pagination works correctly (page=1, page=2, etc.)
- [ ] Total count and total pages calculated correctly
- [ ] Logs ordered by created_at descending
- [ ] Authentication required (401 if no token)
- [ ] Handles empty results (empty array, count=0)
- [ ] Sidebar counts include supply_logs
- [ ] Error handling returns proper status codes

## Frontend Integration

The frontend is already implemented and expects:

1. JWT token from `localStorage.getItem("token")`
2. Response structure matching `SupplyLogsResponse` interface
3. Logs will be displayed with formatted dates: "Oct 24, 2025 3:33 AM"
4. Pagination controls automatically generated
5. Error messages displayed if API fails

## Log Creation Triggers

Supply logs should be created whenever:

- New supply added to inventory (POST /api/supplies)
- Supply quantity updated (PATCH /api/supplies/{id})
- Supply details modified (name, category, price, etc.)
- Supply deleted from system (DELETE /api/supplies/{id})
- Supply acquisition requested (POST /api/requests)
- Supply acquisition approved/rejected (PATCH /api/requests/{id})
- Supply restocked (POST /api/supplies/{id}/restock)
- Supply status changed (available → low stock → out of stock)

Each trigger should create a descriptive log message with relevant context.
