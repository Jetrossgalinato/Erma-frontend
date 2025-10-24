# Backend API Configuration Required

## Issue

The Equipment and Supplies pages are currently returning authentication errors when accessed by non-authenticated users:

- **Equipment API** (`/api/equipment`): Returns `403 Forbidden`
- **Supplies API** (`/api/supplies`): Returns `401 Unauthorized`

## Working Example

The **Facilities API** (`/api/facilities`) is working correctly and allows public GET access. ✅

## Required Backend Changes

### Backend Developer Action Items

The FastAPI backend needs to be configured to allow **public access** (no authentication required) for **GET requests** to view resources, while maintaining authentication for **POST/PUT/DELETE** operations.

#### 1. Equipment Endpoint (`/api/equipment`)

```python
# In your FastAPI backend, modify the equipment router

# BEFORE (requires authentication for all operations):
@router.get("/api/equipment")
async def get_equipment(current_user: User = Depends(get_current_user)):
    # ...

# AFTER (public access for viewing, auth required for modifications):
@router.get("/api/equipment")
async def get_equipment():
    # No authentication required for GET
    # Return all equipment for public viewing
    # ...

@router.post("/api/equipment")
async def create_equipment(
    equipment_data: EquipmentCreate,
    current_user: User = Depends(get_current_user)
):
    # Authentication still required for creating
    # ...
```

#### 2. Supplies Endpoint (`/api/supplies`)

```python
# In your FastAPI backend, modify the supplies router

# BEFORE (requires authentication for all operations):
@router.get("/api/supplies")
async def get_supplies(current_user: User = Depends(get_current_user)):
    # ...

# AFTER (public access for viewing, auth required for modifications):
@router.get("/api/supplies")
async def get_supplies():
    # No authentication required for GET
    # Return all supplies for public viewing
    # ...

@router.post("/api/supplies")
async def create_supply(
    supply_data: SupplyCreate,
    current_user: User = Depends(get_current_user)
):
    # Authentication still required for creating
    # ...
```

### Summary

Make the **GET** endpoints public by removing the `Depends(get_current_user)` dependency:

- ✅ `/api/facilities` - Already working (use as reference)
- ❌ `/api/equipment` - Needs to be made public
- ❌ `/api/supplies` - Needs to be made public

Keep authentication for:

- ✅ POST `/api/borrowing` (borrow equipment)
- ✅ POST `/api/booking` (book facilities)
- ✅ POST `/api/acquiring` (acquire supplies)
- ✅ All PUT/DELETE operations

## Frontend Status

✅ The frontend is already configured correctly to:

1. Send requests **without** requiring authentication tokens for viewing
2. Include authentication tokens when available (for logged-in users)
3. Require authentication for POST operations (borrow, book, acquire)
4. Display disabled buttons with helpful tooltips for non-authenticated users

The only remaining issue is the backend API configuration.
