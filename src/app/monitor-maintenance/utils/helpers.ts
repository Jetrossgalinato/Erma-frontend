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

export interface PaginatedMaintenanceLogs {
  logs: MaintenanceLog[];
  total_count: number;
  total_pages: number;
  page: number;
}

// ==================== API Functions ====================

/**
 * Fetch maintenance logs from the API
 */
export async function fetchMaintenanceLogs(
  page: number = 1,
  limit: number = 10,
  checklist_type: string = "All"
): Promise<PaginatedMaintenanceLogs> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/api/maintenance?page=${page}&limit=${limit}&checklist_type=${checklist_type}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch logs: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ==================== Utility Functions ====================

/**
 * Calculate pagination range for display
 */
export function calculatePaginationRange(
  currentPage: number,
  itemsPerPage: number,
  totalCount: number
): { start: number; end: number } {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalCount);
  return { start, end };
}

/**
 * Generate page numbers for pagination
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number
): number[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => {
    if (totalPages <= 7) return true;
    if (page <= 3) return true;
    if (page >= totalPages - 2) return true;
    if (Math.abs(page - currentPage) <= 1) return true;
    return false;
  });
}

/**
 * Check if ellipsis should be shown between page numbers
 */
export function shouldShowEllipsis(
  currentIndex: number,
  pages: number[]
): boolean {
  if (currentIndex === 0) return false;
  const prevPage = pages[currentIndex - 1];
  const currentPageNum = pages[currentIndex];
  return currentPageNum - prevPage > 1;
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
 * Reject a maintenance log
 */
export async function rejectMaintenanceLog(
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
      body: JSON.stringify({ status: "Rejected" }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reject maintenance log");
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
