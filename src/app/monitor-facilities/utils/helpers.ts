/**
 * Monitor Facilities Page - API Utilities and Helpers
 *
 * This file contains all API functions, types, and utility functions
 * for the monitor-facilities page using FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==================== Types ====================

export interface FacilityLog {
  id: number;
  log_message: string;
  created_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FacilityLogsResponse {
  logs: FacilityLog[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ==================== API Functions ====================

/**
 * Fetch facility logs with pagination from FastAPI backend
 */
export async function fetchFacilityLogs(
  params: PaginationParams
): Promise<FacilityLogsResponse> {
  const token = localStorage.getItem("authToken");

  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/facilities/logs?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch facility logs" }));
    throw new Error(error.detail || "Failed to fetch facility logs");
  }

  return response.json();
}

// ==================== Utility Functions ====================

/**
 * Format date and time for display
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeFormatted = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateFormatted} ${timeFormatted}`;
}

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
