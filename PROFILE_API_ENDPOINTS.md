# Profile API Endpoints - FastAPI Backend Implementation Guide

This document provides comprehensive specifications for implementing the FastAPI endpoints required by the profile page.

---

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

## **1. GET /api/users/{user_id}/profile - Get User Profile**

**Endpoint:** `GET /api/users/{user_id}/profile`

**Description:** Retrieves the user's profile information from the account_requests table.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

- `user_id` (string): The user's ID from JWT token

**Response Schema (200 OK):**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "department": "BSIT",
  "phone_number": "+639123456789",
  "acc_role": "CCIS Dean"
}
```

**Response Fields:**

- `first_name` (string): User's first name
- `last_name` (string): User's last name
- `email` (string): User's email address (from auth.users table)
- `department` (string): User's department
- `phone_number` (string): User's contact number
- `acc_role` (string): User's account role/position

**Response (404 Not Found):**

```json
{
  "detail": "User profile not found"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **2. PUT /api/users/{user_id}/profile - Update User Profile**

**Endpoint:** `PUT /api/users/{user_id}/profile`

**Description:** Updates the user's profile information in the account_requests table.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

- `user_id` (string): The user's ID from JWT token

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "department": "BSIT",
  "phone_number": "+639123456789",
  "acc_role": "CCIS Dean"
}
```

**Field Descriptions:**

- `first_name` (string, required): User's first name
- `last_name` (string, required): User's last name
- `department` (string, required): User's department
- `phone_number` (string, required): User's contact number
- `acc_role` (string, required): User's account role/position

**Response Schema (200 OK):**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "department": "BSIT",
  "phone_number": "+639123456789",
  "acc_role": "CCIS Dean"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Invalid input data"
}
```

**Response (404 Not Found):**

```json
{
  "detail": "User profile not found"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **3. POST /api/auth/change-password - Change User Password**

**Endpoint:** `POST /api/auth/change-password`

**Description:** Updates the user's password after verifying the current password.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "current_password": "currentPassword123",
  "new_password": "newPassword456"
}
```

**Field Descriptions:**

- `current_password` (string, required): User's current password for verification
- `new_password` (string, required): New password (minimum 6 characters)

**Response Schema (200 OK):**

```json
{
  "message": "Password updated successfully"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Current password is incorrect"
}
```

**Response (400 Bad Request):**

```json
{
  "detail": "Password must be at least 6 characters long"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## **4. GET /api/auth/verify - Verify JWT Token**

**Endpoint:** `GET /api/auth/verify`

**Description:** Verifies the JWT token and returns user information.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Schema (200 OK):**

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "role": "employee"
}
```

**Response (401 Unauthorized):**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## Database Schema Requirements

### account_requests table

```sql
CREATE TABLE account_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    acc_role VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### auth.users table (Supabase)

```sql
-- This is managed by Supabase Auth
-- Contains user authentication information including:
-- - id (UUID)
-- - email
-- - encrypted_password
-- - created_at
-- - updated_at
```

---

## Implementation Notes

1. **Profile Data Source:**

   - Profile information is stored in the `account_requests` table
   - Email comes from `auth.users` table
   - The `user_id` from JWT token links both tables

2. **Password Security:**

   - Current password must be verified before allowing change
   - New password must be hashed before storage
   - Minimum password length: 6 characters
   - Consider adding password strength requirements (uppercase, lowercase, numbers, special chars)

3. **Email Immutability:**

   - Email cannot be changed via the profile update endpoint
   - Email is managed by the authentication system
   - If email change is required, implement separate endpoint with email verification

4. **Authorization:**

   - Users can only view/update their own profile
   - Verify that `user_id` from JWT matches the `user_id` in the path parameter
   - Admin users might have permission to view/edit other profiles (implement role-based access)

5. **Data Validation:**
   - Validate phone number format
   - Validate department against allowed values (BSIT, BSCS, BSIS)
   - Validate acc_role against allowed roles
   - Trim whitespace from string inputs
   - Sanitize inputs to prevent SQL injection

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "detail": "Error message here",
  "error_code": "PROFILE_NOT_FOUND",
  "timestamp": "2024-02-20T10:30:00Z"
}
```

Common error codes:

- `PROFILE_NOT_FOUND`: User profile doesn't exist
- `INVALID_TOKEN`: JWT token is invalid or expired
- `INVALID_PASSWORD`: Current password is incorrect
- `WEAK_PASSWORD`: New password doesn't meet requirements
- `INVALID_INPUT`: Request body validation failed
- `UNAUTHORIZED`: User doesn't have permission

---

## Testing the Endpoints

### Test Profile Retrieval

```bash
curl -X GET "http://localhost:8000/api/users/{user_id}/profile" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

### Test Profile Update

```bash
curl -X PUT "http://localhost:8000/api/users/{user_id}/profile" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "department": "BSIT",
    "phone_number": "+639123456789",
    "acc_role": "CCIS Dean"
  }'
```

### Test Password Change

```bash
curl -X POST "http://localhost:8000/api/auth/change-password" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldPassword123",
    "new_password": "newPassword456"
  }'
```

---

## Frontend Integration

The profile page is now fully refactored to:

- ✅ Use FastAPI endpoints instead of direct Supabase calls
- ✅ Integrate with Zustand state management (authStore)
- ✅ Use component-based architecture (6 components created)
- ✅ Centralize all API calls in utils/helpers.ts
- ✅ Provide proper error handling and user feedback
- ✅ Follow best practices for React and TypeScript

**File Structure:**

```
src/app/profile/
├── page.tsx (342 lines - main page component)
├── components/
│   ├── ProfileHeader.tsx
│   ├── ProfileForm.tsx
│   ├── SecuritySection.tsx
│   ├── SuccessMessage.tsx
│   ├── ErrorMessage.tsx
│   └── LoadingState.tsx
└── utils/
    └── helpers.ts (220 lines - API functions and utilities)
```

---

## Security Considerations

1. **JWT Token Validation:**

   - Verify token signature
   - Check token expiration
   - Validate user_id from token matches request

2. **Rate Limiting:**

   - Implement rate limiting on password change endpoint
   - Limit failed password attempts
   - Add CAPTCHA for multiple failed attempts

3. **Audit Logging:**

   - Log all profile updates
   - Log password changes
   - Track failed login attempts

4. **Data Privacy:**
   - Don't return sensitive data in error messages
   - Sanitize all user inputs
   - Use HTTPS in production
   - Implement CORS properly

---

## Additional Considerations

1. **Caching:**

   - Consider caching profile data with short TTL
   - Invalidate cache on profile updates

2. **Real-time Updates:**

   - Consider WebSocket/SSE for profile updates
   - Notify other sessions of profile changes

3. **Profile Photo:**

   - Add endpoint for profile photo upload
   - Use cloud storage (AWS S3, Supabase Storage)
   - Generate thumbnails for performance

4. **Activity History:**
   - Track profile modification history
   - Allow users to view their update history
   - Implement undo functionality for recent changes
