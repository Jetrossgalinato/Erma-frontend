# Supplies API Endpoints - Backend Implementation Guide

This document provides comprehensive specifications for implementing the FastAPI endpoints required by the supplies acquiring feature.

---

## **1. GET /api/supplies - Fetch All Supplies**

**Endpoint:** `GET /api/supplies`

**Description:** Retrieve all supplies with their current stock levels and facility information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Schema (200 OK):**

```json
{
  "supplies": [
    {
      "supply_id": 1,
      "supply_name": "Whiteboard Markers",
      "description": "Dry-erase markers for whiteboards, assorted colors",
      "category": "Office Supplies",
      "quantity": 50,
      "stocking_point": 20,
      "stock_unit": "pieces",
      "facility_id": 1,
      "facility_name": "CL1",
      "remarks": "Refill monthly",
      "image_url": "https://example.com/supplies/markers.jpg"
    }
  ]
}
```

**Response Fields:**

- `supply_id` (integer): Primary key
- `supply_name` (string): Name of the supply
- `description` (string, optional): Supply description
- `category` (string): Supply category (Office Supplies, Cleaning Materials, etc.)
- `quantity` (integer): Current stock quantity
- `stocking_point` (integer): Minimum stock level threshold
- `stock_unit` (string): Unit of measurement (pieces, boxes, reams, etc.)
- `facility_id` (integer): ID of the facility where supply is stored
- `facility_name` (string): Name of the facility
- `remarks` (string, optional): Additional notes
- `image_url` (string, optional): URL to supply image

**Database Requirements:**

- Table: `supplies`
- Columns: `supply_id`, `supply_name`, `description`, `category`, `quantity`, `stocking_point`, `stock_unit`, `facility_id`, `remarks`, `image_url`
- Join with `facilities` table to get `facility_name`

**Error Responses:**

- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database connection error

---

## **2. POST /api/acquiring - Create Supply Acquire Request**

**Endpoint:** `POST /api/acquiring`

**Description:** Create a new supply acquire request. This endpoint requires authentication.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body Schema:**

```json
{
  "acquirers_id": 1,
  "supply_id": 5,
  "quantity": 10,
  "purpose": "Laboratory experiment supplies for next semester"
}
```

**Request Fields:**

- `acquirers_id` (integer, required): User's account_requests ID from the database
- `supply_id` (integer, required): ID of the supply to acquire
- `quantity` (integer, required): Quantity to acquire (must be > 0)
- `purpose` (string, optional): Reason for acquiring the supply

**Validation Rules:**

1. All required fields must be present
2. `quantity` must be greater than 0
3. `quantity` must not exceed available stock (supplies.quantity)
4. `supply_id` must exist in `supplies` table
5. `acquirers_id` must exist in `account_requests` table
6. JWT token must be valid and match the `acquirers_id`

**Response Schema (201 Created):**

```json
{
  "message": "Acquire request submitted successfully",
  "request_id": 123,
  "status": "Pending"
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors (missing fields, invalid quantity, insufficient stock, etc.)
  ```json
  {
    "detail": "Requested quantity exceeds available stock"
  }
  ```
- `401 Unauthorized`: Invalid or missing JWT token
  ```json
  {
    "detail": "Invalid authentication credentials"
  }
  ```
- `404 Not Found`: Supply or acquirers_id not found
  ```json
  {
    "detail": "Supply not found"
  }
  ```
- `500 Internal Server Error`: Database error

**Database Requirements:**

- Table: `acquiring`
- Insert new row with:
  - `acquirers_id` (foreign key to account_requests table)
  - `supply_id` (foreign key to supplies table)
  - `quantity` (integer)
  - `purpose` (text, nullable)
  - `status` (default: "Pending")
  - `created_at` (timestamp, auto-generated)
  - `updated_at` (timestamp, auto-generated)

---

## **3. GET /api/users/{user_id}/account - Get User's Account Request ID**

**Endpoint:** `GET /api/users/{user_id}/account`

**Description:** Retrieve the user's account_requests ID (acquirers_id) needed for creating acquire requests.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**

- `user_id` (integer): The ID of the user

**Response Schema (200 OK):**

```json
{
  "account_request_id": 1,
  "user_id": 1,
  "email": "dean@example.com",
  "full_name": "John Doe"
}
```

**Response Fields:**

- `account_request_id` (integer): The acquirers_id to use in acquire requests
- `user_id` (integer): User's ID
- `email` (string): User's email address
- `full_name` (string): User's full name

**Database Requirements:**

- Join `users` and `account_requests` tables or retrieve from user profile
- Return the `account_requests.id` associated with the user

**Error Responses:**

- `401 Unauthorized`: Invalid JWT token
- `404 Not Found`: User has no account_requests entry
  ```json
  {
    "detail": "User account request not found"
  }
  ```
- `500 Internal Server Error`: Database error

---

## **4. GET /api/auth/verify - Verify JWT Token**

**Endpoint:** `GET /api/auth/verify`

**Description:** Verify the validity of a JWT token and return user information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Schema (200 OK):**

```json
{
  "user_id": 1,
  "email": "dean@example.com",
  "role": "CCIS Dean",
  "is_active": true
}
```

**Response Fields:**

- `user_id` (integer): User's ID
- `email` (string): User's email address
- `role` (string): User's role in the system
- `is_active` (boolean): Account status

**Error Responses:**

- `401 Unauthorized`: Invalid, expired, or missing JWT token
  ```json
  {
    "detail": "Could not validate credentials"
  }
  ```

---

## **Database Schema Summary**

### **supplies table:**

```sql
CREATE TABLE supplies (
    supply_id SERIAL PRIMARY KEY,
    supply_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    stocking_point INTEGER NOT NULL DEFAULT 0,
    stock_unit VARCHAR(50) NOT NULL,
    facility_id INTEGER REFERENCES facilities(facility_id),
    remarks TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **acquiring table (for supply requests):**

```sql
CREATE TABLE acquiring (
    id SERIAL PRIMARY KEY,
    acquirers_id INTEGER REFERENCES account_requests(id),
    supply_id INTEGER REFERENCES supplies(supply_id),
    quantity INTEGER NOT NULL,
    purpose TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Implementation Notes**

### **1. Stock Validation for POST /api/acquiring:**

- Before creating acquire request, check current stock: `SELECT quantity FROM supplies WHERE supply_id = {supply_id}`
- Validate: `requested_quantity <= available_quantity`
- If validation fails, return 400 Bad Request with appropriate error message

### **2. Authentication:**

- All endpoints require JWT authentication
- Extract user_id from JWT token and validate against database
- Ensure user making the request matches the `acquirers_id` in POST /api/acquiring

### **3. Low Stock Detection:**

- Frontend uses `stocking_point` to display low stock warnings
- Backend should optionally implement notifications when quantity <= stocking_point after acquire request approval

### **4. Error Handling:**

- Return appropriate HTTP status codes
- Include descriptive error messages
- Log errors for debugging

### **5. CORS Configuration:**

- Allow requests from frontend origin: `http://localhost:3000`
- Include credentials in CORS configuration

---

## **Testing Checklist**

- [ ] GET /api/supplies returns all supplies with facility names
- [ ] GET /api/supplies includes supplies from all categories
- [ ] POST /api/acquiring creates a new acquire request successfully
- [ ] POST /api/acquiring validates all required fields
- [ ] POST /api/acquiring rejects quantity > available stock
- [ ] POST /api/acquiring rejects quantity <= 0
- [ ] POST /api/acquiring requires valid JWT token
- [ ] GET /api/users/{user_id}/account returns correct acquirers_id
- [ ] GET /api/auth/verify validates JWT tokens correctly
- [ ] All endpoints return proper error responses for invalid inputs

---

## **Example Frontend Usage**

```typescript
// Fetch all supplies
const supplies = await fetchSuppliesList();

// Check user authentication
const isAuth = await checkUserAuthentication();

// Get user's account ID
const accountId = await getUserAccountId();

// Create an acquire request
const success = await createAcquireRequest(
  5, // supply_id
  10, // quantity
  "Laboratory supplies for next semester" // purpose
);
```

---

## **Additional Considerations**

### **Inventory Management:**

- Consider implementing stock deduction after acquire request approval
- Optionally implement automatic restock notifications when quantity <= stocking_point
- Track acquire request history for audit purposes

### **Security:**

- Validate that acquirers_id matches authenticated user
- Prevent users from acquiring more than available stock
- Implement rate limiting to prevent abuse

### **Performance:**

- Index `facility_id` in supplies table for faster joins
- Index `status` in acquiring table for filtering pending requests
- Consider caching frequently accessed supply data
