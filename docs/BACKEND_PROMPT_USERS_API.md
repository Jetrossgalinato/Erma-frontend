# Backend Prompt: Users API Implementation

## Request for Backend Developer

Please implement the **Users Management API** endpoint with the following specifications:

---

## ⚠️ CRITICAL REQUIREMENT: Always Exclude Current User

**All endpoints that return user counts or user lists MUST exclude the current authenticated user.**

This applies to:

1. `GET /api/users` - User list endpoint (already implemented)
2. `GET /api/sidebar/counts` - Sidebar counts endpoint (**IMPORTANT: Update the `users` count**)

---

## Endpoint: GET /api/users

### Description

Fetch a paginated list of users with optional filtering. **IMPORTANT: Exclude the current authenticated user from the results.**

### Authentication

- Requires JWT Bearer token in Authorization header
- Extract `user_id` from the JWT token to identify the current user

### Query Parameters

| Parameter         | Type    | Required | Description                                                  |
| ----------------- | ------- | -------- | ------------------------------------------------------------ |
| `page`            | integer | Yes      | Current page number (starts at 1)                            |
| `limit`           | integer | Yes      | Number of items per page (default: 10)                       |
| `department`      | string  | No       | Filter by department (case-insensitive partial match)        |
| `role`            | string  | No       | Filter by account role (case-insensitive partial match)      |
| `exclude_user_id` | string  | No       | User ID to exclude from results (typically the current user) |

### Request Example

```http
GET /api/users?page=1&limit=10&department=IT&exclude_user_id=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

```json
{
  "users": [
    {
      "id": "uuid-string",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "department": "IT Department",
      "phone_number": "+1234567890",
      "acc_role": "Employee",
      "approved_acc_role": "Admin"
    },
    {
      "id": "uuid-string",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "department": "HR Department",
      "phone_number": "+0987654321",
      "acc_role": "Admin",
      "approved_acc_role": null
    }
  ],
  "total_count": 45,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

### Response Fields

| Field         | Type    | Description                                    |
| ------------- | ------- | ---------------------------------------------- |
| `users`       | array   | Array of user objects                          |
| `total_count` | integer | Total number of users (excluding current user) |
| `page`        | integer | Current page number                            |
| `limit`       | integer | Items per page                                 |
| `total_pages` | integer | Total number of pages                          |

### User Object Fields

| Field               | Type          | Nullable | Description                                      |
| ------------------- | ------------- | -------- | ------------------------------------------------ |
| `id`                | string (UUID) | No       | User's unique identifier                         |
| `first_name`        | string        | No       | User's first name                                |
| `last_name`         | string        | No       | User's last name                                 |
| `email`             | string        | No       | User's email address                             |
| `department`        | string        | No       | User's department                                |
| `phone_number`      | string        | Yes      | User's phone number                              |
| `acc_role`          | string        | No       | Current account role                             |
| `approved_acc_role` | string        | Yes      | Approved/requested role (null if not applicable) |

### Business Logic

1. **Authentication Check:**

   - Verify JWT token is valid
   - Extract `user_id` from token
   - Return 401 if token is invalid or missing

2. **User Exclusion:**

   - If `exclude_user_id` is provided in query params, exclude that user from results
   - If not provided, check if current authenticated user should still be excluded
   - **Recommendation:** Always exclude the current authenticated user (from JWT token)

3. **Filtering:**

   - If `department` is provided: Filter users where `department` contains the search term (case-insensitive)
   - If `role` is provided: Filter users where `acc_role` or `approved_acc_role` contains the search term (case-insensitive)
   - Both filters can be applied simultaneously (AND condition)

4. **Pagination:**

   - Calculate offset: `(page - 1) * limit`
   - Apply LIMIT and OFFSET to query
   - Count total filtered results (excluding current user)
   - Calculate total_pages: `ceil(total_count / limit)`

5. **Sorting:**
   - Default sort: `first_name ASC, last_name ASC`
   - Secondary sort by `email` if names are identical

### Database Query Example (Pseudo-SQL)

```sql
-- Get current user ID from JWT token
current_user_id = extract_user_id_from_token(jwt_token)

-- Build query with filters
SELECT
    id,
    first_name,
    last_name,
    email,
    department,
    phone_number,
    acc_role,
    approved_acc_role
FROM account_requests
WHERE
    id != :current_user_id  -- Exclude current user
    AND (:department IS NULL OR department ILIKE '%' || :department || '%')
    AND (:role IS NULL OR
         acc_role ILIKE '%' || :role || '%' OR
         approved_acc_role ILIKE '%' || :role || '%')
ORDER BY first_name ASC, last_name ASC, email ASC
LIMIT :limit
OFFSET :offset;

-- Get total count
SELECT COUNT(*)
FROM account_requests
WHERE
    id != :current_user_id
    AND (:department IS NULL OR department ILIKE '%' || :department || '%')
    AND (:role IS NULL OR
         acc_role ILIKE '%' || :role || '%' OR
         approved_acc_role ILIKE '%' || :role || '%');
```

### Error Responses

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to fetch users: [error message]"
}
```

### FastAPI Implementation Example

```python
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import math

router = APIRouter()

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    department: str
    phone_number: Optional[str]
    acc_role: str
    approved_acc_role: Optional[str]

class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total_count: int
    page: int
    limit: int
    total_pages: int

@router.get("/api/users", response_model=UsersListResponse)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    department: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    exclude_user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # Extract from JWT
):
    """
    Get paginated list of users with optional filtering.
    Excludes the current authenticated user.
    """

    # Start with base query
    query = db.query(AccountRequest).filter(
        AccountRequest.id != current_user.id  # Always exclude current user
    )

    # Apply additional exclusion if provided
    if exclude_user_id:
        query = query.filter(AccountRequest.id != exclude_user_id)

    # Apply department filter
    if department:
        query = query.filter(
            AccountRequest.department.ilike(f"%{department}%")
        )

    # Apply role filter (check both acc_role and approved_acc_role)
    if role:
        query = query.filter(
            or_(
                AccountRequest.acc_role.ilike(f"%{role}%"),
                AccountRequest.approved_acc_role.ilike(f"%{role}%")
            )
        )

    # Get total count
    total_count = query.count()

    # Calculate pagination
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    offset = (page - 1) * limit

    # Get paginated results
    users = query.order_by(
        AccountRequest.first_name.asc(),
        AccountRequest.last_name.asc(),
        AccountRequest.email.asc()
    ).offset(offset).limit(limit).all()

    # Convert to response format
    user_list = [
        UserResponse(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            department=user.department,
            phone_number=user.phone_number,
            acc_role=user.acc_role,
            approved_acc_role=user.approved_acc_role
        )
        for user in users
    ]

    return UsersListResponse(
        users=user_list,
        total_count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages
    )
```

---

## Testing Checklist

- [ ] Endpoint returns 401 without valid JWT token
- [ ] Current user is excluded from results
- [ ] Pagination works correctly (page 1, 2, 3, etc.)
- [ ] Department filter works (case-insensitive, partial match)
- [ ] Role filter works (checks both acc_role and approved_acc_role)
- [ ] Combined filters work (department + role)
- [ ] Total count is correct and excludes current user
- [ ] Total pages calculation is correct
- [ ] Empty results return properly (empty array, total_count: 0)
- [ ] Sorting by first_name, last_name works
- [ ] `exclude_user_id` parameter works if provided

---

## Additional Notes

### Why Exclude Current User?

- The Users Management page is for managing **other users**, not the current admin/manager
- Current user can manage their own profile via the Profile page
- Prevents accidental self-deletion or role changes
- Cleaner UI without redundant current user in the list

### Performance Considerations

- Add database indexes on:
  - `first_name` (for sorting)
  - `department` (for filtering)
  - `acc_role` (for filtering)
  - `approved_acc_role` (for filtering)
- Consider caching department/role filter options if dataset is large
- Use database-level pagination (LIMIT/OFFSET) instead of application-level

### Security Considerations

- Always validate JWT token before processing request
- Ensure current user has admin/manager permissions to view user list
- Sanitize filter inputs to prevent SQL injection
- Rate limit this endpoint to prevent abuse

---

## Frontend Implementation (Already Complete)

The frontend is ready and will:

1. Fetch users on page load (excluding current user)
2. Pass `exclude_user_id` with current user's ID from JWT
3. Apply filters via query parameters
4. Handle pagination with smart page number display
5. Display users in a table with edit/delete actions

**Frontend sends:**

```http
GET /api/users?page=1&limit=10&exclude_user_id={current_user_id}
Authorization: Bearer {token}
```

**Frontend expects:**

```json
{
  "users": [...],
  "total_count": 45,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

---

## 🔴 ALSO UPDATE: GET /api/sidebar/counts

### Critical Update Required

The sidebar endpoint also returns a `users` count. This count **MUST also exclude the current authenticated user**.

### Endpoint: GET /api/sidebar/counts

**Current Response:**

```json
{
  "equipments": 150,
  "facilities": 25,
  "supplies": 320,
  "requests": 45,
  "equipment_logs": 45,
  "facility_logs": 32,
  "supply_logs": 28,
  "users": 8 // ⚠️ This should NOT include current user
}
```

### Implementation Example:

```python
@router.get("/api/sidebar/counts")
async def get_sidebar_counts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all sidebar counts. Users count excludes current user."""

    counts = {
        "equipments": db.query(Equipment).count(),
        "facilities": db.query(Facility).count(),
        "supplies": db.query(Supply).count(),
        "requests": (
            db.query(Borrowing).count() +
            db.query(Booking).count() +
            db.query(Acquiring).count()
        ),
        "equipment_logs": db.query(EquipmentLog).count(),
        "facility_logs": db.query(FacilityLog).count(),
        "supply_logs": db.query(SupplyLog).count(),
        # ⚠️ IMPORTANT: Exclude current user from count
        "users": db.query(AccountRequest).filter(
            AccountRequest.id != current_user.id
        ).count()
    }

    return counts
```

### Why This Matters:

1. **Consistency:** Both the sidebar count and the users page should show the same number
2. **Accuracy:** Sidebar shows "8 users" but table shows 7 users (confusing!)
3. **User Experience:** Users expect counts to match what they see in the UI

### Quick Fix:

In your sidebar counts endpoint, change:

```python
# ❌ BEFORE (includes current user)
"users": db.query(AccountRequest).count()

# ✅ AFTER (excludes current user)
"users": db.query(AccountRequest).filter(
    AccountRequest.id != current_user.id
).count()
```
