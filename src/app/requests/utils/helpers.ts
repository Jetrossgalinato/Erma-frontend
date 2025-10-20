// Types
export type RequestStatus = "Pending" | "Approved" | "Rejected";

export interface AccountRequest {
  id: number;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: RequestStatus;
  requestedAt: string;
  department?: string;
  phoneNumber?: string;
  acc_role?: string;
  approved_acc_role?: string;
  is_supervisor?: boolean;
  is_intern?: boolean;
}

// Constants
export const requestStatuses = [
  "All Statuses",
  "Pending",
  "Approved",
  "Rejected",
];

export const departments = ["All Departments", "BSIT", "BSCS", "BSIS"];

export const roleOptions = [
  "All Roles",
  "CCIS Dean",
  "Lab Technician",
  "Comlab Adviser",
  "Department Chairperson",
  "Associate Dean",
  "College Clerk",
  "Student Assistant",
  "Lecturer",
  "Instructor",
];

// API Base URL - Update this to match your FastAPI backend URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper Functions

/**
 * Generate date options for filter dropdown
 */
export const getDateOptions = (): string[] => {
  const today = new Date();
  const options = ["All Dates"];

  // Add recent dates
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    if (i === 0) options.push(`Today (${dateStr})`);
    else if (i === 1) options.push(`Yesterday (${dateStr})`);
    else options.push(dateStr);
  }

  options.push("This Week", "This Month");
  return options;
};

/**
 * Get status badge color based on request status
 */
export const getStatusColor = (status: RequestStatus): string => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Handle API errors consistently
 */
export const handleError = (error: unknown, operation: string): string => {
  console.error(`Failed to ${operation}:`, error);

  let errorMessage = "Please try again.";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);

    if ("details" in error) {
      console.error("Error details:", error.details);
    }
  }

  return errorMessage;
};

/**
 * Filter requests based on search term and filters
 */
export const filterRequests = (
  requests: AccountRequest[],
  searchTerm: string,
  selectedStatus: string,
  selectedDepartment: string,
  selectedRole: string,
  selectedRequestedAt: string
): AccountRequest[] => {
  return requests.filter((request) => {
    const fullName = `${request.firstName} ${request.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All Statuses" || request.status === selectedStatus;

    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      request.department === selectedDepartment;

    const matchesRole =
      selectedRole === "All Roles" || request.acc_role === selectedRole;

    const matchesRequestedAt = (() => {
      if (selectedRequestedAt === "All Dates") return true;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      if (selectedRequestedAt.includes("Today"))
        return request.requestedAt === today;
      if (selectedRequestedAt.includes("Yesterday"))
        return request.requestedAt === yesterday;
      if (selectedRequestedAt === "This Week") {
        const weekAgo = new Date(Date.now() - 7 * 86400000)
          .toISOString()
          .split("T")[0];
        return request.requestedAt >= weekAgo && request.requestedAt <= today;
      }
      if (selectedRequestedAt === "This Month") {
        return request.requestedAt.startsWith(today.substring(0, 7));
      }
      return request.requestedAt === selectedRequestedAt;
    })();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDepartment &&
      matchesRole &&
      matchesRequestedAt
    );
  });
};

/**
 * Paginate an array of items
 */
export const paginateItems = <T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return items.slice(start, end);
};

/**
 * Calculate total pages for pagination
 */
export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

// FastAPI API Functions

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

/**
 * Fetch all account requests from FastAPI
 */
export const fetchAccountRequests = async (): Promise<AccountRequest[]> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/account-requests`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch requests: ${response.statusText}`);
  }

  const data = await response.json();

  // Map the response to AccountRequest format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((req: any) => ({
    id: req.id,
    user_id: req.user_id,
    firstName: req.first_name,
    lastName: req.last_name,
    email: req.email,
    status: req.status as RequestStatus,
    requestedAt: req.created_at?.split("T")[0] || "",
    department: req.department,
    phoneNumber: req.phone_number,
    acc_role: req.acc_role,
    approved_acc_role: req.approved_acc_role,
    is_supervisor: req.is_supervisor ?? false,
    is_intern: req.is_intern ?? false,
  }));
};

/**
 * Approve an account request via FastAPI
 */
export const approveAccountRequest = async (
  requestId: number,
  approvedRole: string
): Promise<void> => {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/account-requests/${requestId}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        approved_acc_role: approvedRole,
      }),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "Failed to approve request");
  }
};

/**
 * Reject an account request via FastAPI
 */
export const rejectAccountRequest = async (
  requestId: number
): Promise<void> => {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/account-requests/${requestId}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "Failed to reject request");
  }
};

/**
 * Delete an account request via FastAPI
 */
export const deleteAccountRequest = async (
  requestId: number
): Promise<void> => {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/account-requests/${requestId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "Failed to delete request");
  }
};

/**
 * Verify user authentication via FastAPI
 */
// Response type for auth verification
export interface AuthVerifyResponse {
  user: Record<string, unknown>;
  role: string;
}

export const verifyAuth = async (): Promise<AuthVerifyResponse | null> => {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthVerifyResponse;
    return data;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
};
