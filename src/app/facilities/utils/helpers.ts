// Types
export type FacilityStatus = "Available" | "Occupied" | "Under Maintenance";

export interface Facility {
  facility_id: number;
  facility_name: string;
  facility_type: string;
  floor_level: string;
  capacity: number;
  description?: string;
  status: FacilityStatus;
  image_url?: string;
}

export interface BookingFormData {
  purpose: string;
  start_date: string;
  end_date: string;
}

export interface AuthVerifyResponse {
  user_id: string;
  email: string;
  role: string;
}

// Constants
export const FACILITY_TYPES = [
  "All Facility Types",
  "Room",
  "Office",
  "Computer Lab",
  "Incubation Hub",
  "Robotic Hub",
  "Hall",
];

export const FLOOR_LEVELS = [
  "All Floor Levels",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
];

export const ITEMS_PER_PAGE = 9;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper Functions
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function getStatusColor(status: FacilityStatus): string {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800";
    case "Occupied":
      return "bg-red-100 text-red-800";
    case "Under Maintenance":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function filterFacilities(
  facilities: Facility[],
  searchTerm: string,
  selectedFacilityType: string,
  selectedFloorLevel: string,
  selectedStatus: FacilityStatus | "All Statuses"
): Facility[] {
  // Defensive check: ensure facilities is an array
  if (!Array.isArray(facilities)) {
    console.error("filterFacilities received non-array:", facilities);
    return [];
  }

  return facilities.filter((facility) => {
    const matchesSearch = facility.facility_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFacilityType =
      selectedFacilityType === "All Facility Types" ||
      facility.facility_type === selectedFacilityType;

    const matchesFloorLevel =
      selectedFloorLevel === "All Floor Levels" ||
      facility.floor_level === selectedFloorLevel;

    const matchesStatus =
      selectedStatus === "All Statuses" || facility.status === selectedStatus;

    return (
      matchesSearch && matchesFacilityType && matchesFloorLevel && matchesStatus
    );
  });
}

export function paginateFacilities(
  facilities: Facility[],
  currentPage: number,
  itemsPerPage: number = ITEMS_PER_PAGE
): Facility[] {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return facilities.slice(start, end);
}

export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number = ITEMS_PER_PAGE
): number {
  return Math.ceil(totalItems / itemsPerPage);
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

// FastAPI Functions
export async function verifyAuth(): Promise<AuthVerifyResponse | null> {
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

    const data: AuthVerifyResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

export async function fetchFacilitiesList(): Promise<Facility[]> {
  try {
    const token = getAuthToken();

    // Build headers - include token if available, but don't require it for viewing
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/facilities`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both direct array and object with facilities property
    if (Array.isArray(data)) {
      return data as Facility[];
    }

    // Check if data has a facilities property that is an array
    if (data && typeof data === "object" && Array.isArray(data.facilities)) {
      return data.facilities as Facility[];
    }

    console.error("API returned unexpected data format:", data);
    return [];
  } catch (error) {
    handleError(error, "Failed to fetch facilities");
    return [];
  }
}

export async function checkUserAuthentication(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      return false;
    }

    const authData = await verifyAuth();
    if (!authData || !authData.user_id) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
}

export async function createBookingRequest(
  facilityId: number,
  formData: BookingFormData
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const authData = await verifyAuth();
    if (!authData) {
      throw new Error("User not authenticated");
    }

    // Get user's account ID
    const accountResponse = await fetch(
      `${API_BASE_URL}/api/users/${authData.user_id}/account`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!accountResponse.ok) {
      throw new Error("User account not found");
    }

    const accountData = await accountResponse.json();

    // Format dates to ISO 8601 format with seconds
    const formatDateForBackend = (dateString: string): string => {
      // datetime-local gives us "2025-10-23T14:30"
      // Backend likely expects "2025-10-23T14:30:00" or with timezone
      return dateString.includes("T") ? `${dateString}:00` : dateString;
    };

    const requestPayload = {
      bookers_id: accountData.id,
      facility_id: facilityId,
      purpose: formData.purpose.trim(),
      start_date: formatDateForBackend(formData.start_date),
      end_date: formatDateForBackend(formData.end_date),
      status: "Pending",
    };

    // Create booking request
    const response = await fetch(`${API_BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

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
        } else {
          errorMessage = errorData.detail || errorData.message || errorMessage;
        }
      } catch {
        // If response is not JSON, use statusText
      }
      throw new Error(`Failed to create booking request: ${errorMessage}`);
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to create booking request");
    return false;
  }
}
