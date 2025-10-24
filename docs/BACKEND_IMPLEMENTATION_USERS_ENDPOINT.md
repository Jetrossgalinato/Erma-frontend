# 🚀 Backend Implementation: GET /api/users Endpoint

## Problem

The dashboard-users page shows "0 total users" and "No users found" even though the database has users.

**Database:** PostgreSQL table `users` (or `account_requests`) with 2 rows (id: 1 and 2)  
**Current User:** id: 1  
**Expected Result:** Should display user with id: 2 (excluding current user)

## Solution: Implement GET /api/users Endpoint

---

## FastAPI Implementation

### File: `app/routers/users.py` (or your users router file)

```python
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from pydantic import BaseModel
import math

from app.database import get_db
from app.auth import get_current_user  # Your JWT authentication dependency
from app.models import Users  # Your Users/AccountRequests model

router = APIRouter(prefix="/api", tags=["users"])

# Response Models
class UserResponse(BaseModel):
    id: str  # Changed to string as frontend expects string UUID
    first_name: str
    last_name: str
    email: str
    department: str
    phone_number: Optional[str]
    acc_role: str
    approved_acc_role: Optional[str]

    class Config:
        from_attributes = True

class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total_count: int
    page: int
    limit: int
    total_pages: int

@router.get("/users", response_model=UsersListResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    department: Optional[str] = Query(None, description="Filter by department"),
    role: Optional[str] = Query(None, description="Filter by role"),
    exclude_user_id: Optional[str] = Query(None, description="User ID to exclude"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get paginated list of users with optional filtering.
    Excludes the current authenticated user.

    Frontend expects:
    - User with id:1 is logged in
    - Should return user with id:2
    - Should NOT return user with id:1
    """

    print(f"[GET /api/users] Current user ID: {current_user.id}")
    print(f"[GET /api/users] Exclude user ID: {exclude_user_id}")
    print(f"[GET /api/users] Page: {page}, Limit: {limit}")

    try:
        # Start with base query - ALWAYS exclude current user
        query = db.query(Users).filter(
            Users.id != current_user.id
        )

        # Additional exclusion if provided (usually same as current_user.id)
        if exclude_user_id and exclude_user_id != str(current_user.id):
            query = query.filter(Users.id != exclude_user_id)

        # Apply department filter (case-insensitive partial match)
        if department:
            query = query.filter(
                Users.department.ilike(f"%{department}%")
            )

        # Apply role filter (check both acc_role and approved_acc_role)
        if role:
            query = query.filter(
                or_(
                    Users.acc_role.ilike(f"%{role}%"),
                    Users.approved_acc_role.ilike(f"%{role}%")
                )
            )

        # Get total count BEFORE pagination
        total_count = query.count()
        print(f"[GET /api/users] Total count (excluding current user): {total_count}")

        # Calculate pagination
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
        offset = (page - 1) * limit

        # Get paginated results with sorting
        users = query.order_by(
            Users.first_name.asc(),
            Users.last_name.asc(),
            Users.email.asc()
        ).offset(offset).limit(limit).all()

        print(f"[GET /api/users] Found {len(users)} users on page {page}")

        # Convert to response format
        user_list = [
            UserResponse(
                id=str(user.id),  # Convert to string for frontend
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                department=user.department or "",
                phone_number=user.phone_number,
                acc_role=user.acc_role,
                approved_acc_role=user.approved_acc_role
            )
            for user in users
        ]

        response = UsersListResponse(
            users=user_list,
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

        print(f"[GET /api/users] Returning {len(user_list)} users")
        return response

    except Exception as e:
        print(f"[GET /api/users] Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )
```

---

## Database Model

Make sure your model matches this structure:

```python
# app/models.py (or your models file)

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class Users(Base):
    __tablename__ = "users"  # or "account_requests" if that's your table name

    id = Column(Integer, primary_key=True, index=True)
    # OR if using UUID:
    # id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    email = Column(String, unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    department = Column(String)
    phone_number = Column(String)
    acc_role = Column(String, nullable=False)
    approved_acc_role = Column(String)
    status = Column(String)
    is_employee = Column(Boolean, default=False)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Check Your Current Table

Based on your screenshot, you have a `users` table. Let's verify the structure:

```sql
-- Run this in pgAdmin to check your table structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check current data
SELECT
    id,
    email,
    first_name,
    last_name,
    department,
    acc_role,
    approved_acc_role
FROM users
ORDER BY id;
```

---

## Testing the Endpoint

### 1. Test with curl:

```bash
# Get your auth token first
TOKEN="your_jwt_token_here"

# Test the endpoint
curl -X GET "http://localhost:8000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response:

```json
{
  "users": [
    {
      "id": "2",
      "first_name": "Jetross",
      "last_name": "Neri",
      "email": "jetrossneri87@gmail.com",
      "department": "BSIT",
      "phone_number": "09705872379",
      "acc_role": "Super Admin",
      "approved_acc_role": null
    }
  ],
  "total_count": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

### 2. Test in browser:

Open your browser console and check the Network tab:

- URL: `http://localhost:8000/api/users?page=1&limit=10&exclude_user_id=1`
- Method: GET
- Status: Should be 200
- Response: Should have 1 user (id:2)

---

## Common Issues & Solutions

### Issue 1: Table name mismatch

**Problem:** Your code uses `account_requests` but your table is `users`  
**Solution:** Update your model's `__tablename__` to match your actual table

```python
class Users(Base):
    __tablename__ = "users"  # Make sure this matches your actual table name
```

### Issue 2: ID type mismatch

**Problem:** Database uses integer but frontend expects string  
**Solution:** Convert to string in response

```python
id=str(user.id)  # Always convert to string
```

### Issue 3: Current user extraction failing

**Problem:** `get_current_user()` dependency not working  
**Solution:** Check your JWT token extraction

```python
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")  # or however you store user_id in JWT

        user = db.query(Users).filter(Users.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Issue 4: CORS issues

**Problem:** Browser blocks the request  
**Solution:** Add CORS middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Debugging Checklist

If users still don't show:

- [ ] Is the FastAPI server running? Check `http://localhost:8000/docs`
- [ ] Is the `/api/users` endpoint registered? Check the interactive docs
- [ ] Does the endpoint show in FastAPI docs? Try it there first
- [ ] Is the JWT token valid? Check token in browser localStorage
- [ ] Is `get_current_user()` working? Add print statements
- [ ] Is the table name correct? Verify with `SELECT * FROM users`
- [ ] Are there actually 2 users in the database? Run the SELECT query
- [ ] Is the query excluding the right user? Check the print statements
- [ ] Check FastAPI server logs for errors
- [ ] Check browser console for errors
- [ ] Check Network tab for the actual request/response

---

## Quick Test Script

Save this as `test_users_endpoint.py`:

```python
import requests

# Update these
API_URL = "http://localhost:8000"
TOKEN = "your_jwt_token_here"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

response = requests.get(f"{API_URL}/api/users?page=1&limit=10", headers=headers)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    data = response.json()
    print(f"\n✅ Success!")
    print(f"Total users (excluding current): {data['total_count']}")
    print(f"Users returned: {len(data['users'])}")
    for user in data['users']:
        print(f"  - {user['first_name']} {user['last_name']} (ID: {user['id']})")
else:
    print(f"\n❌ Error: {response.text}")
```

Run with: `python test_users_endpoint.py`

---

## Expected Behavior

**Given:**

- User with id=1 is logged in (jetrossganilato@gmail.com)
- Database has 2 users (id=1 and id=2)

**Expected Result:**

```
Total users: 1
Users shown:
  - Jetross Neri (id=2)
```

**Not shown:**

- Jetross Axle Galinato (id=1) - current user, should be excluded

---

## Register the Router

Don't forget to register the router in your main app:

```python
# app/main.py

from fastapi import FastAPI
from app.routers import users

app = FastAPI()

app.include_router(users.router)  # Register the users router
```

---

## Summary

1. ✅ Create `/api/users` endpoint in FastAPI
2. ✅ Exclude current user from results (current_user.id)
3. ✅ Return proper JSON format with pagination
4. ✅ Convert IDs to strings for frontend compatibility
5. ✅ Add proper error handling and logging
6. ✅ Test with curl or browser
7. ✅ Verify data appears in frontend

Your frontend is **already correct** and waiting for this backend endpoint! 🚀
