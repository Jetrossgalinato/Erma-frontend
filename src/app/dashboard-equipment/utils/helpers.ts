/**
 * Dashboard Equipment Page - API Utilities and Helpers
 *
 * This file contains all API functions, types, and utility functions
 * for the dashboard-equipment page using FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==================== Types ====================

export type Equipment = {
  id: number;
  po_number?: string;
  unit_number?: string;
  brand_name?: string;
  description?: string;
  category?: string;
  status?: string;
  date_acquire?: string;
  supplier?: string;
  amount?: string;
  estimated_life?: string;
  item_number?: string;
  property_number?: string;
  control_number?: string;
  serial_number?: string;
  person_liable?: string;
  remarks?: string;
  updated_at?: string;
  name: string;
  facility_id?: number;
  availability?: string;
  created_at: string;
  image?: string;
};

export type Facility = {
  facility_id: number;
  facility_name: string;
  facility_type?: string;
  botic_hub?: string;
  capacity?: number;
};

// ==================== Helper Functions ====================

export function formatImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url;
}

// ==================== API Functions ====================

/**
 * Fetch all equipments from FastAPI backend
 */
export async function fetchEquipments(): Promise<Equipment[]> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/equipments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch equipments" }));
    throw new Error(error.detail || "Failed to fetch equipments");
  }

  return response.json();
}

/**
 * Fetch all facilities from FastAPI backend
 */
export async function fetchFacilities(): Promise<Facility[]> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/facilities`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch facilities" }));
    throw new Error(error.detail || "Failed to fetch facilities");
  }

  const data = await response.json();
  // Handle both direct array and wrapped object responses
  return Array.isArray(data) ? data : data.facilities || [];
}

/**
 * Create a new equipment
 */
export async function createEquipment(
  equipment: Partial<Equipment>
): Promise<Equipment> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/equipments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to create equipment" }));
    throw new Error(error.detail || "Failed to create equipment");
  }

  return response.json();
}

/**
 * Update an existing equipment
 */
export async function updateEquipment(
  id: number,
  equipment: Partial<Equipment>
): Promise<Equipment> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/equipments/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to update equipment" }));
    throw new Error(error.detail || "Failed to update equipment");
  }

  return response.json();
}

/**
 * Delete equipments by IDs
 */
export async function deleteEquipments(ids: number[]): Promise<void> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/equipments/bulk-delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to delete equipments" }));
    throw new Error(error.detail || "Failed to delete equipments");
  }
}

/**
 * Upload equipment image to storage
 */
export async function uploadEquipmentImage(file: File): Promise<string> {
  const token = localStorage.getItem("authToken");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/equipments/upload-image`, {
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
 * Bulk import equipments
 */
export async function bulkImportEquipments(
  equipments: Partial<Equipment>[]
): Promise<{ imported: number; failed: number }> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/equipments/bulk-import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ equipments }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to import equipments" }));
    throw new Error(error.detail || "Failed to import equipments");
  }

  return response.json();
}

/**
 * Log equipment action
 */
export async function logEquipmentAction(
  action: string,
  equipmentName?: string,
  details?: string
): Promise<void> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/equipment-logs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      equipment_name: equipmentName,
      details,
    }),
  });

  if (!response.ok) {
    console.error("Failed to log equipment action");
  }
}

// ==================== Helper Functions ====================

// Image validation and processing helpers
export const validateImageFile = (file: File): string | null => {
  if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
    return "Please select a PNG or JPG image file";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Image file size must be less than 5MB";
  }

  return null;
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Equipment filtering helpers
export const filterEquipments = (
  equipments: Equipment[],
  categoryFilter: string,
  facilityFilter: string,
  searchQuery: string = ""
): Equipment[] => {
  return equipments.filter((eq) => {
    const matchesCategory =
      !categoryFilter ||
      eq.category?.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesFacility =
      !facilityFilter || eq.facility_id === parseInt(facilityFilter);
    const matchesSearch =
      !searchQuery || eq.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesFacility && matchesSearch;
  });
};

export const getUniqueCategories = (equipments: Equipment[]): string[] => {
  return [
    ...new Set(equipments.map((eq) => eq.category).filter(Boolean)),
  ].sort() as string[];
};

export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

// CSV parsing helper
export const parseCSVToEquipment = async (
  file: File
): Promise<Partial<Equipment>[]> => {
  const text = await file.text();
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row"
    );
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const equipmentData: Partial<Equipment>[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const equipment: Partial<Equipment> = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";

      switch (header.toLowerCase()) {
        case "name":
        case "equipment name":
          equipment.name = value;
          break;
        case "po number":
        case "po_number":
        case "ponumber":
          equipment.po_number = value;
          break;
        case "unit number":
        case "unit_number":
        case "unitnumber":
          equipment.unit_number = value;
          break;
        case "brand name":
        case "brand_name":
        case "brand":
          equipment.brand_name = value;
          break;
        case "description":
          equipment.description = value;
          break;
        case "category":
          equipment.category = value;
          break;
        case "status":
          equipment.status = value;
          break;
        case "availability":
          equipment.availability = value;
          break;
        case "date acquire":
        case "date_acquire":
        case "dateacquired":
          equipment.date_acquire = value;
          break;
        case "supplier":
          equipment.supplier = value;
          break;
        case "amount":
        case "price":
          equipment.amount = value;
          break;
        case "estimated life":
        case "estimated_life":
        case "estimatedlife":
          equipment.estimated_life = value;
          break;
        case "item number":
        case "item_number":
        case "itemnumber":
          equipment.item_number = value;
          break;
        case "property number":
        case "property_number":
        case "propertynumber":
          equipment.property_number = value;
          break;
        case "control number":
        case "control_number":
        case "controlnumber":
          equipment.control_number = value;
          break;
        case "serial number":
        case "serial_number":
        case "serialnumber":
          equipment.serial_number = value;
          break;
        case "person liable":
        case "person_liable":
        case "personliable":
          equipment.person_liable = value;
          break;
        case "facility id":
        case "facility_id":
        case "facilityid":
          equipment.facility_id = value ? parseInt(value, 10) : undefined;
          break;
        case "remarks":
        case "notes":
          equipment.remarks = value;
          break;
      }
    });

    return equipment;
  });

  return equipmentData;
};

// Validation helpers
export const validateEquipmentName = (name?: string): boolean => {
  return !!name && name.trim().length > 0;
};

export const validateCSVFile = (file: File): string | null => {
  if (!file.name.endsWith(".csv")) {
    return "Please select a CSV file";
  }
  return null;
};
