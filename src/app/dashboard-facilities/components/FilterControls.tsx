/**
 * FilterControls Component
 *
 * Provides filtering controls for facility type and floor level
 */

import React from "react";
import { Filter, X } from "lucide-react";

interface FilterControlsProps {
  facilityTypeFilter: string;
  floorLevelFilter: string;
  activeFilter: "facility type" | "floor level" | null;
  showFilterDropdown: boolean;
  uniqueFacilityTypes: string[];
  uniqueFloorLevels: string[];
  onFilterSelect: (filterType: "facility type" | "floor level") => void;
  onFacilityTypeChange: (value: string) => void;
  onFloorLevelChange: (value: string) => void;
  onClearFilters: () => void;
  onToggleDropdown: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  facilityTypeFilter,
  floorLevelFilter,
  activeFilter,
  showFilterDropdown,
  uniqueFacilityTypes,
  uniqueFloorLevels,
  onFilterSelect,
  onFacilityTypeChange,
  onFloorLevelChange,
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
                onClick={() => onFilterSelect("facility type")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                By Facility Type
              </button>
              <button
                onClick={() => onFilterSelect("floor level")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                By Floor Level
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Facility Type Filter */}
      {activeFilter === "facility type" && (
        <div className="relative">
          <select
            value={facilityTypeFilter}
            onChange={(e) => onFacilityTypeChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <option value="">All Facility Types</option>
            {uniqueFacilityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Floor Level Filter */}
      {activeFilter === "floor level" && (
        <div className="relative">
          <select
            value={floorLevelFilter}
            onChange={(e) => onFloorLevelChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <option value="">All Floor Levels</option>
            {uniqueFloorLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters */}
      {(facilityTypeFilter || floorLevelFilter || activeFilter) && (
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
