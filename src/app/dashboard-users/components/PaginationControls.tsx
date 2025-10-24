import { ChevronLeft, ChevronRight } from "lucide-react";
import { generatePageNumbers } from "../utils/helpers";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalCount,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startItem} to {endItem} of {totalCount} results
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
              currentPage === 1
                ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-orange-500 dark:bg-orange-600 text-white"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
}
