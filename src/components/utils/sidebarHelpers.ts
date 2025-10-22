/**
 * Sidebar Component - API Utilities and Helpers
 *
 * This file contains all API functions for the sidebar component
 * using FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==================== Types ====================

export interface SidebarCounts {
  equipments: number;
  facilities: number;
  supplies: number;
  requests: number;
  equipment_logs: number;
  facility_logs: number;
  supply_logs: number;
  users: number;
}

export interface UserRole {
  approved_acc_role: string | null;
}

// ==================== API Functions ====================

/**
 * Fetch all sidebar counts in a single request
 */
export async function fetchSidebarCounts(): Promise<SidebarCounts> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/sidebar/counts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch sidebar counts" }));
    throw new Error(error.detail || "Failed to fetch sidebar counts");
  }

  return response.json();
}

/**
 * Fetch user's approved account role
 */
export async function fetchUserRole(): Promise<UserRole> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/users/me/role`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch user role" }));
    throw new Error(error.detail || "Failed to fetch user role");
  }

  return response.json();
}
