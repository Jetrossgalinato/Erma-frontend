import { Settings, ChevronDown, Edit, Trash2 } from "lucide-react";
import { useRef, useEffect } from "react";

interface ActionsDropdownProps {
  selectedCount: number;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  setShowDropdown: (show: boolean) => void;
}

export default function ActionsDropdown({
  selectedCount,
  showDropdown,
  onToggleDropdown,
  onEdit,
  onDelete,
  setShowDropdown,
}: ActionsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggleDropdown}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium rounded-md shadow-sm transition-all duration-200"
      >
        <Settings className="w-4 h-4 mr-2" />
        Actions
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <button
              onClick={onEdit}
              disabled={selectedCount !== 1}
              className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                selectedCount !== 1
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Edit className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
              Edit Selected ({selectedCount === 1 ? "1" : selectedCount})
            </button>

            <button
              onClick={onDelete}
              disabled={selectedCount === 0}
              className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                selectedCount === 0
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-400"
              }`}
            >
              <Trash2 className="w-4 h-4 mr-3 text-red-600 dark:text-red-400" />
              Delete Selected ({selectedCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
