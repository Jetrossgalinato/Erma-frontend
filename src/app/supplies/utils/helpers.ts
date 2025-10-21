// Types
export interface Supply {
  supply_id: number;
  supply_name: string;
  description?: string;
  category: string;
  quantity: number;
  stocking_point: number;
  stock_unit: string;
  facility_id: number;
  facility_name: string;
  remarks?: string;
  image_url?: string;
}

export interface AcquireFormData {
  quantity: number;
  purpose: string;
}

export interface AuthVerifyResponse {
  user_id: number;
  email: string;
  role: string;
}

export interface UserAccountResponse {
  account_request_id: number;
  user_id: number;
  email: string;
  full_name: string;
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

export const ITEMS_PER_PAGE = 6;

export const API_BASE_URL = "http://localhost:8000";

// Helper Functions
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

export function getUniqueCategories(supplies: Supply[]): string[] {
  const unique = Array.from(
    new Set(supplies.map((s) => s.category).filter((cat) => cat !== null))
  );
  return ["All Categories", ...unique];
}

export function filterSupplies(
  supplies: Supply[],
  searchTerm: string,
  selectedCategory: string,
  selectedFacility: string
): Supply[] {
  // Defensive check: ensure supplies is an array
  if (!Array.isArray(supplies)) {
    console.error("filterSupplies received non-array:", supplies);
    return [];
  }

  return supplies.filter((supply) => {
    const matchesSearch =
      supply.supply_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      supply.category === selectedCategory;

    const matchesFacility =
      selectedFacility === "All Facilities" ||
      supply.facility_name === selectedFacility;

    return matchesSearch && matchesCategory && matchesFacility;
  });
}

export function paginateSupplies(
  supplies: Supply[],
  currentPage: number,
  itemsPerPage: number
): Supply[] {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return supplies.slice(start, end);
}

export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number
): number {
  return Math.ceil(totalItems / itemsPerPage);
}

export function handleError(error: unknown, context: string): void {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    console.error("Error message:", error.message);
  }
}

export function isLowStock(quantity: number, stockingPoint: number): boolean {
  return quantity <= stockingPoint;
}

// FastAPI Integration Functions

/**
 * Verify JWT token with FastAPI backend
 */
export async function verifyAuth(): Promise<AuthVerifyResponse | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("verifyAuth: No auth token found");
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
      console.error("Auth verification failed:", response.statusText);
      return null;
    }

    const data: AuthVerifyResponse = await response.json();
    return data;
  } catch (error) {
    handleError(error, "verifyAuth");
    return null;
  }
}

/**
 * Fetch all supplies from FastAPI backend
 */
export async function fetchSuppliesList(): Promise<Supply[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/supplies`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch supplies: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both direct array and object with supplies property
    if (Array.isArray(data)) {
      return data as Supply[];
    }

    // Check if data has a supplies property that is an array
    if (data && typeof data === "object" && Array.isArray(data.supplies)) {
      return data.supplies as Supply[];
    }

    console.error("API returned unexpected data format:", data);
    return [];
  } catch (error) {
    handleError(error, "fetchSuppliesList");
    return [];
  }
}

/**
 * Check if user is authenticated
 */
export async function checkUserAuthentication(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("checkUserAuthentication: No auth token found");
      return false;
    }

    const authData = await verifyAuth();
    if (!authData) {
      console.log("checkUserAuthentication: Auth verification failed");
      return false;
    }

    console.log("User authenticated:", authData);
    return true;
  } catch (error) {
    handleError(error, "checkUserAuthentication");
    return false;
  }
}

/**
 * Get user's account request ID (acquirers_id)
 */
export async function getUserAccountId(): Promise<number | null> {
  try {
    const authData = await verifyAuth();
    if (!authData) {
      return null;
    }

    const token = getAuthToken();
    if (!token) {
      return null;
    }

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
      throw new Error("Failed to fetch user account ID");
    }

    const data: UserAccountResponse = await response.json();
    return data.account_request_id;
  } catch (error) {
    handleError(error, "getUserAccountId");
    return null;
  }
}

/**
 * Create an acquire request for supplies
 */
export async function createAcquireRequest(
  supplyId: number,
  quantity: number,
  purpose: string
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      alert("Please log in to acquire supplies");
      return false;
    }

    const acquirersId = await getUserAccountId();
    if (!acquirersId) {
      alert("Unable to get your account information");
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/acquiring`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        acquirers_id: acquirersId,
        supply_id: supplyId,
        quantity: quantity,
        purpose: purpose || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail ||
          `Failed to create acquire request: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    handleError(error, "createAcquireRequest");
    if (error instanceof Error) {
      alert(`Failed to submit acquire request: ${error.message}`);
    }
    return false;
  }
}
