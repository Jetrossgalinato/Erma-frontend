import { Filter, Building, Users, X, ChevronDown } from "lucide-react";
import { useRef, useEffect } from "react";

interface FilterControlsProps {
  departmentFilter: string;
  roleFilter: string;
  activeFilter: "department" | "role" | null;
  showFilterDropdown: boolean;
  uniqueDepartments: string[];
  uniqueRoles: string[];
  onDepartmentFilterChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onFilterSelect: (filterType: "department" | "role") => void;
  onToggleFilterDropdown: () => void;
  onClearFilters: () => void;
  setShowFilterDropdown: (show: boolean) => void;
}

export default function FilterControls({
  departmentFilter,
  roleFilter,
  activeFilter,
  showFilterDropdown,
  uniqueDepartments,
  uniqueRoles,
  onDepartmentFilterChange,
  onRoleFilterChange,
  onFilterSelect,
  onToggleFilterDropdown,
  onClearFilters,
  setShowFilterDropdown,
}: FilterControlsProps) {
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowFilterDropdown]);

  return (
    <div className="flex gap-3">
      {/* Filter Dropdown */}
      <div className="relative" ref={filterDropdownRef}>
        <button
          onClick={onToggleFilterDropdown}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium shadow-sm transition-all duration-200 ${
            activeFilter || departmentFilter || roleFilter
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>

        {showFilterDropdown && (
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              <button
                onClick={() => onFilterSelect("department")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Building className="w-4 h-4 mr-3" />
                Filter by Department
              </button>
              <button
                onClick={() => onFilterSelect("role")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Users className="w-4 h-4 mr-3" />
                Filter by Account Role
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Dropdown for Department */}
      {activeFilter === "department" && (
        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentFilterChange(e.target.value)}
          className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {uniqueDepartments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      )}

      {/* Active Filter Dropdown for Account Role */}
      {activeFilter === "role" && (
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="px-3 py-2 border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Account Roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      )}

      {/* Clear Filter Button */}
      {(departmentFilter || roleFilter || activeFilter) && (
        <button
          onClick={onClearFilters}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <X className="w-4 h-4 mr-1 inline" />
          Clear
        </button>
      )}
    </div>
  );
}
