/**
 * FilterControls Component
 *
 * Provides filtering controls for category and facility
 */

import React from "react";
import { Filter, X } from "lucide-react";

interface FilterControlsProps {
  categoryFilter: string;
  facilityFilter: string;
  activeFilter: "category" | "facility" | null;
  showFilterDropdown: boolean;
  uniqueCategories: string[];
  uniqueFacilities: string[];
  onFilterSelect: (filterType: "category" | "facility") => void;
  onCategoryChange: (value: string) => void;
  onFacilityChange: (value: string) => void;
  onClearFilters: () => void;
  onToggleDropdown: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  categoryFilter,
  facilityFilter,
  activeFilter,
  showFilterDropdown,
  uniqueCategories,
  uniqueFacilities,
  onFilterSelect,
  onCategoryChange,
  onFacilityChange,
  onClearFilters,
  onToggleDropdown,
  dropdownRef,
}) => {
  return (
    <div className="flex gap-2 items-center">
      {/* Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={onToggleDropdown}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>

        {showFilterDropdown && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={() => onFilterSelect("category")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                By Category
              </button>
              <button
                onClick={() => onFilterSelect("facility")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                By Facility
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      {activeFilter === "category" && (
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Facility Filter */}
      {activeFilter === "facility" && (
        <div className="relative">
          <select
            value={facilityFilter}
            onChange={(e) => onFacilityChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <option value="">All Facilities</option>
            {uniqueFacilities.map((facility) => (
              <option key={facility} value={facility}>
                {facility}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters */}
      {(categoryFilter || facilityFilter || activeFilter) && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default FilterControls;
