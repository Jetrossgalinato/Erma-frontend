# Alert Component Migration Guide

## Overview

This guide shows how to replace all `alert()` calls with the custom Alert modal component across the application.

## Alert Component Location

`src/components/Alert.tsx`

## Alert Component Props

```typescript
interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string; // Optional title
  message: string; // Required message
  onClose: () => void; // Close handler
}
```

## Migration Steps

### Step 1: Import the Alert Component

```typescript
import Alert from "@/components/Alert";
```

### Step 2: Add Alert State

```typescript
const [alert, setAlert] = useState<{
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
} | null>(null);
```

### Step 3: Replace alert() Calls

**Before:**

```typescript
alert("Operation successful!");
```

**After:**

```typescript
setAlert({
  type: "success",
  message: "Operation successful!",
});
```

**With Title (optional):**

```typescript
setAlert({
  type: "error",
  title: "Validation Error",
  message: "Please fill in all required fields",
});
```

### Step 4: Add Alert Component to JSX (before closing div/fragment)

```typescript
return (
  <div>
    {/* Your page content */}

    {alert && (
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(null)}
      />
    )}
  </div>
);
```

## Alert Types Guide

### Success Alerts

Use for: Successful operations, data saved, requests submitted

```typescript
setAlert({
  type: "success",
  message: "Equipment added successfully!",
});
```

### Error Alerts

Use for: Failed operations, validation errors, API errors

```typescript
setAlert({
  type: "error",
  title: "Error",
  message: "Failed to delete item. Please try again.",
});
```

### Warning Alerts

Use for: Non-critical issues, user should be aware

```typescript
setAlert({
  type: "warning",
  message: "Please log in to access this feature",
});
```

### Info Alerts

Use for: Informational messages, reminders

```typescript
setAlert({
  type: "info",
  message: "Your session will expire in 5 minutes",
});
```

## Pages Requiring Migration

### ✅ Completed

- [x] login/page.tsx

### 📋 Pending

- [ ] dashboard/page.tsx
- [ ] dashboard-equipment/page.tsx (30+ alert calls)
- [ ] dashboard-supplies/page.tsx (20+ alert calls)
- [ ] dashboard-facilities/page.tsx (15+ alert calls)
- [ ] dashboard-users/page.tsx (5+ alert calls)
- [ ] dashboard-request/page.tsx (3+ alert calls)
- [ ] equipment/page.tsx (3 alert calls)
- [ ] facilities/page.tsx (1 alert call)
- [ ] supplies/page.tsx (1 alert call)
- [ ] monitor-equipment/page.tsx
- [ ] monitor-facilities/page.tsx
- [ ] monitor-supplies/page.tsx
- [ ] my-requests/page.tsx (10+ alert calls)
- [ ] profile/page.tsx
- [ ] register/page.tsx
- [ ] requests/page.tsx (6+ alert calls)
- [ ] home/page.tsx

## Complete Example: login/page.tsx

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // ... login logic ...

      setAlert({
        type: "success",
        message: "You have logged in successfully!",
      });
      setTimeout(() => router.push("/home"), 1500);
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  if (authLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Page content */}
      <Footer />
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
```

## Tips

1. **Delayed Actions**: When redirecting after success, add a small delay:

   ```typescript
   setAlert({ type: "success", message: "Saved!" });
   setTimeout(() => router.push("/page"), 1500);
   ```

2. **Multiple Alerts**: Close previous alert before showing new one:

   ```typescript
   setAlert(null);
   setTimeout(() => setAlert({ type: "success", message: "Done!" }), 100);
   ```

3. **Error Messages**: Extract error message from catch blocks:
   ```typescript
   catch (err) {
     setAlert({
       type: "error",
       message: err instanceof Error ? err.message : "An error occurred",
     });
   }
   ```

## Migration Checklist for Each File

- [ ] Import Alert component
- [ ] Add alert state
- [ ] Replace all alert() calls with setAlert()
- [ ] Add Alert component to JSX
- [ ] Test all alert scenarios
- [ ] Verify proper alert types (success/error/warning/info)
- [ ] Check delayed actions work correctly
