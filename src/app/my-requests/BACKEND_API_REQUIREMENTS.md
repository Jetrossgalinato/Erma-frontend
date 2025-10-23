# Backend API Requirements for My Requests Page

## Overview

The frontend my-requests page requires the following FastAPI endpoints to be implemented. All authenticated endpoints require a valid JWT token in the Authorization header.

## Authentication

### Header Format

```
Authorization: Bearer {jwt_token}
```

### User Identification

- JWT token should contain `user_id` claim
- Backend should decode token to get user information
- All "my requests" endpoints should filter by the authenticated user's ID

---

## API Endpoints

### 1. Verify Authentication

**Endpoint:** `GET /api/auth/verify`

**Purpose:** Check if the user's JWT token is valid

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**

```json
{
  "authenticated": true,
  "user_id": 123
}
```

**Response (401 Unauthorized):**

```json
{
  "authenticated": false,
  "detail": "Invalid or expired token"
}
```

---

### 2. Get User's Borrowing Requests

**Endpoint:** `GET /api/borrowing/my-requests`

**Purpose:** Fetch paginated list of borrowing requests for the authenticated user

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

- `page` (integer, optional, default: 1) - Page number for pagination

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "status": "Approved",
      "equipment_name": "Laptop Dell XPS 15",
      "quantity": 2,
      "borrow_date": "2024-01-15",
      "expected_return_date": "2024-01-20",
      "purpose": "Project development work",
      "receiver_name": "John Doe"
    },
    {
      "id": 2,
      "status": "Pending",
      "equipment_name": "Projector",
      "quantity": 1,
      "borrow_date": "2024-01-18",
      "expected_return_date": "2024-01-19",
      "purpose": "Presentation",
      "receiver_name": null
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 10,
  "total_pages": 3
}
```

**Notes:**

- Filter borrowing records where `user_id` matches authenticated user
- `status` can be: "Pending", "Approved", or "Rejected"
- `receiver_name` is nullable (only filled when marked as returned)
- Sort by `id` descending (newest first)
- Page size is fixed at 10 items per page

---

### 3. Get User's Booking Requests

**Endpoint:** `GET /api/booking/my-requests`

**Purpose:** Fetch paginated list of booking requests for the authenticated user

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

- `page` (integer, optional, default: 1) - Page number for pagination

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "status": "Approved",
      "facility_name": "Conference Room A",
      "booking_date": "2024-01-20",
      "start_time": "09:00",
      "end_time": "11:00",
      "purpose": "Team meeting"
    },
    {
      "id": 2,
      "status": "Pending",
      "facility_name": "Auditorium",
      "booking_date": "2024-01-25",
      "start_time": "14:00",
      "end_time": "17:00",
      "purpose": "Workshop presentation"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 10,
  "total_pages": 2
}
```

**Notes:**

- Filter booking records where `user_id` matches authenticated user
- `status` can be: "Pending", "Approved", or "Rejected"
- Time format: "HH:MM" (24-hour format)
- Date format: "YYYY-MM-DD"
- Sort by `id` descending (newest first)

---

### 4. Get User's Acquiring Requests

**Endpoint:** `GET /api/acquiring/my-requests`

**Purpose:** Fetch paginated list of acquiring (supply) requests for the authenticated user

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

- `page` (integer, optional, default: 1) - Page number for pagination

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "supply_name": "Printer Paper A4",
      "quantity": 5,
      "request_date": "2024-01-15",
      "status": "Approved",
      "purpose": "Office supplies for Q1"
    },
    {
      "id": 2,
      "supply_name": "Whiteboard Markers",
      "quantity": 10,
      "request_date": "2024-01-18",
      "status": "Pending",
      "purpose": "Conference room supplies"
    }
  ],
  "total": 8,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

**Notes:**

- Filter acquiring records where `user_id` matches authenticated user
- `status` can be: "Pending", "Approved", or "Rejected"
- Sort by `id` descending (newest first)

---

### 5. Mark Borrowing Items as Returned

**Endpoint:** `POST /api/borrowing/mark-returned`

**Purpose:** User notifies admin that borrowed items have been returned

**Headers:**

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "borrowing_ids": [1, 2, 3],
  "receiver_name": "John Doe"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Return notification sent successfully",
  "notified_count": 3
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "receiver_name is required"
}
```

**Response (404 Not Found):**

```json
{
  "detail": "One or more borrowing IDs not found"
}
```

**Notes:**

- Validate that all `borrowing_ids` belong to the authenticated user
- Create notification records for admin to confirm returns
- Don't directly update borrowing status (admin confirms later)
- `receiver_name` is required and must not be empty

---

### 6. Mark Booking as Done

**Endpoint:** `POST /api/booking/mark-done`

**Purpose:** User notifies that booking usage is completed

**Headers:**

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "booking_ids": [1, 2],
  "completion_notes": "Event went well, room was clean"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking completion notification sent",
  "notified_count": 2
}
```

**Notes:**

- Validate that all `booking_ids` belong to the authenticated user
- `completion_notes` is optional
- Create notification records for admin review
- Don't directly update booking status (admin confirms later)

---

### 7. Bulk Delete Borrowing Requests

**Endpoint:** `DELETE /api/borrowing/bulk-delete`

**Purpose:** Delete multiple borrowing requests

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

- `ids` (array of integers, required) - Array of borrowing IDs to delete

**Example:**

```
DELETE /api/borrowing/bulk-delete?ids=1&ids=2&ids=3
```

**Response (200 OK):**

```json
{
  "success": true,
  "deleted_count": 3,
  "message": "Borrowing requests deleted successfully"
}
```

**Response (403 Forbidden):**

```json
{
  "detail": "Cannot delete requests that don't belong to you"
}
```

**Notes:**

- Validate that all IDs belong to the authenticated user
- Only allow deletion of "Pending" or "Rejected" requests
- Don't allow deletion of "Approved" requests that are active

---

### 8. Bulk Delete Booking Requests

**Endpoint:** `DELETE /api/booking/bulk-delete`

**Purpose:** Delete multiple booking requests

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

- `ids` (array of integers, required) - Array of booking IDs to delete

**Example:**

```
DELETE /api/booking/bulk-delete?ids=1&ids=2
```

**Response (200 OK):**

```json
{
  "success": true,
  "deleted_count": 2,
  "message": "Booking requests deleted successfully"
}
```

**Notes:**

- Same validation rules as borrowing deletion
- Validate ownership and status

---

### 9. Bulk Delete Acquiring Requests

**Endpoint:** `DELETE /api/acquiring/bulk-delete`

**Purpose:** Delete multiple acquiring requests

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

- `ids` (array of integers, required) - Array of acquiring IDs to delete

**Example:**

```
DELETE /api/acquiring/bulk-delete?ids=1&ids=2&ids=3
```

**Response (200 OK):**

```json
{
  "success": true,
  "deleted_count": 3,
  "message": "Acquiring requests deleted successfully"
}
```

**Notes:**

- Same validation rules as other deletions
- Validate ownership and status

---

## Data Models

### Database Relationships

**Users/Accounts:**

- User should have a unique ID
- JWT token contains user_id

**Borrowing:**

- Links to User (borrower)
- Links to Equipment
- Has status (Pending/Approved/Rejected)
- Has dates (borrow_date, expected_return_date, date_returned)
- Optional receiver_name (for return notifications)

**Booking:**

- Links to User (booker)
- Links to Facility
- Has status (Pending/Approved/Rejected)
- Has date and time slots
- Has purpose

**Acquiring:**

- Links to User (requester)
- Links to Supply
- Has quantity
- Has status (Pending/Approved/Rejected)
- Has request_date
- Has purpose

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- **200 OK** - Successful operation
- **201 Created** - Successfully created resource
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User doesn't have permission
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation error
- **500 Internal Server Error** - Server error

Error response format:

```json
{
  "detail": "Error message description"
}
```

---

## Authentication Implementation

### JWT Token Structure

The JWT should contain:

```json
{
  "user_id": 123,
  "email": "user@example.com",
  "exp": 1704067200,
  "iat": 1704063600
}
```

### Token Validation

1. Extract token from `Authorization: Bearer {token}` header
2. Verify token signature
3. Check token expiration
4. Extract user_id from token
5. Use user_id to filter user-specific data

---

## Testing Checklist

For each endpoint, test:

- ✅ Valid token returns correct data
- ✅ Invalid/expired token returns 401
- ✅ Missing token returns 401
- ✅ Pagination works correctly
- ✅ User can only see their own data
- ✅ User cannot modify others' data
- ✅ Proper error messages for invalid input
- ✅ Data format matches specification
- ✅ Status codes are correct

---

## Implementation Priority

### Phase 1 (Core Functionality)

1. ✅ Auth verification endpoint
2. ✅ GET borrowing requests
3. ✅ GET booking requests
4. ✅ GET acquiring requests

### Phase 2 (Actions)

5. ✅ Mark as returned (borrowing)
6. ✅ Mark as done (booking)
7. ✅ Bulk delete endpoints

### Phase 3 (Optimization)

8. Add indexes for user_id filtering
9. Optimize pagination queries
10. Add caching if needed

---

## Example Request Flow

### Fetching Borrowing Requests

**1. Frontend gets token from localStorage:**

```javascript
const token = localStorage.getItem("authToken");
```

**2. Frontend makes request:**

```javascript
fetch("http://localhost:8000/api/borrowing/my-requests?page=1", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**3. Backend validates token:**

```python
user_id = decode_jwt_token(token)
```

**4. Backend queries database:**

```python
borrowings = db.query(Borrowing)
  .filter(Borrowing.user_id == user_id)
  .order_by(Borrowing.id.desc())
  .limit(10)
  .offset((page - 1) * 10)
```

**5. Backend returns paginated response**

---

## Security Considerations

1. **Always validate user ownership** - User can only access their own data
2. **Never trust client data** - Validate all inputs
3. **Use parameterized queries** - Prevent SQL injection
4. **Rate limiting** - Prevent abuse
5. **Token expiration** - JWT should expire (recommended: 24 hours)
6. **HTTPS only** - In production, use HTTPS
7. **CORS configuration** - Allow frontend origin only

---

## Database Schema Suggestions

### Borrowing Table

```sql
CREATE TABLE borrowing (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    equipment_id INTEGER REFERENCES equipment(id),
    quantity INTEGER,
    borrow_date DATE,
    expected_return_date DATE,
    date_returned DATE NULL,
    status VARCHAR(20),
    purpose TEXT,
    receiver_name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_borrowing_user ON borrowing(user_id);
CREATE INDEX idx_borrowing_status ON borrowing(status);
```

### Booking Table

```sql
CREATE TABLE booking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    facility_id INTEGER REFERENCES facilities(id),
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    status VARCHAR(20),
    purpose TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_user ON booking(user_id);
CREATE INDEX idx_booking_date ON booking(booking_date);
```

### Acquiring Table

```sql
CREATE TABLE acquiring (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    supply_id INTEGER REFERENCES supplies(id),
    quantity INTEGER,
    request_date DATE,
    status VARCHAR(20),
    purpose TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_acquiring_user ON acquiring(user_id);
```

---

## Contact & Support

If you have questions about these API requirements, please:

1. Check the REFACTORING_SUMMARY.md for frontend implementation details
2. Review the QUICK_REFERENCE.md for component usage
3. Test endpoints using the examples provided above

---

**Status:** Ready for Backend Implementation
**Last Updated:** October 23, 2025
**Frontend Version:** Completed and tested
**Backend Version:** Pending implementation
