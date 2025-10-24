# Dashboard Users - Backend Implementation Guide

## Overview

This document specifies the FastAPI backend endpoints required for the dashboard-users page functionality. The frontend has been fully restructured with components, utils, Zustand state management, and expects these API responses.

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

### 1. GET /api/users

Retrieve paginated user/account request records with optional filtering.

**Query Parameters:**

- `page` (integer, required): Page number (1-indexed)
- `limit` (integer, required): Items per page (typically 10)
- `department` (string, optional): Filter by department name
- `role` (string, optional): Filter by account role

**Success Response (200 OK):**

```json
{
  "users": [
    {
      "id": "uuid-string",
      "first_name": "John",
      "last_name": "Doe",
      "department": "IT Department",
      "phone_number": "+1234567890",
      "acc_role": "Employee",
      "approved_acc_role": "Admin",
      "email": "john.doe@example.com"
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

### 2. PATCH /api/users/{user_id}

Update user information by ID.

**Path Parameters:**

- `user_id` (string, required): User UUID

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "department": "IT Department",
  "phone_number": "+1234567890",
  "acc_role": "Employee",
  "approved_acc_role": "Admin"
}
```

**Success Response (200 OK):**

```json
{
  "id": "uuid-string",
  "first_name": "John",
  "last_name": "Doe",
  "department": "IT Department",
  "phone_number": "+1234567890",
  "acc_role": "Employee",
  "approved_acc_role": "Admin",
  "email": "john.doe@example.com"
}
```

**Error Response (404 Not Found):**

```json
{
  "detail": "User not found"
}
```

### 3. DELETE /api/users/batch

Delete multiple users by IDs.

**Request Body:**

```json
{
  "user_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Success Response (200 OK):**

```json
{
  "deleted_count": 3,
  "message": "Successfully deleted 3 users"
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "user_ids must be a non-empty array"
}
```

## Database Schema

### account_requests table

```sql
CREATE TABLE account_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    acc_role VARCHAR(100) NOT NULL,
    approved_acc_role VARCHAR(100),
    is_intern BOOLEAN,
    is_supervisor BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_account_requests_user_id ON account_requests(user_id);
CREATE INDEX idx_account_requests_department ON account_requests(department);
CREATE INDEX idx_account_requests_acc_role ON account_requests(acc_role);
CREATE INDEX idx_account_requests_is_intern_is_supervisor
  ON account_requests(is_intern, is_supervisor)
  WHERE is_intern IS NULL AND is_supervisor IS NULL;
```

## FastAPI Implementation Example

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID

router = APIRouter(prefix="/api/users", tags=["users"])

class UserBase(BaseModel):
    first_name: str
    last_name: str
    department: str
    phone_number: Optional[str] = None
    acc_role: str
    approved_acc_role: Optional[str] = None

class User(UserBase):
    id: str
    email: str

    class Config:
        from_attributes = True

class UsersResponse(BaseModel):
    users: List[User]
    total_count: int
    page: int
    limit: int
    total_pages: int

class BatchDeleteRequest(BaseModel):
    user_ids: List[str]

@router.get("", response_model=UsersResponse)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    department: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve paginated list of users with optional filtering.

    Only returns users where is_intern IS NULL AND is_supervisor IS NULL.
    """
    try:
        # Base query
        query = (
            db.query(AccountRequestModel, AuthUserModel.email)
            .join(AuthUserModel, AccountRequestModel.user_id == AuthUserModel.id)
            .filter(
                AccountRequestModel.is_intern.is_(None),
                AccountRequestModel.is_supervisor.is_(None)
            )
        )

        # Apply filters
        if department:
            query = query.filter(
                AccountRequestModel.department.ilike(f"%{department}%")
            )

        if role:
            query = query.filter(
                AccountRequestModel.acc_role.ilike(f"%{role}%")
            )

        # Get total count
        total_count = query.count()

        # Calculate pagination
        offset = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit

        # Get paginated results
        results = (
            query.order_by(
                AccountRequestModel.first_name,
                AccountRequestModel.last_name
            )
            .offset(offset)
            .limit(limit)
            .all()
        )

        # Format response
        users = []
        for account_request, email in results:
            users.append({
                "id": str(account_request.id),
                "first_name": account_request.first_name,
                "last_name": account_request.last_name,
                "department": account_request.department,
                "phone_number": account_request.phone_number,
                "acc_role": account_request.acc_role,
                "approved_acc_role": account_request.approved_acc_role,
                "email": email
            })

        return UsersResponse(
            users=users,
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_data: UserBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user information by ID.
    """
    try:
        # Find user
        account_request = (
            db.query(AccountRequestModel)
            .filter(AccountRequestModel.id == user_id)
            .first()
        )

        if not account_request:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields
        account_request.first_name = user_data.first_name
        account_request.last_name = user_data.last_name
        account_request.department = user_data.department
        account_request.phone_number = user_data.phone_number
        account_request.acc_role = user_data.acc_role
        account_request.approved_acc_role = user_data.approved_acc_role
        account_request.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(account_request)

        # Get email
        auth_user = (
            db.query(AuthUserModel)
            .filter(AuthUserModel.id == account_request.user_id)
            .first()
        )

        return {
            "id": str(account_request.id),
            "first_name": account_request.first_name,
            "last_name": account_request.last_name,
            "department": account_request.department,
            "phone_number": account_request.phone_number,
            "acc_role": account_request.acc_role,
            "approved_acc_role": account_request.approved_acc_role,
            "email": auth_user.email if auth_user else ""
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/batch")
async def batch_delete_users(
    request: BatchDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete multiple users by IDs.
    """
    try:
        if not request.user_ids:
            raise HTTPException(
                status_code=400,
                detail="user_ids must be a non-empty array"
            )

        # Delete users
        deleted_count = (
            db.query(AccountRequestModel)
            .filter(AccountRequestModel.id.in_(request.user_ids))
            .delete(synchronize_session=False)
        )

        db.commit()

        return {
            "deleted_count": deleted_count,
            "message": f"Successfully deleted {deleted_count} users"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
```

## Filter Implementation Notes

### Department Filter

- Case-insensitive partial match (ILIKE)
- Example: "IT" matches "IT Department", "Marketing IT", etc.

### Role Filter

- Case-insensitive partial match on `acc_role` field only
- Does not search in `approved_acc_role`
- Example: "Admin" matches "Admin", "System Admin", etc.

## Testing Checklist

- [ ] GET /api/users returns correct structure without filters
- [ ] Pagination works correctly (multiple pages)
- [ ] Department filter works (case-insensitive)
- [ ] Role filter works (case-insensitive)
- [ ] Combined filters work (department + role)
- [ ] PATCH /api/users/{id} updates user successfully
- [ ] PATCH validates required fields (first_name, last_name, department)
- [ ] PATCH returns 404 for non-existent user
- [ ] DELETE /api/users/batch deletes multiple users
- [ ] DELETE returns correct deleted_count
- [ ] DELETE returns 400 for empty user_ids array
- [ ] Authentication required (401 if no token)
- [ ] Only returns users where is_intern IS NULL AND is_supervisor IS NULL

## Frontend Integration

The frontend is already implemented and expects:

1. JWT token from `localStorage.getItem("token")`
2. Response structures matching defined interfaces
3. Filters applied on backend (no client-side filtering)
4. Pagination handled by backend
5. Error messages returned in `detail` field

## Permissions & Authorization

Consider implementing role-based access control:

- Only admins can delete users
- Only admins can edit approved_acc_role
- Users can view their own record
- Department heads can view their department users

---

**Status:** Frontend implementation complete ✅  
**Waiting on:** Backend API implementation  
**Documentation:** Complete with FastAPI examples
