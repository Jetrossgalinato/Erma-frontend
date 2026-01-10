"use client";

import {
  calculatePaginationRange,
  generatePageNumbers,
  shouldShowEllipsis,
} from "../utils/helpers";

interface PaginationControlsProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const { start, end } = calculatePaginationRange(
    currentPage,
    itemsPerPage,
    totalCount
  );
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing {start} to {end} of {totalCount} results
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Previous
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          const showEllipsis = shouldShowEllipsis(index, pageNumbers);

          return (
            <div key={page} className="flex items-center">
              {showEllipsis && (
                <span className="px-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm border rounded-md shadow-sm ${
                  currentPage === page
                    ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
