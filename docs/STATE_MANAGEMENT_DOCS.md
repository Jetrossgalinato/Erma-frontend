# State Management Documentation

## Overview

The CRMS system now uses **Zustand** for centralized state management. This eliminates prop drilling, reduces code duplication, and provides a single source of truth for application state.

## Architecture

### Store Structure

```
src/store/
├── authStore.ts       # Authentication and user state
├── resourceStore.ts   # Equipment, facilities, supplies data
├── uiStore.ts         # UI state (modals, filters, pagination)
└── index.ts          # Central exports
```

---

## 1. Auth Store (`authStore.ts`)

Manages authentication state and user information.

### State

```typescript
{
  user: User | null; // Current user object
  isAuthenticated: boolean; // Auth status
  isLoading: boolean; // Loading state
}
```

### Actions

- `setUser(user)` - Set user object
- `setIsAuthenticated(bool)` - Set authentication status
- `setIsLoading(bool)` - Set loading state
- `login(token, user)` - Perform login
- `logout()` - Perform logout and clear data
- `initializeAuth()` - Initialize auth from localStorage on app load

### Usage Example

```typescript
import { useAuthStore } from "@/store";

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  // Check if user is authenticated
  if (isAuthenticated) {
    return <div>Welcome {user?.email}!</div>;
  }

  // Login example
  const handleLogin = () => {
    login("jwt-token", {
      userId: "123",
      email: "user@example.com",
      role: "Admin",
    });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Features

- **Persistent**: User data persists across page refreshes
- **Auto-initialization**: Verifies token with backend on app load
- **Secure**: Clears all auth data on logout

---

## 2. Resource Store (`resourceStore.ts`)

Manages equipment, facilities, and supplies data.

### State

```typescript
{
  // Equipment
  equipments: Equipment[];
  isLoadingEquipments: boolean;

  // Facilities
  facilities: Facility[];
  isLoadingFacilities: boolean;

  // Supplies
  supplies: Supply[];
  isLoadingSupplies: boolean;
}
```

### Actions

**Equipment:**

- `setEquipments(equipments)` - Set all equipment
- `setIsLoadingEquipments(bool)` - Set loading state
- `addEquipment(equipment)` - Add single equipment
- `updateEquipment(id, data)` - Update equipment
- `removeEquipment(id)` - Remove equipment

**Facilities:** (similar pattern)

- `setFacilities`, `addFacility`, `updateFacility`, `removeFacility`

**Supplies:** (similar pattern)

- `setSupplies`, `addSupply`, `updateSupply`, `removeSupply`

**Global:**

- `clearAll()` - Clear all resource data

### Usage Example

```typescript
import { useResourceStore } from "@/store";

function EquipmentPage() {
  const { equipments, isLoadingEquipments, setEquipments, addEquipment } =
    useResourceStore();

  // Fetch and set equipment
  useEffect(() => {
    async function fetchData() {
      const data = await fetchEquipmentList();
      setEquipments(data);
    }
    fetchData();
  }, [setEquipments]);

  // Add new equipment
  const handleAdd = (newEquipment) => {
    addEquipment(newEquipment);
  };

  return (
    <div>
      {isLoadingEquipments ? (
        <p>Loading...</p>
      ) : (
        equipments.map((eq) => (
          <div key={eq.equipment_id}>{eq.equipment_name}</div>
        ))
      )}
    </div>
  );
}
```

---

## 3. UI Store (`uiStore.ts`)

Manages UI state like modals, filters, pagination, and search.

### State

```typescript
{
  isGlobalLoading: boolean;
  modals: { [key: string]: boolean };
  filters: { [key: string]: any };
  pagination: { [key: string]: { currentPage, itemsPerPage, totalItems } };
  searchTerms: { [key: string]: string };
  isSidebarOpen: boolean;
}
```

### Actions

**Global Loading:**

- `setIsGlobalLoading(bool)`

**Modals:**

- `openModal(modalId)` - Open specific modal
- `closeModal(modalId)` - Close specific modal
- `toggleModal(modalId)` - Toggle modal
- `closeAllModals()` - Close all modals

**Filters:**

- `setFilter(key, value)` - Set filter value
- `resetFilter(key)` - Clear specific filter
- `resetAllFilters()` - Clear all filters

**Pagination:**

- `setCurrentPage(key, page)` - Set current page
- `setItemsPerPage(key, count)` - Set items per page
- `setTotalItems(key, total)` - Set total items
- `resetPagination(key)` - Reset pagination

**Search:**

- `setSearchTerm(key, term)` - Set search term
- `clearSearchTerm(key)` - Clear specific search
- `clearAllSearchTerms()` - Clear all searches

**Sidebar:**

- `toggleSidebar()` - Toggle sidebar
- `setSidebarOpen(bool)` - Set sidebar state

### Usage Example

```typescript
import { useUIStore } from "@/store";

function EquipmentPage() {
  const {
    modals,
    openModal,
    closeModal,
    setSearchTerm,
    searchTerms,
    setCurrentPage,
    pagination,
  } = useUIStore();

  // Open modal
  const handleOpenAddModal = () => {
    openModal("addEquipment");
  };

  // Search
  const handleSearch = (term) => {
    setSearchTerm("equipment", term);
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage("equipment", page);
  };

  return (
    <div>
      <button onClick={handleOpenAddModal}>Add Equipment</button>

      {modals["addEquipment"] && (
        <Modal onClose={() => closeModal("addEquipment")}>
          Add Equipment Form
        </Modal>
      )}

      <input
        value={searchTerms["equipment"] || ""}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <Pagination
        currentPage={pagination["equipment"]?.currentPage || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

---

## Migration Guide

### Before (Local State)

```typescript
function MyPage() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // ... rest of component
}
```

### After (Zustand Store)

```typescript
import { useAuthStore } from "@/store";

function MyPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // No need for useEffect - auth is initialized globally!
  // ... rest of component
}
```

---

## Best Practices

### 1. **Use Selectors for Performance**

```typescript
// ❌ Bad - Component re-renders on any auth state change
const authStore = useAuthStore();

// ✅ Good - Only re-renders when isAuthenticated changes
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### 2. **Separate Actions from State**

```typescript
// ✅ Good - Cleaner code
const { equipments, isLoadingEquipments } = useResourceStore();
const { setEquipments, addEquipment } = useResourceStore();
```

### 3. **Use Store for Shared State Only**

- ✅ Use store: Authentication, user data, resource lists
- ❌ Don't use store: Form input values, temporary UI state (use local state)

### 4. **Clear Data on Logout**

```typescript
const logout = useAuthStore((state) => state.logout);
const clearAll = useResourceStore((state) => state.clearAll);

const handleLogout = () => {
  logout(); // Clear auth
  clearAll(); // Clear resources
  router.push("/login");
};
```

---

## Pages Already Migrated

### ✅ Home Page (`/src/app/home/page.tsx`)

- Removed local `useState` for auth
- Using `useAuthStore` for `isAuthenticated` and `isLoading`

---

## Next Steps for Full Migration

### Pages to Update:

1. **Login Page** - Use `login()` action instead of manual localStorage
2. **Register Page** - Use `login()` action after successful registration
3. **Equipment Page** - Use `useResourceStore` for equipment data
4. **Facilities Page** - Use `useResourceStore` for facilities data
5. **Supplies Page** - Use `useResourceStore` for supplies data
6. **Dashboard Pages** - Use all three stores
7. **My Requests Page** - Use `useAuthStore` for user info

### Example: Equipment Page Migration

```typescript
// Before
const [equipments, setEquipments] = useState([]);

useEffect(() => {
  fetchEquipmentList().then(setEquipments);
}, []);

// After
import { useResourceStore } from "@/store";

const { equipments, setEquipments, isLoadingEquipments } = useResourceStore();

useEffect(() => {
  const loadEquipment = async () => {
    const data = await fetchEquipmentList();
    setEquipments(data);
  };
  loadEquipment();
}, [setEquipments]);
```

---

## Debugging

### View Store State in Browser

```typescript
// Add to any component temporarily
useEffect(() => {
  console.log("Auth State:", useAuthStore.getState());
  console.log("Resource State:", useResourceStore.getState());
  console.log("UI State:", useUIStore.getState());
}, []);
```

### Reset All Stores (Development)

```typescript
const resetAll = () => {
  useAuthStore.getState().logout();
  useResourceStore.getState().clearAll();
  useUIStore.setState({
    modals: {},
    filters: {},
    pagination: {},
    searchTerms: {},
  });
};
```

---

## Benefits

✅ **No Prop Drilling** - Access state from any component
✅ **Single Source of Truth** - All auth state in one place
✅ **Persistent** - Auth persists across refreshes
✅ **Type-Safe** - Full TypeScript support
✅ **Performant** - Only re-renders when selected state changes
✅ **Devtools** - Works with Redux DevTools extension
✅ **Simple API** - Easier than Redux
✅ **SSR Compatible** - Works with Next.js App Router

---

## Installation

Already installed:

```bash
npm install zustand
```

---

## Files Created

1. `/src/store/authStore.ts` - Authentication store
2. `/src/store/resourceStore.ts` - Resources store
3. `/src/store/uiStore.ts` - UI state store
4. `/src/store/index.ts` - Central exports
5. `/src/components/StoreInitializer.tsx` - Auto-initialize auth
6. Updated: `/src/app/layout.tsx` - Added StoreInitializer
7. Updated: `/src/app/home/page.tsx` - Using authStore

---

## Support

For more information: https://github.com/pmndrs/zustand
