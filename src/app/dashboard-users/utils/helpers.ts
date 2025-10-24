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

  const response = await fetch(
    `http://localhost:8000/api/users?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

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

  const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
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

  const response = await fetch(`http://localhost:8000/api/users/batch`, {
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

export function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  const delta = 2;
  const range = [];
  const rangeWithDots: (number | string)[] = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push("...", totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots.filter(
    (item, index, array) => array.indexOf(item) === index
  );
}
