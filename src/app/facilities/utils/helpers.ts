// Types
export type FacilityStatus =
  | "Available"
  | "Unavailable"
  | "Maintenance"
  | "Renovation";

export interface Facility {
  id: number;
  name: string;
  connection_type: string;
  facility_type: string;
  floor_level: string;
  cooling_tools: string;
  building: string;
  remarks: string;
  status: FacilityStatus;
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

export const ITEMS_PER_PAGE = 6;

export const API_BASE_URL = "http://localhost:8000";

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
    case "Unavailable":
      return "bg-red-100 text-red-800";
    case "Maintenance":
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
  return facilities.filter((facility) => {
    const matchesSearch = facility.name
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

export function handleError(error: unknown, context: string): void {
  console.error(`${context}:`, error);
  if (error instanceof Error) {
    alert(`${context}: ${error.message}`);
  } else {
    alert(`${context}: An unknown error occurred`);
  }
}

// FastAPI Functions
export async function verifyAuth(): Promise<AuthVerifyResponse | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("verifyAuth: No token found in localStorage");
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
      console.log("verifyAuth: Response not OK");
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
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/facilities`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    const data: Facility[] = await response.json();
    return data;
  } catch (error) {
    handleError(error, "Failed to fetch facilities");
    return [];
  }
}

export async function checkUserAuthentication(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("checkUserAuthentication: No auth token found");
      return false;
    }

    const authData = await verifyAuth();
    if (!authData || !authData.user_id) {
      console.log("checkUserAuthentication: Auth verification failed");
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

    // Create booking request
    const response = await fetch(`${API_BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookers_id: accountData.id,
        facility_id: facilityId,
        purpose: formData.purpose,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: "Pending",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create booking request: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to create booking request");
    return false;
  }
}
