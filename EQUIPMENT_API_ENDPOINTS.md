# FastAPI Endpoints Required for Equipment Page

This document lists all the FastAPI backend endpoints needed for the equipment page to function properly.

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

## 1. Auth Verification

**Endpoint:** `GET /api/auth/verify`

**Description:** Verifies the JWT token and returns user information.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "user_id": "string",
  "email": "string",
  "role": "string"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid token"
}
```

---

## 2. Get Equipment List

**Endpoint:** `GET /api/equipment`

**Description:** Retrieves all equipment with facility names and availability status based on active borrowing records.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "name": "Desktop Computer",
    "po_number": "PO-2024-001",
    "unit_number": "UNIT-001",
    "brand_name": "Dell",
    "description": "High performance desktop",
    "facility": "CL1",
    "facility_id": 1,
    "facility_name": "CL1",
    "category": "Computer",
    "status": "Working",
    "availability": "Available",
    "date_acquire": "2024-01-01",
    "supplier": "Dell Inc.",
    "amount": "50000.00",
    "estimated_life": "5 years",
    "item_number": "ITEM-001",
    "property_number": "PROP-001",
    "control_number": "CTRL-001",
    "serial_number": "SN-12345",
    "person_liable": "John Doe",
    "remarks": "Good condition",
    "updated_at": "2024-01-15T00:00:00Z",
    "image": "https://example.com/image.jpg"
  }
]
```

**Note:** The `availability` field should be:

- `"Available"` if the equipment has no active borrowing (status "Approved" and return_status not "Returned")
- `"Borrowed"` if there is an active borrowing record

**Query Logic:**

```sql
SELECT e.*, f.name as facility_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM borrowing b
      WHERE b.borrowed_item = e.id
      AND b.request_status = 'Approved'
      AND (b.return_status IS NULL OR b.return_status != 'Returned')
    )
    THEN 'Borrowed'
    ELSE 'Available'
  END as availability
FROM equipments e
LEFT JOIN facilities f ON e.facility_id = f.id
```

---

## 3. Get User Account

**Endpoint:** `GET /api/users/{user_id}/account`

**Description:** Retrieves user account information including employee status.

**Path Parameters:**

- `user_id` (string): The user's unique identifier

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "id": 1,
  "is_employee": true,
  "user_id": "string",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "department": "IT",
  "role": "Faculty"
}
```

**Response (404 Not Found):**

```json
{
  "detail": "User account not found"
}
```

---

## 4. Create Borrowing Request

**Endpoint:** `POST /api/borrowing`

**Description:** Creates a new borrowing request for equipment.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "borrowed_item": 1,
  "purpose": "For teaching demonstration",
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "return_date": "2024-02-05",
  "request_status": "Pending",
  "availability": "Available",
  "borrowers_id": 123
}
```

**Field Descriptions:**

- `borrowed_item` (integer): Equipment ID being borrowed
- `purpose` (string, required): Reason for borrowing
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format
- `return_date` (string, required): Expected return date in YYYY-MM-DD format
- `request_status` (string): Always "Pending" for new requests
- `availability` (string): Equipment availability status
- `borrowers_id` (integer): Account ID of the borrower

**Response (201 Created):**

```json
{
  "id": 1,
  "borrowed_item": 1,
  "purpose": "For teaching demonstration",
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "return_date": "2024-02-05",
  "request_status": "Pending",
  "availability": "Available",
  "borrowers_id": 123,
  "created_at": "2024-01-20T10:00:00Z"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Invalid request data"
}
```

**Response (404 Not Found):**

```json
{
  "detail": "Equipment not found"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "detail": "Not authorized to access this resource"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

---

## Database Schema Requirements

### equipments table

```sql
CREATE TABLE equipments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR NOT NULL,
  po_number VARCHAR,
  unit_number VARCHAR,
  brand_name VARCHAR,
  description TEXT,
  facility VARCHAR,
  facility_id INTEGER REFERENCES facilities(id),
  category VARCHAR,
  status VARCHAR CHECK (status IN ('Working', 'In Use', 'For Repair')),
  date_acquire DATE,
  supplier VARCHAR,
  amount DECIMAL(10,2),
  estimated_life VARCHAR,
  item_number VARCHAR,
  property_number VARCHAR,
  control_number VARCHAR,
  serial_number VARCHAR,
  person_liable VARCHAR,
  remarks TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  image TEXT
);
```

### facilities table

```sql
CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE
);
```

### borrowing table

```sql
CREATE TABLE borrowing (
  id SERIAL PRIMARY KEY,
  borrowed_item INTEGER REFERENCES equipments(id) ON DELETE CASCADE,
  borrowers_id INTEGER REFERENCES account_requests(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  return_date DATE NOT NULL,
  request_status VARCHAR CHECK (request_status IN ('Pending', 'Approved', 'Rejected')),
  return_status VARCHAR CHECK (return_status IN ('Returned', 'Not Returned', 'Overdue')),
  availability VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

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
  is_employee BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Implementation Notes

1. **Equipment Availability Logic:**

   - Check if equipment has any active borrowing records
   - Active = `request_status = 'Approved'` AND `return_status != 'Returned'`
   - If active borrowing exists: `availability = 'Borrowed'`
   - Otherwise: `availability = 'Available'`

2. **Authorization:**

   - Only employees (`is_employee = true`) can create borrowing requests
   - This check is done on the frontend, but should also be validated on the backend

3. **Borrowing Request Workflow:**

   - User creates request with status "Pending"
   - Admin approves/rejects the request
   - If approved, equipment availability changes to "Borrowed"
   - When returned, `return_status` is set to "Returned"
   - Equipment availability returns to "Available"

4. **Image URLs:**

   - Images should be stored as URLs (can be from cloud storage like Supabase Storage, S3, etc.)
   - Frontend displays images using the URL provided in the `image` field

5. **Error Handling:**
   - All endpoints should return appropriate HTTP status codes
   - Error messages should be descriptive for debugging
   - Frontend handles errors by displaying alerts to users

---

## Testing the Endpoints

You can test these endpoints using tools like:

- **Postman**: Import the endpoints and test with your token
- **curl**: Command-line testing
- **httpie**: User-friendly HTTP client

Example curl request:

```bash
curl -X GET "http://localhost:8000/api/equipment" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

---

## Frontend Integration Complete

The equipment page (`/equipment/page.tsx`) has been successfully refactored to:

- ✅ Remove all Supabase dependencies
- ✅ Use FastAPI endpoints via helper functions
- ✅ Centralize all helper code in `helpers.ts`
- ✅ Reduce code duplication
- ✅ Improve maintainability

**File Statistics:**

- `page.tsx`: 628 lines (reduced from 796 lines)
- `helpers.ts`: 313 lines (comprehensive helper functions and API calls)
- **Total lines saved**: 168 lines through better organization
