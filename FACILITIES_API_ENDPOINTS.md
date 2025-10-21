# Facilities API Endpoints - Backend Implementation Guide

This document provides comprehensive specifications for implementing the FastAPI endpoints required by the facilities booking feature.

---

## **1. GET /api/facilities - Fetch All Facilities**

**Endpoint:** `GET /api/facilities`

**Description:** Retrieve all facilities with their current status and details.

**Headers:**

- No authentication required (public endpoint)

**Response Schema (200 OK):**

```json
[
  {
    "facility_id": 1,
    "facility_name": "Computer Laboratory 1",
    "facility_type": "Laboratory",
    "floor_level": "Ground Floor",
    "capacity": 40,
    "description": "Main computer laboratory with 40 workstations",
    "status": "Available",
    "image_url": "https://example.com/facilities/lab1.jpg"
  }
]
```

**Response Fields:**

- `facility_id` (integer): Primary key
- `facility_name` (string): Name of the facility
- `facility_type` (string): Type of facility (Laboratory, Classroom, Conference Room, etc.)
- `floor_level` (string): Floor location (Ground Floor, 2nd Floor, 3rd Floor, etc.)
- `capacity` (integer): Maximum capacity
- `description` (string, optional): Facility description
- `status` (string): Current availability status - "Available", "Occupied", "Under Maintenance"
- `image_url` (string, optional): URL to facility image

**Database Requirements:**

- Table: `facilities`
- Columns: `facility_id`, `facility_name`, `facility_type`, `floor_level`, `capacity`, `description`, `status`, `image_url`
- Status should be dynamically determined based on:
  - Check `account_requests` table for active bookings (approved requests with current date between `start_date` and `end_date`)
  - If active booking exists: status = "Occupied"
  - If facility marked for maintenance: status = "Under Maintenance"
  - Otherwise: status = "Available"

**Error Responses:**

- `500 Internal Server Error`: Database connection error

---

## **2. POST /api/booking - Create Facility Booking Request**

**Endpoint:** `POST /api/booking`

**Description:** Create a new facility booking request. This endpoint requires authentication.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body Schema:**

```json
{
  "bookers_id": 1,
  "facility_id": 5,
  "purpose": "Department meeting and planning session",
  "start_date": "2025-10-25",
  "end_date": "2025-10-25",
  "return_date": "2025-10-25"
}
```

**Request Fields:**

- `bookers_id` (integer, required): User's account_requests ID from the database
- `facility_id` (integer, required): ID of the facility to book
- `purpose` (string, required): Reason for booking (min 10 characters)
- `start_date` (string, required): Booking start date (YYYY-MM-DD format)
- `end_date` (string, required): Booking end date (YYYY-MM-DD format)
- `return_date` (string, required): Expected return date (YYYY-MM-DD format, should match end_date for facilities)

**Validation Rules:**

1. All fields are required
2. `purpose` must be at least 10 characters long
3. `start_date` must not be in the past
4. `end_date` must be >= `start_date`
5. `return_date` must be >= `end_date`
6. `facility_id` must exist in `facilities` table
7. `bookers_id` must exist in `account_requests` table
8. JWT token must be valid and match the `bookers_id`
9. Check for booking conflicts: no approved booking should overlap with requested dates

**Response Schema (201 Created):**

```json
{
  "message": "Booking request submitted successfully",
  "request_id": 123,
  "status": "Pending"
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors (missing fields, invalid dates, booking conflict, etc.)
  ```json
  {
    "detail": "Start date cannot be in the past"
  }
  ```
- `401 Unauthorized`: Invalid or missing JWT token
  ```json
  {
    "detail": "Invalid authentication credentials"
  }
  ```
- `404 Not Found`: Facility or bookers_id not found
  ```json
  {
    "detail": "Facility not found"
  }
  ```
- `500 Internal Server Error`: Database error

**Database Requirements:**

- Table: `account_requests`
- Insert new row with:
  - `bookers_id` (foreign key to users table)
  - `facility_id` (foreign key to facilities table, nullable)
  - `equipment_id` (null for facility bookings)
  - `supply_id` (null for facility bookings)
  - `purpose` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `return_date` (date)
  - `status` (default: "Pending")
  - `request_type` (set to "Booking" for facilities)
  - `created_at` (timestamp, auto-generated)
  - `updated_at` (timestamp, auto-generated)

---

## **3. GET /api/users/{user_id}/account - Get User's Account Request ID**

**Endpoint:** `GET /api/users/{user_id}/account`

**Description:** Retrieve the user's account_requests ID (bookers_id) needed for creating booking requests.

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

- `account_request_id` (integer): The bookers_id to use in booking requests
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

### **facilities table:**

```sql
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    facility_name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100) NOT NULL,
    floor_level VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Available',
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **account_requests table (for bookings):**

```sql
CREATE TABLE account_requests (
    id SERIAL PRIMARY KEY,
    bookers_id INTEGER REFERENCES users(id),
    facility_id INTEGER REFERENCES facilities(facility_id) NULL,
    equipment_id INTEGER REFERENCES equipment(equipment_id) NULL,
    supply_id INTEGER REFERENCES supplies(supply_id) NULL,
    purpose TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    request_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Implementation Notes**

### **1. Status Logic for GET /api/facilities:**

- Query `account_requests` table to check for active bookings
- A booking is "active" if: `status = 'Approved'` AND current date is between `start_date` and `end_date`
- If active booking exists for a facility, set status to "Occupied"
- Otherwise, return the facility's default status

### **2. Authentication:**

- All endpoints except GET /api/facilities require JWT authentication
- Extract user_id from JWT token and validate against database
- Ensure user making the request matches the `bookers_id` in POST /api/booking

### **3. Date Validation:**

- Use Python `datetime` for date parsing and validation
- Ensure all dates are in YYYY-MM-DD format
- Check for booking conflicts by querying overlapping approved bookings

### **4. Error Handling:**

- Return appropriate HTTP status codes
- Include descriptive error messages
- Log errors for debugging

### **5. CORS Configuration:**

- Allow requests from frontend origin: `http://localhost:3000`
- Include credentials in CORS configuration

---

## **Testing Checklist**

- [ ] GET /api/facilities returns all facilities with correct status
- [ ] GET /api/facilities calculates "Occupied" status based on active bookings
- [ ] POST /api/booking creates a new booking request successfully
- [ ] POST /api/booking validates all required fields
- [ ] POST /api/booking rejects past start dates
- [ ] POST /api/booking detects booking conflicts
- [ ] POST /api/booking requires valid JWT token
- [ ] GET /api/users/{user_id}/account returns correct bookers_id
- [ ] GET /api/auth/verify validates JWT tokens correctly
- [ ] All endpoints return proper error responses for invalid inputs

---

## **Example Frontend Usage**

```typescript
// Fetch all facilities
const facilities = await fetchFacilitiesList();

// Check user authentication
const isAuth = await checkUserAuthentication();

// Create a booking request
const bookingData = {
  bookers_id: 1,
  facility_id: 5,
  purpose: "Department meeting",
  start_date: "2025-10-25",
  end_date: "2025-10-25",
  return_date: "2025-10-25",
};
const result = await createBookingRequest(bookingData);
```
