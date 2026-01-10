/**
 * FilterControls Component
 *
 * Provides filtering controls for facility type and floor level
 */

import React from "react";
import { Filter, ChevronDown, X, Building, Layers } from "lucide-react";

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
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={onToggleDropdown}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium shadow-sm transition-all duration-200 ${
            activeFilter || facilityTypeFilter || floorLevelFilter
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>

        {showFilterDropdown && (
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              <button
                onClick={() => onFilterSelect("facility type")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Building className="w-4 h-4 mr-3" />
                Filter by Facility Type
              </button>

              <hr className="my-1 border-gray-100 dark:border-gray-600" />

              <button
                onClick={() => onFilterSelect("floor level")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Layers className="w-4 h-4 mr-3" />
                Filter by Floor Level
              </button>
            </div>
          </div>
        )}
      </div>

      {activeFilter === "facility type" && (
        <select
          value={facilityTypeFilter}
          onChange={(e) => onFacilityTypeChange(e.target.value)}
          className="px-4 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
        >
          <option
            value=""
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            All Facility Types
          </option>
          {uniqueFacilityTypes.map((type) => (
            <option
              key={type}
              value={type}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {type}
            </option>
          ))}
        </select>
      )}

      {activeFilter === "floor level" && (
        <select
          value={floorLevelFilter}
          onChange={(e) => onFloorLevelChange(e.target.value)}
          className="px-4 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
        >
          <option
            value=""
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            All Floor Levels
          </option>
          {uniqueFloorLevels.map((level) => (
            <option
              key={level}
              value={level}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {level}
            </option>
          ))}
        </select>
      )}

      {(facilityTypeFilter || floorLevelFilter || activeFilter) && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <X className="w-4 h-4 mr-2" />
          Clear
        </button>
      )}
    </>
  );
};

export default FilterControls;
