/**
 * Dashboard Facilities Page - API Utilities and Helpers
 *
 * This file contains all API functions and type definitions for the facilities
 * dashboard using FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==================== Types ====================

export interface Facility {
  id: number;
  facility_id?: number;
  facility_name: string;
  connection_type?: string;
  facility_type?: string;
  floor_level?: string;
  cooling_tools?: string;
  building?: string;
  capacity?: number;
  remarks?: string;
  description?: string;
  status?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FacilityFormData {
  facility_name: string;
  connection_type?: string;
  facility_type: string;
  floor_level: string;
  cooling_tools?: string;
  building?: string;
  capacity?: number;
  status: string;
  remarks?: string;
}

// ==================== API Functions ====================

/**
 * Fetch all facilities
 */
export async function fetchFacilities(): Promise<Facility[]> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities`, {
    method: "GET",
    headers: {
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

  // Handle if backend returns an object with a facilities array
  const facilitiesArray = Array.isArray(data) ? data : data.facilities || [];

  // Map facility_id to id if needed
  return facilitiesArray.map((facility: Facility) => ({
    ...facility,
    id: facility.id || facility.facility_id || 0,
  }));
}

/**
 * Create a new facility
 */
export async function createFacility(
  facilityData: FacilityFormData
): Promise<Facility> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(facilityData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to create facility" }));

    // Handle validation errors (422)
    if (error.detail && Array.isArray(error.detail)) {
      const errorMessages = error.detail
        .map(
          (err: { loc?: string[]; msg: string }) =>
            `${err.loc ? err.loc.join(".") : "Field"}: ${err.msg}`
        )
        .join("; ");
      throw new Error(errorMessages);
    }

    throw new Error(error.detail || "Failed to create facility");
  }

  return response.json();
}

/**
 * Update an existing facility
 */
export async function updateFacility(
  id: number,
  facilityData: Partial<FacilityFormData>
): Promise<Facility> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(facilityData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to update facility" }));
    throw new Error(error.detail || "Failed to update facility");
  }

  return response.json();
}

/**
 * Delete multiple facilities
 */
export async function deleteFacilities(ids: number[]): Promise<void> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities/bulk-delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ facility_ids: ids }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to delete facilities" }));
    throw new Error(error.detail || "Failed to delete facilities");
  }
}

/**
 * Bulk import facilities from CSV
 */
export async function bulkImportFacilities(
  facilities: Partial<Facility>[]
): Promise<{ imported: number; failed: number }> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities/bulk-import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ facilities }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to import facilities" }));
    throw new Error(error.detail || "Failed to import facilities");
  }

  return response.json();
}

/**
 * Log facility action
 */
export async function logFacilityAction(
  action: string,
  facilityName?: string,
  additionalInfo?: string
): Promise<void> {
  try {
    const token = localStorage.getItem("authToken");

    const logMessage = additionalInfo
      ? `${action}${
          facilityName ? ` facility "${facilityName}"` : ""
        }. ${additionalInfo}`
      : `${action}${facilityName ? ` facility "${facilityName}"` : ""}`;

    const response = await fetch(`${API_BASE_URL}/api/facility-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ log_message: logMessage }),
    });

    if (!response.ok) {
      console.warn("Failed to log facility action:", response.status);
    }
  } catch (error) {
    console.warn("Error logging facility action:", error);
  }
}

// ==================== Helper Functions ====================

/**
 * Parse CSV file content to facility data
 */
export function parseCSVToFacilities(csvText: string): Partial<Facility>[] {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row"
    );
  }

  // Parse CSV headers
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  // Parse data rows
  const facilitiesData: Partial<Facility>[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const facility: Partial<Facility> = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";

      // Map common header variations to facility properties
      switch (header.toLowerCase()) {
        case "name":
        case "facility name":
        case "facility_name":
          facility.facility_name = value;
          break;
        case "connection type":
        case "connectiontype":
          facility.connection_type = value;
          break;
        case "facility type":
        case "facilitytype":
        case "type":
          facility.facility_type = value;
          break;
        case "floor level":
        case "floor":
        case "level":
          facility.floor_level = value;
          break;
        case "cooling tools":
        case "cooling":
          facility.cooling_tools = value;
          break;
        case "building":
          facility.building = value;
          break;
        case "capacity":
          facility.capacity = value ? parseInt(value, 10) : 0;
          break;
        case "status":
          facility.status = value;
          break;
        case "remarks":
        case "notes":
          facility.remarks = value;
          break;
      }
    });

    return facility;
  });

  return facilitiesData;
}

/**
 * Get unique facility types from facilities list
 */
export function getUniqueFacilityTypes(facilities: Facility[]): string[] {
  if (!Array.isArray(facilities)) {
    return [];
  }
  return [
    ...new Set(
      facilities.map((facility) => facility.facility_type).filter(Boolean)
    ),
  ].sort() as string[];
}

/**
 * Get unique floor levels from facilities list
 */
export function getUniqueFloorLevels(facilities: Facility[]): string[] {
  if (!Array.isArray(facilities)) {
    return [];
  }
  return [
    ...new Set(
      facilities.map((facility) => facility.floor_level).filter(Boolean)
    ),
  ].sort() as string[];
}

/**
 * Filter facilities based on criteria
 */
export function filterFacilities(
  facilities: Facility[],
  facilityTypeFilter: string,
  floorLevelFilter: string
): Facility[] {
  if (!Array.isArray(facilities)) {
    return [];
  }
  return facilities.filter((facility) => {
    const matchesFacilityType =
      !facilityTypeFilter ||
      facility.facility_type
        ?.toLowerCase()
        .includes(facilityTypeFilter.toLowerCase());

    const matchesFloorLevel =
      !floorLevelFilter ||
      facility.floor_level
        ?.toString()
        .toLowerCase()
        .includes(floorLevelFilter.toLowerCase());

    return matchesFacilityType && matchesFloorLevel;
  });
}
