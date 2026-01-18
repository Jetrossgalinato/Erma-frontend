/**
 * Dashboard Supplies Utilities and API Functions
 *
 * This file contains all API functions and helper utilities for the dashboard-supplies page
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface Supply {
  id: number;
  name: string;
  description?: string;
  category: string;
  quantity: number | string;
  stocking_point: number | string;
  stock_unit: string;
  facility_id?: number;
  image?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  facilities?: {
    id: number;
    facility_id?: number;
    facility_name: string;
    name?: string; // Fallback for compatibility
  };
}

export interface SupplyFormData {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  stocking_point: number;
  stock_unit: string;
  facility_id?: number;
  image?: string;
  remarks?: string;
}

export interface Facility {
  id: number;
  facility_id?: number;
  facility_name: string;
  name?: string; // Fallback for compatibility
}

// Helper Functions
export function formatImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url;
}

/**
 * Fetch all supplies
 */
export async function fetchSupplies(): Promise<Supply[]> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/supplies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch supplies" }));
    throw new Error(error.detail || "Failed to fetch supplies");
  }

  const data = await response.json();

  // Ensure we always return an array
  if (Array.isArray(data)) {
    return data;
  }

  // If the response is an object with a supplies property
  if (data && Array.isArray(data.supplies)) {
    return data.supplies;
  }

  // Default to empty array if unexpected format
  console.error("Unexpected supplies API response format:", data);
  return [];
}

/**
 * Fetch all facilities for dropdown selection
 */
export async function fetchFacilities(): Promise<Facility[]> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch facilities" }));
    throw new Error(error.detail || "Failed to fetch facilities");
  }

  const data = await response.json();

  // Ensure we always return an array
  const facilitiesArray = Array.isArray(data) ? data : data.facilities || [];

  // Map facility_id to id for consistency
  return facilitiesArray.map((facility: Facility) => ({
    ...facility,
    id: facility.id || facility.facility_id || 0,
  }));
}

/**
 * Create a new supply
 */
export async function createSupply(
  supplyData: SupplyFormData,
): Promise<Supply> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/supplies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(supplyData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to create supply" }));
    throw new Error(error.detail || "Failed to create supply");
  }

  return response.json();
}

/**
 * Update an existing supply
 */
export async function updateSupply(
  id: number,
  supplyData: Partial<SupplyFormData>,
): Promise<Supply> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/supplies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(supplyData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to update supply" }));
    throw new Error(error.detail || "Failed to update supply");
  }

  return response.json();
}

/**
 * Upload supply image
 */
export async function uploadSupplyImage(file: File): Promise<string> {
  const token = localStorage.getItem("authToken");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/supplies/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to upload image" }));
    throw new Error(error.detail || "Failed to upload image");
  }

  const data = await response.json();
  return data.image_url;
}

/**
 * Delete multiple supplies
 */
export async function deleteSupplies(ids: number[]): Promise<void> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/supplies/bulk-delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ supply_ids: ids }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to delete supplies" }));
    throw new Error(error.detail || "Failed to delete supplies");
  }
}

/**
 * Bulk import supplies
 */
export async function bulkImportSupplies(
  supplies: Partial<Supply>[],
): Promise<{ imported: number; failed: number; message: string }> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/supplies/bulk-import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ supplies }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to import supplies" }));
    throw new Error(error.detail || "Failed to import supplies");
  }

  return response.json();
}

/**
 * Log supply action for audit trail
 */
export async function logSupplyAction(
  action: string,
  supplyName?: string,
  details?: string,
): Promise<void> {
  const token = localStorage.getItem("authToken");

  try {
    await fetch(`${API_BASE_URL}/api/supply-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        supply_name: supplyName,
        details,
      }),
    });
  } catch (error) {
    // Log errors silently - don't block the main operation
    console.error("Failed to log supply action:", error);
  }
}

/**
 * Parse CSV file content to supplies array
 */
export function parseCSVToSupplies(
  csvText: string,
  facilities: Facility[] = [],
): Partial<Supply>[] {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row",
    );
  }

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/"/g, "").toLowerCase());

  const supplies: Partial<Supply>[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const supply: Partial<Supply> = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";

      switch (header) {
        case "name":
        case "supply name":
          supply.name = value;
          break;
        case "description":
          supply.description = value;
          break;
        case "category":
          supply.category = value;
          break;
        case "quantity":
          supply.quantity = parseInt(value) || 0;
          break;
        case "stocking point":
        case "stocking_point":
          supply.stocking_point = parseInt(value) || 0;
          break;
        case "stock unit":
        case "stock_unit":
        case "unit":
          supply.stock_unit = value;
          break;
        case "facility_id":
          supply.facility_id = parseInt(value) || undefined;
          break;
        case "facility":
        case "facility id":
          if (value && facilities.length > 0) {
            const facility = facilities.find(
              (f) =>
                f.facility_name?.toLowerCase() === value.toLowerCase() ||
                f.name?.toLowerCase() === value.toLowerCase(),
            );
            if (facility) {
              supply.facility_id = facility.facility_id || facility.id;
            } else {
              // Try to parse as ID if name lookup fails
              supply.facility_id = parseInt(value) || undefined;
            }
          } else {
            supply.facility_id = parseInt(value) || undefined;
          }
          break;
        case "image":
        case "image_url":
          supply.image = value;
          break;
        case "remarks":
        case "notes":
          supply.remarks = value;
          break;
      }
    });

    return supply;
  });

  return supplies;
}

/**
 * Get unique categories from supplies list
 */
export function getUniqueCategories(supplies: Supply[]): string[] {
  if (!Array.isArray(supplies)) {
    return [];
  }
  return [
    ...new Set(supplies.map((supply) => supply.category).filter(Boolean)),
  ].sort() as string[];
}

/**
 * Get unique facilities from supplies list
 */
export function getUniqueFacilities(supplies: Supply[]): string[] {
  if (!Array.isArray(supplies)) {
    return [];
  }
  return [
    ...new Set(
      supplies.map((supply) => supply.facilities?.name).filter(Boolean),
    ),
  ].sort() as string[];
}

/**
 * Filter supplies based on criteria
 */
export function filterSupplies(
  supplies: Supply[],
  categoryFilter: string,
  facilityFilter: string,
  searchQuery: string = "",
): Supply[] {
  if (!Array.isArray(supplies)) {
    return [];
  }
  return supplies.filter((supply) => {
    const matchesCategory =
      !categoryFilter ||
      supply.category?.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesFacility =
      !facilityFilter ||
      supply.facilities?.name
        ?.toLowerCase()
        .includes(facilityFilter.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      supply.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesFacility && matchesSearch;
  });
}

export interface SupplyHistoryItem {
  id: number;
  borrower_name: string;
  purpose: string;
  request_date: string;
  quantity: number;
  request_status: string;
}

export const fetchSupplyHistory = async (
  id: number,
): Promise<SupplyHistoryItem[]> => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/api/supplies/${id}/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch supply history: ${response.status}`);
  }

  return response.json();
};

export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number,
) => {
  return Math.ceil(totalItems / itemsPerPage);
};

/**
 * Get stock status with color coding
 */
export function getStockStatus(
  quantity: number | string,
  stockingPoint: number | string,
): { status: string; color: string } {
  const qty = Number(quantity);
  const point = Number(stockingPoint);

  if (qty === 0) {
    return {
      status: "Out of Stock",
      color:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700",
    };
  }
  if (qty <= point) {
    return {
      status: "Low Stock",
      color:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700",
    };
  }
  return {
    status: "In Stock",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700",
  };
}
