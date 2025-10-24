# Backend API Requirements for Dashboard Requests Page

## Overview

The dashboard-request page needs FastAPI endpoints to manage borrowing, booking, and acquiring requests. These endpoints should handle CRUD operations, status updates, notifications, and pagination.

## Authentication

All endpoints require JWT Bearer token authentication in the `Authorization` header.

---

## 1. Borrowing Requests Endpoints

### GET /api/borrowing/requests

**Purpose:** Fetch paginated borrowing requests with equipment and borrower details

**Query Parameters:**

- `page` (int, default=1): Page number
- `page_size` (int, default=10): Items per page

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "borrowers_id": 5,
      "borrowed_item": 10,
      "equipment_name": "Lenovo Legion 7i",
      "borrower_name": "John Doe",
      "purpose": "For gaming tournament",
      "request_status": "Pending",
      "availability": "Available",
      "return_status": null,
      "start_date": "2025-10-25T08:00:00",
      "end_date": "2025-10-30T17:00:00",
      "date_returned": null,
      "created_at": "2025-10-23T10:00:00"
    }
  ],
  "total": 50,
  "page": 1,
  "total_pages": 5
}
```

### GET /api/borrowing/return-notifications

**Purpose:** Fetch pending return notifications

**Response:**

```json
[
  {
    "id": 1,
    "borrowing_id": 15,
    "receiver_name": "Jane Smith",
    "status": "pending_confirmation",
    "message": "Equipment returned",
    "created_at": "2025-10-24T09:00:00",
    "equipment_name": "Lenovo Legion 7i",
    "borrower_name": "John Doe"
  }
]
```

### PUT /api/borrowing/bulk-update-status

**Purpose:** Approve or reject multiple borrowing requests

**Request Body:**

```json
{
  "ids": [1, 2, 3],
  "status": "Approved"
}
```

**Business Logic:**

- When approved: Set `request_status` to "Approved", set `availability` to "Borrowed"
- When rejected: Set `request_status` to "Rejected", set `availability` to "Available"
- Create notifications for affected borrowers
- Log action to `equipment_logs` table

**Response:** `200 OK` with success message

### DELETE /api/borrowing/bulk-delete

**Purpose:** Delete multiple borrowing requests

**Request Body:**

```json
{
  "ids": [1, 2, 3]
}
```

**Business Logic:**

- Delete related `return_notifications` first (foreign key)
- Delete borrowing records
- Create notifications for affected borrowers
- Log action to `equipment_logs` table

**Response:** `200 OK` with success message

### POST /api/borrowing/confirm-return

**Purpose:** Confirm equipment return

**Request Body:**

```json
{
  "notification_id": 1,
  "borrowing_id": 15
}
```

**Business Logic:**

- Update borrowing record: set `date_returned`, `availability` to "Available", `return_status` to "Returned"
- Update notification status to "confirmed"
- Create notification for borrower
- Log action to `equipment_logs` table

**Response:** `200 OK` with success message

### POST /api/borrowing/reject-return

**Purpose:** Reject equipment return request

**Request Body:**

```json
{
  "notification_id": 1
}
```

**Business Logic:**

- Update notification status to "rejected"
- Create notification for borrower
- Log action to `equipment_logs` table

**Response:** `200 OK` with success message

---

## 2. Booking Requests Endpoints

### GET /api/booking/requests

**Purpose:** Fetch paginated booking requests with facility and booker details

**Query Parameters:**

- `page` (int, default=1): Page number
- `page_size` (int, default=10): Items per page

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "bookers_id": 5,
      "facility_id": 3,
      "facility_name": "AIR LAB",
      "booker_name": "John Doe",
      "purpose": "Meeting",
      "status": "Pending",
      "start_date": "2025-10-25T08:00:00",
      "end_date": "2025-10-25T10:00:00",
      "return_date": "2025-10-25T10:00:00",
      "created_at": "2025-10-23T10:00:00"
    }
  ],
  "total": 30,
  "page": 1,
  "total_pages": 3
}
```

### GET /api/booking/done-notifications

**Purpose:** Fetch pending completion notifications

**Response:**

```json
[
  {
    "id": 1,
    "booking_id": 10,
    "completion_notes": "Everything went well",
    "status": "pending_confirmation",
    "message": "Booking completed",
    "created_at": "2025-10-24T10:00:00",
    "facility_name": "AIR LAB",
    "booker_name": "John Doe"
  }
]
```

### PUT /api/booking/bulk-update-status

**Purpose:** Approve or reject multiple booking requests

**Request Body:**

```json
{
  "ids": [1, 2, 3],
  "status": "Approved"
}
```

**Business Logic:**

- Update booking records with new status
- Create notifications for affected bookers
- Log action to `facility_logs` table

**Response:** `200 OK` with success message

### DELETE /api/booking/bulk-delete

**Purpose:** Delete multiple booking requests

**Request Body:**

```json
{
  "ids": [1, 2, 3]
}
```

**Business Logic:**

- Delete booking records
- Create notifications for affected bookers
- Log action to `facility_logs` table

**Response:** `200 OK` with success message

### POST /api/booking/confirm-done

**Purpose:** Confirm booking completion

**Request Body:**

```json
{
  "notification_id": 1,
  "booking_id": 10
}
```

**Business Logic:**

- Update booking status to "Completed"
- Update notification status to "confirmed"
- Create notification for booker
- Log action to `facility_logs` table

**Response:** `200 OK` with success message

### POST /api/booking/dismiss-done

**Purpose:** Dismiss booking completion notification

**Request Body:**

```json
{
  "notification_id": 1
}
```

**Business Logic:**

- Update notification status to "dismissed"
- Create notification for booker
- Log action to `facility_logs` table

**Response:** `200 OK` with success message

---

## 3. Acquiring Requests Endpoints

### GET /api/acquiring/requests

**Purpose:** Fetch paginated acquiring requests with supply and acquirer details

**Query Parameters:**

- `page` (int, default=1): Page number
- `page_size` (int, default=10): Items per page

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "acquirers_id": 5,
      "supply_id": 8,
      "supply_name": "Bond Paper A4",
      "acquirer_name": "John Doe",
      "facility_name": "AIR LAB",
      "quantity": 100,
      "purpose": "For printing",
      "status": "Pending",
      "created_at": "2025-10-23T10:00:00"
    }
  ],
  "total": 20,
  "page": 1,
  "total_pages": 2
}
```

### PUT /api/acquiring/bulk-update-status

**Purpose:** Approve or reject multiple acquiring requests

**Request Body:**

```json
{
  "ids": [1, 2, 3],
  "status": "Approved"
}
```

**Business Logic:**

- Update acquiring records with new status
- **When approved**: Deduct quantity from supplies table (check for sufficient quantity first)
- Create notifications for affected acquirers
- Log action to `supply_logs` table

**Response:** `200 OK` with success message or error if insufficient quantity

### DELETE /api/acquiring/bulk-delete

**Purpose:** Delete multiple acquiring requests

**Request Body:**

```json
{
  "ids": [1, 2, 3]
}
```

**Business Logic:**

- Delete acquiring records
- Create notifications for affected acquirers
- Log action to `supply_logs` table

**Response:** `200 OK` with success message

---

## Database Schema Notes

### borrowing table

- `id`, `borrowers_id`, `borrowed_item`, `purpose`, `request_status`, `availability`, `return_status`, `start_date`, `end_date`, `date_returned`, `created_at`

### booking table

- `id`, `bookers_id`, `facility_id`, `purpose`, `status`, `start_date`, `end_date`, `return_date`, `created_at`

### acquiring table

- `id`, `acquirers_id`, `supply_id`, `quantity`, `purpose`, `status`, `created_at`

### return_notifications table

- `id`, `borrowing_id`, `receiver_name`, `status`, `message`, `created_at`

### done_notifications table

- `id`, `booking_id`, `completion_notes`, `status`, `message`, `created_at`

### notifications table

- `id`, `user_id`, `title`, `message`, `is_read`, `created_at`

---

## Error Handling

All endpoints should return proper error responses:

- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server errors

---

## Testing Checklist

- [ ] All endpoints return correct pagination
- [ ] Bulk operations handle empty arrays
- [ ] Notifications are created correctly
- [ ] Logs are written to appropriate log tables
- [ ] Foreign key constraints are handled (delete return_notifications before borrowing)
- [ ] Supply quantity validation works
- [ ] JWT authentication works on all endpoints
