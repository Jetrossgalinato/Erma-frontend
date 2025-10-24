# 🔴 URGENT: Fix Users Count to Exclude Current User

## Problem

The sidebar shows incorrect user count because it includes the current logged-in user. The users management page correctly excludes the current user, causing a mismatch:

- **Sidebar count:** 8 users
- **Users table:** Shows only 7 users (current user excluded)

This is confusing for users! ❌

## Solution

Update the `GET /api/sidebar/counts` endpoint to exclude the current authenticated user from the users count.

## What Needs to Change

### File: `[your_sidebar_counts_endpoint].py`

**BEFORE (Current Code):**

```python
@router.get("/api/sidebar/counts")
async def get_sidebar_counts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    counts = {
        "equipments": db.query(Equipment).count(),
        "facilities": db.query(Facility).count(),
        "supplies": db.query(Supply).count(),
        "requests": ...,
        "equipment_logs": ...,
        "facility_logs": ...,
        "supply_logs": ...,
        "users": db.query(AccountRequest).count()  # ❌ Includes current user
    }
    return counts
```

**AFTER (Fixed Code):**

```python
@router.get("/api/sidebar/counts")
async def get_sidebar_counts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    counts = {
        "equipments": db.query(Equipment).count(),
        "facilities": db.query(Facility).count(),
        "supplies": db.query(Supply).count(),
        "requests": ...,
        "equipment_logs": ...,
        "facility_logs": ...,
        "supply_logs": ...,
        "users": db.query(AccountRequest).filter(
            AccountRequest.id != current_user.id  # ✅ Excludes current user
        ).count()
    }
    return counts
```

## One-Line Fix

Change this line:

```python
"users": db.query(AccountRequest).count()
```

To this:

```python
"users": db.query(AccountRequest).filter(AccountRequest.id != current_user.id).count()
```

## Why This Matters

1. ✅ **Consistency:** Sidebar count matches the users page count
2. ✅ **Accuracy:** Users see the correct number of users they can manage
3. ✅ **Logic:** Users shouldn't manage themselves via the Users page (they use Profile page)
4. ✅ **User Experience:** No confusion about mismatched numbers

## Testing

After the fix:

1. Login as any user
2. Check sidebar "Users" count (e.g., shows "7")
3. Navigate to Users Management page
4. Count should match (shows 7 users in table, not including yourself)

✅ Both should show the same number!

## Reference

See full documentation in:

- `BACKEND_PROMPT_USERS_API.md` - Complete API specification
- `SIDEBAR_API_ENDPOINTS.md` - Sidebar endpoint details

---

**Priority:** HIGH 🔴  
**Estimated Time:** 2 minutes  
**Impact:** Fixes user confusion, improves UX consistency
