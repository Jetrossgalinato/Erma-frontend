import React, { useState, useRef, useEffect } from "react";
import { Filter, RefreshCw, ChevronDown } from "lucide-react";

interface MaintenanceLogHeaderProps {
  filterType: string;
  setFilterType: (type: string) => void;
  onRefresh: () => void;
}

export default function MaintenanceLogHeader({
  filterType,
  setFilterType,
  onRefresh,
}: MaintenanceLogHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "All", label: "All Types" },
    { value: "Daily", label: "Daily" },
    { value: "Weekly", label: "Weekly" },
    { value: "Monthly", label: "Monthly" },
  ];

  const selectedLabel =
    options.find((opt) => opt.value === filterType)?.label || "All Types";

  return (
    <div className="mb-8 pt-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Maintenance Logs
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review and confirm maintenance reports submitted by student assistants
          and lab technicians.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-orange-500 focus:border-orange-500 flex items-center justify-between min-w-[160px] transition-colors"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              {selectedLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
              {options.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => {
                    setFilterType(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${
                      filterType === option.value
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }
                    ${
                      index !== options.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }
                  `}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}
