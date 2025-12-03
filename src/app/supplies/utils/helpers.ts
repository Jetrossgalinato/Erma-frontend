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

export const ITEMS_PER_PAGE = 9;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
      supply.supply_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

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

export function handleError(
  error: unknown,
  context: string,
  showAlert?: (alert: { type: "error"; message: string }) => void
): void {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    console.error("Error message:", error.message);
    if (showAlert) {
      showAlert({ type: "error", message: `${context}: ${error.message}` });
    }
  } else if (showAlert) {
    showAlert({
      type: "error",
      message: `${context}: An unknown error occurred`,
    });
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

    // Build headers - include token if available, but don't require it for viewing
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/supplies`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // Log the error but don't show alert for viewing - backend needs to allow public access
      console.error(
        `Failed to fetch supplies: ${response.status} ${response.statusText}`
      );
      console.error(
        "Backend API /api/supplies requires authentication to be removed for GET requests"
      );
      return [];
    }

    const data = await response.json();

    // Handle both direct array and object with supplies property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let suppliesArray: any[] = [];
    if (Array.isArray(data)) {
      suppliesArray = data;
    } else if (
      data &&
      typeof data === "object" &&
      Array.isArray(data.supplies)
    ) {
      suppliesArray = data.supplies;
    } else {
      console.error("API returned unexpected data format:", data);
      return [];
    }

    // Map the data to match our interface (handle both formats)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return suppliesArray.map((item: any) => ({
      supply_id: item.supply_id || item.id,
      supply_name: item.supply_name || item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity || 0,
      stocking_point: item.stocking_point || 0,
      stock_unit: item.stock_unit,
      facility_id: item.facility_id || item.facilities?.id,
      facility_name:
        item.facility_name ||
        item.facilities?.facility_name ||
        item.facilities?.name ||
        "Unknown",
      remarks: item.remarks,
      image_url: item.image_url || item.image,
    }));
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
      return false;
    }

    const authData = await verifyAuth();
    if (!authData) {
      return false;
    }

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
  purpose: string,
  showAlert?: (alert: { type: "error" | "warning"; message: string }) => void
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      if (showAlert) {
        showAlert({
          type: "warning",
          message: "Please log in to acquire supplies",
        });
      }
      return false;
    }

    const acquirersId = await getUserAccountId();
    if (!acquirersId) {
      if (showAlert) {
        showAlert({
          type: "error",
          message: "Unable to get your account information",
        });
      }
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
    handleError(error, "createAcquireRequest", showAlert);
    if (error instanceof Error && showAlert) {
      showAlert({
        type: "error",
        message: `Failed to submit acquire request: ${error.message}`,
      });
    }
    return false;
  }
}
