# Session Timeout Feature Documentation

## Overview

The session timeout feature automatically logs out users after a period of inactivity to enhance security and manage system resources.

## Configuration

**Location:** `/src/utils/sessionTimeout.ts`

### Default Settings:

- **Session Timeout:** 30 minutes of inactivity
- **Warning Before Timeout:** 5 minutes before expiration
- **Warning Display:** Shows at 25 minutes of inactivity

## How It Works

### 1. **Activity Detection**

The system monitors user activity through these events:

- Mouse movement
- Mouse clicks
- Keyboard input
- Scrolling
- Touch events

### 2. **Timeout Flow**

```
User Activity → Reset Timer
    ↓
25 minutes inactive → Warning Modal Appears
    ↓
User Options:
    - Click "Continue Session" → Reset timer, continue using
    - Click "Logout Now" → Immediate logout
    - No action for 5 more minutes → Automatic logout
    ↓
30 minutes total → Auto Logout + Alert + Redirect to login
```

### 3. **Warning Modal**

When the warning appears (at 25 minutes):

- Shows a yellow warning icon
- Displays remaining time (5 minutes countdown)
- Offers two options:
  - **Continue Session:** Resets the timer
  - **Logout Now:** Immediate logout
- Updates countdown every second

### 4. **Automatic Logout**

When timeout occurs (at 30 minutes):

- Shows browser alert: "Your session has expired due to inactivity. You will be redirected to the login page."
- Clears all authentication data:
  - `authToken`
  - `userId`
  - `userEmail`
  - `userRole`
- Redirects to `/login` page

## Implementation Details

### Files Created:

1. **`/src/utils/sessionTimeout.ts`**

   - Core session management logic
   - Activity listeners
   - Timer management
   - Configuration constants

2. **`/src/components/SessionTimeoutProvider.tsx`**

   - React component wrapper
   - Warning modal UI
   - Session state management
   - User interaction handlers

3. **Updated `/src/app/layout.tsx`**
   - Integrated SessionTimeoutProvider
   - Applied globally to all authenticated pages

## Customization

To change timeout settings, edit `/src/utils/sessionTimeout.ts`:

```typescript
// Configuration
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes warning
```

### Examples:

**15-minute timeout with 3-minute warning:**

```typescript
const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_TIMEOUT = 3 * 60 * 1000; // 3 minutes
```

**1-hour timeout with 10-minute warning:**

```typescript
const TIMEOUT_DURATION = 60 * 60 * 1000; // 60 minutes
const WARNING_BEFORE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

## User Experience

### Normal Usage:

- Users interact with the system normally
- Timer resets automatically with any activity
- No interruption to workflow

### Inactive User:

1. At 25 minutes: Warning modal appears
2. User sees countdown: "5 minutes"
3. Options to continue or logout
4. If no action: Auto-logout at 30 minutes

### After Logout:

- Alert message displayed
- All session data cleared
- Redirected to login page
- Must re-authenticate to continue

## Security Features

1. **Automatic Cleanup:** All auth tokens removed on timeout
2. **Activity Debouncing:** Prevents excessive timer resets (1-second minimum)
3. **Client-Side Protection:** Reduces risk of unauthorized access to idle sessions
4. **Clear Communication:** Users warned before forced logout

## Testing

### To Test Timeout:

1. **Quick Test (Development):**

   - Temporarily change timeout to 1 minute:
     ```typescript
     const TIMEOUT_DURATION = 1 * 60 * 1000; // 1 minute
     const WARNING_BEFORE_TIMEOUT = 30 * 1000; // 30 seconds
     ```
   - Login to the system
   - Wait 30 seconds → Warning appears
   - Wait 30 more seconds → Auto logout

2. **Warning Modal Test:**

   - Login to system
   - Remain inactive until warning appears
   - Click "Continue Session" → Timer resets
   - Try "Logout Now" → Immediate logout

3. **Activity Reset Test:**
   - Login to system
   - Occasionally move mouse or click
   - Verify warning never appears (timer keeps resetting)

## Browser Compatibility

Works in all modern browsers:

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

Requires:

- `localStorage` support
- JavaScript enabled

## Notes

- Only applies to **authenticated users** (those with `authToken`)
- Non-authenticated pages (login, register, home) are not affected
- Timer starts when user logs in
- Each activity resets the full 30-minute timer
- Warning modal has highest z-index (z-100) to stay on top
