/**
 * ActionsDropdown Component
 *
 * Provides action buttons for facilities (add, edit, delete, import, refresh)
 */

import React from "react";
import {
  Settings,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
  Upload,
} from "lucide-react";

interface ActionsDropdownProps {
  selectedRows: number[];
  isRefreshing: boolean;
  showActionsDropdown: boolean;
  onRefresh: () => void;
  onToggleDropdown: () => void;
  onAddNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onImport: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  selectedRows,
  showActionsDropdown,
  onToggleDropdown,
  onAddNew,
  onEdit,
  onDelete,
  onImport,
  dropdownRef,
}) => {
  return (
    <div className="flex gap-3">
      {/* Actions Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={onToggleDropdown}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Actions
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {showActionsDropdown && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={onAddNew}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Facility
              </button>
              <button
                onClick={onEdit}
                disabled={selectedRows.length !== 1}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Selected
              </button>
              <button
                onClick={onDelete}
                disabled={selectedRows.length === 0}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedRows.length})
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <button
                onClick={onImport}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsDropdown;
