// Types
export type RequestStatus = "Pending" | "Approved" | "Rejected";

export interface Borrowing {
  id: number;
  status: RequestStatus;
  equipment_name: string;
  quantity: number;
  borrow_date: string;
  expected_return_date: string;
  purpose: string | null;
  receiver_name?: string;
}

export interface Booking {
  id: number;
  status: string;
  facility_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string | null;
}

export interface Acquiring {
  id: number;
  supply_name: string;
  quantity: number;
  request_date: string;
  status: string;
  purpose: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Constants
export const PAGE_SIZE = 10;
export const ITEMS_PER_PAGE = 9;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper Functions

// Helper Functions
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function getUserId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
}

export function getStatusColor(status: RequestStatus | string): string {
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
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function handleError(error: unknown, context: string): void {
  console.error(`${context}:`, error);
  if (error instanceof Error) {
    alert(`${context}: ${error.message}`);
  } else {
    alert(`${context}: An unknown error occurred`);
  }
}

// FastAPI Authentication Functions
export async function verifyAuth(): Promise<{ user_id: string } | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

// Fetch Borrowing Requests
export async function fetchBorrowingRequests(
  page: number = 1,
  skipAuthVerify = false
): Promise<PaginatedResponse<Borrowing>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Skip redundant auth verification if already verified
    if (!skipAuthVerify) {
      const authData = await verifyAuth();
      if (!authData) {
        throw new Error("User not authenticated");
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/api/borrowing/my-requests?page=${page}&page_size=${PAGE_SIZE}`,
      {
        method: "GET",
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch borrowing requests:", error);
    return {
      data: [],
      total: 0,
      page: page,
      page_size: PAGE_SIZE,
      total_pages: 0,
    };
  }
}

// Fetch Booking Requests
export async function fetchBookingRequests(
  page: number = 1,
  skipAuthVerify = false
): Promise<PaginatedResponse<Booking>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Skip redundant auth verification if already verified
    if (!skipAuthVerify) {
      const authData = await verifyAuth();
      if (!authData) {
        throw new Error("User not authenticated");
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/api/booking/my-requests?page=${page}&page_size=${PAGE_SIZE}`,
      {
        method: "GET",
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch booking requests:", error);
    return {
      data: [],
      total: 0,
      page: page,
      page_size: PAGE_SIZE,
      total_pages: 0,
    };
  }
}

// Fetch Acquiring Requests
export async function fetchAcquiringRequests(
  page: number = 1,
  skipAuthVerify = false
): Promise<PaginatedResponse<Acquiring>> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Skip redundant auth verification if already verified
    if (!skipAuthVerify) {
      const authData = await verifyAuth();
      if (!authData) {
        throw new Error("User not authenticated");
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/api/acquiring/my-requests?page=${page}&page_size=${PAGE_SIZE}`,
      {
        method: "GET",
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch acquiring requests:", error);
    return {
      data: [],
      total: 0,
      page: page,
      page_size: PAGE_SIZE,
      total_pages: 0,
    };
  }
}

// Mark items as returned
export async function markAsReturned(
  borrowingIds: number[],
  receiverName: string
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/borrowing/mark-returned`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowing_ids: borrowingIds,
          receiver_name: receiverName,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark as returned: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to mark items as returned");
    return false;
  }
}

// Mark booking as done
export async function markBookingAsDone(
  bookingIds: number[],
  completionNotes?: string
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/booking/mark-done`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_ids: bookingIds,
        completion_notes: completionNotes || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as done: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to mark booking as done");
    return false;
  }
}

// Delete requests
export async function deleteRequests(
  requestType: "borrowing" | "booking" | "acquiring",
  requestIds: number[]
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const endpoint =
      requestType === "borrowing"
        ? "borrowing"
        : requestType === "booking"
        ? "booking"
        : "acquiring";

    const requestPayload = { ids: requestIds };

    const response = await fetch(
      `${API_BASE_URL}/api/${endpoint}/bulk-delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!response.ok) {
      // Try to get more details from the error response
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        console.error("Backend error response:", errorData);

        // Format validation errors nicely
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errors = errorData.detail
            .map((err: { loc?: string[]; msg?: string }) => {
              const field = err.loc ? err.loc.join(" -> ") : "unknown";
              return `${field}: ${err.msg}`;
            })
            .join(", ");
          errorMessage = errors;
        } else if (errorData.detail) {
          errorMessage =
            typeof errorData.detail === "string"
              ? errorData.detail
              : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If response is not JSON, use statusText
      }
      throw new Error(`Failed to delete requests: ${errorMessage}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to delete requests");
    return false;
  }
}

// Parallel data loading with single auth verification
export async function loadAllRequestsParallel(
  borrowingPage: number,
  bookingPage: number,
  acquiringPage: number
) {
  try {
    // Verify authentication ONCE for all requests
    const authData = await verifyAuth();
    if (!authData) {
      throw new Error("User not authenticated");
    }

    // Fetch all three types in parallel (skipping redundant auth checks)
    const [borrowingRes, bookingRes, acquiringRes] = await Promise.all([
      fetchBorrowingRequests(borrowingPage, true),
      fetchBookingRequests(bookingPage, true),
      fetchAcquiringRequests(acquiringPage, true),
    ]);

    return {
      borrowing: borrowingRes,
      booking: bookingRes,
      acquiring: acquiringRes,
    };
  } catch (error) {
    console.error("Failed to load requests in parallel:", error);
    throw error;
  }
}
