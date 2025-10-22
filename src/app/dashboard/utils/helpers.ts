/**
 * Dashboard Page - API Utilities and Helpers
 *
 * This file contains all API functions, types, and utility functions
 * for the dashboard page using FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==================== Types ====================

export interface DashboardStats {
  total_users: number;
  pending_requests: number;
  total_equipment: number;
  active_facilities: number;
  total_supplies: number;
  borrowed_last_7_days: number;
  borrowed_today: number;
  total_equipment_categories: number;
}

export interface EquipmentPerPersonLiable {
  person_liable: string;
  equipment_count: number;
}

export interface EquipmentByCategory {
  category: string;
  count: number;
}

export interface EquipmentByStatus {
  status: string;
  count: number;
}

export interface EquipmentPerFacility {
  facility_name: string;
  equipment_count: number;
}

export interface EquipmentAvailability {
  status: string;
  count: number;
  percentage: number;
}

// ==================== API Functions ====================

/**
 * Fetches dashboard statistics from FastAPI
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch dashboard stats" }));
    throw new Error(error.detail || "Failed to fetch dashboard stats");
  }

  return response.json();
}

/**
 * Fetches equipment count per person liable
 */
export async function fetchEquipmentPerPersonLiable(): Promise<
  EquipmentPerPersonLiable[]
> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/equipment/by-person-liable`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch equipment data" }));
    throw new Error(error.detail || "Failed to fetch equipment data");
  }

  return response.json();
}

/**
 * Fetches equipment count by category
 */
export async function fetchEquipmentByCategory(): Promise<
  EquipmentByCategory[]
> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/equipment/by-category`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch equipment categories" }));
    throw new Error(error.detail || "Failed to fetch equipment categories");
  }

  return response.json();
}

/**
 * Fetches equipment count by status
 */
export async function fetchEquipmentByStatus(): Promise<EquipmentByStatus[]> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/equipment/by-status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch equipment status" }));
    throw new Error(error.detail || "Failed to fetch equipment status");
  }

  return response.json();
}

/**
 * Fetches equipment count per facility
 */
export async function fetchEquipmentPerFacility(): Promise<
  EquipmentPerFacility[]
> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/equipment/by-facility`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch equipment per facility" }));
    throw new Error(error.detail || "Failed to fetch equipment per facility");
  }

  return response.json();
}

/**
 * Fetches equipment availability statistics
 */
export async function fetchEquipmentAvailability(): Promise<
  EquipmentAvailability[]
> {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/equipment/availability`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch equipment availability" }));
    throw new Error(error.detail || "Failed to fetch equipment availability");
  }

  return response.json();
}

// ==================== Utility Functions ====================

/**
 * Formats a number with commas for thousands
 */
export function formatNumber(num: number | null): string {
  if (num === null) return "0";
  return num.toLocaleString();
}

/**
 * Calculates percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Gets color class for status
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "available":
    case "active":
      return "bg-green-500";
    case "borrowed":
    case "pending":
      return "bg-yellow-500";
    case "maintenance":
    case "under maintenance":
      return "bg-orange-500";
    case "damaged":
    case "unavailable":
      return "bg-red-500";
    default:
      return "bg-blue-500";
  }
}

/**
 * Validates authentication token
 */
export function validateToken(): boolean {
  const token = localStorage.getItem("authToken");
  return !!token;
}

/**
 * Handles API errors consistently
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
