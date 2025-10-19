import React from "react";
import { Filter, ChevronDown, X, Building, Tag } from "lucide-react";
import {
  type Equipment,
  type Facility,
  getUniqueCategories,
} from "../utils/helpers";

type FilterControlsProps = {
  equipments: Equipment[];
  facilities: Facility[];
  categoryFilter: string;
  facilityFilter: string;
  activeFilter: "category" | "facility" | null;
  showFilterDropdown: boolean;
  filterDropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggleDropdown: () => void;
  onFilterSelect: (filterType: "category" | "facility") => void;
  onCategoryChange: (value: string) => void;
  onFacilityChange: (value: string) => void;
  onClearFilters: () => void;
};

export default function FilterControls({
  equipments,
  facilities,
  categoryFilter,
  facilityFilter,
  activeFilter,
  showFilterDropdown,
  filterDropdownRef,
  onToggleDropdown,
  onFilterSelect,
  onCategoryChange,
  onFacilityChange,
  onClearFilters,
}: FilterControlsProps) {
  return (
    <>
      <div className="relative" ref={filterDropdownRef}>
        <button
          onClick={onToggleDropdown}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium transition-all duration-200 ${
            activeFilter || categoryFilter || facilityFilter
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
                onClick={() => onFilterSelect("category")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Tag className="w-4 h-4 mr-3" />
                Filter by Category
              </button>
              <button
                onClick={() => onFilterSelect("facility")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Building className="w-4 h-4 mr-3" />
                Filter by Facility
              </button>
            </div>
          </div>
        )}
      </div>

      {activeFilter === "category" && (
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {getUniqueCategories(equipments).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      )}

      {activeFilter === "facility" && (
        <select
          value={facilityFilter}
          onChange={(e) => onFacilityChange(e.target.value)}
          className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Facilities</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
      )}

      {(categoryFilter || facilityFilter || activeFilter) && (
        <button
          onClick={onClearFilters}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <X className="w-4 h-4 mr-1 inline" />
          Clear
        </button>
      )}
    </>
  );
}
