// Types
export type EquipmentStatus = "Working" | "In Use" | "For Repair";

export interface Equipment {
  id: number;
  created_at: string;
  name: string;
  po_number: string | null;
  unit_number: string | null;
  brand_name: string | null;
  description: string | null;
  facility: string | null;
  facility_id: number | null;
  facility_name?: string;
  category: string | null;
  status: EquipmentStatus;
  availability?: string;
  date_acquire: string | null;
  supplier: string | null;
  amount: string | null;
  estimated_life: string | null;
  item_number: string | null;
  property_number: string | null;
  control_number: string | null;
  serial_number: string | null;
  person_liable: string | null;
  remarks: string | null;
  updated_at?: string;
  image?: string | null;
}

export interface BorrowingFormData {
  purpose: string;
  start_date: string;
  end_date: string;
  return_date: string;
}

export interface AuthVerifyResponse {
  user_id: string;
  email: string;
  role: string;
}

export interface UserAccountResponse {
  id: number;
  is_employee: boolean;
}

// Constants
export const FACILITIES = [
  "All Facilities",
  "CL1",
  "CL2",
  "CL3",
  "CL4",
  "CL5",
  "CL6",
  "CL10",
  "CL11",
  "MULTIMEDIA LAB",
  "MSIT LAB",
  "NET LAB",
  "DEANS OFFICE",
  "FACULTY OFFICE",
  "REPAIR ROOM",
  "AIR LAB",
  "CHCI",
  "VLRC",
  "ICTC",
  "NAVIGATU",
];

export const ITEMS_PER_PAGE = 9;

export const API_BASE_URL = "http://localhost:8000";

// Helper Functions
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function getStatusColor(
  status: EquipmentStatus,
  availability?: string
): string {
  if (availability === "Borrowed") {
    return "bg-red-100 text-red-800";
  }

  switch (status) {
    case "Working":
      return "bg-green-100 text-green-800";
    case "In Use":
      return "bg-orange-100 text-orange-800";
    case "For Repair":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getUniqueCategories(equipment: Equipment[]): string[] {
  const unique = Array.from(
    new Set(
      equipment
        .map((e) => e.category)
        .filter((cat): cat is string => cat !== null)
    )
  );
  return ["All Categories", ...unique];
}

export function filterEquipment(
  equipment: Equipment[],
  searchTerm: string,
  selectedCategory: string,
  selectedFacility: string
): Equipment[] {
  return equipment.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory;
    const matchesFacility =
      selectedFacility === "All Facilities" ||
      item.facility === selectedFacility;

    return matchesSearch && matchesCategory && matchesFacility;
  });
}

export function paginateEquipment(
  equipment: Equipment[],
  currentPage: number,
  itemsPerPage: number = ITEMS_PER_PAGE
): Equipment[] {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return equipment.slice(start, end);
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

    console.log(
      "verifyAuth: Making request to",
      `${API_BASE_URL}/api/auth/verify`
    );
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("verifyAuth: Response status:", response.status);
    if (!response.ok) {
      console.log("verifyAuth: Response not OK");
      return null;
    }

    const data: AuthVerifyResponse = await response.json();
    console.log("verifyAuth: Response data:", data);
    return data;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

export async function fetchEquipmentList(): Promise<Equipment[]> {
  try {
    const token = getAuthToken();

    // Build headers - include token if available, but don't require it for viewing
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/equipment`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // Log the error but don't show alert for viewing - backend needs to allow public access
      console.error(
        `Failed to fetch equipment: ${response.status} ${response.statusText}`
      );
      console.error(
        "Backend API /api/equipment requires authentication to be removed for GET requests"
      );
      return [];
    }

    const data: Equipment[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch equipment:", error);
    return [];
  }
}

export async function checkUserAuthorization(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("checkUserAuthorization: No auth token found");
      return false;
    }

    // TEMPORARY: Check if user data exists in localStorage (from login)
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log(
          "checkUserAuthorization: Found userData in localStorage:",
          userData
        );
        console.log(
          "checkUserAuthorization: is_employee value:",
          userData.is_employee,
          "type:",
          typeof userData.is_employee
        );
        // If userData has is_employee, use it directly (can be boolean or number)
        if (
          userData.is_employee !== undefined &&
          userData.is_employee !== null
        ) {
          // Convert to boolean: 1 or true = true, 0 or false = false
          const isEmployee = Boolean(userData.is_employee);
          console.log(
            "checkUserAuthorization: Using localStorage is_employee:",
            userData.is_employee,
            "-> converted to:",
            isEmployee
          );
          return isEmployee;
        } else {
          console.log(
            "checkUserAuthorization: is_employee is undefined or null, will check backend"
          );
        }
      } catch (e) {
        console.error("Failed to parse userData:", e);
      }
    }

    const authData = await verifyAuth();
    console.log("checkUserAuthorization: authData =", authData);
    console.log(
      "checkUserAuthorization: authData.user_id =",
      authData?.user_id,
      "type:",
      typeof authData?.user_id
    );

    if (!authData || !authData.user_id) {
      console.log(
        "checkUserAuthorization: Auth verification failed or no user_id"
      );
      return false;
    }

    console.log(
      "checkUserAuthorization: Auth OK, fetching account data for user_id:",
      authData.user_id
    );

    const response = await fetch(
      `${API_BASE_URL}/api/users/${authData.user_id}/account`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log(
        "checkUserAuthorization: Failed to fetch account data:",
        response.status
      );
      return false;
    }

    const accountData: UserAccountResponse = await response.json();
    return accountData.is_employee === true;
  } catch (error) {
    console.error("Authorization check failed:", error);
    return false;
  }
}

export async function createBorrowingRequest(
  equipmentId: number,
  formData: BorrowingFormData
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

    const accountData: UserAccountResponse = await accountResponse.json();

    // Create borrowing request
    const response = await fetch(`${API_BASE_URL}/api/borrowing`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        borrowed_item: equipmentId,
        purpose: formData.purpose,
        start_date: formData.start_date,
        end_date: formData.end_date,
        return_date: formData.return_date,
        request_status: "Pending",
        availability: "Available",
        borrowers_id: accountData.id,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create borrowing request: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "Failed to create borrowing request");
    return false;
  }
}
