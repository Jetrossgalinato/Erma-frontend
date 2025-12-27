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
  Download,
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
  onExport: () => void;
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
  onExport,
  dropdownRef,
}) => {
  return (
    <div className="flex gap-3">
      {/* Actions Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={onToggleDropdown}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Actions
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {showActionsDropdown && (
          <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={onAddNew}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Plus className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                Add New Facility
              </button>
              <button
                onClick={onImport}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Download className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                Import Data from CSV File
              </button>
              <button
                onClick={onExport}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Upload className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                Export Data to CSV File
              </button>
              <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
              <button
                onClick={onEdit}
                disabled={selectedRows.length !== 1}
                className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                  selectedRows.length !== 1
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Edit
                  className={`w-4 h-4 mr-3 ${
                    selectedRows.length !== 1
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                Edit Selected
              </button>
              <button
                onClick={onDelete}
                disabled={selectedRows.length === 0}
                className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                  selectedRows.length === 0
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-400"
                }`}
              >
                <Trash2
                  className={`w-4 h-4 mr-3 ${
                    selectedRows.length === 0
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
                Delete Selected ({selectedRows.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsDropdown;
