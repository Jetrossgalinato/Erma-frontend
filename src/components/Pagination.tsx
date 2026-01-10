import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-4 mb-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>

      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-2 sm:px-3 py-1 text-gray-500 text-xs sm:text-base">
              ...
            </span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-base transition-colors shadow-sm ${
                currentPage === page
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>
    </div>
  );
}
