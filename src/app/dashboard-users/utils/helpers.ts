// Types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  phone_number: string;
  acc_role: string;
  approved_acc_role: string | null;
  email: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  departmentFilter?: string;
  roleFilter?: string;
  excludeUserId?: string; // To exclude current user
}

export interface UsersResponse {
  users: User[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API Functions
export async function fetchUsers(
  params: PaginationParams
): Promise<UsersResponse> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params.departmentFilter) {
    queryParams.append("department", params.departmentFilter);
  }

  if (params.roleFilter) {
    queryParams.append("role", params.roleFilter);
  }

  if (params.excludeUserId) {
    queryParams.append("exclude_user_id", params.excludeUserId);
  }

  const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Not authenticated");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch users: ${response.statusText}`
    );
  }

  return response.json();
}

export async function updateUser(
  userId: string,
  userData: Partial<User>
): Promise<User> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Not authenticated");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to update user: ${response.statusText}`
    );
  }

  return response.json();
}

export async function deleteUsers(userIds: string[]): Promise<void> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/users/batch`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_ids: userIds }),
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Not authenticated");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to delete users: ${response.statusText}`
    );
  }
}

// Utility Functions
export function getUniqueDepartments(users: User[]): string[] {
  return [
    ...new Set(users.map((user) => user.department).filter(Boolean)),
  ].sort();
}

export function getUniqueRoles(users: User[]): string[] {
  const allRoles = users.map((user) => user.acc_role).filter(Boolean);
  return [...new Set(allRoles)].sort();
}

export function filterUsers(
  users: User[],
  departmentFilter: string,
  roleFilter: string
): User[] {
  return users.filter((user) => {
    const matchesDepartment =
      !departmentFilter ||
      user.department?.toLowerCase().includes(departmentFilter.toLowerCase());

    const matchesRole =
      !roleFilter ||
      user.acc_role?.toLowerCase().includes(roleFilter.toLowerCase());

    return matchesDepartment && matchesRole;
  });
}

/**
 * Calculate pagination range for display
 */
export function calculatePaginationRange(
  currentPage: number,
  itemsPerPage: number,
  totalCount: number
): { start: number; end: number } {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalCount);
  return { start, end };
}

/**
 * Generate page numbers for pagination
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number
): number[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => {
    if (totalPages <= 7) return true;
    if (page <= 3) return true;
    if (page >= totalPages - 2) return true;
    if (Math.abs(page - currentPage) <= 1) return true;
    return false;
  });
}

/**
 * Check if ellipsis should be shown between page numbers
 */
export function shouldShowEllipsis(
  currentIndex: number,
  pages: number[]
): boolean {
  if (currentIndex === 0) return false;
  const prevPage = pages[currentIndex - 1];
  const currentPageNum = pages[currentIndex];
  return currentPageNum - prevPage > 1;
}
