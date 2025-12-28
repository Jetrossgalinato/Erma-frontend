/**
 * Request Type Selector Component
 * Dropdown to switch between borrowing, booking, and acquiring requests
 */

import { ChevronDown } from "lucide-react";

interface RequestTypeSelectorProps {
  currentType: "borrowing" | "booking" | "acquiring";
  onChange: (type: "borrowing" | "booking" | "acquiring") => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RequestTypeSelector({
  currentType,
  onChange,
  isOpen,
  onToggle,
}: RequestTypeSelectorProps) {
  const options = [
    { value: "borrowing", label: "Borrowing Requests" },
    { value: "booking", label: "Booking Requests" },
    { value: "acquiring", label: "Acquiring Requests" },
  ] as const;

  const currentLabel = options.find((o) => o.value === currentType)?.label;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={onToggle}
        className="inline-flex justify-between items-center w-52 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {currentLabel}
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onToggle();
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentType === option.value
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
