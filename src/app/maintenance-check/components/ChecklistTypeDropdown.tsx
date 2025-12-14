import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ChecklistType } from "../utils/types";

interface ChecklistTypeDropdownProps {
  selectedType: ChecklistType;
  setSelectedType: (type: ChecklistType) => void;
}

const ChecklistTypeDropdown: React.FC<ChecklistTypeDropdownProps> = ({
  selectedType,
  setSelectedType,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        <span>{selectedType} Maintenance</span>
        <ChevronDown size={16} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {(["Daily", "Weekly", "Monthly"] as ChecklistType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setIsDropdownOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedType === type
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {type} Maintenance
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistTypeDropdown;
