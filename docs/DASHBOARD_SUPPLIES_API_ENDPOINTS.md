# Dashboard Supplies API Endpoints

This document outlines the FastAPI endpoints required for the Dashboard Supplies management page.

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. GET /api/supplies

**Purpose:** Fetch all supplies with full details

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Whiteboard Marker",
    "category": "Office Supplies",
    "quantity": 50,
    "stocking_point": 20,
    "stock_unit": "pieces",
    "description": "Black permanent marker for whiteboards",
    "image": "https://example.com/images/marker.jpg",
    "remarks": "Refill when low",
    "facilities": {
      "id": 1,
      "name": "Main Building"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
]
```

**Error Response (401 Unauthorized):**

```json
{
  "detail": "Not authenticated"
}
```

---

### 2. GET /api/facilities

**Purpose:** Fetch all available facilities

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <token>
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
    "name": "Science Laboratory"
  },
  {
    "id": 3,
    "name": "Library"
  }
]
```

---

### 3. POST /api/supplies

**Purpose:** Create a new supply item

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Whiteboard Marker",
  "category": "Office Supplies",
  "quantity": 50,
  "stocking_point": 20,
  "stock_unit": "pieces",
  "facility_id": 1,
  "description": "Black permanent marker for whiteboards",
  "image": "https://example.com/images/marker.jpg",
  "remarks": "Refill when low"
}
```

**Required Fields:**

- `name` (string)
- `category` (string)
- `stock_unit` (string)

**Optional Fields:**

- `quantity` (number, default: 0)
- `stocking_point` (number, default: 0)
- `facility_id` (number, nullable)
- `description` (string, nullable)
- `image` (string, nullable - URL)
- `remarks` (string, nullable)

**Response (201 Created):**

```json
{
  "id": 15,
  "name": "Whiteboard Marker",
  "category": "Office Supplies",
  "quantity": 50,
  "stocking_point": 20,
  "stock_unit": "pieces",
  "description": "Black permanent marker for whiteboards",
  "image": "https://example.com/images/marker.jpg",
  "remarks": "Refill when low",
  "facilities": {
    "id": 1,
    "name": "Main Building"
  },
  "created_at": "2024-01-22T09:15:00Z",
  "updated_at": "2024-01-22T09:15:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "Name, category, and stock_unit are required"
}
```

---

### 4. PUT /api/supplies/{supply_id}

**Purpose:** Update an existing supply item

**Authentication:** Required

**URL Parameters:**

- `supply_id` (integer) - The ID of the supply to update

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "name": "Whiteboard Marker - Blue",
  "category": "Office Supplies",
  "quantity": 75,
  "stocking_point": 25,
  "stock_unit": "pieces",
  "facility_id": 2,
  "description": "Blue permanent marker for whiteboards",
  "image": "https://example.com/images/blue-marker.jpg",
  "remarks": "Updated stock"
}
```

**Response (200 OK):**

```json
{
  "id": 15,
  "name": "Whiteboard Marker - Blue",
  "category": "Office Supplies",
  "quantity": 75,
  "stocking_point": 25,
  "stock_unit": "pieces",
  "description": "Blue permanent marker for whiteboards",
  "image": "https://example.com/images/blue-marker.jpg",
  "remarks": "Updated stock",
  "facilities": {
    "id": 2,
    "name": "Science Laboratory"
  },
  "created_at": "2024-01-22T09:15:00Z",
  "updated_at": "2024-01-22T10:30:00Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "detail": "Supply not found"
}
```

---

### 5. DELETE /api/supplies

**Purpose:** Delete multiple supply items

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "supply_ids": [1, 5, 12, 18]
}
```

**Response (200 OK):**

```json
{
  "deleted": 4,
  "message": "Successfully deleted 4 supplies"
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "supply_ids must be a non-empty array"
}
```

**Error Response (404 Not Found):**

```json
{
  "deleted": 2,
  "message": "Deleted 2 supplies, 2 not found"
}
```

---

### 6. POST /api/supplies/bulk-import

**Purpose:** Import multiple supplies from CSV data

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "supplies": [
    {
      "name": "Pencil",
      "category": "Office Supplies",
      "quantity": 100,
      "stocking_point": 30,
      "stock_unit": "pieces",
      "facility_id": 1,
      "description": "HB Pencil",
      "remarks": "For general use"
    },
    {
      "name": "Eraser",
      "category": "Office Supplies",
      "quantity": 50,
      "stocking_point": 20,
      "stock_unit": "pieces",
      "facility_id": 1,
      "description": "White eraser",
      "remarks": null
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "imported": 2,
  "failed": 0,
  "message": "Successfully imported 2 supplies"
}
```

**Partial Success Response (200 OK):**

```json
{
  "imported": 1,
  "failed": 1,
  "message": "Imported 1 supplies, 1 failed"
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "supplies must be a non-empty array"
}
```

---

### 7. POST /api/supplies/log-action

**Purpose:** Log supply management actions (create, update, delete)

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "action": "create",
  "supply_id": 15,
  "details": "Created new supply: Whiteboard Marker"
}
```

**Action Types:**

- `"create"` - Supply was created
- `"update"` - Supply was updated
- `"delete"` - Supply was deleted

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Action logged successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "Invalid action type. Must be 'create', 'update', or 'delete'"
}
```

---

## CSV Import Format

When using the bulk import feature, the CSV file should have the following columns:

```csv
name,category,quantity,stocking_point,stock_unit,facility_id,description,remarks
Pencil,Office Supplies,100,30,pieces,1,HB Pencil,For general use
Eraser,Office Supplies,50,20,pieces,1,White eraser,
Notebook,Office Supplies,75,25,pieces,2,50 pages,Standard size
```

**Required CSV Columns:**

- name
- category
- stock_unit

**Optional CSV Columns:**

- quantity (default: 0)
- stocking_point (default: 0)
- facility_id (nullable)
- description (nullable)
- remarks (nullable)

---

## Error Handling

All endpoints follow consistent error response format:

**Validation Error (422 Unprocessable Entity):**

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Server Error (500 Internal Server Error):**

```json
{
  "detail": "Internal server error"
}
```

---

## CORS Configuration

The backend should allow requests from:

```
http://localhost:3000
```

---

## Notes

1. **Image Handling:** Currently, the `image` field accepts URLs as strings. Future implementation may include file upload endpoints.

2. **Facility Relationship:** When `facility_id` is provided, the response includes the full facility object in the `facilities` field.

3. **Stock Status:** The frontend calculates stock status (In Stock, Low Stock, Out of Stock) based on `quantity` and `stocking_point` values.

4. **Timestamps:** All timestamps should be in ISO 8601 format (UTC).

5. **Pagination:** Not implemented yet. All supplies are returned in a single request. Consider adding pagination for large datasets.

6. **Filtering/Search:** Filtering and searching are handled on the frontend. Consider adding query parameters for server-side filtering.
