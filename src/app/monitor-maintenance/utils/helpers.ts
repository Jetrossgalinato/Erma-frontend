/**
 * Monitor Maintenance Page - API Utilities and Helpers
 *
 * This file contains all API functions, types, and utility functions
 * for the monitor-maintenance page.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==================== Types ====================

export interface ChecklistItem {
  status: string;
  remarks: string;
}

export interface MaintenanceLog {
  id: number;
  user_id: number;
  laboratory: string;
  date: string;
  checklist_data: string;
  additional_concerns: string | null;
  status: string;
  created_at: string;
  user_first_name: string;
  user_last_name: string;
  user_role: string;
  checklist_type: string;
  log_type: string;
}

// ==================== API Functions ====================

/**
 * Fetch maintenance logs from the API
 */
export async function fetchMaintenanceLogs(): Promise<MaintenanceLog[]> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch logs: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Confirm a maintenance log
 */
export async function confirmMaintenanceLog(
  id: number,
  logType: string
): Promise<void> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/api/maintenance/${id}/status?log_type=${logType}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "Confirmed" }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to confirm maintenance log");
  }
}

/**
 * Delete a maintenance log
 */
export async function deleteMaintenanceLog(
  id: number,
  logType: string
): Promise<void> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/api/maintenance/${id}?log_type=${logType}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete maintenance log");
  }
}
