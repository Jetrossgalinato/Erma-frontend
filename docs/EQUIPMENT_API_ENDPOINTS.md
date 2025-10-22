# Equipment API Endpoints Documentation

This document describes the FastAPI endpoints used by the dashboard-equipment page.

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

## Required Endpoints for Dashboard Equipment Page

### 1. Get All Equipments

**Endpoint:** `GET /equipments`

**Description:** Fetches all equipments from the database ordered by ID.

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
    "name": "Laptop",
    "po_number": "PO-2024-001",
    "unit_number": "UN-001",
    "brand_name": "Dell",
    "description": "Dell Latitude 5520",
    "category": "Electronics",
    "status": "Active",
    "availability": "Available",
    "date_acquired": "2024-01-15",
    "supplier": "Tech Supplies Inc.",
    "amount": "45000.00",
    "estimated_life": "5 years",
    "item_number": "ITM-001",
    "property_number": "PROP-001",
    "control_number": "CTRL-001",
    "serial_number": "SN-123456789",
    "person_liable": "John Doe",
    "facility_id": 1,
    "remarks": "Good condition",
    "image": "https://storage.example.com/equipment-images/laptop.jpg",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T08:00:00Z"
  }
]
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

---

### 2. Get All Facilities

**Endpoint:** `GET /facilities`

**Description:** Fetches all facilities ordered by name for the facility filter dropdown.

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
    "name": "Main Building"
  },
  {
    "id": 2,
    "name": "Laboratory"
  }
]
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

---

### 3. Create Equipment

**Endpoint:** `POST /equipments`

**Description:** Creates a new equipment record.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Projector",
  "po_number": "PO-2024-002",
  "unit_number": "UN-002",
  "brand_name": "Epson",
  "description": "Epson EB-X05",
  "category": "Electronics",
  "status": "Active",
  "availability": "Available",
  "date_acquired": "2024-02-01",
  "supplier": "Epson Philippines",
  "amount": "25000.00",
  "estimated_life": "3 years",
  "item_number": "ITM-002",
  "property_number": "PROP-002",
  "control_number": "CTRL-002",
  "serial_number": "SN-987654321",
  "person_liable": "Jane Smith",
  "facility_id": 1,
  "remarks": "Brand new",
  "image": "https://storage.example.com/equipment-images/projector.jpg"
}
```

**Field Descriptions:**

- `name` (string, **required**): Equipment name
- `po_number` (string, optional): Purchase order number
- `unit_number` (string, optional): Unit identification number
- `brand_name` (string, optional): Brand or manufacturer name
- `description` (string, optional): Detailed description
- `category` (string, optional): Equipment category
- `status` (string, optional): Equipment status
- `availability` (string, optional): Availability status
- `date_acquired` (string, optional): Date acquired in YYYY-MM-DD format
- `supplier` (string, optional): Supplier name
- `amount` (string, optional): Purchase amount
- `estimated_life` (string, optional): Estimated lifespan
- `item_number` (string, optional): Item number
- `property_number` (string, optional): Property number
- `control_number` (string, optional): Control number
- `serial_number` (string, optional): Serial number
- `person_liable` (string, optional): Person responsible
- `facility_id` (integer, optional): Facility ID reference
- `remarks` (string, optional): Additional notes
- `image` (string, optional): Image URL

**Response (201 Created):**

```json
{
  "id": 2,
  "name": "Projector",
  "po_number": "PO-2024-002",
  "brand_name": "Epson",
  "category": "Electronics",
  "facility_id": 1,
  "image": "https://storage.example.com/equipment-images/projector.jpg",
  "created_at": "2024-10-22T10:30:00Z",
  "updated_at": "2024-10-22T10:30:00Z"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Equipment name is required"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

---

### 4. Update Equipment

**Endpoint:** `PUT /equipments/{id}`

**Description:** Updates an existing equipment record.

**Path Parameters:**

- `id` (integer): Equipment ID

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Updated Projector",
  "status": "Under Maintenance",
  "remarks": "Requires bulb replacement",
  "amount": "25500.00"
}
```

**Note:** Only send the fields you want to update. All fields are optional except the equipment must exist.

**Response (200 OK):**

```json
{
  "id": 2,
  "name": "Updated Projector",
  "status": "Under Maintenance",
  "remarks": "Requires bulb replacement",
  "amount": "25500.00",
  "updated_at": "2024-10-22T11:00:00Z"
}
```

**Response (404 Not Found):**

```json
{
  "detail": "Equipment not found"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

---

### 5. Delete Equipments (Bulk)

**Endpoint:** `DELETE /equipments/bulk-delete`

**Description:** Deletes multiple equipment records by their IDs.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "ids": [1, 2, 3]
}
```

**Field Descriptions:**

- `ids` (array of integers, **required**): Array of equipment IDs to delete

**Response (200 OK):**

```json
{
  "message": "Successfully deleted 3 equipments",
  "deleted_count": 3
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "No equipment IDs provided"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

---

### 6. Upload Equipment Image

**Endpoint:** `POST /equipments/upload-image`

**Description:** Uploads an equipment image to storage and returns the public URL.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:** Multipart form data

- `file` (file, **required**): Image file (PNG, JPG, or JPEG)

**File Requirements:**

- Supported formats: PNG, JPG, JPEG
- Maximum file size: 5MB
- File will be renamed with timestamp and random string for uniqueness

**Response (200 OK):**

```json
{
  "image_url": "https://storage.example.com/equipment-images/1729598400-abc123.jpg",
  "filename": "1729598400-abc123.jpg"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Invalid file format. Only PNG, JPG, and JPEG are allowed"
}
```

**Response (413 Payload Too Large):**

```json
{
  "detail": "File size exceeds 5MB limit"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

**Implementation Notes:**

- Image should be stored in a persistent storage (e.g., local filesystem, S3, Azure Blob)
- Return the publicly accessible URL
- Filename format: `{timestamp}-{random_string}.{extension}`

---

### 7. Bulk Import Equipments

**Endpoint:** `POST /equipments/bulk-import`

**Description:** Imports multiple equipment records from CSV data.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "equipments": [
    {
      "name": "Equipment 1",
      "category": "Electronics",
      "brand_name": "Brand A",
      "facility_id": 1
    },
    {
      "name": "Equipment 2",
      "category": "Furniture",
      "brand_name": "Brand B",
      "facility_id": 2
    }
  ]
}
```

**Field Descriptions:**

- `equipments` (array, **required**): Array of equipment objects
  - Each object follows the same structure as the Create Equipment endpoint
  - Only `name` is required for each equipment

**Response (200 OK):**

```json
{
  "imported": 2,
  "failed": 0,
  "total": 2,
  "message": "Successfully imported 2 equipments"
}
```

**Response (207 Multi-Status):** (Partial success)

```json
{
  "imported": 1,
  "failed": 1,
  "total": 2,
  "message": "Imported 1 equipments, 1 failed",
  "errors": [
    {
      "index": 1,
      "error": "Equipment name is required"
    }
  ]
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "No equipments provided"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

**Implementation Notes:**

- Validate each equipment before importing
- Continue importing even if some records fail
- Return detailed error information for failed records
- All records should have `created_at` and `updated_at` timestamps

---

### 8. Log Equipment Action

**Endpoint:** `POST /equipment-logs`

**Description:** Logs equipment-related actions for audit trail.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "action": "added",
  "equipment_name": "Laptop",
  "details": "Added new Dell Latitude 5520"
}
```

**Field Descriptions:**

- `action` (string, **required**): Action performed (e.g., "added", "updated", "deleted", "imported")
- `equipment_name` (string, optional): Name of the equipment affected
- `details` (string, optional): Additional details about the action

**Common Actions:**

- `added` - Equipment created
- `updated` - Equipment modified
- `deleted` - Equipment removed
- `imported` - Bulk import performed

**Response (201 Created):**

```json
{
  "id": 1,
  "log_message": "John Doe added equipment: Laptop - Added new Dell Latitude 5520",
  "action": "added",
  "equipment_name": "Laptop",
  "details": "Added new Dell Latitude 5520",
  "user_email": "john.doe@example.com",
  "created_at": "2024-10-22T10:00:00Z"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Action is required"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

**Implementation Notes:**

- Extract user information from the JWT token
- Automatically construct `log_message` from user, action, equipment_name, and details
- Format: `{user_name} {action} equipment: {equipment_name} - {details}`
- Or if no equipment_name: `{user_name} {action} - {details}`

---

## Additional Endpoints (Optional - For Equipment Page)

### 9. Auth Verification

**Endpoint:** `GET /api/auth/verify`

**Description:** Verifies the JWT token and returns user information. (This is used by the equipment borrowing page, not dashboard-equipment)

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

### 10. Get Equipment List (For Borrowing Page)

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

### 11. Get User Account (For Borrowing Page)

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

### 12. Create Borrowing Request (For Borrowing Page)

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
  name VARCHAR(255) NOT NULL,
  po_number VARCHAR(100),
  unit_number VARCHAR(100),
  brand_name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50),
  availability VARCHAR(50),
  date_acquired DATE,
  supplier VARCHAR(255),
  amount DECIMAL(10, 2),
  estimated_life VARCHAR(50),
  item_number VARCHAR(100),
  property_number VARCHAR(100),
  control_number VARCHAR(100),
  serial_number VARCHAR(100),
  person_liable VARCHAR(255),
  facility_id INTEGER REFERENCES facilities(id),
  remarks TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### facilities table

```sql
CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### equipment_logs table

```sql
CREATE TABLE equipment_logs (
  id SERIAL PRIMARY KEY,
  log_message TEXT NOT NULL,
  action VARCHAR(50),
  equipment_name VARCHAR(255),
  details TEXT,
  user_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Implementation Notes for Backend

### 1. Equipment CRUD Operations

**Create Equipment:**

- Validate that `name` field is required
- Set `created_at` and `updated_at` to current timestamp
- Return the created equipment with all fields

**Update Equipment:**

- Only update fields that are provided in the request
- Always update `updated_at` to current timestamp
- Return the updated equipment

**Delete Equipment:**

- Support bulk delete by accepting array of IDs
- Use database transaction for atomicity
- Return count of deleted records

### 2. Image Upload

**Storage Options:**

- Local filesystem: Store in `/uploads/equipment-images/`
- Cloud storage: AWS S3, Azure Blob, Google Cloud Storage
- Return public URL that frontend can access

**File Handling:**

- Generate unique filename: `{timestamp}-{random}.{extension}`
- Validate file type (PNG, JPG, JPEG only)
- Validate file size (max 5MB)
- Store file and return URL

### 3. Bulk Import

**Processing:**

- Validate each equipment record
- Continue processing even if some fail
- Use database transaction for batch insert
- Return detailed results with success/failure counts

**Validation:**

- Each equipment must have `name` field
- Validate `facility_id` exists if provided
- Set timestamps for all records

### 4. Equipment Logs

**Auto-populate:**

- Extract user info from JWT token (email, name)
- Construct `log_message` automatically:
  - With equipment: `{user} {action} equipment: {name} - {details}`
  - Without equipment: `{user} {action} - {details}`
- Store action, equipment_name, details separately for querying

### 5. Authentication

**JWT Token:**

- Validate Bearer token on all endpoints
- Extract user information from token payload
- Return 401 if token is invalid or expired

**Token Payload Should Include:**

```json
{
  "user_id": "string",
  "email": "string",
  "role": "string",
  "exp": 1234567890
}
```

### 6. Error Handling

**Return appropriate HTTP status codes:**

- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found (resource doesn't exist)
- 413: Payload Too Large (file size exceeded)
- 500: Internal Server Error

**Error Response Format:**

```json
{
  "detail": "Error message here"
}
```

### 7. CORS Configuration

Allow frontend origin:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing the Endpoints

You can test these endpoints using tools like:

- **Postman**: Import the endpoints and test with your token
- **curl**: Command-line testing
- **httpie**: User-friendly HTTP client

### Example curl requests:

**Get all equipments:**

```bash
curl -X GET "http://localhost:8000/equipments" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

**Create equipment:**

```bash
curl -X POST "http://localhost:8000/equipments" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "category": "Electronics",
    "brand_name": "Dell"
  }'
```

**Upload image:**

```bash
curl -X POST "http://localhost:8000/equipments/upload-image" \
  -H "Authorization: Bearer your_token_here" \
  -F "file=@/path/to/image.jpg"
```

**Bulk delete:**

```bash
curl -X DELETE "http://localhost:8000/equipments/bulk-delete" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [1, 2, 3]
  }'
```

---

## Frontend Integration Summary

### Dashboard Equipment Page Migration Complete

The dashboard-equipment page (`/dashboard-equipment/page.tsx`) has been successfully refactored to:

- ✅ Remove all Supabase dependencies
- ✅ Use Zustand authStore for authentication
- ✅ Use FastAPI endpoints via helper functions
- ✅ Centralize all API calls in `utils/helpers.ts`
- ✅ Add comprehensive error handling
- ✅ Add loading states for all operations
- ✅ Support all CRUD operations through FastAPI

### Required Backend Endpoints Summary

**8 Required Endpoints:**

1. `GET /equipments` - Fetch all equipments
2. `GET /facilities` - Fetch all facilities
3. `POST /equipments` - Create equipment
4. `PUT /equipments/{id}` - Update equipment
5. `DELETE /equipments/bulk-delete` - Delete multiple equipments
6. `POST /equipments/upload-image` - Upload equipment image
7. `POST /equipments/bulk-import` - Bulk import equipments
8. `POST /equipment-logs` - Log equipment actions

**File Statistics:**

- `page.tsx`: Fully migrated to FastAPI with authStore
- `utils/helpers.ts`: 8 API functions + helper utilities
- All TypeScript errors resolved ✅

---

## CSV Import Format

The CSV file should have the following headers (case-insensitive):

```
name, category, po_number, unit_number, brand_name, description, status, availability, date_acquired, supplier, amount, estimated_life, item_number, property_number, control_number, serial_number, person_liable, facility_id, remarks
```

**Example CSV:**

```csv
name,category,brand_name,facility_id
"Dell Laptop","Electronics","Dell",1
"Office Chair","Furniture","Herman Miller",2
"Epson Projector","Electronics","Epson",1
```

**Supported header variations:**

- `name` / `equipment name`
- `po_number` / `po number` / `ponumber`
- `unit_number` / `unit number` / `unitnumber`
- `brand_name` / `brand name` / `brand`
- `date_acquired` / `date acquired` / `dateacquired`
- `estimated_life` / `estimated life` / `estimatedlife`
- `item_number` / `item number` / `itemnumber`
- `property_number` / `property number` / `propertynumber`
- `control_number` / `control number` / `controlnumber`
- `serial_number` / `serial number` / `serialnumber`
- `person_liable` / `person liable` / `personliable`
- `facility_id` / `facility id` / `facilityid`
- `remarks` / `notes`

---

## Notes for Equipment Borrowing Page (Separate from Dashboard)

The following endpoints (9-12) are used by the equipment borrowing page (`/equipment/page.tsx`), which is separate from the dashboard-equipment management page:

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

### Borrowing Page Implementation Notes

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
