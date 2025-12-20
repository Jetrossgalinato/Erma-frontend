// API Configuration
import { fetchWithRetry, API_BASE_URL } from "@/utils/api";

// Types

// Types
export interface BorrowingRequest {
  id: number;
  borrowers_id: number;
  borrowed_item: number;
  equipment_name: string;
  borrower_name: string;
  purpose: string;
  request_status: string;
  availability: string;
  return_status: string | null;
  start_date: string;
  end_date: string;
  date_returned: string | null;
  created_at: string;
}

export interface BookingRequest {
  id: number;
  bookers_id: number;
  facility_id: number;
  facility_name: string;
  booker_name: string;
  purpose: string;
  status: string;
  start_date: string;
  end_date: string;
  return_date: string | null;
  created_at: string;
}

export interface AcquiringRequest {
  id: number;
  acquirers_id: number;
  supply_id: number;
  supply_name: string;
  acquirer_name: string;
  facility_name: string;
  quantity: number;
  purpose: string;
  status: string;
  created_at: string;
}

export interface ReturnNotification {
  id: number;
  borrowing_id: number;
  receiver_name: string;
  status: string;
  message: string;
  created_at: string;
  equipment_name: string;
  borrower_name: string;
}

export interface DoneNotification {
  id: number;
  booking_id: number;
  completion_notes: string | null;
  status: string;
  message: string;
  created_at: string;
  facility_name: string;
  booker_name: string;
}

export interface RequestNotification {
  id: number;
  request_type: "borrowing" | "booking" | "acquiring";
  request_id: number;
  requester_name: string;
  item_name: string;
  status: string;
  message: string;
  created_at: string;
  purpose: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  total_pages: number;
}

// Helper Functions
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function handleError(
  error: unknown,
  context: string,
  showAlert?: (alert: { type: "error"; message: string }) => void
): void {
  console.error(`${context}:`, error);
  const message =
    error instanceof Error
      ? `${context}: ${error.message}`
      : `${context}: An unknown error occurred`;

  if (showAlert) {
    showAlert({ type: "error", message });
  }
}

export function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "rejected":
    case "not returned":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "borrowed":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "returned":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}

export function formatTime(dateString: string | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "N/A";
  }
}

// API Functions

// Borrowing Requests
export async function fetchBorrowingRequests(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<BorrowingRequest>> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/borrowing/requests?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch borrowing requests: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    handleError(error, "Failed to fetch borrowing requests");
    return { data: [], total: 0, page: 1, total_pages: 0 };
  }
}

export async function fetchReturnNotifications(): Promise<
  ReturnNotification[]
> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/borrowing/return-notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch return notifications: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    handleError(error, "Failed to fetch return notifications");
    return [];
  }
}

export async function bulkUpdateBorrowingStatus(
  ids: number[],
  status: "Approved" | "Rejected"
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/borrowing/bulk-update-status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, status }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update borrowing status: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to update borrowing status");
    return false;
  }
}

export async function bulkDeleteBorrowingRequests(
  ids: number[]
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/borrowing/bulk-delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete borrowing requests: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to delete borrowing requests");
    return false;
  }
}

export async function confirmReturn(
  notificationId: number,
  borrowingId: number
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/borrowing/confirm-return`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_id: notificationId,
          borrowing_id: borrowingId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to confirm return: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to confirm return");
    return false;
  }
}

export async function rejectReturn(notificationId: number): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/borrowing/reject-return`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notification_id: notificationId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reject return: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to reject return");
    return false;
  }
}

// Booking Requests
export async function fetchBookingRequests(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<BookingRequest>> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/booking/requests?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch booking requests: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    handleError(error, "Failed to fetch booking requests");
    return { data: [], total: 0, page: 1, total_pages: 0 };
  }
}

export async function fetchDoneNotifications(): Promise<DoneNotification[]> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/booking/done-notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch done notifications: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    handleError(error, "Failed to fetch done notifications");
    return [];
  }
}

export async function fetchRequestNotifications(): Promise<
  RequestNotification[]
> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/requests/pending-notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch request notifications: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    handleError(error, "Failed to fetch request notifications");
    return [];
  }
}

export async function bulkUpdateBookingStatus(
  ids: number[],
  status: "Approved" | "Rejected"
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/booking/bulk-update-status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, status }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update booking status: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to update booking status");
    return false;
  }
}

export async function bulkDeleteBookingRequests(
  ids: number[]
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/booking/bulk-delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete booking requests: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to delete booking requests");
    return false;
  }
}

export async function confirmDone(
  notificationId: number,
  bookingId: number
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/booking/confirm-done`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_id: notificationId,
          booking_id: bookingId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to confirm completion: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to confirm completion");
    return false;
  }
}

export async function dismissDone(notificationId: number): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/booking/dismiss-done`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notification_id: notificationId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to dismiss notification: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to dismiss notification");
    return false;
  }
}

// Acquiring Requests
export async function fetchAcquiringRequests(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<AcquiringRequest>> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/acquiring/requests?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch acquiring requests: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    handleError(error, "Failed to fetch acquiring requests");
    return { data: [], total: 0, page: 1, total_pages: 0 };
  }
}

export async function bulkUpdateAcquiringStatus(
  ids: number[],
  status: "Approved" | "Rejected"
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/acquiring/bulk-update-status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, status }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update acquiring status: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to update acquiring status");
    return false;
  }
}

export async function bulkDeleteAcquiringRequests(
  ids: number[]
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/acquiring/bulk-delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete acquiring requests: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to delete acquiring requests");
    return false;
  }
}
