import React from "react";
import {
  Settings,
  ChevronDown,
  Plus,
  Download,
  Edit,
  Trash2,
} from "lucide-react";

type ActionsDropdownProps = {
  selectedRows: number[];
  showActionsDropdown: boolean;
  actionsDropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggleDropdown: () => void;
  onInsertClick: () => void;
  onImportClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
};

export default function ActionsDropdown({
  selectedRows,
  showActionsDropdown,
  actionsDropdownRef,
  onToggleDropdown,
  onInsertClick,
  onImportClick,
  onEditClick,
  onDeleteClick,
}: ActionsDropdownProps) {
  return (
    <div className="relative" ref={actionsDropdownRef}>
      <button
        onClick={onToggleDropdown}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium rounded-md shadow-sm transition-all duration-200"
      >
        <Settings className="w-4 h-4 mr-2" />
        Actions
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {showActionsDropdown && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <button
              onClick={onInsertClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Plus className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
              Insert Row
            </button>

            <button
              onClick={onImportClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Download className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
              Import Data from CSV File
            </button>

            <hr className="my-1 border-gray-100 dark:border-gray-600" />

            <button
              onClick={onEditClick}
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
              Edit Selected (
              {selectedRows.length === 1 ? "1" : selectedRows.length})
            </button>

            <button
              onClick={onDeleteClick}
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
  );
}
